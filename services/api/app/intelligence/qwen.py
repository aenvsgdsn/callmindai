import json
import requests
from typing import Dict, Any
from app.core.config import settings
from app.policy.engine import PolicyEngine, PolicyEvaluationResult

AI_DISCLOSURE_PROMPT = (
    "You are CallMind AI, an automated lead qualification assistant calling on behalf of {agency_name}. "
    "Under no circumstances should you claim to be human. "
    "Never guarantee investment returns, ROI, or property capital appreciation. "
    "Only extract: intent, location, budget, bedrooms, timeline, and purchase purpose."
)

class QwenIntelligenceService:
    def __init__(self):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.endpoint = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"

    def analyze_conversation_turn(
        self,
        lead_id: str,
        user_message: str,
        agency_name: str,
        conversation_history: list[dict]
    ) -> Dict[str, Any]:
        # Pre-filter through policy engine
        policy_result: PolicyEvaluationResult = PolicyEngine.evaluate_incoming_message(user_message)
        
        if policy_result.is_blocked or policy_result.escalate_to_human:
            return {
                "blocked": policy_result.is_blocked,
                "escalate": policy_result.escalate_to_human,
                "action": policy_result.action,
                "response": policy_result.system_response,
                "extracted_fields": {}
            }

        system_instruction = AI_DISCLOSURE_PROMPT.format(agency_name=agency_name)
        messages = [{"role": "system", "content": system_instruction}] + conversation_history
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": "qwen-plus",
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            response = requests.post(self.endpoint, headers=headers, json=body, timeout=10)
            response.raise_for_status()
            res_json = response.json()
            llm_content = res_json["choices"][0]["message"]["content"]
            parsed_data = json.loads(llm_content)
        except Exception:
            return {
                "blocked": False,
                "escalate": True,
                "action": "FALLBACK_ESCALATION",
                "response": "I am having trouble processing that right now. Connecting you with our property agent.",
                "extracted_fields": {}
            }

        return {
            "blocked": False,
            "escalate": parsed_data.get("escalate_to_human", False),
            "action": "CONTINUE",
            "response": parsed_data.get("reply_message"),
            "extracted_fields": parsed_data.get("extracted_preferences", {})
        }