"""Audit log helper — now uses supabase-py instead of SQLAlchemy."""
from app.db.supabase_client import sb


def record_audit_log(
    agency_id: str,
    actor_type: str,
    actor_id: str,
    event_type: str,
    entity_type: str,
    entity_id: str,
    metadata: dict = None,
    # legacy param ignored (kept for call-site compat)
    db=None,
):
    try:
        sb().table("audit_logs").insert({
            "agency_id":   agency_id,
            "actor_type":  actor_type,
            "actor_id":    actor_id,
            "event_type":  event_type,
            "entity_type": entity_type,
            "entity_id":   entity_id,
            "metadata":    metadata or {},
        }).execute()
    except Exception:
        pass  # audit failure should never crash the main operation