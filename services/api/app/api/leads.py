"""
Leads router — Supabase-powered.
Optimized: all queries use Supabase PostgREST with proper filtering.
No N+1 queries, no SQLAlchemy.
"""
import re
import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from pydantic import BaseModel

from app.db.supabase_client import sb
from app.core.security import CurrentUser, get_current_user

router = APIRouter(prefix="/leads", tags=["Leads"])

AVATAR_COLORS = ["v", "b", "g", "a", "r"]


# ── Schemas ───────────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    source: Optional[str] = "manual"
    intent: Optional[str] = "buy"
    budget: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    intent: Optional[str] = None
    budget: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    contact_eligibility: Optional[bool] = None
    consent_status: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_leads(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List all leads for the agency — single optimized Supabase query."""
    query = sb().table("leads").select("*").eq(
        "agency_id", current_user.agency_id
    ).order("created_at", desc=True).range(offset, offset + limit - 1)

    if status_filter:
        query = query.eq("status", status_filter)

    res = query.execute()
    return res.data or []


@router.post("", status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    cleaned_phone = re.sub(r"[^\d+]", "", payload.phone)
    insert_data = {
        "agency_id":           current_user.agency_id,
        "name":                payload.name.strip(),
        "phone":               cleaned_phone,
        "email":               payload.email.lower().strip() if payload.email else None,
        "source":              payload.source or "manual",
        "intent":              payload.intent or "buy",
        "status":              "new",
        "contact_eligibility": True,
        "consent_status":      "opted_in",
    }
    if payload.budget:   insert_data["budget"]   = payload.budget
    if payload.location: insert_data["location"] = payload.location
    if payload.notes:    insert_data["notes"]    = payload.notes

    res = sb().table("leads").insert(insert_data).execute()
    lead = res.data[0]

    # Audit log
    sb().table("audit_logs").insert({
        "agency_id":   current_user.agency_id,
        "actor_type":  "user",
        "actor_id":    current_user.id,
        "event_type":  "lead_created",
        "entity_type": "lead",
        "entity_id":   lead["id"],
        "metadata":    {"source": lead["source"]},
    }).execute()

    return lead


@router.get("/{lead_id}")
def get_lead(
    lead_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    res = sb().table("leads").select("*").eq("id", lead_id).eq(
        "agency_id", current_user.agency_id
    ).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return res.data


@router.get("/{lead_id}/appointments")
def get_lead_appointments(
    lead_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Return all appointments for a specific lead — for the lead detail panel."""
    # Verify lead belongs to agency
    lead_res = sb().table("leads").select("id").eq("id", lead_id).eq(
        "agency_id", current_user.agency_id
    ).single().execute()
    if not lead_res.data:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Single JOIN-style query using PostgREST foreign key expansion
    res = sb().table("appointments").select(
        "*, agent:users(name)"
    ).eq("lead_id", lead_id).eq(
        "agency_id", current_user.agency_id
    ).order("scheduled_at", desc=True).execute()

    return res.data or []


@router.patch("/{lead_id}")
def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    # Verify ownership
    check = sb().table("leads").select("id").eq("id", lead_id).eq(
        "agency_id", current_user.agency_id
    ).single().execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = sb().table("leads").update(update_data).eq("id", lead_id).execute()
    return res.data[0]


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    check = sb().table("leads").select("id").eq("id", lead_id).eq(
        "agency_id", current_user.agency_id
    ).single().execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Lead not found")

    sb().table("leads").delete().eq("id", lead_id).execute()


@router.post("/import")
async def import_leads_csv(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    batch = []
    for row in reader:
        name  = (row.get("name", "") or "").strip()
        phone = re.sub(r"[^\d+]", "", row.get("phone", "") or "")
        email = (row.get("email", "") or "").lower().strip() or None
        intent = (row.get("intent", "buy") or "buy").lower()

        if not name or not phone:
            continue

        batch.append({
            "agency_id":           current_user.agency_id,
            "name":                name,
            "phone":               phone,
            "email":               email,
            "source":              "csv_import",
            "intent":              intent if intent in ["buy","rent","invest","sell"] else "buy",
            "status":              "new",
            "contact_eligibility": True,
            "consent_status":      "opted_in",
        })

    if batch:
        sb().table("leads").insert(batch).execute()

    return {"status": "success", "imported_count": len(batch)}