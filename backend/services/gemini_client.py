import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Ensure environment variables are loaded from backend/.env
load_dotenv()

logger = logging.getLogger("agripulse.gemini")

# Single shared initialization of GEMINI_API_KEY from environment
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

def is_gemini_configured() -> bool:
    """Checks if a valid Gemini API key is configured."""
    return bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("mock_") and len(GEMINI_API_KEY) > 10)

def verify_gemini_startup():
    """Startup verification called on server boot."""
    if not is_gemini_configured():
        logger.warning(
            "⚠️ GEMINI_API_KEY is not configured or is empty in backend/.env. "
            "The platform will run in resilient local agronomy mode. "
            "To enable live Gemini AI, add GEMINI_API_KEY=your_key to your backend/.env file."
        )
    else:
        logger.info("✅ Gemini API Key detected and initialized for Copilot pipeline.")

def call_gemini(
    prompt: str,
    system_instruction: str,
    temperature: float = 0.2,
    response_mime_type: str = "application/json",
    timeout_secs: float = 5.0
) -> Optional[Dict[str, Any]]:
    """
    Single shared helper to execute Google Gemini 2.5 Flash API calls.
    Returns parsed JSON dict or None on failure.
    """
    if not is_gemini_configured():
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\n{prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": response_mime_type
            }
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=timeout_secs) as resp:
            raw_response = resp.read().decode("utf-8")
            result = json.loads(raw_response)
            candidate = result.get("candidates", [{}])[0]
            part_text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            if part_text:
                return json.loads(part_text)
    except Exception as e:
        logger.warning(f"Gemini API request note: {e}")
        return None

    return None
