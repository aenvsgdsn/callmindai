from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    source: Optional[str] = "manual"
    intent: Optional[str] = "buy"

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    intent: Optional[str] = None
    status: Optional[str] = None
    contact_eligibility: Optional[bool] = None

class LeadResponse(LeadBase):
    id: str
    agency_id: str
    status: str
    contact_eligibility: bool
    consent_status: str
    created_at: datetime

    class Config:
        from_attributes = True