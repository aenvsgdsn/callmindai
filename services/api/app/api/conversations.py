"""
Conversations router: manage AI conversation threads with leads.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Conversation, Lead
from app.core.security import CurrentUser, get_current_user
from app.services.audit import record_audit_log

router = APIRouter(prefix="/conversations", tags=["Conversations"])

AVATAR_COLORS = ["v", "b", "g", "a", "r"]


class MessageItem(BaseModel):
    from_: str  # 'ai' or 'lead'
    text: str
    ts: Optional[str] = None

    class Config:
        populate_by_name = True


class ConversationResponse(BaseModel):
    id: str
    lead_id: str
    lead_name: str
    lead_avatar: str
    channel: str
    status: str
    last_msg: str
    time: str
    msg_count: int
    sentiment: str
    ai_handled: bool
    messages: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class CreateConversationRequest(BaseModel):
    lead_id: str
    channel: str = "SMS"
    initial_message: Optional[str] = None


def _time_ago(dt: Optional[datetime]) -> str:
    if not dt:
        return "Unknown"
    diff = datetime.utcnow() - dt
    if diff.seconds < 60:
        return "Just now"
    if diff.seconds < 3600:
        return f"{diff.seconds // 60} min ago"
    if diff.days == 0:
        return f"{diff.seconds // 3600} hr ago"
    return f"{diff.days}d ago"


def _enrich(conv: Conversation, lead: Lead, idx: int) -> ConversationResponse:
    msgs = conv.messages or []
    last_msg = msgs[-1]["text"] if msgs else ""
    return ConversationResponse(
        id=conv.id,
        lead_id=conv.lead_id,
        lead_name=lead.name if lead else "Unknown",
        lead_avatar=AVATAR_COLORS[idx % len(AVATAR_COLORS)],
        channel=conv.channel,
        status=conv.status,
        last_msg=last_msg,
        time=_time_ago(conv.updated_at),
        msg_count=len(msgs),
        sentiment=conv.sentiment,
        ai_handled=conv.ai_handled,
        messages=msgs,
    )


@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    convs = db.query(Conversation).filter(
        Conversation.agency_id == current_user.agency_id
    ).order_by(Conversation.updated_at.desc()).all()

    result = []
    for i, conv in enumerate(convs):
        lead = db.query(Lead).filter(Lead.id == conv.lead_id).first()
        result.append(_enrich(conv, lead, i))
    return result


@router.get("/{conv_id}", response_model=ConversationResponse)
def get_conversation(
    conv_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.agency_id == current_user.agency_id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    lead = db.query(Lead).filter(Lead.id == conv.lead_id).first()
    return _enrich(conv, lead, 0)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: CreateConversationRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == payload.lead_id,
        Lead.agency_id == current_user.agency_id,
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    initial_msgs = []
    if payload.initial_message:
        initial_msgs.append({
            "from": "ai",
            "text": payload.initial_message,
            "ts": datetime.utcnow().isoformat(),
        })

    conv = Conversation(
        lead_id=lead.id,
        agency_id=current_user.agency_id,
        channel=payload.channel,
        status="active",
        messages=initial_msgs,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _enrich(conv, lead, 0)


@router.post("/{conv_id}/message")
def add_message(
    conv_id: str,
    body: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Add a message to a conversation thread."""
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.agency_id == current_user.agency_id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs = conv.messages or []
    msgs.append({
        "from": body.get("from", "ai"),
        "text": body.get("text", ""),
        "ts": datetime.utcnow().isoformat(),
    })
    conv.messages = msgs
    conv.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "ok", "message_count": len(msgs)}


@router.post("/{conv_id}/takeover")
def takeover_conversation(
    conv_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Flag a conversation as human-handled and set status to human-required."""
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.agency_id == current_user.agency_id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.ai_handled = False
    conv.status = "human-required"
    conv.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "ok", "ai_handled": False}
