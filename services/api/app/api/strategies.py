"""
Strategies router — Supabase-powered with optimized JOIN queries.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db.supabase_client import sb
from app.core.security import CurrentUser, get_current_user, require_role

router = APIRouter(prefix="/strategies", tags=["Strategies"])

AVATAR_COLORS = ["v", "b", "g", "a", "r"]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _enrich(s: dict, idx: int) -> dict:
    lead      = s.get("lead")     or {}
    approver  = s.get("approver") or {}

    created_at = s.get("created_at", "")
    try:
        from datetime import datetime
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        created_str = dt.strftime("%b %d, %I:%M %p")
    except Exception:
        created_str = created_at

    return {
        "id":               s["id"],
        "lead_id":          s["lead_id"],
        "lead_name":        lead.get("name", "Unknown"),
        "lead_avatar_color": AVATAR_COLORS[idx % len(AVATAR_COLORS)],
        "objective":        s.get("objective", ""),
        "questions":        s.get("questions") or [],
        "status":           s.get("status", "pending"),
        "approved_by":      approver.get("name") or s.get("approved_by"),
        "created_at":       created_str,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_strategies(
    status_filter: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Single JOIN query: strategy + lead name + approver name.
    Old code: N+1 Python loop per strategy.
    """
    query = sb().table("qualification_strategies").select(
        "*, lead:leads(name), approver:users(name)"
    ).eq("agency_id", current_user.agency_id).order("created_at", desc=True)

    if status_filter:
        query = query.eq("status", status_filter)

    res = query.execute()
    return [_enrich(s, i) for i, s in enumerate(res.data or [])]


@router.post("/{strategy_id}/approve")
def approve_strategy(
    strategy_id: str,
    payload: dict,
    current_user: CurrentUser = Depends(
        require_role(["agency_admin", "sales_manager"])
    ),
):
    res = sb().table("qualification_strategies").select(
        "id, lead_id"
    ).eq("id", strategy_id).eq("agency_id", current_user.agency_id).single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Strategy not found")

    update_data = {
        "status":      "approved",
        "approved_by": current_user.id,
    }
    if payload.get("custom_questions"):
        update_data["questions"] = payload["custom_questions"]

    sb().table("qualification_strategies").update(update_data).eq(
        "id", strategy_id
    ).execute()

    # Audit
    sb().table("audit_logs").insert({
        "agency_id":   current_user.agency_id,
        "actor_type":  "user",
        "actor_id":    current_user.id,
        "event_type":  "strategy_approved",
        "entity_type": "strategy",
        "entity_id":   strategy_id,
        "metadata":    {"approved_by": current_user.email},
    }).execute()

    # Return updated record
    updated = sb().table("qualification_strategies").select(
        "*, lead:leads(name), approver:users(name)"
    ).eq("id", strategy_id).single().execute()
    return _enrich(updated.data, 0)


@router.post("/{strategy_id}/reject")
def reject_strategy(
    strategy_id: str,
    current_user: CurrentUser = Depends(
        require_role(["agency_admin", "sales_manager"])
    ),
):
    res = sb().table("qualification_strategies").select("id").eq(
        "id", strategy_id
    ).eq("agency_id", current_user.agency_id).single().execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Strategy not found")

    sb().table("qualification_strategies").update({"status": "rejected"}).eq(
        "id", strategy_id
    ).execute()

    sb().table("audit_logs").insert({
        "agency_id":   current_user.agency_id,
        "actor_type":  "user",
        "actor_id":    current_user.id,
        "event_type":  "strategy_rejected",
        "entity_type": "strategy",
        "entity_id":   strategy_id,
        "metadata":    {"rejected_by": current_user.email},
    }).execute()

    return {"status": "rejected", "strategy_id": strategy_id}
