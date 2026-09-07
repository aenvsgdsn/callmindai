"""
Strategies router: list, approve, reject qualification strategies.
Merged from approvals.py + new list endpoint.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import QualificationStrategy, Lead, User
from app.schemas.strategy import StrategyApprovalRequest, StrategyResponse
from app.core.security import CurrentUser, get_current_user, require_role
from app.services.audit import record_audit_log

router = APIRouter(prefix="/strategies", tags=["Strategies"])


class StrategyWithLead(BaseModel):
    id: str
    lead_id: str
    lead_name: str
    lead_avatar_color: str
    objective: str
    questions: List[str]
    status: str
    approved_by: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


AVATAR_COLORS = ["v", "b", "g", "a", "r"]


@router.get("", response_model=List[StrategyWithLead])
def list_strategies(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all qualification strategies for this agency, joined with lead name."""
    query = db.query(QualificationStrategy).join(Lead).filter(
        Lead.agency_id == current_user.agency_id
    )
    if status_filter:
        query = query.filter(QualificationStrategy.status == status_filter)

    strategies = query.order_by(QualificationStrategy.created_at.desc()).all()

    result = []
    for i, s in enumerate(strategies):
        lead = db.query(Lead).filter(Lead.id == s.lead_id).first()
        result.append(StrategyWithLead(
            id=s.id,
            lead_id=s.lead_id,
            lead_name=lead.name if lead else "Unknown",
            lead_avatar_color=AVATAR_COLORS[i % len(AVATAR_COLORS)],
            objective=s.objective,
            questions=s.questions or [],
            status=s.status,
            approved_by=s.approved_by,
            created_at=s.created_at.strftime("%b %d, %I:%M %p") if s.created_at else "",
        ))
    return result


@router.post("/{strategy_id}/approve", response_model=StrategyResponse)
def approve_strategy(
    strategy_id: str,
    payload: StrategyApprovalRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(["agency_admin", "sales_manager"])),
):
    strategy = db.query(QualificationStrategy).join(Lead).filter(
        QualificationStrategy.id == strategy_id,
        Lead.agency_id == current_user.agency_id
    ).first()

    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found or access denied")

    strategy.status = "approved"
    strategy.approved_by = current_user.id
    if payload.custom_questions:
        strategy.questions = payload.custom_questions

    db.commit()
    db.refresh(strategy)

    record_audit_log(
        db=db,
        agency_id=current_user.agency_id,
        actor_type="user",
        actor_id=current_user.id,
        event_type="strategy_approved",
        entity_type="strategy",
        entity_id=strategy.id,
        metadata={"approved_by": current_user.email}
    )
    return strategy


@router.post("/{strategy_id}/reject")
def reject_strategy(
    strategy_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(["agency_admin", "sales_manager"])),
):
    strategy = db.query(QualificationStrategy).join(Lead).filter(
        QualificationStrategy.id == strategy_id,
        Lead.agency_id == current_user.agency_id
    ).first()

    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found or access denied")

    strategy.status = "rejected"
    db.commit()

    record_audit_log(
        db=db,
        agency_id=current_user.agency_id,
        actor_type="user",
        actor_id=current_user.id,
        event_type="strategy_rejected",
        entity_type="strategy",
        entity_id=strategy.id,
        metadata={"rejected_by": current_user.email}
    )
    return {"status": "rejected", "strategy_id": strategy_id}
