from sqlalchemy.orm import Session
from app.db.models import AuditLog

def record_audit_log(
    db: Session,
    agency_id: str,
    actor_type: str,
    actor_id: str,
    event_type: str,
    entity_type: str,
    entity_id: str,
    metadata: dict = None
):
    log_entry = AuditLog(
        agency_id=agency_id,
        actor_type=actor_type,
        actor_id=actor_id,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=metadata or {}
    )
    db.add(log_entry)
    db.commit()