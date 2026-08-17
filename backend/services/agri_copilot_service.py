import re
import os
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from services.gemini_client import call_gemini, is_gemini_configured
from services.language_utils import (
    SUPPORTED_LANGUAGES,
    detect_language_pipeline,
    build_language_instruction,
    OFF_TOPIC_REFUSALS,
    DEFAULT_AGRI_SUGGESTIONS
)

logger = logging.getLogger("agripulse.copilot_service")

# ============================================================================
# DATA MODELS
# ============================================================================

class LanguageInfo(BaseModel):
    code: str = Field(description="ISO language code e.g. hi, mr, pa, gu, te, ta, kn, bn, ml, or, en, hi-Latn")
    name: str = Field(description="Display name e.g. हिन्दी (Hindi)")
    script: str = Field(description="Script family e.g. Devanagari, Gurmukhi, Latin")
    is_romanized: bool = False
    confidence: float = 1.0


class DomainResult(BaseModel):
    is_agri: bool
    confidence: float
    detected_category: str = "general_agriculture"
    refusal_message: Optional[str] = None
    suggested_followups: List[str] = []


class CopilotResponse(BaseModel):
    query: str
    language: LanguageInfo
    domain: DomainResult
    response_text: str
    action_title: Optional[str] = None
    action_details: Optional[str] = None
    key_stats: List[Dict[str, str]] = []
    suggested_followups: List[str] = []
    audio_tts_text: Optional[str] = None


# ============================================================================
# STEP 1: LANGUAGE & SCRIPT DETECTION (FAST HEURISTICS + GEMINI AI FALLBACK)
# ============================================================================

def detect_language(query: str, manual_override: Optional[str] = None) -> LanguageInfo:
    """
    Detects language and script of incoming user text using the unified language_utils pipeline.
    """
    if manual_override and manual_override in SUPPORTED_LANGUAGES and manual_override != "auto":
        meta = SUPPORTED_LANGUAGES[manual_override]
        return LanguageInfo(
            code=meta.code,
            name=f"{meta.native} ({meta.name})" if meta.native != meta.name else meta.name,
            script=meta.script,
            is_romanized=False,
            confidence=1.0
        )
    elif manual_override == "hi-Latn":
        return LanguageInfo(
            code="hi-Latn",
            name="Hinglish (Romanized Hindi)",
            script="Latin",
            is_romanized=True,
            confidence=1.0
        )

    res = detect_language_pipeline(query)
    return LanguageInfo(
        code=res["code"],
        name=res["name"],
        script=res["script"],
        is_romanized=res.get("is_romanized", False),
        confidence=res.get("confidence", 0.95)
    )



# ============================================================================
# STEP 2: PRE-LLM DOMAIN CLASSIFICATION (AGRICULTURE vs OFF_TOPIC)
# ============================================================================

AGRI_CORE_KEYWORDS = [
    # Agronomy, Soil, Plants
    "crop", "crops", "farm", "farming", "farmer", "farmers", "agriculture", "agronomy",
    "soil", "fertilizer", "fertilizers", "npk", "urea", "dap", "ssp", "mop", "manure",
    "compost", "zinc", "nitrogen", "phosphorus", "potash", "irrigation", "drip",
    "sprinkler", "borewell", "harvest", "harvesting", "sowing", "seed", "seeds",
    "germination", "yield", "acre", "hectare", "quintal", "pesticide",
    "fungicide", "insecticide", "herbicide", "weed", "weeds", "pest", "disease", "blight",
    "rust", "rot", "wilt", "borer", "aphid", "whitefly", "bollworm",

    # Commodities (English & Indic)
    "wheat", "paddy", "rice", "basmati", "cotton", "mustard", "soybean", "soya", "sugarcane",
    "maize", "corn", "onion", "tomato", "potato", "chilli", "turmeric", "gram", "chana",
    "moong", "urad", "arhar", "tur", "groundnut", "peanut", "garlic", "ginger", "banana",
    "mango", "apple", "grape", "orange", "millets", "bajra", "jowar", "ragi",
    "गेहूं", "गहू", "धान", "तांदूळ", "चावल", "कपास", "कापूस", "सरसों", "सोयाबीन", "गन्ना",
    "उस", "मक्का", "प्याज", "कांदा", "टमाटर", "टोमॅटो", "आलू", "बटाटा", "मिर्च", "चना",
    "मूंग", "उड़द", "अरहर", "तूर", "मूंगफली", "लहसुन", "अदरक", "बाजरा", "ज्वार", "रागी",
    "ਕਣਕ", "ਮੱਕੀ", "ਝੋਨਾ", "ਨਰਮਾ", "ਸਰ੍ਹੋਂ", "ਮਗਫળી", "કપાસ", "ડાંગર", "ઘઉં", "બાજરી",
    "వరి", "పత్తి", "మిరప", "వేరుశనగ", "మొక్కజొన్న", "நெல்", "பருத்தி", "கரும்பு", "மஞ்சள்",
    "ಭತ್ತ", "ಹತ್ತಿ", "ಕಬ್ಬು", "ರಾಗಿ", "ধান", "গম", "আলু", "পাট", "നെല്ല്", "റബ്ബർ",
    "ଖତ", "ସାର", "ଚାଷ",

    # Mandi & Trading
    "mandi", "apmc", "spot price", "msp", "bhav", "bhaw",
    "arrival", "arrivals", "enam", "e-nam", "brokerage", "commission", "arhtiya",
    "escrow", "wdra", "warehouse", "godown",
    "मंडी", "बाजार", "भाव", "दर", "एमएसपी", "ખરીફ", "રવી", "rabi", "kharif", "zaid",

    # Schemes & Finance
    "pm-kisan", "pmkisan", "kisan", "pmfby", "fasal bima", "crop insurance",
    "kcc", "kisan credit card", "loan", "subsidy", "subsidies", "soil health card", "nabard",
    "dbt", "fpo", "cooperative", "योजना", "किस्त", "बीमा", "कर्ज", "अनुदान", "ಸಾಲ", "రుణಂ",

    # Equipment & Livestock
    "tractor", "harvester", "sprayer", "tiller", "plough", "drone", "rotavator",
    "dairy", "cattle", "cow", "buffalo", "milk", "livestock", "mastitis", "fodder",
    "veterinary", "ट्रैक्टर", "पशुपालन", "गाय", "भैंस", "दूध", "मवेशी"
]

EXPLICIT_OFF_TOPIC_PATTERNS = [
    r'\bcricket\b', r'\bmatch\b', r'\bcricketer\b', r'\bfootball\b', r'\bmovie\b', r'\bmovies\b',
    r'\bcinema\b', r'\bfilm\b', r'\bfilms\b', r'\bactor\b', r'\bactress\b', r'\bsong\b', r'\bsongs\b',
    r'\bpoem\b', r'\bpoems\b', r'\bpoetry\b', r'\blove\b', r'\bromance\b', r'\bshayari\b', r'\bkavita\b',
    r'\bcode\b', r'\bpython\b', r'\bjavascript\b', r'\bhtml\b', r'\bcss\b', r'\bprogramming\b',
    r'\bsoftware\b', r'\bgaming\b', r'\bgame\b', r'\bpolitics\b', r'\belection\b', r'\bjoke\b',
    r'\bjokes\b', r'\bchutkula\b', r'\bchutkule\b', r'\bipl\b', r'\bworld cup\b', r'\bbollywood\b',
    r'\bhollywood\b', r'\bprem\b', r'\bgirlfriend\b', r'\bboyfriend\b',
    # Indic script off-topic
    r'क्रिकेट', r'मैच', r'सिनेमा', r'चित्रपट', r'फिल्म', r'गाना', r'गाने', r'कविता', r'शायरी',
    r'प्यार', r'प्रेम', r'जोक', r'चुटकुला', r'রাজনীতি', r'সিনেমা', r'গান', r'క్రీడలు', r'సినిమా',
    r'பாடல்', r'திரைப்படம்', r'ಹಾಡು', r'ಸಿನಿಮಾ'
]


def classify_domain(query: str, lang_info: LanguageInfo) -> DomainResult:
    """
    Strict Domain Classifier:
    - Labels query as AGRICULTURE or OFF_TOPIC.
    - If off-topic keyword (cricket, movie, song, love, code) is present, refuses immediately.
    """
    clean = query.strip().lower()
    if not clean:
        refusal = OFF_TOPIC_REFUSALS.get(lang_info.code, OFF_TOPIC_REFUSALS["en"])
        followups = DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, DEFAULT_AGRI_SUGGESTIONS["en"])
        return DomainResult(is_agri=False, confidence=1.0, refusal_message=refusal, suggested_followups=followups)

    # 1. Check explicit off-topic triggers
    has_off_topic_trigger = any(re.search(pat, clean) for pat in EXPLICIT_OFF_TOPIC_PATTERNS)
    if has_off_topic_trigger:
        refusal = OFF_TOPIC_REFUSALS.get(lang_info.code, OFF_TOPIC_REFUSALS["en"])
        followups = DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, DEFAULT_AGRI_SUGGESTIONS["en"])
        return DomainResult(
            is_agri=False,
            confidence=0.99,
            detected_category="off_topic_entertainment_or_sports",
            refusal_message=refusal,
            suggested_followups=followups
        )

    # 2. Check agriculture keyword density
    agri_matches = sum(1 for kw in AGRI_CORE_KEYWORDS if kw in clean)
    if agri_matches >= 1:
        return DomainResult(
            is_agri=True,
            confidence=0.96,
            detected_category="agriculture_in_domain"
        )

    # 3. Weather check: If weather mentioned without crops, check context
    if "weather" in clean or "मौसम" in clean or "हवामान" in clean or "মৌসম" in clean or "వాతావరణం" in clean or "வானிலை" in clean or "ಹವಾಮಾನ" in clean:
        return DomainResult(is_agri=True, confidence=0.88, detected_category="weather_farming_advisory")

    # 4. Check short generic queries
    words = clean.split()
    if len(words) <= 2:
        if any(kw in clean for kw in AGRI_CORE_KEYWORDS):
            return DomainResult(is_agri=True, confidence=0.90, detected_category="agriculture_short_query")
        else:
            refusal = OFF_TOPIC_REFUSALS.get(lang_info.code, OFF_TOPIC_REFUSALS["en"])
            followups = DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, DEFAULT_AGRI_SUGGESTIONS["en"])
            return DomainResult(is_agri=False, confidence=0.90, refusal_message=refusal, suggested_followups=followups)

    # Default to in-domain agriculture for general farming assistance
    return DomainResult(is_agri=True, confidence=0.85, detected_category="general_farming_inquiry")


# ============================================================================
# STEP 3: RESPONSE GENERATION (GEMINI API + RESILIENT LOCAL AGRONOMY FALLBACK)
# ============================================================================

def generate_response(
    query: str,
    lang_info: LanguageInfo,
    app_context: Optional[Dict[str, Any]] = None
) -> CopilotResponse:
    """
    Generates tailored agricultural advisory strictly in the user's detected
    language and script. Uses Gemini API client with hard safety prompts.
    """
    # 1. Domain Check
    domain_result = classify_domain(query, lang_info)
    if not domain_result.is_agri:
        return CopilotResponse(
            query=query,
            language=lang_info,
            domain=domain_result,
            response_text=domain_result.refusal_message or OFF_TOPIC_REFUSALS["en"],
            action_title="कृषि संबंधित प्रश्न पूछें • Ask Farming Questions",
            action_details="AgriPulse AI is specialized strictly in Indian agriculture, agronomy, mandi prices, and government schemes.",
            key_stats=[
                {"label": "Domain Scope", "val": "Agriculture Only"},
                {"label": "Detected Language", "val": lang_info.name}
            ],
            suggested_followups=domain_result.suggested_followups or DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, []),
            audio_tts_text=domain_result.refusal_message
        )

    # 2. Call Gemini via shared client if API key is active
    if is_gemini_configured():
        lang_instr = build_language_instruction(lang_info.code, lang_info.is_romanized)
        system_instruction = f"""
You are AgriPulse AI, an expert Indian Agricultural Copilot and Agronomist.

HARD RULES:
1. Scope: Answer ONLY questions related to farming, crops, pest/disease control, fertilizers (NPK/Urea/DAP dosage), irrigation, mandi spot prices, MSP, PM-KISAN, PMFBY crop insurance, KCC loans, farm machinery, or livestock/dairy.
2. {lang_instr}
3. Context & Tone: Use practical Indian farming terms (ICAR guidelines, quintals, acres, Kharif/Rabi, MSP, Mandi). Keep it concise, helpful, and direct for a farmer.

Output ONLY valid JSON in this exact structure:
{{
  "response_text": "Detailed, practical answer in {lang_info.name} (3-4 sentences max)",
  "action_title": "Short title in {lang_info.name}",
  "action_details": "Bullet-style actionable steps in {lang_info.name}",
  "key_stats": [
    {{"label": "Metric 1 in {lang_info.name}", "val": "Value 1"}},
    {{"label": "Metric 2 in {lang_info.name}", "val": "Value 2"}}
  ],
  "suggested_followups": [
    "Follow-up 1 in {lang_info.name}",
    "Follow-up 2 in {lang_info.name}",
    "Follow-up 3 in {lang_info.name}"
  ]
}}
"""
        prompt = f"User Farming Query: {query}\nProvide response strictly as JSON:"
        gemini_result = call_gemini(prompt=prompt, system_instruction=system_instruction)

        if gemini_result and isinstance(gemini_result, dict):
            return CopilotResponse(
                query=query,
                language=lang_info,
                domain=domain_result,
                response_text=gemini_result.get("response_text", ""),
                action_title=gemini_result.get("action_title", "कृषि सलाह • Advisory"),
                action_details=gemini_result.get("action_details", ""),
                key_stats=gemini_result.get("key_stats", []),
                suggested_followups=gemini_result.get("suggested_followups", DEFAULT_AGRI_SUGGESTIONS.get(lang_info.code, [])),
                audio_tts_text=gemini_result.get("response_text", "")
            )

    # 3. Localized Agronomy Response Fallback
    return get_localized_agronomy_fallback(query, lang_info, domain_result)


def get_localized_agronomy_fallback(query: str, lang_info: LanguageInfo, domain: DomainResult) -> CopilotResponse:
    """
    High-precision agronomy knowledge base tailored for all 11+ Indian regional languages.
    """
    code = lang_info.code
    q = query.lower()

    if any(k in q for k in ["khad", "fertilizer", "gobar", "urea", "dap", "उर्वरक", "खाद", "खत", "ਗੋਹਾ", "ખાતર", "ఎరువు", "உரம்", "ಗೊಬ್ಬರ", "সার"]):
        # Fertilizer Question
        responses = {
            "hi": "गेहूं की फसल में बुवाई के समय प्रति एकड़ 50 किलो DAP, 20 किलो MOP और 25 किलो यूरिया डालें। पहली सिंचाई (CRI स्टेज, 21 दिन बाद) पर 45 किलो यूरिया और 10 किलो जिंक सल्फेट 21% का छिड़काव करें।",
            "mr": "गहू पिकासाठी पेरणीच्या वेळी एकरी ५० किलो डीएपी (DAP), २० किलो एमओपी आणि २५ किलो युरिया द्यावे. पहिल्या पाण्याच्या वेळी (२१ दिवसांनी) ४५ किलो युरिया आणि १० किलो झिंक सल्फेट द्यावे.",
            "pa": "ਕਣਕ ਦੀ ਫ਼ਸਲ ਲਈ ਬਿਜਾਈ ਵੇਲੇ ਪ੍ਰਤੀ ਏਕੜ 55 ਕਿਲੋ ਡੀ.ਏ.ਪੀ. (DAP) ਅਤੇ 20 ਕਿਲੋ ਪੋਟਾਸ਼ ਪਾਓ। ਪਹਿਲੇ ਪਾਣੀ (21 ਦਿਨਾਂ ਬਾਅਦ) ਸਮੇਂ 45 ਕਿਲੋ ਯੂਰੀਆ ਅਤੇ 10 ਕਿਲੋ ਜ਼ਿੰਕ ਸਲਫੇਟ ਜ਼ਰੂਰ ਦਿਓ।",
            "gu": "મગફળી અને ઘઉંના પાક માટે વાવણી સમયે એકરે ૫૦ કિલો DAP અને ૨૦ કિલો પોટાશ આપો. પ્રથમ પિયત સમયે ૪૫ કિલો યુરિયા અને ૧૦ કિલો ઝિંક સલ્ફેટ આપવું ફાયદાકારક રહેશે.",
            "te": "వరి పంటకు ఎకరాకు 50 కిలోల డీఏపీ (DAP), 25 కిలోల యూరియా మరియు 20 కిలోల పొటాష్ వేయాలి. దుక్కిలో జింక్ సల్ఫేట్ 10 కిలోలు వేయడం మంచిది.",
            "ta": "நெல் பயிருக்கு ஏக்கருக்கு 50 கிலோ டிஏபி (DAP), 25 கிலோ யூரியா மற்றும் 20 கிலோ பொட்டாஷ் இட வேண்டும். முதல் பாசனத்தின் போது துத்தநாக சல்பேட் சேர்ப்பது நல்லது.",
            "kn": "ಭತ್ತದ ಬೆಳೆಗೆ ಪ್ರತಿ ಎಕರೆಗೆ 50 ಕೆಜಿ ಡಿಎಪಿ (DAP), 25 ಕೆಜಿ ಯೂರಿಯಾ ಮತ್ತು 20 ಕೆಜಿ ಪೊಟ್ಯಾಶ್ ಹಾಕಿ. ಮೊದಲ ನೀರಾವರಿ ಸಮಯದಲ್ಲಿ ಸತು ಸಲ್ಫೇಟ್ ಹಾಕುವುದು ಉತ್ತಮ.",
            "bn": "ধান ফসলের জন্য একর প্রতি ৫০ কেজি ডিএপি (DAP) এবং ২৫ কেজি ইউরিয়া প্রয়োগ করুন। প্রথম সেচের সময় দস্তা বা জিঙ্ক সালফেট দেওয়া উপকারী।",
            "ml": "നെൽകൃഷിക്ക് ഏക്കറിന് 50 കിലോഗ്രാം ഡിഎപി, 25 കിലോഗ്രാം യൂറിയ, 20 കിലോഗ്രാം പൊട്ടാഷ് എന്നിവ നൽകുക. സിങ്ക് സൾഫേറ്റ് ചേർക്കുന്നത് വിളവ് വർദ്ധിപ്പിക്കും.",
            "or": "ଧାନ ଫସଲ ପାଇଁ ଏକର ପିଛା ୫୦ କିଲୋ ଡିଏପି (DAP) ଓ ୨୫ କିଲୋ ୟୁରିଆ ପ୍ରୟୋଗ କରନ୍ତୁ। ପ୍ରଥମ ପାଣି ମଡ଼ାଇବା ସମୟରେ ଜିଙ୍କ୍ ସଲଫେଟ୍ ଦେବା ଉତ୍ତମ।",
            "hi-Latn": "Wheat (gehu) ki fasal me sowing ke time per acre 50kg DAP aur 20kg MOP daalein. First irrigation (21 days CRI stage) par 45kg Urea aur 10kg Zinc Sulfate daalna zaroori hai.",
            "en": "For wheat crop, apply 50 kg DAP, 20 kg MOP, and 25 kg Urea per acre at sowing time. At the 1st irrigation (CRI stage, 21 days), top-dress with 45 kg Urea and 10 kg Zinc Sulphate (21%)."
        }
        title = {
            "hi": "गेहूं उर्वरक प्रबंधन (ICAR दिशानिर्देश)",
            "mr": "गहू खत व्यवस्थापन (ICAR मार्गदर्शक)",
            "pa": "ਕਣਕ ਖਾਦ ਪ੍ਰਬੰਧਨ (PAU ਸਿਫਾਰਸ਼ਾਂ)",
            "gu": "ખાતર વ્યવસ્થાપન માર્ગદર્શન",
            "te": "వరి ఎరువుల యాजమాన్యం",
            "ta": "நெல் உர மேலாண்மை",
            "kn": "ಬೆಳೆ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ",
            "bn": "ফসল সার ব্যবস্থাপনা",
            "ml": "വളപ്രയോഗ നിർദ്ദേശങ്ങൾ",
            "or": "ଫସଲ ସାର ପରିଚାଳନା",
            "hi-Latn": "Wheat Fertilizer Dosage (ICAR Guidelines)",
            "en": "Wheat Fertilizer Dosage (ICAR Guidelines)"
        }
        resp_text = responses.get(code, responses["en"])
        act_title = title.get(code, title["en"])
        key_stats = [
            {"label": "DAP Dosage", "val": "50 kg/Acre"},
            {"label": "Urea Top-Dress", "val": "45 kg/Acre"},
            {"label": "Zinc Sulphate", "val": "10 kg/Acre"}
        ]
    elif any(k in q for k in ["bhav", "price", "rate", "mandi", "ਭਾਅ", "भाव", "ભાવ", "ధర", "விலை", "ದರ", "দর"]):
        # Mandi Price Question
        responses = {
            "hi": "करनाल एवं खन्ना मंडी में शरबती गेहूं का मॉडल भाव ₹2,840 प्रति क्विंटल चल रहा है (न्यूनतम समर्थन मूल्य ₹2,425/क्विंटल से +₹415 ऊपर)। आने वाले 15 दिनों में आटा मिलों की मांग से भाव में ₹50-80 की तेजी रहने का अनुमान है।",
            "mr": "लातूर व अकोला बाजारपेठेत सोयाबीनचा भाव ₹४,८९० आणि शरबती गव्हाचा भाव ₹२,८४० प्रति क्विंटल आहे. केंद्र सरकारच्या हमीभावापेक्षा (MSP) खुल्या बाजारात तेजी दिसून येत आहे.",
            "pa": "ਖੰਨਾ ਅਤੇ ਕਰਨਾਲ ਮੰਡੀ ਵਿੱਚ ਸ਼ਰਬਤੀ ਕਣਕ ਦਾ ਤਾਜ਼ਾ ਭਾਅ ₹2,840 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ (ਸਰਕਾਰੀ ਐਮਐਸਪੀ ₹2,425 ਨਾਲੋਂ ਵੱਧ)। ਆਉਣ ਵਾਲੇ ਦਿਨਾਂ ਵਿੱਚ ਮਿੱਲਾਂ ਦੀ ਮੰਗ ਕਾਰਨ ਭਾਅ ਮਜ਼ਬੂਤ ਰਹਿਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ।",
            "gu": "રાજકોટ અને ઊંઝા માર્કેટ યાર્ડમાં જીરું અને ઘઉંના ભાવ મજબૂત છે. ઘઉંનો હાજર ભાવ ₹૨,૮૪૦/ક્વિન્ટલ ચાલી રહ્યો છે.",
            "te": "మార్కెట్ యార్డులో నాణ్యమైన ధాన్యం ధర క్వింటాలుకు ₹2,840 గా ఉంది. ప్రభుత్వ మద్దతు ధర (MSP) కంటే ధరలు నిలకడగా ఉన్నాయి.",
            "ta": "மண்டி சந்தையில் தானியத்தின் மாதிரி விலை குவிண்டாலுக்கு ₹2,840 ஆக உள்ளது. அரசு கொள்முதல் விலையை விட சந்தை தேவை அதிகமாக உள்ளது.",
            "kn": "ಮಂಡಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹2,840 ರಂತೆ ಬೆಲೆ ಲಭ್ಯವಿದೆ. ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಬೆಲೆಗಳು ಸ್ಥಿರವಾಗಿರುವ ಸಾಧ್ಯತೆಯಿದೆ.",
            "bn": "মান্ডিতে শস্যের বর্তমান মডেল দর প্রতি কুইন্টাল ₹২,৮৪০। সরকারি সহায়ক মূল্যের চেয়ে খোলা বাজারে চাহিদা ভালো রয়েছে।",
            "ml": "മാർക്കറ്റിൽ ക്വിന്റലിന് ₹2,840 നിരക്കിൽ വ്യാപാരം നടക്കുന്നു. സർക്കാർ താങ്ങുവിലയേക്കാൾ ഉയർന്ന നിരക്കാണിത്.",
            "or": "ମଣ୍ଡିରେ ଶସ୍ୟର ହାରାହାରି ଦର କ୍ୱିଣ୍ଟାଲ ପିଛା ₹୨,୮୪୦ ରହିଛି। ଆଗାମୀ ଦିନରେ ବଜାର ଦର ସ୍ଥିର ରହିବାର ଆଶା ଅଛି।",
            "hi-Latn": "Karnal aur Khanna mandi me sharbati gehu ka spot rate ₹2,840/quintal chal raha hai, jo MSP ₹2,425 se +₹415 upar hai. Next 15 days me rate strong rehne ki umeed hai.",
            "en": "In Karnal and North India APMCs, premium Sharbati Wheat is trading at ₹2,840/quintal (realizing +₹415/qtl above Government MSP of ₹2,425). Mill demand is projected to stay firm."
        }
        title = {
            "hi": "दैनिक मंडी भाव व पूर्वानुमान",
            "mr": "दैनिक बाजारभाव व तेजी-मंदी कल",
            "pa": "ਤਾਜ਼ਾ ਮੰਡੀ ਰਿਪੋਰਟ ਤੇ ਭਾਅ",
            "gu": "માર્કેટ યાર્ડ ભાવ રિપોર્ટ",
            "te": "రోజువారీ మార్కెట్ ధరల విశ్లేషణ",
            "ta": "தினசரி மண்டி விலை நிலவரம்",
            "kn": "ದೈನಂದಿನ ಮಂಡಿ ದರ ವರದಿ",
            "bn": "দৈনিক মান্ডি দর ও পূর্বাভাস",
            "ml": "വിപണി വില വിവരങ്ങൾ",
            "or": "ଦୈନିକ ମଣ୍ଡି ଦର ସୂଚନା",
            "hi-Latn": "Daily Mandi Spot Rates & Outlook",
            "en": "Daily Mandi Spot Rates & Outlook"
        }
        resp_text = responses.get(code, responses["en"])
        act_title = title.get(code, title["en"])
        key_stats = [
            {"label": "Current Modal Rate", "val": "₹2,840/qtl"},
            {"label": "Govt MSP Benchmark", "val": "₹2,425/qtl"},
            {"label": "15-Day Trajectory", "val": "+₹60-80 Bullish"}
        ]
    elif any(k in q for k in ["pest", "disease", "insect", "keet", "rog", "कीट", "रोग", "कीड", "ਰੋਗ", "ઈયળ", "తెగులు", "பூச்சி", "ಕೀಟ"]):
        # Pest / Disease Control
        responses = {
            "hi": "कपास और दलहनी फसलों में कीट नियंत्रण के लिए प्रति एकड़ 80 मिलीलीटर इमिडाक्लोप्रिड (Imidacloprid 17.8% SL) 150 लीटर पानी में घोलकर छिड़कें। फफूंद जनित रोगों के लिए प्रोपिकोनाज़ोल (Tilt 25% EC) 200 मिलीलीटर का इस्तेमाल करें।",
            "mr": "कापूस पिकावरील बोंडअळी व रसशोषक किडींच्या नियंत्रणासाठी इमिडाक्लोप्रिड (Imidacloprid 17.8% SL) ८० मिली किंवा निंबोळी अर्क ५% ची १५० लिटर पाण्यातून फवारणी करावी.",
            "pa": "ਫ਼ਸਲਾਂ ਵਿੱਚ ਤੇਲਾ ਜਾਂ ਪੀਲਾ ਰਤੂਆ ਰੋਗ ਰੋਕਣ ਲਈ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ (Tilt 25% EC) 200 ਮਿਲੀਲੀਟਰ ਨੂੰ 200 ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਧੁੱਪ ਵਾਲੇ ਦਿਨ ਛਿੜਕਾਅ ਕਰੋ।",
            "gu": "કપાસમાં ગુલાબી ઈયળ અને ચૂસિયા પ્રકારની જીવાતો માટે લીંબોળીનું તેલ અથવા ઈમિડાક્લોપ્રિડ ૮૦ મિલી ૧૫૦ લિટર પાણીમાં છંટકાવ કરવો.",
            "te": "పంటల్లో పురుగుల నివారణకు ఇమిడాక్లోప్రిడ్ 80 మి.లీ 150 లీటర్ల నీటిలో కలిపి పిచికారీ చేయాలి. తెగుళ్ల నివారణకు ప్రొపికోనజోల్ వాడండి.",
            "ta": "பயிர்களில் பூச்சி தாக்குதலைக் கட்டுப்படுத்த இமிடாக்ளோப்ரிட் 80 மி.லி அல்லது வேப்ப எண்ணெய் கரைசலை 150 லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.",
            "kn": "ಬೆಳೆಗಳಲ್ಲಿ ಕೀಟಬಾಧೆ ನಿಯಂತ್ರಣಕ್ಕೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 80 ಮಿ.ಲೀ 150 ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ. ಶಿಲೀಂಧ್ರ ರೋಗಗಳಿಗೆ ಪ್ರೊಪಿಕೊನಾಜೋಲ್ ಬಳಸಿ.",
            "bn": "ফসলে পোকা দমনের জন্য ইমিডাক্লোপ্রিড ৮০ মিলি ১৫০ লিটার জলে মিশিয়ে স্প্রে করুন। ছত্রাকজনিত রোগের জন্য প্রপিকোনাজল ব্যবহার করুন।",
            "ml": "കീടങ്ങളെ നിയന്ത്രിക്കാൻ ഇമിഡാക്ലോപ്രിഡ് 80 മില്ലി 150 ലിറ്റർ വെള്ളത്തിൽ കലക്കി തളിക്കുക. കുമിൾ രോഗങ്ങൾക്ക് പ്രൊപികൊണാസോൾ ഉപയോഗിക്കാം.",
            "or": "ଫସଲରେ ପୋକ ନିୟନ୍ତ୍ରଣ ପାଇଁ ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୮୦ ମି.ଲି. ୧୫୦ ଲିଟର ପାଣିରେ ମିଶାଇ ସ୍ପ୍ରେ କରନ୍ତୁ।",
            "hi-Latn": "Kapas aur anya faslon me pest control ke liye Imidacloprid (17.8% SL) 80ml ko 150 liter paani me gholkar spray karein. Fungal diseases ke liye Propiconazole 200ml use karein.",
            "en": "For sucking pests and bollworms, spray Imidacloprid (17.8% SL) @ 80 ml in 150 Liters of water per acre. For fungal rusts, spray Propiconazole (Tilt 25% EC) @ 200 ml/acre on a clear sunny morning."
        }
        title = {
            "hi": "कीट व रोग नियंत्रण उपाय (ICAR प्रोटोकॉल)",
            "mr": "एकात्मिक कीड व रोग नियंत्रण",
            "pa": "ਕੀਟ ਤੇ ਬਿਮਾਰੀ ਰੋਕਥਾਮ",
            "gu": "જીવાત અને રોગ નિયંત્રણ",
            "te": "సమగ్ర సస్యరక్షణ చర్యలు",
            "ta": "ஒருங்கிணைந்த பூச்சி மேலாண்மை",
            "kn": "ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ",
            "bn": "সমন্বিত পোকা ও রোগ দমন",
            "ml": "കീടരോഗ നിയന്ത്രണ മാർഗ്ഗങ്ങൾ",
            "or": "ସମନ୍ୱିତ ପୋକ ଓ ରୋଗ ପରିଚାଳନା",
            "hi-Latn": "Integrated Pest & Disease Management",
            "en": "Integrated Pest & Disease Management"
        }
        resp_text = responses.get(code, responses["en"])
        act_title = title.get(code, title["en"])
        key_stats = [
            {"label": "Imidacloprid 17.8%", "val": "80 ml/Acre"},
            {"label": "Propiconazole 25%", "val": "200 ml/Acre"},
            {"label": "Water Volume", "val": "150 L/Acre"}
        ]
    else:
        # General Farm Advisory
        responses = {
            "hi": "खेती में उत्तम पैदावार और अधिकतम लाभ के लिए संतुलित उर्वरक (NPK 4:2:1), मृदा स्वास्थ्य कार्ड के अनुसार सूक्ष्म पोषक तत्व, और समय पर सिंचाई प्रबंधन अत्यंत महत्वपूर्ण है। अपनी फसल की वर्तमान स्थिति बताएं।",
            "mr": "शेतीमध्ये भरपूर उत्पादनासाठी जमिनीची सुपीकता, वेळेवर सिंचन आणि प्रमाणित बियाण्यांचा वापर आवश्यक आहे. आपल्या पिकाची सद्यस्थिती सांगा जेणेकरून अचूक मार्गदर्शन करता येईल.",
            "pa": "ਵਧੀਆ ਝਾੜ ਲਈ ਸੰਤੁਲਿਤ ਖਾਦਾਂ, ਮਿੱਟੀ ਪਰਖ ਰਿਪੋਰਟ ਅਤੇ ਸਹੀ ਸਮੇਂ 'ਤੇ ਸਿੰਚਾਈ ਪ੍ਰਬੰਧਨ ਬਹੁਤ ਜ਼ਰੂਰੀ ਹੈ। ਆਪਣੀ ਫ਼ਸਲ ਬਾਰੇ ਹੋਰ ਜਾਣਕਾਰੀ ਦਿਓ।",
            "gu": "ખેતીમાં સારા ઉત્પાદન માટે જમીન ચકાસણી, સપ્રમાણ ખાતર અને સમયસર પિયત વ્યવસ્થાપન ખૂબ મહત્વપૂર્ણ છે.",
            "te": "వ్యవసాయంలో అధిక దిగుబడి సాధించడానికి సమతుల్య ఎరువులు, నేల పరీక్ష మరియు సకాలంలో నీటి యాజమాన్యం ఎంతో అవసరం.",
            "ta": "விவசாயத்தில் அதிக மகசூல் பெற சமச்சீர் உரமிடுதல், மண் பரிசோதனை மற்றும் சரியான பாசன மேலாண்மை மிகவும் அவசியம்.",
            "kn": "ಕೃಷಿಯಲ್ಲಿ ಉತ್ತಮ ಇಳುವರಿಗಾಗಿ ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಸಮತೋಲಿತ ರಸಗೊಬ್ಬರ ಮತ್ತು ಸಮಯೋಚಿತ ನೀರಾವರಿ ಅತ್ಯಗತ್ಯ.",
            "bn": "উচ্চ ফলনের জন্য সুষম সার প্রয়োগ, মাটি পরীক্ষা এবং সময়মতো সেচ ব্যবস্থাপনা অত্যন্ত জরুরি।",
            "ml": "കൂടുതൽ വിളവിനായി മണ്ണ് പരിശോധനയും സമീകൃത വളപ്രയോഗവും കൃത്യമായ ജലസേചനവും ഉറപ്പാക്കുക.",
            "or": "ଭଲ ଅମଳ ପାଇଁ ମାଟି ପରୀକ୍ଷା, ସନ୍ତୁଳିତ ସାର ପ୍ରୟୋଗ ଓ ଠିକ୍ ସମୟରେ ଜଳସେଚନ ଅତ୍ୟନ୍ତ ଜରୁରୀ।",
            "hi-Latn": "Kheti me bumper production ke liye Soil Health Card ke hisab se balanced NPK aur time par irrigation management bohot zaroori hai. Apni fasal ki stage batayein.",
            "en": "For optimal agricultural yield and maximum profitability, balanced NPK nutrition (4:2:1), Soil Health Card micronutrient application, and stage-wise irrigation scheduling are vital."
        }
        title = {
            "hi": "कृषि एवं फसल प्रबंधन सलाह",
            "mr": "कृषी व पीक व्यवस्थापन सल्ला",
            "pa": "ਖੇਤੀਬਾੜੀ ਅਤੇ ਫ਼ਸਲ ਸਲਾਹ",
            "gu": "કૃષિ અને પાક વ્યવસ્થાપન",
            "te": "వ్యవసాయ సలహా",
            "ta": "விவசாய ஆலோசனை",
            "kn": "ಕೃಷಿ ಸಲಹೆ",
            "bn": "কৃষি পরামর্শ",
            "ml": "കാർഷിക ഉപദേശം",
            "or": "କୃଷି ପରାମର୍ଶ",
            "hi-Latn": "Farming & Crop Management Advice",
            "en": "Farming & Crop Management Advice"
        }
        resp_text = responses.get(code, responses["en"])
        act_title = title.get(code, title["en"])
        key_stats = [
            {"label": "NPK Ratio", "val": "4:2:1 Optimal"},
            {"label": "Soil Test", "val": "SHC Certified"},
            {"label": "Water Efficiency", "val": "+30% with Drip"}
        ]

    return CopilotResponse(
        query=query,
        language=lang_info,
        domain=domain,
        response_text=resp_text,
        action_title=act_title,
        action_details="Follow ICAR-approved standard agronomic schedule for optimal plant protection and maximum market realization.",
        key_stats=key_stats,
        suggested_followups=DEFAULT_AGRI_SUGGESTIONS.get(code, DEFAULT_AGRI_SUGGESTIONS["en"]),
        audio_tts_text=resp_text
    )
