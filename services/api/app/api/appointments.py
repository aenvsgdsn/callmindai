"""
Appointments router: manage scheduled viewings, consultations, etc.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import threading

from app.db.database import get_db
from app.db.models import Appointment, Lead
from app.core.security import CurrentUser, get_current_user
from app.services.email_service import send_appointment_email

router = APIRouter(prefix="/appointments", tags=["Appointments"])


AVATAR_COLORS = ["v", "b", "g", "a", "r"]


class AppointmentResponse(BaseModel):
    id: str
    lead_id: str
    lead_name: str
    lead_avatar: str
    date: str
    time: str
    duration: str
    appointment_type: str
    property_address: Optional[str]
    agent: Optional[str]
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True


class CreateAppointmentRequest(BaseModel):
    lead_id: str
    date: str
    time: str
    duration: str = "60 min"
    appointment_type: str = "Property Viewing"
    property_address: Optional[str] = None
    agent: Optional[str] = None
    notes: Optional[str] = None


class UpdateAppointmentRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None


def _enrich(appt: Appointment, lead: Optional[Lead], idx: int) -> AppointmentResponse:
    return AppointmentResponse(
        id=appt.id,
        lead_id=appt.lead_id,
        lead_name=lead.name if lead else "Unknown",
        lead_avatar=AVATAR_COLORS[idx % len(AVATAR_COLORS)],
        date=appt.date,
        time=appt.time,
        duration=appt.duration,
        appointment_type=appt.appointment_type,
        property_address=appt.property_address,
        agent=appt.agent,
        status=appt.status,
        notes=appt.notes,
    )


@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    appts = db.query(Appointment).filter(
        Appointment.agency_id == current_user.agency_id
    ).order_by(Appointment.created_at.desc()).all()

    result = []
    for i, appt in enumerate(appts):
        lead = db.query(Lead).filter(Lead.id == appt.lead_id).first()
        result.append(_enrich(appt, lead, i))
    return result


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: CreateAppointmentRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == payload.lead_id,
        Lead.agency_id == current_user.agency_id,
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    appt = Appointment(
        lead_id=lead.id,
        agency_id=current_user.agency_id,
        date=payload.date,
        time=payload.time,
        duration=payload.duration,
        appointment_type=payload.appointment_type,
        property_address=payload.property_address,
        agent=payload.agent,
        status="pending",
        notes=payload.notes,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    # Fire-and-forget email — runs in background so it doesn't block the response
    if lead.email:
        def _send():
            send_appointment_email(
                lead_name=lead.name,
                lead_email=lead.email,
                appointment_type=payload.appointment_type,
                date=payload.date,
                time=payload.time,
                duration=payload.duration,
                address=payload.property_address,
                notes=payload.notes,
                agent=payload.agent,
            )
        threading.Thread(target=_send, daemon=True).start()

    return _enrich(appt, lead, 0)


@router.patch("/{appt_id}", response_model=AppointmentResponse)
def update_appointment(
    appt_id: str,
    payload: UpdateAppointmentRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.agency_id == current_user.agency_id,
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if payload.status is not None:
        appt.status = payload.status
    if payload.notes is not None:
        appt.notes = payload.notes
    if payload.date is not None:
        appt.date = payload.date
    if payload.time is not None:
        appt.time = payload.time

    db.commit()
    db.refresh(appt)
    lead = db.query(Lead).filter(Lead.id == appt.lead_id).first()
    return _enrich(appt, lead, 0)
