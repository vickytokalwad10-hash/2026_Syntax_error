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

LANGUAGE_NAMES = {
    "en": "English",
    "mr": "मराठी (Marathi)",
    "hi": "हिन्दी (Hindi)",
    "pa": "ਪੰਜਾਬੀ (Punjabi)",
    "gu": "ગુજરાતી (Gujarati)",
    "te": "తెలుగు (Telugu)",
    "ta": "தமிழ் (Tamil)",
    "kn": "ಕನ್ನಡ (Kannada)"
}

OUT_OF_SCOPE_RESPONSES = {
    "en": "I am AgriPulse AI, specialized exclusively in Agriculture, Mandi Prices, Crop Health, Weather, and Farming Economics. Please ask an agricultural or market-related question.",
    "mr": "मी ॲग्रीपल्स एआय (AgriPulse AI) आहे, मी केवळ शेती, पीक सल्ला, बाजारभाव (मंडी दर), हवामान आणि कृषी अर्थशास्त्राशी संबंधित प्रश्नांची उत्तरे देतो. कृपया शेतीविषयक प्रश्न विचारा.",
    "hi": "मैं एग्रीपल्स एआई (AgriPulse AI) हूँ, जो केवल कृषि, मंडी भाव, फसल स्वास्थ्य, मौसम और किसान बाजार से जुड़े प्रश्नों के लिए समर्पित है। कृपया खेती या मंडी से संबंधित प्रश्न पूछें।",
    "pa": "ਮੈਂ ਐਗਰੀਪਲਸ ਏਆਈ ਹਾਂ, ਜੋ ਸਿਰਫ਼ ਖੇਤੀਬਾੜੀ, ਮੰਡੀ ਦੇ ਭਾਅ, ਫਸਲਾਂ ਦੀ ਸਿਹਤ ਅਤੇ ਮੌਸਮ ਸੰਬੰਧੀ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦੇਣ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਖੇਤੀ ਨਾਲ ਸੰਬੰਧਿਤ ਸਵਾਲ ਪੁੱਛੋ।",
    "gu": "હું એગ્રીપલ્સ એઆઈ છું, જે ફક્ત ખેતી, બજાર ભાવ (મંડી દરો), પાક સંભાળ અને હવામાન સંબંધિત પ્રશ્નો માટે સમર્પિત છે. કૃપા કરીને કૃષિ સંબંધિત પ્રશ્ન પૂછો.",
    "te": "నేను అగ్రిపల్స్ AI ని, వ్యవసాయం, మార్కెట్ ధరలు, పంట ఆరోగ్యం మరియు వాతావరణానికి సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇస్తాను. దయచేసి వ్యవసాయ సంబంధిత ప్రశ్న అడగండి.",
    "ta": "நான் அக்ரிபல்ஸ் AI, விவசாயம், மண்டி சந்தை விலைகள், பயிர் ஆரோக்கியம் மற்றும் வானிலை தொடர்பான கேள்விகளுக்கு மட்டுமே பதிலளிப்பேன். தயவுசெய்து விவசாயம் சார்ந்த கேள்வியைக் கேளுங்கள்.",
    "kn": "ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಎಐ, ಕೃಷಿ, ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು, ಬೆಳೆ ಆರೋಗ್ಯ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತೇನೆ. ದಯವಿಟ್ಟು ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ."
}

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
    lang_name = LANGUAGE_NAMES.get(language_code, "English")

    system_instruction = f"""
You are AgriPulse AI, India's leading AI Agricultural Economics, Agronomy, and APMC Mandi Market Intelligence Copilot.

CRITICAL RULES:
1. DOMAIN RESTRICTION: You MUST ONLY answer questions strictly relevant to Agriculture, Farming, Crops, Mandi Spot Prices, Price Forecasts, Weather/Monsoon advisories, Crop Pests/Diseases/Fertilizers, Warehouse Storage (WDRA) vs Sell decisions, Farm Machinery, Agricultural Policies (MSP, PM-Kisan, Export/Import Duties), and Direct Farmgate-to-Buyer Trading.
2. OUT-OF-SCOPE QUESTIONS: If the user asks about anything outside agriculture, farming, or agricultural market trading (e.g. coding, software, general history, movies, politics, entertainment, gaming, sports, etc.), you MUST politely DECLINE in the requested language: {lang_name} and instruct them to ask about farming, crops, or mandi prices.
3. LANGUAGE ENFORCEMENT: You MUST answer strictly in the requested language: {lang_name} (Language Code: {language_code}).
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
