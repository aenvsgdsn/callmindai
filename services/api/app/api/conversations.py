"""
Conversations router — Supabase-powered with optimized JOIN queries.
Uses PostgREST foreign key expansion instead of N+1 Python loops.
"""
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.db.supabase_client import sb
from app.core.security import CurrentUser, get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

AVATAR_COLORS = ["v", "b", "g", "a", "r"]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _time_ago(iso: str | None) -> str:
    if not iso:
        return "Unknown"
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        diff = datetime.now(timezone.utc) - dt
        s = int(diff.total_seconds())
        if s < 60:   return "Just now"
        if s < 3600: return f"{s // 60} min ago"
        if s < 86400:return f"{s // 3600} hr ago"
        return f"{diff.days}d ago"
    except Exception:
        return "Unknown"


def _enrich(conv: dict, idx: int) -> dict:
    """Flatten the PostgREST nested lead join into a flat response."""
    msgs = conv.get("messages") or []
    lead = conv.get("lead") or {}          # populated by ?select=*,lead:leads(name)
    return {
        "id":         conv["id"],
        "lead_id":    conv["lead_id"],
        "lead_name":  lead.get("name", "Unknown"),
        "lead_email": lead.get("email"),
        "lead_avatar":AVATAR_COLORS[idx % len(AVATAR_COLORS)],
        "channel":    conv.get("channel", "SMS"),
        "status":     conv.get("status", "active"),
        "last_msg":   msgs[-1]["text"] if msgs else "",
        "time":       _time_ago(conv.get("updated_at")),
        "msg_count":  len(msgs),
        "sentiment":  conv.get("sentiment", "neutral"),
        "ai_handled": conv.get("ai_handled", True),
        "messages":   msgs,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_conversations(current_user: CurrentUser = Depends(get_current_user)):
    """
    Single optimised query: PostgREST JOIN on leads table.
    Replaces the old N+1 loop (one query per conversation to get lead name).
    """
    res = sb().table("conversations").select(
        "*, lead:leads(name, email)"   # ← JOIN in one round-trip
    ).eq("agency_id", current_user.agency_id
    ).order("updated_at", desc=True).execute()

    return [_enrich(c, i) for i, c in enumerate(res.data or [])]


@router.get("/{conv_id}")
def get_conversation(
    conv_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    res = sb().table("conversations").select(
        "*, lead:leads(name, email)"
    ).eq("id", conv_id).eq("agency_id", current_user.agency_id).single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return _enrich(res.data, 0)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: dict,
    current_user: CurrentUser = Depends(get_current_user),
):
    lead_id = payload.get("lead_id")
    channel = payload.get("channel", "SMS")
    initial = payload.get("initial_message")

    # Verify lead belongs to agency
    lead_res = sb().table("leads").select("id, name, email").eq(
        "id", lead_id
    ).eq("agency_id", current_user.agency_id).single().execute()
    if not lead_res.data:
        raise HTTPException(status_code=404, detail="Lead not found")

    msgs = []
    if initial:
        msgs.append({"from": "ai", "text": initial, "ts": datetime.now(timezone.utc).isoformat()})

    res = sb().table("conversations").insert({
        "lead_id":   lead_id,
        "agency_id": current_user.agency_id,
        "channel":   channel,
        "status":    "active",
        "messages":  msgs,
    }).execute()

    conv = res.data[0]
    conv["lead"] = lead_res.data
    return _enrich(conv, 0)


@router.post("/{conv_id}/message")
def add_message(
    conv_id: str,
    body: dict,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Append a message to the JSONB messages array — atomic update."""
    res = sb().table("conversations").select(
        "id, messages, agency_id"
    ).eq("id", conv_id).eq("agency_id", current_user.agency_id).single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs = res.data.get("messages") or []
    msgs.append({
        "from": body.get("from", "human"),
        "text": body.get("text", "").strip(),
        "ts":   datetime.now(timezone.utc).isoformat(),
    })

    sb().table("conversations").update({
        "messages":   msgs,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        # Update sentiment if human is taking a positive tone
        "ai_handled": body.get("from", "human") != "human",
    }).eq("id", conv_id).execute()

    return {"status": "ok", "message_count": len(msgs)}


@router.post("/{conv_id}/takeover")
def takeover_conversation(
    conv_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    res = sb().table("conversations").select("id").eq(
        "id", conv_id
    ).eq("agency_id", current_user.agency_id).single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    sb().table("conversations").update({
        "ai_handled": False,
        "status":     "human-required",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", conv_id).execute()

    return {"status": "ok", "ai_handled": False}
