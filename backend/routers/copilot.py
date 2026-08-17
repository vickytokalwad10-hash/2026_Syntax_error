from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from services.agri_copilot_service import (
    detect_language,
    classify_domain,
    generate_response,
    LanguageInfo,
    DomainResult,
    CopilotResponse,
    OFF_TOPIC_REFUSALS,
    DEFAULT_AGRI_SUGGESTIONS
)

logger = logging.getLogger("agripulse.copilot_router")
router = APIRouter(prefix="/api/copilot", tags=["Multilingual Agri Copilot"])

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class CopilotQueryRequest(BaseModel):
    query: str = Field(..., description="User voice transcript or typed text in any Indian script or English")
    language: Optional[str] = Field("auto", description="Optional manual override code e.g. hi, mr, pa, or auto")
    context_crop: Optional[str] = Field(None, description="Active crop context from farm (e.g. wheat, mustard)")
    user_id: Optional[str] = Field("farmer_default", description="User identifier for session logging")
    location: Optional[str] = Field("Karnal, Haryana", description="Mandi district or farm location")


# ============================================================================
# COPILOT QUERY ENDPOINT (3-STEP PIPELINE)
# ============================================================================

@router.post("/query", response_model=CopilotResponse)
async def query_agri_copilot(req: CopilotQueryRequest):
    """
    Multilingual, Domain-Restricted Agri Copilot:
    1. Language & Script Detection (Auto-detects Devanagari, Gurmukhi, Telugu, Tamil, Kannada, Gujarati, Bengali, Malayalam, Odia, or Romanized Hindi).
    2. Domain Classification (Strict filter: Only Agriculture allowed. Out-of-domain is politely refused before LLM).
    3. Response Generation (Responds strictly in the same detected language and script with Indian farming context).
    """
    clean_query = req.query.strip()
    if not clean_query:
        lang_info = detect_language(clean_query, req.language)
        domain_res = classify_domain(clean_query, lang_info)
        return CopilotResponse(
            query=req.query,
            language=lang_info,
            domain=domain_res,
            response_text=domain_res.refusal_message or OFF_TOPIC_REFUSALS["en"],
            action_title="खाली प्रश्न • Empty Query",
            action_details="Please ask any farming, crop, fertilizer, weather, or mandi rate question.",
            key_stats=[],
            suggested_followups=DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, DEFAULT_AGRI_SUGGESTIONS["en"]),
            audio_tts_text=domain_res.refusal_message
        )

    # Step 1: Detect Language
    lang_info = detect_language(clean_query, req.language)
    logger.info(f"Copilot Language Detected: {lang_info.code} ({lang_info.name}) [Script: {lang_info.script}, Romanized: {lang_info.is_romanized}]")

    # Step 2: Domain Classification
    domain_result = classify_domain(clean_query, lang_info)
    logger.info(f"Copilot Domain Classification: is_agri={domain_result.is_agri}, category={domain_result.detected_category}")

    # Step 3: Generate Localized Response
    app_context = {
        "context_crop": req.context_crop,
        "user_id": req.user_id,
        "location": req.location
    }
    response = generate_response(clean_query, lang_info, app_context)

    return response


@router.get("/languages")
async def get_supported_languages():
    """
    Returns list of supported Indian languages with native names and script information.
    """
    return {
        "supported_languages": [
            {"code": "auto", "name": "🌐 Auto-Detect Language (बोलें या लिखें)", "script": "Any", "is_default": True},
            {"code": "hi", "name": "हिन्दी (Hindi)", "script": "Devanagari"},
            {"code": "mr", "name": "मराठी (Marathi)", "script": "Devanagari"},
            {"code": "pa", "name": "ਪੰਜਾਬੀ (Punjabi)", "script": "Gurmukhi"},
            {"code": "gu", "name": "ગુજરાતી (Gujarati)", "script": "Gujarati"},
            {"code": "te", "name": "తెలుగు (Telugu)", "script": "Telugu"},
            {"code": "ta", "name": "தமிழ் (Tamil)", "script": "Tamil"},
            {"code": "kn", "name": "ಕನ್ನಡ (Kannada)", "script": "Kannada"},
            {"code": "bn", "name": "বাংলা (Bengali)", "script": "Bengali"},
            {"code": "ml", "name": "മലയാളം (Malayalam)", "script": "Malayalam"},
            {"code": "or", "name": "ଓଡ଼ିଆ (Odia)", "script": "Odia"},
            {"code": "hi-Latn", "name": "Hinglish (Romanized Hindi)", "script": "Latin"},
            {"code": "en", "name": "English (Indian)", "script": "Latin"}
        ]
    }
