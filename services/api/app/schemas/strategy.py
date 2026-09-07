from pydantic import BaseModel
from typing import List, Optional

class StrategyApprovalRequest(BaseModel):
    custom_questions: Optional[List[str]] = None

class StrategyResponse(BaseModel):
    id: str
    lead_id: str
    objective: str
    questions: List[str]
    status: str
    approved_by: Optional[str] = None

    class Config:
        from_attributes = True