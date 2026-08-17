import os
import json
import urllib.request
import urllib.error
import time
from typing import Dict, Any, Optional

# Load GEMINI_API_KEY from environment or local .env
def get_gemini_key():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEY="):
                        key = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        break
    return key or ""

from typing import Dict, Any, Optional
from services.language_utils import (
    SUPPORTED_LANGUAGES,
    build_language_instruction,
    OFF_TOPIC_REFUSALS
)

def ask_gemini_agri_copilot(
    query: str, 
    language_code: str = "en", 
    context_crop: Optional[str] = "wheat", 
    role: str = "all",
    api_key: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    key = api_key or get_gemini_key()
    if not key:
        return None
    meta = SUPPORTED_LANGUAGES.get(language_code, SUPPORTED_LANGUAGES["en"])
    lang_name = f"{meta.native} ({meta.name})"
    lang_instr = build_language_instruction(meta.code)

    system_instruction = f"""
You are AgriPulse AI, India's leading AI Agricultural Economics, Agronomy, and APMC Mandi Market Intelligence Copilot.

CRITICAL RULES:
1. DOMAIN RESTRICTION: You MUST ONLY answer questions strictly relevant to Agriculture, Farming, Crops, Mandi Spot Prices, Price Forecasts, Weather/Monsoon advisories, Crop Pests/Diseases/Fertilizers, Warehouse Storage (WDRA) vs Sell decisions, Farm Machinery, Agricultural Policies (MSP, PM-Kisan, Export/Import Duties), and Direct Farmgate-to-Buyer Trading.
2. OUT-OF-SCOPE QUESTIONS: If the user asks about anything outside agriculture, farming, or agricultural market trading (e.g. coding, software, general history, movies, politics, entertainment, gaming, sports, etc.), you MUST politely DECLINE in the requested language: {lang_name} and instruct them to ask about farming, crops, or mandi prices.
3. {lang_instr}
4. OUTPUT FORMAT: Output ONLY a valid, parseable JSON object with no markdown backticks, matching this exact schema:
{{
  "is_agri_related": true,
  "voice_response": "A crisp, natural-sounding response (2-3 sentences) in {lang_name} explaining the market insight or crop advice.",
  "action_title": "A short, actionable title in {lang_name}",
  "action_details": "Detailed actionable steps or recommendations in {lang_name}",
  "key_stats": [
    {{"label": "Metric 1 in {lang_name}", "val": "Value 1"}},
    {{"label": "Metric 2 in {lang_name}", "val": "Value 2"}}
  ],
  "suggested_followups": [
    "Follow-up question 1 in {lang_name}",
    "Follow-up question 2 in {lang_name}",
    "Follow-up question 3 in {lang_name}"
  ]
}}
If not agri-related, set "is_agri_related": false, provide a polite refusal in {lang_name} in "voice_response", and provide 3 agricultural questions in "suggested_followups".
"""

    prompt = f"""
Context:
- Current Target Crop: {context_crop}
- User Persona: {role} (Farmer / Buyer / Trader)
- User Question: {query}
- Response Language: {lang_name} ({language_code})

Provide agricultural response strictly as JSON:
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": system_instruction + "\n\n" + prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000,
            "responseMimeType": "application/json"
        }
    }

    models_to_try = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"]

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url, 
                data=req_data, 
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    resp_body = response.read().decode("utf-8")
                    resp_json = json.loads(resp_body)
                    text_content = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Clean any potential markdown wrapper
                    text_content = text_content.strip()
                    if text_content.startswith("```json"):
                        text_content = text_content[7:]
                    if text_content.startswith("```"):
                        text_content = text_content[3:]
                    if text_content.endswith("```"):
                        text_content = text_content[:-3]
                    
                    parsed = json.loads(text_content.strip())
                    return parsed
        except urllib.error.HTTPError as he:
            # 429 rate limit or 404 model not found
            continue
        except Exception as e:
            continue

    return None
