from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import QualificationStrategy, Lead
from app.schemas.strategy import StrategyApprovalRequest, StrategyResponse
from app.core.security import CurrentUser, require_role
from app.services.audit import record_audit_log

router = APIRouter(prefix="/strategies", tags=["Approvals"])

@router.post("/{strategy_id}/approve", response_model=StrategyResponse)
def approve_strategy(
    strategy_id: str,
    payload: StrategyApprovalRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(["agency_admin", "sales_manager"]))
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
    current_user: CurrentUser = Depends(require_role(["agency_admin", "sales_manager"]))
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