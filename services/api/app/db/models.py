import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Agency(Base):
    __tablename__ = "agencies"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="agency")
    leads = relationship("Lead", back_populates="agency")

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # nullable for backward compat
    role = Column(String, default="agent")  # agent, sales_manager, agency_admin

    agency = relationship("Agency", back_populates="users")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(String, primary_key=True, default=gen_uuid)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    source = Column(String, default="manual")
    intent = Column(String, default="buy")
    status = Column(String, default="new")
    contact_eligibility = Column(Boolean, default=True)
    consent_status = Column(String, default="opted_in")
    created_at = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="leads")
    strategies = relationship("QualificationStrategy", back_populates="lead")

class QualificationStrategy(Base):
    __tablename__ = "qualification_strategies"
    id = Column(String, primary_key=True, default=gen_uuid)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    objective = Column(String, nullable=False)
    questions = Column(JSON, default=list)
    status = Column(String, default="pending")  # pending, approved, rejected
    approved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="strategies")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    agency_id = Column(String, nullable=False)
    actor_type = Column(String, nullable=False)
    actor_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class Conversation(Base):
    """Tracks AI conversation threads with leads."""
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=gen_uuid)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    channel = Column(String, default="SMS")  # SMS, Email, Voice
    status = Column(String, default="active")  # active, waiting, completed, human-required
    sentiment = Column(String, default="neutral")  # positive, neutral, negative
    ai_handled = Column(Boolean, default=True)
    messages = Column(JSON, default=list)  # [{from: 'ai'|'lead', text: '...', ts: '...'}]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lead = relationship("Lead", foreign_keys=[lead_id])

class Appointment(Base):
    """Tracks scheduled viewings, consultations, etc."""
    __tablename__ = "appointments"
    id = Column(String, primary_key=True, default=gen_uuid)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    agency_id = Column(String, ForeignKey("agencies.id"), nullable=False)
    date = Column(String, nullable=False)          # e.g. "Aug 28, 2026"
    time = Column(String, nullable=False)          # e.g. "2:00 PM"
    duration = Column(String, default="60 min")
    appointment_type = Column(String, default="Property Viewing")
    property_address = Column(String, nullable=True)
    agent = Column(String, nullable=True)
    status = Column(String, default="pending")     # pending, confirmed, completed, invited
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", foreign_keys=[lead_id])