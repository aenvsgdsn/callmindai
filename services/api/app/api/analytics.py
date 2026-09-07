"""
Analytics router: computed metrics from the database.
GET /analytics/summary  — KPI stat card numbers
GET /analytics/weekly   — weekly engagement bar chart data
GET /analytics/funnel   — lead funnel data
GET /analytics/channels — lead sources breakdown
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.db.database import get_db
from app.db.models import Lead, QualificationStrategy, Conversation, Appointment
from app.core.security import CurrentUser, get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """Returns KPI numbers for the stat cards."""
    agency_id = current_user.agency_id

    total_leads = db.query(Lead).filter(Lead.agency_id == agency_id).count()

    active_convs = db.query(Conversation).filter(
        Conversation.agency_id == agency_id,
        Conversation.status.in_(["active", "waiting"])
    ).count()

    # Qualified this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    qualified_month = db.query(Lead).filter(
        Lead.agency_id == agency_id,
        Lead.status.in_(["qualified", "converted"]),
        Lead.created_at >= month_start,
    ).count()

    appointments_booked = db.query(Appointment).filter(
        Appointment.agency_id == agency_id,
        Appointment.status.in_(["confirmed", "pending"]),
    ).count()

    # Previous month for trend calculation
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)
    prev_total = db.query(Lead).filter(
        Lead.agency_id == agency_id,
        Lead.created_at < month_start,
        Lead.created_at >= prev_month_start,
    ).count()
    prev_qualified = db.query(Lead).filter(
        Lead.agency_id == agency_id,
        Lead.status.in_(["qualified", "converted"]),
        Lead.created_at >= prev_month_start,
        Lead.created_at < month_start,
    ).count()

    def trend(curr: int, prev: int) -> str:
        if prev == 0:
            return "+0.0%"
        pct = ((curr - prev) / prev) * 100
        sign = "+" if pct >= 0 else ""
        return f"{sign}{pct:.1f}%"

    return {
        "total_leads": total_leads,
        "active_conversations": active_convs,
        "qualified_this_month": qualified_month,
        "appointments_booked": appointments_booked,
        "trends": {
            "total_leads": trend(total_leads, prev_total),
            "qualified_this_month": trend(qualified_month, prev_qualified),
        }
    }


@router.get("/weekly")
def get_weekly(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Returns per-day counts for the last 7 days."""
    agency_id = current_user.agency_id
    today = datetime.utcnow().date()
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    result = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)

        conversations = db.query(Conversation).filter(
            Conversation.agency_id == agency_id,
            Conversation.created_at >= day_start,
            Conversation.created_at < day_end,
        ).count()

        qualified = db.query(Lead).filter(
            Lead.agency_id == agency_id,
            Lead.status.in_(["qualified", "converted"]),
            Lead.created_at >= day_start,
            Lead.created_at < day_end,
        ).count()

        booked = db.query(Appointment).filter(
            Appointment.agency_id == agency_id,
            Appointment.created_at >= day_start,
            Appointment.created_at < day_end,
        ).count()

        result.append({
            "label": labels[day.weekday()],
            "date": day.isoformat(),
            "conversations": conversations,
            "qualified": qualified,
            "booked": booked,
        })

    return result


@router.get("/monthly")
def get_monthly(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Returns per-week counts for the last 4 weeks (monthly view)."""
    agency_id = current_user.agency_id
    today = datetime.utcnow().date()
    result = []

    for i in range(3, -1, -1):
        week_start_date = today - timedelta(weeks=i + 1)
        week_end_date = today - timedelta(weeks=i)
        ws = datetime(week_start_date.year, week_start_date.month, week_start_date.day)
        we = datetime(week_end_date.year, week_end_date.month, week_end_date.day)

        conversations = db.query(Conversation).filter(
            Conversation.agency_id == agency_id,
            Conversation.created_at >= ws,
            Conversation.created_at < we,
        ).count()

        qualified = db.query(Lead).filter(
            Lead.agency_id == agency_id,
            Lead.status.in_(["qualified", "converted"]),
            Lead.created_at >= ws,
            Lead.created_at < we,
        ).count()

        booked = db.query(Appointment).filter(
            Appointment.agency_id == agency_id,
            Appointment.created_at >= ws,
            Appointment.created_at < we,
        ).count()

        result.append({
            "label": f"Wk {4 - i}",
            "date": week_start_date.isoformat(),
            "conversations": conversations,
            "qualified": qualified,
            "booked": booked,
        })

    return result


@router.get("/funnel")

def get_funnel(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Returns lead funnel breakdown by status."""
    agency_id = current_user.agency_id

    all_statuses = [
        ("new", "New Leads", "#0d9488"),
        ("engaging", "Engaging", "#10b981"),
        ("qualified", "Qualified", "#10B981"),
        ("reviewing", "Booked", "#F59E0B"),
        ("converted", "Converted", "#0d9488"),
    ]

    total = db.query(Lead).filter(Lead.agency_id == agency_id).count() or 1
    result = []

    for status_val, label, color in all_statuses:
        count = db.query(Lead).filter(
            Lead.agency_id == agency_id,
            Lead.status == status_val,
        ).count()
        result.append({
            "label": label,
            "value": count,
            "color": color,
            "pct": round((count / total) * 100),
        })

    return result


@router.get("/channels")
def get_channels(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Returns leads broken down by source/channel."""
    agency_id = current_user.agency_id

    sources = db.query(Lead.source, func.count(Lead.id)).filter(
        Lead.agency_id == agency_id
    ).group_by(Lead.source).all()

    total = sum(c for _, c in sources) or 1
    colors = ["#0d9488", "#10b981", "#10b981", "#f59e0b", "#6366f1"]

    return [
        {
            "label": src or "Unknown",
            "value": count,
            "pct": round((count / total) * 100),
            "color": colors[i % len(colors)],
        }
        for i, (src, count) in enumerate(sources)
    ]
