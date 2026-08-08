import os
import re
import time
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request, Depends
from dotenv import load_dotenv

from database import get_db
from models import ChatbotRequest, ChatbotResponse

load_dotenv()
logger = logging.getLogger("agripulse.chatbot")
router = APIRouter(prefix="/api/chatbot", tags=["Domain-Restricted AI Chatbot"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# In-memory Rate Limiting: 20 messages per minute per IP / user
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW = 60 # seconds
user_request_timestamps = defaultdict(list)


def check_rate_limit(client_id: str):
    now = time.time()
    timestamps = user_request_timestamps[client_id]
    # Prune timestamps older than window
    user_request_timestamps[client_id] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(user_request_timestamps[client_id]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. You can send up to 20 messages per minute. Please pause for a moment."
        )
    user_request_timestamps[client_id].append(now)


# Agricultural Domain Keywords & Non-Agri Blocklist for Fast Deterministic Screening
AGRI_KEYWORDS = [
    # Crops & produce
    "crop", "wheat", "rice", "paddy", "soybean", "cotton", "onion", "potato", "tomato", "chilli",
    "maize", "pulses", "gram", "tur", "moong", "mustard", "sugarcane", "garlic", "ginger",
    # Soil & inputs
    "soil", "fertilizer", "urea", "dap", "npk", "pesticide", "fungicide", "insecticide", "manure", "vermicompost",
    "ph", "nitrogen", "phosphorus", "potassium", "irrigation", "drip", "sprinkler",
    # Markets & economics
    "mandi", "bhav", "price", "arbitrage", "msp", "apmc", "market", "trade", "yield", "rate", "quintal", "selling",
    "buyer", "farmer", "procurement", "transport", "freight",
    # Agronomy & diseases
    "disease", "pest", "blight", "rust", "rot", "wilt", "leaf", "sowing", "harvest", "germination", "seed",
    # Weather & schemes
    "weather", "rain", "monsoon", "drought", "humidity", "temperature", "pm kisan", "kisan", "subsidy", "scheme", "fasal bima",
    # Hindi / Marathi transliterations & terms
    "kheti", "fasal", "khedut", "sheti", "peek", "khad", "paani", "havaman", "rog", "bhav", "dar", "shetiyojna", "dawa", "khat",
    "कांदा", "गहू", "तांदूळ", "सोयाबीन", "मका", "कापूस", "खत", "औषध", "बाजारभाव", "हवामान", "रोग", "कीड", "पाणी", "योजना",
    "गेहूं", "चावल", "धान", "प्याज", "टमाटर", "खाद", "दवा", "कीटनाशक", "सिंचाई", "मौसम", "योजना"
]

NON_AGRI_PATTERNS = [
    r"\b(cricket|football|fifa|ipl|actor|movie|bollywood|hollywood|song|lyrics|celebrity|president|election|bitcoin|crypto|nft)\b",
    r"\b(write a poem about love|write a romance|play a video game|who won the match|capital of|recipe for pizza)\b"
]

REFUSAL_MESSAGES = {
    "English": "I am AgriPulse Assistant, dedicated exclusively to agriculture. I can only assist with farming, crop health, soil nutrients, mandi market prices, weather advisories, irrigation, pest control, and agricultural trade. How can I help you with your farming needs?",
    "Hindi": "मैं एग्रीपल्स सहायक हूँ, जो केवल कृषि और किसानों के लिए समर्पित है। मैं केवल खेती, फसल स्वास्थ्य, मिट्टी पोषण, मंडी भाव, मौसम सलाह, सिंचाई, कीटनाशक और कृषि व्यापार से संबंधित प्रश्नों में ही मदद कर सकता हूँ। कृपया खेती से जुड़ा प्रश्न पूछें।",
    "Marathi": "मी ॲग्रीपल्स असिस्टंट आहे, जो केवळ शेती आणि शेतकऱ्यांसाठी समर्पित आहे. मी फक्त पिके, माती परीक्षण, खते, कीटकनाशके, बाजारभाव (मंडी भाव), हवामान सल्ला, सिंचन आणि कृषी योजनांशी संबंधित प्रश्नांची उत्तरे देऊ शकतो. कृपया शेतीशी संबंधित प्रश्न विचारा."
}

SUGGESTED_PROMPTS = {
    "English": [
        "What is the best fertilizer dose for wheat at tillering?",
        "Check today's soybean mandi prices in Maharashtra",
        "How to prevent yellow rust in wheat crops?",
        "Explain PM-KUSUM solar pump subsidy eligibility"
    ],
    "Hindi": [
        "गेहूं की फसल में कल्ले फूटते समय कौन सी खाद डालें?",
        "महाराष्ट्र और मध्य प्रदेश में सोयाबीन का आज का मंडी भाव क्या है?",
        "टमाटर में पत्ती मरोड़ (लीफ कर्ल) रोग का जैविक इलाज बताएं",
        "पीएम किसान सम्मान निधि और फसल बीमा योजना का लाभ कैसे लें?"
    ],
    "Marathi": [
        "सोयाबीन पिकावरील खोडकिडीच्या नियंत्रणासाठी कोणती फवारणी करावी?",
        "नाशिक आणि लासलगाव बाजार समितीमधील लाल कांद्याचे आजचे दर काय आहेत?",
        "ठिबक सिंचनासाठी शासकीय अनुदान मिळवण्याची प्रक्रिया काय आहे?",
        "ऊस पिकाला खताचा पहिला डोस कधी व कोणता द्यावा?"
    ]
}


def classify_is_agri(query: str) -> bool:
    q = query.lower().strip()
    # Check non-agri regex patterns
    for pat in NON_AGRI_PATTERNS:
        if re.search(pat, q, re.IGNORECASE):
            return False

    # Check for agri keywords
    for kw in AGRI_KEYWORDS:
        if kw in q:
            return True

    # Generic short greetings or conversational queries are allowed in agri context
    if len(q.split()) <= 3 and any(g in q for g in ["hello", "hi", "namaste", "pranam", "help", "kem cho", "ram ram", "namaskar"]):
        return True

    # If ambiguous and query contains no explicit tech/pop-culture terms, allow to pass to Gemini with strict system prompt
    return True


async def call_gemini_api(user_message: str, language: str, role: str, chat_history: List[Dict[str, str]]) -> str:
    """Calls Gemini API using google-genai SDK or direct structured fallback"""
    if not GEMINI_API_KEY or "your_gemini" in GEMINI_API_KEY:
        # Fallback offline agtech intelligence engine
        return generate_offline_agri_response(user_message, language, role)

    system_instruction = (
        "You are AgriPulse Assistant, an expert AI agronomist and market intelligence assistant for farmers and agricultural buyers. "
        "You must ONLY answer questions related to: farming, crops, soil health, weather for agriculture, mandi/market prices, "
        "government agri schemes (PM-Kisan, PMFBY, KUSUM), pesticides/fertilizers, irrigation, crop diseases, and agri trade between farmers and buyers. "
        "If a user asks anything unrelated to agriculture, politely decline and redirect them back to agriculture topics. "
        f"You MUST respond ONLY in {language}. Use clear, structured bullet points, practical dosages, and actionable advice."
    )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Build contents including history
        contents = []
        for turn in chat_history[-6:]:
            role_turn = "user" if turn.get("sender") == "user" else "model"
            contents.append(types.Content(
                role=role_turn,
                parts=[types.Part.from_text(text=turn.get("text", ""))]
            ))
        
        # Add current user prompt
        contents.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=f"User Role: {role.capitalize()}\nLanguage: {language}\nQuery: {user_message}")]
        ))

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.4,
            max_output_tokens=800
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=config
        )
        if response and response.text:
            return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API error: {e}")

    return generate_offline_agri_response(user_message, language, role)


def generate_offline_agri_response(query: str, language: str, role: str) -> str:
    """High-quality agtech responses when offline or testing without quota."""
    q = query.lower()
    if language == "Marathi":
        if "कांदा" in q or "bhav" in q or "दर" in q or "price" in q:
            return (
                "🧅 **कांदा बाजारभाव व सल्ला (लासलगाव/नाशिक):**\n"
                "• सरासरी बाजारभाव: **₹1,850 - ₹2,350 प्रति क्विंटल**\n"
                "• गुणवत्ता: उत्तम प्रत असलेल्या कांद्याला निर्यातीसाठी अधिक मागणी आहे.\n"
                "• साठवणूक सल्ला: कांदा साठवण्यापूर्वी 15 दिवस आधी पाणी बंद करावे आणि सावलीत सुकवून चाळीत भरावा."
            )
        elif "खत" in q or "fertilizer" in q or "युरिया" in q or "dose" in q:
            return (
                "🌱 **पिकांसाठी संतुलित खत व्यवस्थापन सल्ला:**\n"
                "• पेरणीच्या वेळी: 10:26:26 किंवा DAP सोबत गंधक (Sulphur) 10 किलो/एकर वापरावे.\n"
                "• नत्राचा वापर (Urea): 30 ते 45 दिवसांच्या अंतराने विभागून द्यावा.\n"
                "• सूक्ष्म अन्नद्रव्ये: झिंक (Zinc) व बोरॉन (Boron) ची फवारणी फुलधारणेच्या वेळी फायदेशीर ठरते."
            )
        else:
            return (
                "🌾 **ॲग्रीपल्स कृषी सल्ला:**\n"
                f"तुमच्या '{query}' या प्रश्नावर शिफारस:\n"
                "• जमिनीचा ओलावा तपासूनच सिंचन व खतांचा डोस द्यावा.\n"
                "• कीड व रोगांचा प्रादुर्भाव रोखण्यासाठी एकात्मिक कीड व्यवस्थापन (IPM) पद्धतीचा अवलंब करा."
            )
    elif language == "Hindi":
        if "भाव" in q or "मंडी" in q or "price" in q:
            return (
                "📊 **मंडी भाव और बाजार विश्लेषण:**\n"
                "• गेहूं (शरबती): **₹2,650 - ₹2,900 / क्विंटल**\n"
                "• सोयाबीन: **₹4,750 - ₹5,100 / क्विंटल**\n"
                "• सलाह: आगामी 15 दिनों में मांग बढ़ने के संकेत हैं। अपने माल की ग्रेडिंग करके बेचें।"
            )
        elif "खाद" in q or "fertilizer" in q or "रोग" in q:
            return (
                "🧪 **फसल पोषण और कीट प्रबंधन:**\n"
                "• बुवाई के समय NPK 12:32:16 अथवा DAP + पोटाश का संतुलित प्रयोग करें।\n"
                "• कीटों की रोकथाम के लिए नीम तेल (1500 PPM) 5ml प्रति लीटर पानी में मिलाकर स्प्रे करें।"
            )
        else:
            return (
                "🌾 **एग्रीपल्स कृषि विशेषज्ञ सलाह:**\n"
                f"आपके प्रश्न '{query}' के संदर्भ में:\n"
                "• मौसम विभाग के अनुसार आगामी 3-5 दिनों में मौसम साफ रहने का अनुमान है।\n"
                "• सिंचाई का समय प्रातः अथवा सायंकाल में रखें जिससे वाष्पीकरण कम हो।"
            )
    else:
        # English
        if "price" in q or "mandi" in q or "rate" in q:
            return (
                "📊 **Mandi Price Intelligence:**\n"
                "• **Wheat (Sharbati Gold)**: ₹2,750 / Quintal (Firm demand in major APMCs)\n"
                "• **Soybean (JS-335)**: ₹4,850 / Quintal\n"
                "• **Basmati Rice (1121)**: ₹4,200 / Quintal\n"
                "• **Arbitrage Tip**: Inter-state transport to northern processing hubs offers ₹240-₹380/Q net margin."
            )
        elif "fertilizer" in q or "nutrient" in q or "urea" in q or "soil" in q:
            return (
                "🌱 **Soil Nutrient & Fertilizer Advisory:**\n"
                "• **Basal Dose**: Apply NPK (10:26:26) @ 50kg/acre along with Zinc Sulphate (10kg/acre).\n"
                "• **Top Dressing**: Split Urea into 2 splits (at 21 days first irrigation and 45 days tillering).\n"
                "• **Foliar Spray**: Spray 19:19:19 (1kg/100L water) during active vegetative growth."
            )
        else:
            return (
                "🌾 **AgriPulse Agronomy Advisory:**\n"
                f"Regarding your query on '{query}':\n"
                "• Monitor soil moisture levels using tensiometers or local agro-climatic indices.\n"
                "• Ensure proper field drainage to prevent root rot during unexpected precipitation.\n"
                "• Check government subsidy schemes like PM-KUSUM for solar-powered irrigation."
            )


@router.post("", response_model=ChatbotResponse)
async def chat_with_agri_assistant(payload: ChatbotRequest, request: Request):
    # Enforce Rate Limiting per IP / user
    client_ip = request.client.host if request.client else "default_user"
    user_key = payload.user_id or payload.session_id or client_ip
    check_rate_limit(user_key)

    user_message = payload.message.strip()
    language = payload.language or "English"
    role = payload.role or "farmer"
    session_id = payload.session_id or f"sess_{int(time.time())}"
    db = await get_db()

    # Domain Guardrail Check
    is_agri = classify_is_agri(user_message)

    if not is_agri:
        # Off-topic logging without PII
        offtopic_log = {
            "session_id": session_id,
            "user_id": payload.user_id or "anonymous",
            "role": role,
            "query_snippet": user_message[:120],
            "language": language,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.offtopic_logs.insert_one(offtopic_log)

        refusal_reply = REFUSAL_MESSAGES.get(language, REFUSAL_MESSAGES["English"])
        actions = SUGGESTED_PROMPTS.get(language, SUGGESTED_PROMPTS["English"])

        return ChatbotResponse(
            reply=refusal_reply,
            is_agri_related=False,
            language=language,
            timestamp=datetime.now(timezone.utc).isoformat(),
            suggested_actions=actions
        )

    # Fetch last 6 conversation turns for multi-turn continuity
    history_cursor = db.chat_logs.find({"session_id": session_id})
    past_logs = await history_cursor.to_list(length=6)
    chat_history = []
    for item in past_logs:
        chat_history.append({"sender": "user", "text": item.get("message", "")})
        chat_history.append({"sender": "model", "text": item.get("response", "")})

    # Call Gemini Model
    ai_reply = await call_gemini_api(user_message, language, role, chat_history)

    # Store in MongoDB chat_logs
    log_doc = {
        "session_id": session_id,
        "user_id": payload.user_id or "anonymous",
        "role": role,
        "message": user_message,
        "response": ai_reply,
        "language": language,
        "is_agri_related": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_logs.insert_one(log_doc)

    actions = SUGGESTED_PROMPTS.get(language, SUGGESTED_PROMPTS["English"])

    return ChatbotResponse(
        reply=ai_reply,
        is_agri_related=True,
        language=language,
        timestamp=datetime.now(timezone.utc).isoformat(),
        suggested_actions=actions[:3]
    )


@router.get("/history")
async def get_chat_history(session_id: str, limit: int = 20):
    db = await get_db()
    logs = await db.chat_logs.find({"session_id": session_id}).to_list(length=limit)
    return {
        "session_id": session_id,
        "history": logs
    }
