import csv
import io
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Lead
from app.schemas.lead import LeadCreate, LeadResponse
from app.core.security import CurrentUser, get_current_user
from app.services.audit import record_audit_log

router = APIRouter(prefix="/leads", tags=["Leads"])


def sanitize_csv_cell(cell: str) -> str:
    if cell and cell.strip().startswith(("=", "+", "-", "@", "\t", "\r")):
        return "'" + cell.strip()
    return cell.strip()


@router.get("", response_model=List[LeadResponse])
def list_leads(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all leads for the current agency."""
    query = db.query(Lead).filter(Lead.agency_id == current_user.agency_id)
    if status_filter:
        query = query.filter(Lead.status == status_filter)
    return query.order_by(Lead.created_at.desc()).offset(offset).limit(limit).all()


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    cleaned_phone = re.sub(r"[^\d+]", "", payload.phone)
    new_lead = Lead(
        agency_id=current_user.agency_id,
        name=payload.name.strip(),
        phone=cleaned_phone,
        email=str(payload.email).lower().strip() if payload.email else None,
        source=payload.source or "manual",
        intent=payload.intent or "buy",
        status="new",
        contact_eligibility=True,
        consent_status="opted_in"
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    record_audit_log(
        db=db,
        agency_id=current_user.agency_id,
        actor_type="user",
        actor_id=current_user.id,
        event_type="lead_created",
        entity_type="lead",
        entity_id=new_lead.id,
        metadata={"source": new_lead.source}
    )
    return new_lead


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.agency_id == current_user.agency_id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update lead status, intent, contact_eligibility."""
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.agency_id == current_user.agency_id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    allowed = {"status", "intent", "contact_eligibility", "consent_status"}
    for key, val in payload.items():
        if key in allowed:
            setattr(lead, key, val)

    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.agency_id == current_user.agency_id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()


@router.post("/import")
async def import_leads_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    created_leads = []
    for row in reader:
        name = sanitize_csv_cell(row.get("name", ""))
        phone = sanitize_csv_cell(row.get("phone", ""))
        email = sanitize_csv_cell(row.get("email", ""))
        intent = sanitize_csv_cell(row.get("intent", "buy"))

        if not name or not phone:
            continue

        cleaned_phone = re.sub(r"[^\d+]", "", phone)
        lead = Lead(
            agency_id=current_user.agency_id,
            name=name,
            phone=cleaned_phone,
            email=email.lower() if email else None,
            source="csv_import",
            intent=intent if intent in ["buy", "rent", "invest", "sell"] else "buy",
            status="new",
            contact_eligibility=True,
            consent_status="opted_in"
        )
        db.add(lead)
        created_leads.append(lead)

    db.commit()
    return {"status": "success", "imported_count": len(created_leads)}