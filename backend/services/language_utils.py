"""
AgriPulse AI — Unified Language Engine & Utilities
Single Source of Truth for Language Identification, Script Range Detection,
and Gemini AI Language Prompt Generation across all 11 Indian Regional Languages.
"""

import re
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field

@dataclass
class LanguageMetadata:
    code: str                  # Canonical ISO 639-1 code (e.g. 'hi', 'mr', 'te')
    name: str                  # English display name (e.g. 'Hindi')
    native: str                # Native script name (e.g. 'हिन्दी')
    script: str                # Script name (e.g. 'Devanagari')
    speech_lang: str           # Web Speech API & TTS locale tag (e.g. 'hi-IN')
    unicode_range: Optional[Tuple[int, int]] = None  # (start_hex, end_hex)

# Canonical 11 Supported Languages
SUPPORTED_LANGUAGES: Dict[str, LanguageMetadata] = {
    "en": LanguageMetadata(
        code="en",
        name="English",
        native="English",
        script="Latin",
        speech_lang="en-IN",
        unicode_range=None
    ),
    "hi": LanguageMetadata(
        code="hi",
        name="Hindi",
        native="हिन्दी",
        script="Devanagari",
        speech_lang="hi-IN",
        unicode_range=(0x0900, 0x097F)
    ),
    "mr": LanguageMetadata(
        code="mr",
        name="Marathi",
        native="मराठी",
        script="Devanagari",
        speech_lang="mr-IN",
        unicode_range=(0x0900, 0x097F)
    ),
    "pa": LanguageMetadata(
        code="pa",
        name="Punjabi",
        native="ਪੰਜਾਬੀ",
        script="Gurmukhi",
        speech_lang="pa-IN",
        unicode_range=(0x0A00, 0x0A7F)
    ),
    "gu": LanguageMetadata(
        code="gu",
        name="Gujarati",
        native="ગુજરાતી",
        script="Gujarati",
        speech_lang="gu-IN",
        unicode_range=(0x0A80, 0x0AFF)
    ),
    "te": LanguageMetadata(
        code="te",
        name="Telugu",
        native="తెలుగు",
        script="Telugu",
        speech_lang="te-IN",
        unicode_range=(0x0C00, 0x0C7F)
    ),
    "ta": LanguageMetadata(
        code="ta",
        name="Tamil",
        native="தமிழ்",
        script="Tamil",
        speech_lang="ta-IN",
        unicode_range=(0x0B80, 0x0BFF)
    ),
    "kn": LanguageMetadata(
        code="kn",
        name="Kannada",
        native="ಕನ್ನಡ",
        script="Kannada",
        speech_lang="kn-IN",
        unicode_range=(0x0C80, 0x0CFF)
    ),
    "bn": LanguageMetadata(
        code="bn",
        name="Bengali",
        native="বাংলা",
        script="Bengali",
        speech_lang="bn-IN",
        unicode_range=(0x0980, 0x09FF)
    ),
    "ml": LanguageMetadata(
        code="ml",
        name="Malayalam",
        native="മലയാളം",
        script="Malayalam",
        speech_lang="ml-IN",
        unicode_range=(0x0D00, 0x0D7F)
    ),
    "or": LanguageMetadata(
        code="or",
        name="Odia",
        native="ଓଡ଼ିଆ",
        script="Odia",
        speech_lang="or-IN",
        unicode_range=(0x0B00, 0x0B7F)
    )
}

# Unique script ranges for deterministic identification
SCRIPT_RANGES = [
    ("Gurmukhi", 0x0A00, 0x0A7F, "pa"),
    ("Gujarati", 0x0A80, 0x0AFF, "gu"),
    ("Odia", 0x0B00, 0x0B7F, "or"),
    ("Tamil", 0x0B80, 0x0BFF, "ta"),
    ("Telugu", 0x0C00, 0x0C7F, "te"),
    ("Kannada", 0x0C80, 0x0CFF, "kn"),
    ("Malayalam", 0x0D00, 0x0D7F, "ml"),
    ("Bengali", 0x0980, 0x09FF, "bn"),
    ("Devanagari", 0x0900, 0x097F, "hi_mr") # Handled by lexical disambiguation
]

# Marathi-specific lexical markers
MARATHI_MARKERS = [
    "आहे", "आहेत", "नाही", "काय", "करावे", "करावा", "करावी", "पिकावर", "पिकाचे", "पिकासाठी",
    "खत", "कीड", "रोग", "पाऊस", "बाजारभाव", "शेतकरी", "कधी", "कसे", "द्यावे", "फवारणी",
    "कापूस", "सोयाबीन", "ऊस", "कांदा", "तूर", "हरभरा", "ज्वारी", "बाजरी", "दरामध्ये", "भाव",
    "मला", "सांगा", "सांग", "कालचा", "कोण", "जिंकला", "आम्हाला", "तुम्हाला", "माहिती", "द्या",
    "कुठे", "केव्हा", "झाला", "झाली", "झाले", "होते", "होती", "पाहिजे", "पाहिजेत", "करायचे", "करायचा"
]

# Hindi-specific lexical markers
HINDI_MARKERS = [
    "है", "हैं", "नहीं", "क्या", "करें", "करना", "फसल", "खाद", "कीट", "रोग", "मौसम",
    "मंडी", "भाव", "किसान", "कब", "कैसे", "डालें", "छिड़काव", "गेहूं", "धान", "सरसों",
    "चना", "मक्का", "उर्वरक", "सिंचाई", "कीटनाशक", "दाम", "कृषि", "उपज"
]

# Romanized / Hinglish markers
ROMANIZED_MARKERS = [
    "kya", "kaise", "kab", "fayda", "nuksan", "khad", "kheti", "pani", "daalu", "daale",
    "fasal", "mandi", "bhav", "price", "kitna", "keed", "kida", "aaya", "spray", "kare",
    "batao", "bataiye", "bhetel", "kadhi", "kay", "karu", "karave", "kharidi", "vikri"
]


def detect_unicode_script(text: str) -> Optional[Tuple[str, str, float]]:
    """
    Step 1 of Language Detection Pipeline:
    Deterministically detects non-Latin Unicode script blocks.
    Returns (lang_code, script_name, confidence) or None if Latin/Ambiguous.
    """
    if not text:
        return None

    counts: Dict[str, int] = {}
    total_letters = 0

    for char in text:
        cp = ord(char)
        for script_name, start, end, code in SCRIPT_RANGES:
            if start <= cp <= end:
                counts[code] = counts.get(code, 0) + 1
                total_letters += 1
                break

    if total_letters == 0:
        return None

    # Identify dominant script
    best_code, count = max(counts.items(), key=lambda x: x[1])
    confidence = min(0.99, count / max(1, total_letters) * 1.05)

    if best_code == "hi_mr":
        # Disambiguate Hindi vs Marathi
        mr_matches = sum(1 for w in MARATHI_MARKERS if w in text)
        hi_matches = sum(1 for w in HINDI_MARKERS if w in text)
        if mr_matches > hi_matches:
            return ("mr", "Devanagari", max(0.92, confidence))
        elif hi_matches > mr_matches:
            return ("hi", "Devanagari", max(0.92, confidence))
        else:
            # Default Devanagari to Hindi with high confidence
            return ("hi", "Devanagari", 0.90)

    lang_meta = SUPPORTED_LANGUAGES.get(best_code)
    script_name = lang_meta.script if lang_meta else "Indic"
    return (best_code, script_name, confidence)


def detect_language_pipeline(text: str) -> Dict[str, Any]:
    """
    3-Step Language Detection Pipeline:
    Step 1: Unicode Script Range Detection
    Step 2: Lexical Romanized / English Classification
    Step 3: Confidence Score Output
    """
    text_clean = text.strip()
    if not text_clean:
        return {
            "code": "en",
            "name": "English",
            "native": "English",
            "script": "Latin",
            "confidence": 1.0,
            "is_romanized": False
        }

    # Step 1: Unicode Script Range Check
    script_match = detect_unicode_script(text_clean)
    if script_match:
        code, script_name, confidence = script_match
        meta = SUPPORTED_LANGUAGES.get(code, SUPPORTED_LANGUAGES["hi"])
        return {
            "code": meta.code,
            "name": meta.name,
            "native": meta.native,
            "script": script_name,
            "confidence": round(confidence, 2),
            "is_romanized": False
        }

    # Step 2: Romanized / Latin script detection
    lower = text_clean.lower()
    words = re.findall(r'\b[a-zA-Z]+\b', lower)
    romanized_hits = sum(1 for w in words if w in ROMANIZED_MARKERS)

    if romanized_hits >= 1 or any(m in lower for m in ["wheat me", "fasal me", "pani kab", "bhav kya", "khad daalu"]):
        return {
            "code": "hi-Latn",
            "name": "Hinglish (Romanized Hindi)",
            "native": "Hinglish",
            "script": "Latin",
            "confidence": 0.88,
            "is_romanized": True
        }

    # Default to English for Latin text
    return {
        "code": "en",
        "name": "English",
        "native": "English",
        "script": "Latin",
        "confidence": 0.95,
        "is_romanized": False
    }


def build_language_instruction(lang_code: str, is_romanized: bool = False) -> str:
    """
    THE SINGLE CENTRALIZED FUNCTION FOR BUILDING GEMINI LANGUAGE PROMPT INSTRUCTIONS.
    Used across all Gemini call sites in the backend to guarantee prompt consistency.
    """
    # Normalize code
    clean_code = "hi" if lang_code in ["hi-Latn", "hinglish"] else lang_code
    meta = SUPPORTED_LANGUAGES.get(clean_code, SUPPORTED_LANGUAGES["en"])

    if is_romanized or lang_code == "hi-Latn":
        return f"""LANGUAGE INSTRUCTION:
- Language: {meta.name} (Romanized / Hinglish)
- Script: Latin script with conversational Hindi/Hinglish phrasing.
- Strict Requirement: Respond in natural phonetic Hinglish so the farmer can easily read and understand. Do not use English technical jargon without simple explanation."""
    
    if meta.code == "en":
        return f"""LANGUAGE INSTRUCTION:
- Language: English (Indian Agricultural Context)
- Script: Latin script
- Strict Requirement: Respond in clear, accessible English with standard Indian agricultural terminology (e.g. quintal, MSP, APMC, Rabi, Kharif)."""

    return f"""LANGUAGE INSTRUCTION:
- Language: {meta.name} ({meta.native})
- ISO Code: {meta.code}
- Script: Authentic native {meta.script} script ONLY.
- Strict Requirement: Write your entire response, action items, key metrics, and suggestions STRICTLY in {meta.name} using {meta.script} script. Do NOT mix with Latin or English words unless it is a standard acronym (e.g., NPK, DAP, PM-KISAN)."""


# Standardized Off-Topic Refusals for all 11 Languages
OFF_TOPIC_REFUSALS: Dict[str, str] = {
    "en": "I am AgriPulse AI, dedicated exclusively to agriculture, crop advice, fertilizer dosage, weather advisories, and mandi prices. Please ask a farming or market-related question.",
    "hi": "मैं एग्रीपल्स किसान मित्र हूँ। मैं केवल खेती, फसल सुरक्षा, खाद की मात्रा, मौसम और मंडी भाव से जुड़े प्रश्नों में आपकी सहायता कर सकता हूँ। कृपया खेती से संबंधित प्रश्न पूछें।",
    "mr": "मी ॲग्रीपल्स किसान मित्र आहे. मी केवळ शेती, पीक सल्ला, खतांची मात्रा, हवामान आणि बाजारभाव याविषयी माहिती देतो. कृपया शेतीशी संबंधित प्रश्न विचारा.",
    "pa": "ਮੈਂ ਐਗਰੀਪਲਸ ਕਿਸਾਨ ਮਿੱਤਰ ਹਾਂ। ਮੈਂ ਸਿਰਫ਼ ਖੇਤੀਬਾੜੀ, ਫਸਲਾਂ ਦੀ ਸਲਾਹ, ਖਾਦ ਦੀ ਮਾਤਰਾ, ਮੌਸਮ ਅਤੇ ਮੰਡੀ ਦੇ ਭਾਅ ਬਾਰੇ ਹੀ ਜਵਾਬ ਦੇ ਸਕਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਖੇਤੀਬਾੜੀ ਸੰਬੰਧੀ ਸਵਾਲ ਪੁੱਛੋ।",
    "gu": "હું એગ્રીપલ્સ કિસાન મિત્ર છું. હું માત્ર ખેતી, પાક સલાહ, ખાતરની માત્રા, હવામાન અને બજાર ભાવ અંગેના પ્રશ્નોના જવાબો આપું છું. કૃપા કરીને કૃષિ સંબંધિત પ્રશ્ન પૂછો.",
    "te": "నేను అగ్రిపల్స్ కిసాన్ మిత్రను. నేను వ్యవసాయం, పంట సలహాలు, ఎరువుల మోతాదు, వాతావరణం మరియు మార్కెట్ ధరలకు సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను. దయచేసి వ్యవసాయ సంబంధిత ప్రశ్న అడగండి.",
    "ta": "நான் அக்ரிபல்ஸ் கிசான் மித்ரா. விவசாயம், பயிர் ஆலோசனை, உர அளவு, வானிலை மற்றும் மண்டி விலை தொடர்பான கேள்விகளுக்கு மட்டுமே என்னால் பதிலளிக்க முடியும். தயவுசெய்து விவசாயம் சார்ந்த கேள்வியைக் கேளுங்கள்.",
    "kn": "ನಾನು ಅಗ್ರಿಪಲ್ಸ್ ಕಿಸಾನ್ ಮಿತ್ರ. ನಾನು ಕೃಷಿ, ಬೆಳೆ ಸಲಹೆ, ಗೊಬ್ಬರದ ಪ್ರಮಾಣ, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ದರಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಬಲ್ಲೆ. ದಯವಿಟ್ಟು ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
    "bn": "আমি এগ্রিপালস কিষাণ মিত্র। আমি শুধুমাত্র কৃষি, ফসলের পরামর্শ, সারের মাত্রা, আবহাওয়া এবং মান্ডি দর সম্পর্কিত প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে কৃষি সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন।",
    "ml": "ഞാൻ അഗ്രിപൾസ് കിസാൻ മിത്രയാണ്. കൃഷി, വിള സംരക്ഷണം, വളപ്രയോഗം, കാലാവസ്ഥ, മാർക്കറ്റ് വില എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് മാത്രമേ എനിക്ക് മറുപടി നൽകാൻ കഴിയൂ. ദയവായി കൃഷിയുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ ചോദിക്കുക.",
    "or": "ମୁଁ ଏଗ୍ରିପଲ୍ସ କିଷାନ ମିତ୍ର। ମୁଁ କେବଳ କୃଷି, ଫସଲ ପରାମର୍ଶ, ଖତ ପ୍ରୟୋଗ, ପାଣିପାଗ ଏବଂ ମଣ୍ଡି ଦର ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନର ଉତ୍ତର ଦେଇପାରିବି। ଦୟାକରି କୃଷି ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।",
    "hi-Latn": "Main AgriPulse Kisan Mitra hoon. Main sirf kheti, fasal salaah, khad, mausam aur mandi bhav ke sawalon ka jawab de sakta hoon. Kripya kheti se juda sawal poochhein."
}

# Standardized Agricultural Suggestions for all 11 Languages
DEFAULT_AGRI_SUGGESTIONS: Dict[str, List[str]] = {
    "en": [
        "What is the recommended fertilizer schedule for wheat?",
        "How to control yellow rust disease in crops?",
        "What are today's APMC mandi spot prices for mustard?",
        "When is the next PM-KISAN installment expected?"
    ],
    "hi": [
        "गेहूं की फसल में पहली सिंचाई और यूरिया कब डालें?",
        "सरसों में माहू (चेपा) कीट का जैविक नियंत्रण कैसे करें?",
        "आज के गेहूं और धान के नजदीकी मंडी भाव क्या हैं?",
        "पीएम किसान सम्मान निधि की अगली किस्त कब आएगी?"
    ],
    "mr": [
        "कापूस पिकावर बोंडअळी नियंत्रणासाठी काय उपाय करावेत?",
        "सोयाबीन पिकासाठी खत व्यवस्थापन कसे करावे?",
        "आजचे कांदा आणि सोयाबीनचे बाजारभाव काय आहेत?",
        "ठिबक सिंचन अनुदानासाठी अर्ज कसा करावा?"
    ],
    "pa": [
        "ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ ਦੀ ਰੋਕਥਾਮ ਕਿਵੇਂ ਕਰੀਏ?",
        "ਝੋਨੇ ਦੀ ਸਿੱਧੀ ਬਿਜਾਈ (DSR) ਵਿੱਚ ਖਾਦ ਕਦੋਂ ਪਾਈਏ?",
        "ਅੱਜ ਕਣਕ ਅਤੇ ਬਾਸਮਤੀ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?",
        "ਫਸਲੀ ਰਹਿੰਦ-ਖੂੰਹਦ ਪ੍ਰਬੰਧਨ ਲਈ ਸਰਕਾਰੀ ਸਬਸਿਡੀ ਕਿਵੇਂ ਲਈਏ?"
    ],
    "gu": [
        "મગફળીના પાકમાં સફેદ ઘેણ (સફેદ ઈયળ) નું નિયંત્રણ કેવી રીતે કરવું?",
        "કપાસમાં ખાતર અને પિયતનું યોગ્ય આયોજન જણાવો.",
        "આજના જીરું અને એરંડાના મુખ્ય માર્કેટિંગ યાર્ડ ભાવ શું છે?",
        "પીએમ કિસાન યોજનાની સ્થિતિ કેવી રીતે તપાસવી?"
    ],
    "te": [
        "వరి పంటలో కాండం తొలుచు పురుగు నివారణకు ఏ మందులు వాడాలి?",
        "మిరప తోటలో నల్ల తామర పురుగుల నివారణ ఎలా చేయాలి?",
        "ఈరోజు స్థానిక మార్కెట్ యార్డులో పత్తి ధర ఎంత ఉంది?",
        "రైతు భరోసా మరియు PM-KISAN స్థితిని ఎలా తనిਖీ చేయాలి?"
    ],
    "ta": [
        "நெல் பயிரில் குருத்துப்பூச்சி தாக்குதலை கட்டுப்படுத்துவது எப்படி?",
        "கரும்பு பயிருக்கு சொட்டு நீர் பாசனத்தில் உரம் இடுவது எப்படி?",
        "இன்றைய முக்கிய மண்டிகளில் பருத்தி மற்றும் நெல் விலை என்ன?",
        "பிரதம மந்திரி பயிர் காப்பீட்டு திட்டத்தில் இழப்பீடு பெறுவது எப்படி?"
    ],
    "kn": [
        "ಭತ್ತದ ಬೆಳೆಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಯಾವ ಔಷಧ ಬಳಸಬೇಕು?",
        "ಕಬ್ಬಿನ ಬೆಳೆಗೆ ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಗೊಬ್ಬರ ನೀಡುವ ವಿಧಾನ ತಿಳಿಸಿ.",
        "ಇಂದಿನ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಮೆಕ್ಕೆಜೋಳ ಮತ್ತು ತೊಗರಿ ಧಾರಣೆ ಎಷ್ಟು?",
        "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಸಾಲ ಪಡೆಯಲು ಅರ್ಹತೆಗಳೇನು?"
    ],
    "bn": [
        "ধানের মাজরা পোকা দমনে কোন কীটনাশক কার্যকরী?",
        "আলু চাষে নাবি ধসা রোগ নিয়ন্ত্রণের সেরা উপায় কি?",
        "আজকের স্থানীয় মান্ডিতে পাট ও সরিষার পাইকারি দর কত?",
        "পিএম কিষাণ যোজনার স্ট্যাটাস কীভাবে চেক করবেন?"
    ],
    "ml": [
        "നെല്ലിലെ കുരുനാശക കീടങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം?",
        "റബ്ബർ, ഏലം തോട്ടങ്ങളിൽ മികച്ച വളപ്രയോഗം എങ്ങനെ നടത്തണം?",
        "ഇന്നത്തെ മാർക്കറ്റിൽ തേങ്ങ, അടയ്ക്ക, കുരുമുളക് വില എത്രയാണ്?",
        "കിസാൻ ക്രഡിറ്റ് കാർഡ് വഴി കുറഞ്ഞ പലിശയിൽ വായ്പ എങ്ങനെ ലഭിക്കും?"
    ],
    "or": [
        "ଧାନ ଫସଲରେ କାଣ୍ଡ ବିନ୍ଧା ପୋକ ଦମନ ପାଇଁ କେଉଁ ଔଷଧ ବ୍ୟବହାର କରିବେ?",
        "ବାଦାମ ଏବଂ ସୋରିଷ ଫସଲରେ ସାର ପ୍ରୟୋଗ କିପରି କରିବେ?",
        "ଆଜିର ମଣ୍ଡିରେ ଧାନ ଏବଂ ମୁଗର ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP) କେତେ?",
        "ପ୍ରଧାନମନ୍ତ୍ରୀ ଫସଲ ବୀମା ଯୋଜନାରେ କ୍ଲେମ କିପରି କରିବେ?"
    ],
    "hi-Latn": [
        "Wheat me pehla paani aur urea kab daalna chahiye?",
        "Sarson me maahu keet ke liye kaunsa spray karein?",
        "Aaj ka wheat aur paddy ka mandi rate kya hai?",
        "PM-KISAN installment aane ki date kaise check karein?"
    ]
}
