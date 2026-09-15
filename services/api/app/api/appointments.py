"""
Appointments router — Supabase-powered.
Auto lead-status transition is handled by PostgreSQL trigger (on_appointment_created).
Uses PostgREST JOIN for lead + agent name in a single query.
"""
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.db.supabase_client import sb
from app.core.security import CurrentUser, get_current_user
from app.services.email_service import send_appointment_email
import threading

router = APIRouter(prefix="/appointments", tags=["Appointments"])

AVATAR_COLORS = ["v", "b", "g", "a", "r"]


# ── Schemas ───────────────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    lead_id: str
    # ISO datetime string from frontend e.g. "2026-09-20T14:00:00"
    date: str           # kept as "date" for frontend compat — stored as scheduled_at
    time: str
    duration: str = "60 min"
    appointment_type: str = "Property Viewing"
    property_address: Optional[str] = None
    agent: Optional[str] = None
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _enrich(appt: dict, idx: int) -> dict:
    """Flatten PostgREST nested join + format for frontend."""
    lead  = appt.get("lead")  or {}
    agent = appt.get("agent_user") or {}

    # Parse scheduled_at back to date/time strings the frontend expects
    scheduled_at = appt.get("scheduled_at", "")
    try:
        dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))
        date_str = dt.strftime("%b %d, %Y")
        time_str = dt.strftime("%-I:%M %p") if appt.get("time") is None else appt.get("time","")
    except Exception:
        date_str = appt.get("date", scheduled_at)
        time_str = appt.get("time", "")

    dur_min = appt.get("duration_minutes", 60)

    return {
        "id":               appt["id"],
        "lead_id":          appt["lead_id"],
        "lead_name":        lead.get("name", "Unknown"),
        "lead_email":       lead.get("email"),
        "lead_avatar":      AVATAR_COLORS[idx % len(AVATAR_COLORS)],
        "date":             date_str,
        "time":             time_str,
        "duration":         f"{dur_min} min",
        "appointment_type": appt.get("appointment_type", "Property Viewing"),
        "property_address": appt.get("property_address"),
        "agent":            agent.get("name") or appt.get("agent_name"),
        "status":           appt.get("status", "pending"),
        "notes":            appt.get("notes"),
        "confirmation_token": appt.get("confirmation_token"),
    }


def _parse_scheduled_at(date_str: str, time_str: str) -> str:
    """
    Convert frontend date ('2026-09-20') + time ('2:00 PM') to ISO datetime.
    """
    try:
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
        return dt.isoformat()
    except Exception:
        try:
            return datetime.fromisoformat(date_str).isoformat()
        except Exception:
            return datetime.now(timezone.utc).isoformat()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_appointments(current_user: CurrentUser = Depends(get_current_user)):
    """
    Single optimized JOIN query — lead name + agent name in one round-trip.
    Old code: looped N separate db.query(Lead) calls.
    """
    res = sb().table("appointments").select(
        "*, lead:leads(name, email), agent_user:users(name)"
    ).eq("agency_id", current_user.agency_id
    ).order("scheduled_at", desc=True).execute()

    return [_enrich(a, i) for i, a in enumerate(res.data or [])]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    # Verify lead
    lead_res = sb().table("leads").select("id, name, email").eq(
        "id", payload.lead_id
    ).eq("agency_id", current_user.agency_id).single().execute()
    if not lead_res.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead = lead_res.data

    scheduled_at = _parse_scheduled_at(payload.date, payload.time)
    try:
        dur_min = int(payload.duration.split()[0])
    except Exception:
        dur_min = 60

    res = sb().table("appointments").insert({
        "lead_id":          payload.lead_id,
        "agency_id":        current_user.agency_id,
        "scheduled_at":     scheduled_at,
        "duration_minutes": dur_min,
        "appointment_type": payload.appointment_type,
        "property_address": payload.property_address,
        "notes":            payload.notes,
        "status":           "pending",
        # DB trigger automatically sets lead.status = 'reviewing'
    }).execute()

    appt = res.data[0]
    appt["lead"]       = lead
    appt["agent_user"] = {}
    appt["time"]       = payload.time

    # Fire-and-forget email confirmation
    if lead.get("email"):
        def _send():
            send_appointment_email(
                lead_name=lead["name"],
                lead_email=lead["email"],
                appointment_type=payload.appointment_type,
                date=payload.date,
                time=payload.time,
                duration=payload.duration,
                address=payload.property_address,
                notes=payload.notes,
                agent=payload.agent,
            )
        threading.Thread(target=_send, daemon=True).start()

    return _enrich(appt, 0)


@router.patch("/{appt_id}")
def update_appointment(
    appt_id: str,
    payload: AppointmentUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    check = sb().table("appointments").select("id, lead_id").eq(
        "id", appt_id
    ).eq("agency_id", current_user.agency_id).single().execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_data: dict = {}
    if payload.status is not None: update_data["status"] = payload.status
    if payload.notes  is not None: update_data["notes"]  = payload.notes
    if payload.date   is not None:
        update_data["scheduled_at"] = _parse_scheduled_at(
            payload.date, payload.time or "09:00 AM"
        )

    if update_data:
        sb().table("appointments").update(update_data).eq("id", appt_id).execute()

    # Return enriched record
    res = sb().table("appointments").select(
        "*, lead:leads(name, email), agent_user:users(name)"
    ).eq("id", appt_id).single().execute()
    return _enrich(res.data, 0)
