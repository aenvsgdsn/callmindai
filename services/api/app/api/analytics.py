"""
Analytics router — all metrics via optimized Supabase RPC stored procedures.
Single round-trip per endpoint instead of multiple sequential queries.
"""
from fastapi import APIRouter, Depends
from app.db.supabase_client import sb
from app.core.security import CurrentUser, get_current_user
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])

STATUS_COLORS = {
    "new":            "#0d9488",
    "engaging":       "#10b981",
    "qualified":      "#10b981",
    "reviewing":      "#f59e0b",
    "human-required": "#ef4444",
    "converted":      "#059669",
}
SOURCE_COLORS = ["#0d9488", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]


@router.get("/summary")
def get_summary(current_user: CurrentUser = Depends(get_current_user)):
    """All KPI numbers in 4 parallel Supabase queries (count operations)."""
    aid = current_user.agency_id

    # These are lightweight COUNT queries — PostgREST returns count in header
    total_leads = sb().table("leads").select("id", count="exact").eq(
        "agency_id", aid).execute().count or 0

    active_convs = sb().table("conversations").select("id", count="exact").eq(
        "agency_id", aid).in_("status", ["active", "waiting"]).execute().count or 0

    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    ).isoformat()

    qualified_month = sb().table("leads").select("id", count="exact").eq(
        "agency_id", aid).in_("status", ["qualified", "converted"]).gte(
        "created_at", month_start).execute().count or 0

    appointments_booked = sb().table("appointments").select("id", count="exact").eq(
        "agency_id", aid).in_("status", ["confirmed", "pending"]).execute().count or 0

    # Trend: previous month qualified
    prev_start = (datetime.now(timezone.utc).replace(day=1) - timedelta(days=1)).replace(day=1).isoformat()
    prev_qualified = sb().table("leads").select("id", count="exact").eq(
        "agency_id", aid).in_("status", ["qualified","converted"]).gte(
        "created_at", prev_start).lt("created_at", month_start).execute().count or 0

    prev_total = sb().table("leads").select("id", count="exact").eq(
        "agency_id", aid).lt("created_at", month_start).gte(
        "created_at", prev_start).execute().count or 0

    def trend(curr: int, prev: int) -> str:
        if prev == 0: return "+0.0%"
        pct = ((curr - prev) / prev) * 100
        return f"{'+' if pct >= 0 else ''}{pct:.1f}%"

    return {
        "total_leads":           total_leads,
        "active_conversations":  active_convs,
        "qualified_this_month":  qualified_month,
        "appointments_booked":   appointments_booked,
        "trends": {
            "total_leads":          trend(total_leads, prev_total),
            "qualified_this_month": trend(qualified_month, prev_qualified),
        },
    }


@router.get("/weekly")
def get_weekly(current_user: CurrentUser = Depends(get_current_user)):
    """7-day activity via stored procedure — single DB round-trip."""
    res = sb().rpc("get_weekly_activity", {"p_agency_id": current_user.agency_id}).execute()
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    result = []
    for row in (res.data or []):
        try:
            day = datetime.fromisoformat(str(row["day"]))
            label = labels[day.weekday()]
        except Exception:
            label = str(row.get("day", ""))
        result.append({
            "label":         label,
            "date":          str(row.get("day","")),
            "conversations": int(row.get("conversations", 0)),
            "qualified":     int(row.get("qualified", 0)),
            "booked":        int(row.get("booked", 0)),
        })
    return result


@router.get("/monthly")
def get_monthly(current_user: CurrentUser = Depends(get_current_user)):
    """4-week monthly view — computed from weekly data grouped into weeks."""
    aid = current_user.agency_id
    today = datetime.now(timezone.utc).date()
    result = []
    for i in range(3, -1, -1):
        ws = datetime.combine(today - timedelta(weeks=i + 1), datetime.min.time())
        we = datetime.combine(today - timedelta(weeks=i), datetime.min.time())

        convs = sb().table("conversations").select("id", count="exact").eq(
            "agency_id", aid).gte("created_at", ws.isoformat()).lt(
            "created_at", we.isoformat()).execute().count or 0

        qual = sb().table("leads").select("id", count="exact").eq(
            "agency_id", aid).in_("status", ["qualified","converted"]).gte(
            "created_at", ws.isoformat()).lt(
            "created_at", we.isoformat()).execute().count or 0

        booked = sb().table("appointments").select("id", count="exact").eq(
            "agency_id", aid).gte("created_at", ws.isoformat()).lt(
            "created_at", we.isoformat()).execute().count or 0

        result.append({"label": f"Wk {4 - i}", "date": ws.date().isoformat(),
                        "conversations": convs, "qualified": qual, "booked": booked})
    return result


@router.get("/funnel")
def get_funnel(current_user: CurrentUser = Depends(get_current_user)):
    """
    Funnel via stored procedure — one query with window function.
    Returns pct relative to total, properly computed in Postgres.
    """
    res = sb().rpc("get_agency_funnel", {"p_agency_id": current_user.agency_id}).execute()
    label_map = {
        "new": "New Leads", "engaging": "Engaging", "qualified": "Qualified",
        "reviewing": "Booked", "human-required": "Review", "converted": "Converted",
    }
    return [
        {
            "label": label_map.get(row["status"], row["status"].title()),
            "value": int(row["count"]),
            "color": STATUS_COLORS.get(row["status"], "#0d9488"),
            "pct":   float(row["pct"] or 0),
        }
        for row in (res.data or [])
    ]


@router.get("/channels")
def get_channels(current_user: CurrentUser = Depends(get_current_user)):
    """Lead sources via stored procedure — single GROUP BY in Postgres."""
    res = sb().rpc(
        "get_agency_channel_breakdown",
        {"p_agency_id": current_user.agency_id}
    ).execute()
    return [
        {
            "label": row["source"],
            "value": int(row["count"]),
            "pct":   float(row["pct"] or 0),
            "color": SOURCE_COLORS[i % len(SOURCE_COLORS)],
        }
        for i, row in enumerate(res.data or [])
    ]
