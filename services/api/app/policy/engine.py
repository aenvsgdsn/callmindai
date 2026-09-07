import re
from typing import Optional
from pydantic import BaseModel

class PolicyEvaluationResult(BaseModel):
    is_blocked: bool
    escalate_to_human: bool
    action: str
    system_response: Optional[str] = None
    reason: Optional[str] = None

class PolicyEngine:
    OPT_OUT_PATTERNS = [
        r"\b(stop|opt[\s-]?out|unsubscribe|do not call|don't call|remove me)\b"
    ]
    HUMAN_PATTERNS = [
        r"\b(human|agent|operator|representative|real person|manager)\b"
    ]
    GUARANTEE_PATTERNS = [
        r"\b(guarantee|guaranteed returns?|promise profit|roi guarantee)\b"
    ]
    INJECTION_PATTERNS = [
        r"(ignore previous instructions|system prompt|disregard prior|act as a)",
        r"(bypass policy|classify as high intent|force high intent)"
    ]

    @classmethod
    def evaluate_incoming_message(cls, text: str) -> PolicyEvaluationResult:
        normalized = text.strip().lower()

        for pattern in cls.OPT_OUT_PATTERNS:
            if re.search(pattern, normalized):
                return PolicyEvaluationResult(
                    is_blocked=True,
                    escalate_to_human=False,
                    action="OPT_OUT",
                    system_response="You have been unsubscribed. No further automated communications will be sent.",
                    reason="User requested opt-out"
                )

        for pattern in cls.HUMAN_PATTERNS:
            if re.search(pattern, normalized):
                return PolicyEvaluationResult(
                    is_blocked=False,
                    escalate_to_human=True,
                    action="ESCALATE_HUMAN",
                    system_response="I understand you would like to speak with a specialist. Transferring you to an agent now.",
                    reason="Direct human agent escalation requested"
                )

        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, normalized):
                return PolicyEvaluationResult(
                    is_blocked=True,
                    escalate_to_human=True,
                    action="SECURITY_ESCALATION",
                    system_response="I am an automated assistant for property inquiries. Let me connect you with an agent.",
                    reason="Potential prompt manipulation detected"
                )

        for pattern in cls.GUARANTEE_PATTERNS:
            if re.search(pattern, normalized):
                return PolicyEvaluationResult(
                    is_blocked=False,
                    escalate_to_human=False,
                    action="DISCLAIMER_REQUIRED",
                    system_response="Please note: We do not provide guaranteed investment returns. All real estate investments carry market risks.",
                    reason="Investment guarantee inquiry requires compliance disclaimer"
                )

        return PolicyEvaluationResult(
            is_blocked=False,
            escalate_to_human=False,
            action="PROCEED"
        )