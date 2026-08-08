from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import math
import re
try:
    from services.gemini_service import (
        ask_gemini_agri_copilot, 
        OUT_OF_SCOPE_RESPONSES, 
        LANGUAGE_NAMES
    )
except ImportError:
    from backend.services.gemini_service import (
        ask_gemini_agri_copilot, 
        OUT_OF_SCOPE_RESPONSES, 
        LANGUAGE_NAMES
    )

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot Voice Assistant"])

class CopilotQuery(BaseModel):
    query: str
    language: str = "en" # "en", "mr", "hi", "pa", "gu", "te", "ta", "kn"
    context_crop: Optional[str] = "wheat"
    role: Optional[str] = "all" # "farmer", "buyer", or "all"

# Knowledge Base & Live Market Data Matrices
CROP_DATA = {
    "wheat": {
        "en_name": "Wheat (Sharbati/Mill Grade)",
        "mr_name": "शरबती गहू",
        "hi_name": "शरबती गेहूं",
        "spot": 2840,
        "msp": 2275,
        "forecast_15d": 2985,
        "forecast_30d": 3140,
        "trend": "+4.8% Bullish",
        "mr_trend": "+4.8% तेजीचा कल",
        "hi_trend": "+4.8% तेजी का रुख",
        "top_mandi": "Khanna (Punjab) / Azadpur (Delhi)",
        "mr_top_mandi": "खन्ना (पंजाब), लातूर व आझादपूर (दिल्ली)",
        "hi_top_mandi": "खन्ना (पंजाब) एवं आजादपुर (दिल्ली)",
        "best_buyer_mandi": "Ujjain (MP) / Kota (RJ)",
        "mr_best_buyer_mandi": "उज्जैन (मध्य प्रदेश) व कोटा (राजस्थान)",
        "hi_best_buyer_mandi": "उज्जैन (मध्य प्रदेश) एवं कोटा (राजस्थान)",
        "buyer_landed_cost": 2790,
        "moisture_limit": "Max 12.0%",
        "storage_gain_60d": "₹280/Quintal net ROI (+9.8%)",
        "mr_storage_gain_60d": "₹280 प्रति क्विंटल निव्वळ नफा (+9.8%)",
        "hi_storage_gain_60d": "₹280 प्रति क्विंटल शुद्ध लाभ (+9.8%)",
        "key_driver": "Flour mill demand spike + low central pool buffer",
        "mr_key_driver": "आटा मिलकडून मोठी मागणी व केंद्रीय साठ्यात कमतरता",
        "hi_key_driver": "आटा मिलों की भारी मांग व केंद्रीय बफर स्टॉक में कमी"
    },
    "rice": {
        "en_name": "Paddy / Rice (Basmati 1121)",
        "mr_name": "बासमती तांदूळ / धान (1121)",
        "hi_name": "धान / बासमती चावल (1121)",
        "spot": 3950,
        "msp": 2300,
        "forecast_15d": 3930,
        "forecast_30d": 4360,
        "trend": "+5.2% Strong Bullish",
        "mr_trend": "+5.2% जोरदार तेजी",
        "hi_trend": "+5.2% जोरदार तेजी",
        "top_mandi": "Karnal (Haryana) / Taraori",
        "mr_top_mandi": "कर्नाल (हरियाणा) व गोंदिया (महाराष्ट्र)",
        "hi_top_mandi": "करनाल एवं तरावड़ी (हरियाणा)",
        "best_buyer_mandi": "Gondia (MH) / Kaithal (HR)",
        "mr_best_buyer_mandi": "गोंदिया (महाराष्ट्र) व कैथल (हरियाणा)",
        "hi_best_buyer_mandi": "गोंदिया (महाराष्ट्र) एवं कैथल (हरियाणा)",
        "buyer_landed_cost": 3880,
        "moisture_limit": "Max 14.0%",
        "storage_gain_60d": "₹340/Quintal net ROI (+8.6%)",
        "mr_storage_gain_60d": "₹340 प्रति क्विंटल निव्वळ नफा (+8.6%)",
        "hi_storage_gain_60d": "₹340 प्रति क्विंटल शुद्ध लाभ (+8.6%)",
        "key_driver": "Middle East export shipments open + stable festive demand",
        "mr_key_driver": "खाडी देशांमधील निर्यात मागणी व सणासुदीची वाढती खरेदी",
        "hi_key_driver": "खाड़ी देशों में निर्यात मांग एवं आगामी त्योहारों की खपत"
    },
    "cotton": {
        "en_name": "Cotton (Medium/Long Staple Shankar-6)",
        "mr_name": "कापूस (शंकर-६ / मध्यम स्टेपल)",
        "hi_name": "कपास (शंकर-6)",
        "spot": 7420,
        "msp": 7122,
        "forecast_15d": 7930,
        "forecast_30d": 8200,
        "trend": "+6.4% Strong Bullish",
        "mr_trend": "+6.4% मजबूत तेजी",
        "hi_trend": "+6.4% मजबूत तेजी",
        "top_mandi": "Rajkot (Gujarat) / Adilabad (TS) / Akola (MH)",
        "mr_top_mandi": "अकोला (महाराष्ट्र), राजकोट (गुजरात) व आदिलाबाद",
        "hi_top_mandi": "राजकोट (गुजरात) एवं आदिलाबाद (तेलंगाना)",
        "best_buyer_mandi": "Surendranagar (GJ) / Akola (MH)",
        "mr_best_buyer_mandi": "अकोला (महाराष्ट्र) व सुरेंद्रनगर (गुजरात)",
        "hi_best_buyer_mandi": "सुरेंद्रनगर (गुजरात) एवं अकोला (महाराष्ट्र)",
        "buyer_landed_cost": 7310,
        "moisture_limit": "Max 8.5% (Trash < 3%)",
        "storage_gain_60d": "₹450/Quintal net ROI (+6.1%)",
        "mr_storage_gain_60d": "₹450 प्रति क्विंटल निव्वळ नफा (+6.1%)",
        "hi_storage_gain_60d": "₹450 प्रति क्विंटल शुद्ध लाभ (+6.1%)",
        "key_driver": "Spinning mills restocking + lower global ending stocks (USDA)",
        "mr_key_driver": "कापड व सूत गिरण्यांची खरेदी व जागतिक साठ्यातील घट",
        "hi_key_driver": "कताई मिलों द्वारा पुनः स्टॉक व वैश्विक स्टॉक में कमी"
    },
    "soybean": {
        "en_name": "Soybean (Yellow FAQ Grade)",
        "mr_name": "पिवळा सोयाबीन (FAQ दर्जा)",
        "hi_name": "सोयाबीन (पीला एफएक्यू)",
        "spot": 4890,
        "msp": 4892,
        "forecast_15d": 5010,
        "forecast_30d": 5220,
        "trend": "+6.7% Bullish",
        "mr_trend": "+6.7% तेजीचा कल",
        "hi_trend": "+6.7% तेजी का रुख",
        "top_mandi": "Indore (MP) / Latur (MH) / Akola (MH)",
        "mr_top_mandi": "लातूर, अकोला, वाशिम (महाराष्ट्र) व इंदूर (मध्य प्रदेश)",
        "hi_top_mandi": "इंदौर (मध्य प्रदेश) एवं लातूर (महाराष्ट्र)",
        "best_buyer_mandi": "Dewas (MP) / Jalna (MH)",
        "mr_best_buyer_mandi": "जालना (महाराष्ट्र) व देवास (मध्य प्रदेश)",
        "hi_best_buyer_mandi": "देवास (मध्य प्रदेश) एवं जालना (महाराष्ट्र)",
        "buyer_landed_cost": 4790,
        "moisture_limit": "Max 10.0% (Foreign matter < 2%)",
        "storage_gain_60d": "₹310/Quintal net ROI (+6.3%)",
        "mr_storage_gain_60d": "₹310 प्रति क्विंटल निव्वळ नफा (+6.3%)",
        "hi_storage_gain_60d": "₹310 प्रति क्विंटल शुद्ध लाभ (+6.3%)",
        "key_driver": "Soymeal export contracts + crushing plant capacity surge",
        "mr_key_driver": "सोयामिल्ल निर्यात करार व तेल प्रक्रिया उद्योगांची वाढती मागणी",
        "hi_key_driver": "सोयामील निर्यात अनुबंध एवं पेराई मिलों की मजबूत मांग"
    },
    "mustard": {
        "en_name": "Mustard Seed (42% Oil Content)",
        "mr_name": "मोहरी / राई (४२% तेल प्रमाण)",
        "hi_name": "सरसों दाना (42% तेल)",
        "spot": 5780,
        "msp": 5650,
        "forecast_15d": 5910,
        "forecast_30d": 6120,
        "trend": "+5.9% Steady Bullish",
        "mr_trend": "+5.9% स्थिर तेजी",
        "hi_trend": "+5.9% स्थिर तेजी",
        "top_mandi": "Jaipur (RJ) / Bharatpur / Alwar",
        "mr_top_mandi": "जयपूर, भरतपूर व अलवर (राजस्थान)",
        "hi_top_mandi": "जयपुर, भरतपुर एवं अलवर (राजस्थान)",
        "best_buyer_mandi": "Agra (UP) / Sri Ganganagar (RJ)",
        "mr_best_buyer_mandi": "आग्रा (उत्तर प्रदेश) व श्री गंगानगर (राजस्थान)",
        "hi_best_buyer_mandi": "आगरा (उत्तर प्रदेश) एवं श्रीगंगानगर (राजस्थान)",
        "buyer_landed_cost": 5690,
        "moisture_limit": "Max 8.0%",
        "storage_gain_60d": "₹320/Quintal net ROI (+5.5%)",
        "mr_storage_gain_60d": "₹320 प्रति क्विंटल निव्वळ नफा (+5.5%)",
        "hi_storage_gain_60d": "₹320 प्रति क्विंटल शुद्ध लाभ (+5.5%)",
        "key_driver": "Import duty hike on edible oils + festive crushing demand",
        "mr_key_driver": "खाद्यतेलावरील आयात शुल्क वाढ व सणासुदीची वाढती मागणी",
        "hi_key_driver": "खाद्य तेल आयात शुल्क वृद्धि एवं त्योहारी पेराई मांग"
    },
    "onion": {
        "en_name": "Nashik Red Onion (Summer Garva Grade)",
        "mr_name": "नाशिक उन्हाळी कांदा (गरवा दर्जा)",
        "hi_name": "नासिक लाल प्याज (गर्वा ग्रेड)",
        "spot": 2150,
        "msp": None,
        "forecast_15d": 2300,
        "forecast_30d": 2680,
        "trend": "+12.2% Volatile Spike",
        "mr_trend": "+12.2% मोठी तेजी अपेक्षित",
        "hi_trend": "+12.2% तेज उछाल",
        "top_mandi": "Lasalgaon (Nashik) / Pimpalgaon / Yeola",
        "mr_top_mandi": "लासलगाव, पिंपळगाव, येवला (नाशिक) व पुणे",
        "hi_top_mandi": "लासलगांव, पिंपलगांव (नासिक) एवं सोलापुर",
        "best_buyer_mandi": "Azadpur (Delhi) / Vashi (Mumbai)",
        "mr_best_buyer_mandi": "वाशी (नवी मुंबई) व आझादपूर (दिल्ली)",
        "hi_best_buyer_mandi": "वाशी (मुंबई) एवं आजादपुर (दिल्ली)",
        "buyer_landed_cost": 2080,
        "moisture_limit": "Cured dry neck, zero sprouting",
        "storage_gain_60d": "Traditional Kanda Chawl offers +25% margin till Oct",
        "mr_storage_gain_60d": "पारंपरिक कांदा चाळीत साठवणूक केल्यास ऑक्टोबरपर्यंत +२५% नफा",
        "hi_storage_gain_60d": "पारंपरिक कांदा चाळ में भंडारण से अक्टूबर तक +25% मुनाफा",
        "key_driver": "Late kharif nursery delayed + lower southern state supply",
        "mr_key_driver": "खरीप लागवडीत विलंब व दक्षिण भारतातील पुरवठ्यात घट",
        "hi_key_driver": "खरीफ नर्सरी में देरी एवं दक्षिणी राज्यों से कम आवक"
    },
    "tomato": {
        "en_name": "Hybrid Tomato (Commercial Grade)",
        "mr_name": "हायब्रिड टोमॅटो",
        "hi_name": "टमाटर (व्यावसायिक हाइब्रिड)",
        "spot": 1820,
        "msp": None,
        "forecast_15d": 2180,
        "forecast_30d": 2450,
        "trend": "+19.8% High Volatility",
        "mr_trend": "+19.8% उच्च तेजी व चढ-उतार",
        "hi_trend": "+19.8% उच्च उतार-चढ़ाव",
        "top_mandi": "Kolar (KA) / Narayangaon (MH) / Madanapalle (AP)",
        "mr_top_mandi": "नारायणगाव (पुणे), पिंपळगाव (नाशिक) व कोलार (कर्नाटक)",
        "hi_top_mandi": "कोलार (कर्नाटक), नारायणगांव (महाराष्ट्र) व मदनपल्ले",
        "best_buyer_mandi": "Azadpur (Delhi) / Koyambedu (Chennai)",
        "mr_best_buyer_mandi": "आझादपूर (दिल्ली) व कोयाम्बेडू (चेन्नई)",
        "hi_best_buyer_mandi": "आजादपुर (दिल्ली) एवं कोयमबेडु (चेन्नई)",
        "buyer_landed_cost": 1740,
        "moisture_limit": "Firm mature green/turning stage",
        "storage_gain_60d": "Perishable: Sell within 3-5 days in cold chain",
        "mr_storage_gain_60d": "नाशवंत पीक: कोल्ड चेनद्वारे ३ ते ५ दिवसांत विक्री करा",
        "hi_storage_gain_60d": "जल्द खराब होने वाली फसल: 3-5 दिन में कोल्ड चेन द्वारा बेचें",
        "key_driver": "Monsoon arrival disruption & leaf curl virus in local belts",
        "mr_key_driver": "पावसामुळे आवकेत अडथळा व स्थानिक पट्ट्यात विषाणू प्रादुर्भाव",
        "hi_key_driver": "बारिश से आवक में रुकावट व लीफ कर्ल वायरस का प्रभाव"
    },
    "potato": {
        "en_name": "Potato (Jyoti/Kufri Pukhraj)",
        "mr_name": "बटाटा (ज्योती / कुफरी पुखराज)",
        "hi_name": "आलू (कुफरी पुखराज/ज्योति)",
        "spot": 1460,
        "msp": None,
        "forecast_15d": 1520,
        "forecast_30d": 1610,
        "trend": "+4.1% Steady",
        "mr_trend": "+4.1% स्थिर भाववाढ",
        "hi_trend": "+4.1% स्थिर बढ़त",
        "top_mandi": "Agra (UP) / Farrukhabad / Jalandhar",
        "mr_top_mandi": "आग्रा, जालंधर व पुणे बाजार समिती",
        "hi_top_mandi": "आगरा, फर्रुखाबाद (यूपी) एवं जालंधर",
        "best_buyer_mandi": "Hassan (KA) / Hooghly (WB)",
        "mr_best_buyer_mandi": "हासन (कर्नाटक) व हुगळी (प. बंगाल)",
        "hi_best_buyer_mandi": "हासन (कर्नाटक) एवं हुगली (पश्चिम बंगाल)",
        "buyer_landed_cost": 1390,
        "moisture_limit": "Firm skin, 45mm+ size grade",
        "storage_gain_60d": "Cold storage rent ₹160/bag offers +14% margin by Nov",
        "mr_storage_gain_60d": "कोल्ड स्टोरेज भाडे ₹१६०/गोणी वजा जाता नोव्हेंबरपर्यंत १४% नफा",
        "hi_storage_gain_60d": "कोल्ड स्टोरेज किराया ₹160/बोरी काटकर नवंबर तक 14% मुनाफा",
        "key_driver": "Cold storage dispatch rate steady + processing plant demand",
        "mr_key_driver": "कोल्ड स्टोरेजमधून नियमित पुरवठा व चिप्स कंपन्यांची मागणी",
        "hi_key_driver": "कोल्ड स्टोरेज से संतुलित निकासी व चिप्स कंपनियों की मांग"
    },
    "sugarcane": {
        "en_name": "Sugarcane (FRP Grade)",
        "mr_name": "ऊस (एफआरपी भाव)",
        "hi_name": "गन्ना (एफआरपी ग्रेड)",
        "spot": 340,
        "msp": 340,
        "forecast_15d": 340,
        "forecast_30d": 340,
        "trend": "Stable (Statutory FRP)",
        "mr_trend": "स्थिर (वैधानिक एफआरपी दर)",
        "hi_trend": "स्थिर (वैधानिक एफआरपी भाव)",
        "top_mandi": "Kolhapur / Sangli / Western UP Sugar Belt",
        "mr_top_mandi": "कोल्हापूर, सांगली, पुणे व पश्चिम महाराष्ट्र साखर पट्टा",
        "hi_top_mandi": "पश्चिम उत्तर प्रदेश एवं कोल्हापुर चीनी बेल्ट",
        "best_buyer_mandi": "Direct Mill Gate Gate Supply",
        "mr_best_buyer_mandi": "थेट साखर कारखाना गेट पुरवठा",
        "hi_best_buyer_mandi": "सीधे चीनी मिल गेट आपूर्ति",
        "buyer_landed_cost": 340,
        "moisture_limit": "Brix index 18-20%",
        "storage_gain_60d": "Immediate crushing within 24h of harvest mandatory",
        "mr_storage_gain_60d": "तोडणीनंतर २४ तासांच्या आत कारखान्यात गाळप आवश्यक",
        "hi_storage_gain_60d": "कटाई के 24 घंटे के भीतर मिल में पेराई अनिवार्य",
        "key_driver": "Ethanol blending quota allocation & statutory FRP support",
        "mr_key_driver": "इथेनॉल मिश्रण कोटा व केंद्र सरकारचा एफआरपी आधार",
        "hi_key_driver": "एथेनॉल सम्मिश्रण कोटा एवं सरकारी मूल्य समर्थन"
    },
    "maize": {
        "en_name": "Maize (Poultry/Starch Grade)",
        "mr_name": "मका (पोल्ट्री / स्टार्च दर्जा)",
        "hi_name": "मक्का (पोल्ट्री/स्टार्च ग्रेड)",
        "spot": 2240,
        "msp": 2090,
        "forecast_15d": 2310,
        "forecast_30d": 2420,
        "trend": "+4.9% Bullish",
        "mr_trend": "+4.9% तेजी",
        "hi_trend": "+4.9% तेजी",
        "top_mandi": "Gulabbagh (Bihar) / Davanagere (KA) / Aurangabad",
        "mr_top_mandi": "छत्रपती संभाजीनगर (औरंगाबाद), सांगली व गुलाबबाग (बिहार)",
        "hi_top_mandi": "गुलाबबाग (बिहार) एवं दावणगेरे (कर्नाटक)",
        "best_buyer_mandi": "Chhindwara (MP) / Nizamabad (TS)",
        "mr_best_buyer_mandi": "छिंदवाडा (मध्य प्रदेश) व निजामाबाद (तेलंगाणा)",
        "hi_best_buyer_mandi": "छिंदवाड़ा (मध्य प्रदेश) एवं निजामाबाद (तेलंगाना)",
        "buyer_landed_cost": 2180,
        "moisture_limit": "Max 14% (Aflatoxin < 20 ppb)",
        "storage_gain_60d": "₹160/Q gain possible if stored dry below 12% moisture",
        "mr_storage_gain_60d": "१२% पेक्षा कमी ओलाव्यावर साठवणूक केल्यास ₹१६०/क्विंटल नफा",
        "hi_storage_gain_60d": "12% से कम नमी पर भंडारित करने पर ₹160/Q का लाभ",
        "key_driver": "Ethanol manufacturing plants & poultry feed consumption",
        "mr_key_driver": "मका आधारित इथेनॉल प्रकल्प व कुक्कुटपालन खाद्य मागणी",
        "hi_key_driver": "मक्का आधारित एथेनॉल इकाइयां एवं पोल्ट्री फीड की मजबूत मांग"
    }
}

def detect_crop(query_lower: str, context_crop: str = "wheat") -> str:
    crop_keywords = {
        "wheat": ["wheat", "sharbati", "gehu", "gehun", "gahu", "गेहूं", "गेहु", "गहू"],
        "rice": ["rice", "paddy", "basmati", "dhan", "chawal", "tandul", "चावल", "धान", "बासमती", "तांदूळ"],
        "cotton": ["cotton", "kapas", "rui", "kapus", "कपास", "रुई", "कापूस"],
        "soybean": ["soybean", "soya", "सोयाबीन", "सोया"],
        "mustard": ["mustard", "sarson", "rai", "mohari", "rapeseed", "सरसों", "राई", "मोहरी"],
        "onion": ["onion", "pyaz", "kanda", "lasalgaon", "प्याज", "कांदा", "लासलगाव"],
        "tomato": ["tomato", "tamatar", "tomata", "टमाटर", "टोमॅटो"],
        "potato": ["potato", "aloo", "alu", "batata", "आलू", "बटाटा"],
        "sugarcane": ["sugarcane", "ganna", "us", "cane", "गन्ना", "ऊस"],
        "maize": ["maize", "corn", "makka", "maka", "मक्का", "मकई", "मका"]
    }
    
    for cid, keywords in crop_keywords.items():
        if any(kw in query_lower for kw in keywords):
            return cid
    return context_crop if context_crop in CROP_DATA else "wheat"

@router.post("/query")
def process_copilot_query(req: CopilotQuery):
    # 1. Primary: Gemini AI Multilingual Agricultural Reasoning Engine
    gemini_res = ask_gemini_agri_copilot(
        query=req.query,
        language_code=req.language,
        context_crop=req.context_crop or "wheat",
        role=req.role or "all"
    )
    
    if gemini_res and isinstance(gemini_res, dict):
        is_agri = gemini_res.get("is_agri_related", True)
        cid = req.context_crop if req.context_crop in CROP_DATA else "wheat"
        c_info = CROP_DATA.get(cid, CROP_DATA["wheat"])
        if not is_agri:
            return {
                "status": "out_of_scope",
                "crop_id": cid,
                "crop_name": c_info["en_name"],
                "language_detected": req.language,
                "role_detected": req.role,
                "voice_response": gemini_res.get("voice_response", OUT_OF_SCOPE_RESPONSES.get(req.language, OUT_OF_SCOPE_RESPONSES["en"])),
                "action_title": gemini_res.get("action_title", "Agricultural Questions Only"),
                "action_details": gemini_res.get("action_details", "AgriPulse AI is an AI copilot dedicated exclusively to agriculture, farming economics, and mandi price intelligence."),
                "key_stats": gemini_res.get("key_stats", []),
                "suggested_followups": gemini_res.get("suggested_followups", [
                    "What is the 15-day price forecast for Wheat?",
                    "Which APMC Mandi offers the highest net realization?",
                    "Should I store my harvest or sell immediately?"
                ])
            }
        else:
            return {
                "status": "success",
                "crop_id": cid,
                "crop_name": c_info["en_name"],
                "language_detected": req.language,
                "role_detected": req.role,
                "voice_response": gemini_res.get("voice_response"),
                "action_title": gemini_res.get("action_title"),
                "action_details": gemini_res.get("action_details"),
                "key_stats": gemini_res.get("key_stats", []),
                "suggested_followups": gemini_res.get("suggested_followups", [])
            }

    # 2. Resilient Fallback: Domain Intelligence & Knowledge Base
    q = req.query.lower().strip()
    
    # Non-agricultural domain check for offline mode
    non_agri_indicators = [
        "who is", "prime minister", "president", "cricket", "ipl", "movie", "song", "lyrics", 
        "tell a joke", "python code", "javascript", "react code", "capital of", "recipe for cake",
        "who won", "football", "gaming", "bitcoin", "crypto"
    ]
    agri_indicators = [
        "crop", "price", "mandi", "bhav", "rate", "wheat", "rice", "cotton", "soybean", "mustard",
        "onion", "tomato", "potato", "sugarcane", "maize", "farm", "kisan", "farmer", "sell", "buy",
        "weather", "rain", "fertilizer", "pest", "spray", "storage", "warehouse", "msp", "fpo",
        "बाजार", "मंडी", "भाव", "दर", "गहू", "कांदा", "कापूस", "सोयाबीन", "शेती", "शेतकरी", "पीक", "खरेदी", "विक्री",
        "गेहूं", "प्याज", "कपास", "फसल", "किसान", "भंडारण", "मौसम", "खाद", "दाम"
    ]
    
    if any(nw in q for nw in non_agri_indicators) and not any(aw in q for aw in agri_indicators):
        cid = req.context_crop if req.context_crop in CROP_DATA else "wheat"
        c_info = CROP_DATA.get(cid, CROP_DATA["wheat"])
        return {
            "status": "out_of_scope",
            "crop_id": cid,
            "crop_name": c_info["en_name"],
            "language_detected": req.language,
            "role_detected": req.role,
            "voice_response": OUT_OF_SCOPE_RESPONSES.get(req.language, OUT_OF_SCOPE_RESPONSES["en"]),
            "action_title": "AgriPulse AI Agricultural Scope",
            "action_details": "Please ask questions regarding crop prices, mandi arbitrage, weather forecasts, pest alerts, or storage decisions.",
            "key_stats": [
                {"label": "Domain", "val": "Agriculture & Mandis Only"},
                {"label": "Supported Crops", "val": "9 Core Commodities"}
            ],
            "suggested_followups": [
                "What is the current mandi rate for Wheat?",
                "Which mandi offers highest profit for Soybean?",
                "Compare 60-day storage vs immediate sale"
            ]
        }
    
    is_mr = req.language == "mr" or any(w in q for w in ["कांदा", "गहू", "कापूस", "सोयाबीन", "तांदूळ", "बटाटा", "ऊस", "बाजार", "समिती", "नफा", "विक्री", "खरेदी", "साठवणूक", "भाव", "दर", "नाशिक", "लातूर", "पुणे", "अकोला", "लासलगाव", "करावा", "करावे", "आहे", "काय"])
    is_hi = (req.language == "hi" or any(char in q for char in "अआइईउऊऋएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसहज्ञश्रड़ढ़")) and not is_mr
    
    crop_id = detect_crop(q, req.context_crop or "wheat")
    crop = CROP_DATA[crop_id]
    
    if is_mr:
        c_name = crop["mr_name"]
    elif is_hi:
        c_name = crop["hi_name"]
    else:
        c_name = crop["en_name"]

    # Detect user intent and role (Farmer vs Buyer vs Agronomy)
    is_buyer_query = any(w in q for w in [
        "buyer", "buy", "sourcing", "source", "procure", "procurement", "bulk", "landed cost",
        "quality spec", "moisture limit", "fpo", "trader", "miller", "exporter", "wholesaler",
        "खरीदार", "खरीदना", "थोक", "व्यापारी", "सोर्सिंग", "आवक", "मिलर", "निर्यात", "गुणवत्ता",
        "खरेदीदार", "खरेदी", "व्यापारी", "घाऊक", "दर", "सोर्सिंग"
    ]) or req.role == "buyer"

    # Intent classifiers (Ordered by specificity)
    is_direct_trade = any(w in q for w in [
        "direct", "escrow", "commission", "middleman", "dalal", "contract", "deal", "b2b",
        "सीधे", "बिचौलिया", "दलाल", "कमीशन", "एस्क्रो", "अनुबंध", "डायरेक्ट", "सौदा",
        "थेट", "दलाली", "मध्यस्थ", "करार", "एस्क्रो"
    ])

    is_storage_sell = any(w in q for w in [
        "storage", "store", "warehouse", "wdra", "roi", "hold", "keep", "enwr", "e-nwr", "pledge",
        "भंडारण", "गोदाम", "रोककर", "रोकना", "रखें", "रखना",
        "साठवणूक", "गोदाम", "साठा", "चाळ", "ठेवावे", "ठेवणे"
    ])

    is_msp_scheme = any(w in q for w in [
        "msp", "government rate", "support price", "procurement center", "fci", "nafed", "pm kisan", "kcc", "subsidy",
        "एमएसपी", "समर्थन मूल्य", "सरकारी भाव", "सरकारी खरीद", "खरीद केंद्र", "सब्सिडी", "योजना",
        "हमीभाव", "सरकारी दर", "अनुदान"
    ])

    is_quality_grading = any(w in q for w in [
        "moisture", "quality", "grade", "faq", "standard", "aflatoxin", "brix", "trash", "spec",
        "नमी", "गुणवत्ता", "ग्रेड", "मानक", "सैंपल", "कचरा",
        "ओलावा", "दर्जा", "प्रतवारी", "मानके"
    ])

    is_weather_health = any(w in q for w in [
        "weather", "heatwave", " heat ", "rainfall", " rain ", "temperature", "satellite", "ndvi", "sentinel", "disease", "pest", "spray", "irrigation",
        "मौसम", "गर्मी", "बारिश", "तापमान", "उपग्रह", "सेटेलाइट", "कीट", "रोग", "छिड़काव", "सूखा", "सिंचाई",
        "हवामान", "पाऊस", "तापमान", "रोग", "कीड", "फवारणी", "पाणी", "उष्णता"
    ])

    is_mandi_arbitrage = any(w in q for w in [
        "which mandi", "best mandi", "highest profit", "freight", "transport", "sourcing hub", "where to buy", "where to sell",
        "सर्वोत्तम मंडी", "कौन सी मंडी", "भाड़ा", "परिवहन", "कहाँ बेचें", "कहाँ से खरीदें", "सस्ती मंडी",
        "कोणती बाजार समिती", "सर्वोत्तम बाजार", "वाहतूक", "भाडे", "कुठे विकावे", "स्वस्त बाजार"
    ])

    is_price_forecast = any(w in q for w in [
        "forecast", "trend", "future", "prediction", "target", "15-day", "30-day", "price", "rate",
        "अनुमान", "भविष्यवाणी", "रुझान", "15 दिन", "30 दिन", " भाव ", " भाव", "भाव ", "दाम ", "मूल्य", "रेट",
        "अंदाज", "कल", "१५ दिवस", "३० दिवस", "दर", "भाव"
    ]) or "भाव" in q or "price" in q or "दर" in q

    # 1. DIRECT TRADE / B2B CONTRACTS
    if is_direct_trade:
        if is_buyer_query:
            if is_mr:
                resp_text = f"ॲग्रीपल्स डायरेक्ट B2B मार्केटमध्ये आपण थेट शेतकरी आणि FPOs कडून {c_name} खरेदी करू शकता. शून्य बाजार समिती सेस व १००% सुरक्षित एस्क्रो पेमेंट उपलब्ध आहे."
                action_title = "थेट B2B एस्क्रो खरेदी"
                action_desc = f"१. लॉट निवडा (अपेक्षित भाव: ₹{crop['spot'] - 30}/क्विंटल) २. एस्क्रो खात्यात २०% रक्कम जमा करा ३. शेतातून थेट माल वाहतूक व ई-वे बिल जारी."
                stats = [
                    {"label": "थेट सरासरी भाव", "val": f"₹{crop['spot']}/Q"},
                    {"label": "सेस व दलाली बचत", "val": "२.५% ते ३.५%"},
                    {"label": "एस्क्रो सुरक्षा", "val": "१००% सुरक्षित"}
                ]
            elif is_hi:
                resp_text = f"एग्रीपल्स डायरेक्ट B2B पोर्टल पर आप सीधे सत्यापित किसानों और FPOs से {c_name} खरीद सकते हैं। शून्य APMC मंडी सेस और पारदर्शी 100% एस्क्रो सुरक्षा उपलब्ध है।"
                action_title = "खरीदार B2B एस्क्रो खरीद"
                action_desc = f"1. लॉट साइज व मूल्य तय करें (सुझाव: ₹{crop['spot'] - 30}/Q) 2. एस्क्रो खाते में अग्रिम 20% जमा करें 3. फार्मगेट से लोडिंग के बाद डिजिटल ई-वे बिल जारी होगा।"
                stats = [
                    {"label": "औसत फार्मगेट भाव", "val": f"₹{crop['spot']}/Q"},
                    {"label": "मंडी सेस बचत", "val": "2.5% - 3.5%"},
                    {"label": "एस्क्रो सुरक्षा", "val": "100% बैंक समर्थित"}
                ]
            else:
                resp_text = f"On the AgriPulse Direct B2B Portal, institutional buyers and millers can procure {c_name} directly from verified farmers & FPOs with zero mandi cess and 100% escrow protection."
                action_title = "Direct Institutional Escrow Contract"
                action_desc = f"1. Select listed farmer lots at ~₹{crop['spot']}/Q 2. Lock quality moisture specs ({crop['moisture_limit']}) 3. Direct farmgate collection with verified digital weighbridge."
                stats = [
                    {"label": "Direct Spot Sourcing", "val": f"₹{crop['spot']}/Q"},
                    {"label": "Intermediary Savings", "val": "+3.5% to 5.0%"},
                    {"label": "Escrow Guarantee", "val": "Quality Verified"}
                ]
        else:
            if is_mr:
                resp_text = f"शेतकरी बांधव ॲग्रीपल्स डायरेक्ट मार्केटमध्ये कोणत्याही मध्यस्थाशिवाय थेट मोठ्या कंपन्यांना व प्रक्रिया उद्योगांना {c_name} विकू शकतात. ०% दलालीसह पूर्ण रक्कम थेट बँक खात्यात मिळते."
                action_title = "०% दलाली थेट विक्री नोंदणी"
                action_desc = f"थेट विक्रीतून बाजार समिती दलाली (२-३%) व वजन कपातीची बचत होते. आपला शेतमाल ₹{crop['spot'] + 45}/क्विंटल प्रीमियम दराने लिस्ट करा."
                stats = [
                    {"label": "अपेक्षित विक्री भाव", "val": f"₹{crop['spot'] + 45}/Q"},
                    {"label": "दलाली बचत", "val": "₹६० ते ₹१२०/Q"},
                    {"label": "पेमेंट कालावधी", "val": "२४ तासांत थेट बँक जमा"}
                ]
            elif is_hi:
                resp_text = f"किसान भाई एग्रीपल्स डायरेक्ट मार्केट में बिना किसी बिचौलिए या दलाल के सीधे बड़ी कंपनियों और आटा/दाल/ऑयल मिलों को {c_name} बेच सकते हैं। आपको पूरा भुगतान सीधे बैंक खाते में मिलेगा।"
                action_title = "0% कमीशन पर सीधी बिक्री"
                action_desc = f"सीधे बेचने पर आपको मंडी कमीशन (1.5-2.5%) व तुलाई कटने की बचत होगी। आप अपनी फसल का लॉट ₹{crop['spot'] + 40}/Q के प्रीमियम भाव पर लिस्ट कर सकते हैं।"
                stats = [
                    {"label": "अनुशंसित लिस्टिंग भाव", "val": f"₹{crop['spot'] + 40}/Q"},
                    {"label": "ब्रोकरेज बचत", "val": "₹60 - ₹110/Q"},
                    {"label": "भुगतान मोड", "val": "24 घंटे में NEFT/UPI"}
                ]
            else:
                resp_text = f"Farmers can list {c_name} directly on the AgriPulse B2B marketplace to sell directly to millers, food processors, and institutional buyers with 0% brokerage commission."
                action_title = "Direct Farm-to-Buyer Listing"
                action_desc = f"By bypassing intermediaries, farmers earn an extra ₹50 to ₹120 per quintal. Buyers inspect accredited quality samples and deposit funds in escrow prior to dispatch."
                stats = [
                    {"label": "Direct Farmer Realization", "val": f"₹{crop['spot'] + 50}/Q"},
                    {"label": "Commission Saved", "val": "0% Brokerage"},
                    {"label": "Payment Timeline", "val": "Instant Escrow Release"}
                ]

    # 2. STORAGE VS SELL NOW (WAREHOUSE ROI)
    elif is_storage_sell:
        if is_mr:
            resp_text = f"{c_name} पिकासाठी गोदामात साठवणूक करणे (Storage) अत्यंत फायदेशीर आहे. ६० दिवस सुरक्षित WDRA गोदामात ठेवल्यास {crop.get('mr_storage_gain_60d', crop['storage_gain_60d'])} चा निव्वळ नफा मिळू शकतो."
            action_title = "गोदाम साठवणूक व e-NWR पावती सल्ला"
            action_desc = "गोदाम पावतीवर (e-NWR) राष्ट्रीयीकृत बँकेकडून अवघ्या ७% वार्षिक व्याजाने ७५% पर्यंत कर्ज (Pledge Loan) उपलब्ध होते, ज्यामुळे तातडीची पैशांची गरज पूर्ण होते."
            stats = [
                {"label": "संभाव्य निव्वळ ROI", "val": crop.get('mr_storage_gain_60d', crop['storage_gain_60d'])},
                {"label": "गोदाम भाडे", "val": "₹१८-₹२२/Q दरमहा"},
                {"label": "तारण कर्ज सुविधा", "val": "७५% e-NWR Pledge"}
            ]
        elif is_hi:
            resp_text = f"{c_name} के लिए गोदाम में रोककर रखना (Storage) काफी लाभदायक है। 60 दिन सुरक्षित WDRA गोदाम में रखने पर आपको {crop['hi_storage_gain_60d']} का शुद्ध मुनाफा हो सकता है।"
            action_title = "भंडारण एवं e-NWR रसीद सलाह"
            action_desc = "गोदाम रसीद (e-NWR) पर बैंक से केवल 7% वार्षिक ब्याज पर 75% तक ऋण (Pledge Loan) भी लिया जा सकता है, जिससे तत्काल पैसों की जरूरत पूरी हो जाती है।"
            stats = [
                {"label": "अनुमानित शुद्ध ROI", "val": crop['hi_storage_gain_60d']},
                {"label": "गोदाम किराया", "val": "₹18-₹22/Q प्रति माह"},
                {"label": "बैंक ऋण सुविधा", "val": "75% e-NWR Pledge"}
            ]
        else:
            resp_text = f"For {c_name}, holding in accredited WDRA warehouses is financially favorable. A 60-day storage strategy offers {crop['storage_gain_60d']} after deducting warehousing rent (₹18-₹22/Q/month) and interest costs."
            action_title = "Storage vs Immediate Sale Decision"
            action_desc = "Farmers can deposit produce in WDRA registered warehouses, generate Electronic Negotiable Warehouse Receipts (e-NWR), and avail low-interest pledge financing up to 75% of commodity value."
            stats = [
                {"label": "Net 60-Day Storage ROI", "val": crop['storage_gain_60d']},
                {"label": "Monthly Storage Cost", "val": "₹18-₹22/Quintal"},
                {"label": "Pledge Finance", "val": "75% of Stock Value"}
            ]

    # 3. GOVERNMENT MSP & REGISTRATION
    elif is_msp_scheme:
        msp_val = f"₹{crop['msp']}/Q" if crop['msp'] else ("हमीभाव लागू नाही (मुक्त बाजार)" if is_mr else "MSP लागू नहीं (ओपन मार्केट)")
        if is_mr:
            resp_text = f"{c_name} पिकासाठी केंद्र शासनाचा किमान हमीभाव (MSP) {msp_val} आहे. शेतकरी ई-समृद्धी पोर्टल किंवा नजीकच्या NAFED/FCI खरेदी केंद्रावर नोंदणी करू शकतात."
            action_title = "शासकीय हमीभाव खरेदी माहिती"
            action_desc = f"खरेदी केंद्रासाठी आवश्यक कागदपत्रे: १. ७/१२ व ८-अ उतारा २. आधार कार्ड व बँक पासबुक ३. ओलावा निकष: कमाल {crop['moisture_limit']}। रक्कम थेट DBT द्वारे खात्यात जमा होते."
            stats = [
                {"label": "शासकीय हमीभाव", "val": msp_val},
                {"label": "ओलावा मर्यादा", "val": crop['moisture_limit']},
                {"label": "पेमेंट पद्धत", "val": "थेट DBT बँक जमा"}
            ]
        elif is_hi:
            resp_text = f"{c_name} के लिए सरकार द्वारा घोषित न्यूनतम समर्थन मूल्य (MSP) {msp_val} है। किसान e-Samridhi पोर्टल या निकटतम FCI/NAFED खरीद केंद्र पर स्लॉट बुक कर सकते हैं।"
            action_title = "सरकारी खरीद व आवश्यक दस्तावेज"
            action_desc = f"खरीद केंद्र पर आवश्यक: 1. खसरा/खतौनी नकल 2. आधार कार्ड व बैंक पासबुक 3. नमी मानक: अधिकतम {crop['moisture_limit']}। भुगतान 48-72 घंटे में सीधे DBT से खाते में आता है।"
            stats = [
                {"label": "सरकारी MSP दर", "val": msp_val},
                {"label": "नमी की सीमा", "val": crop['moisture_limit']},
                {"label": "भुगतान सुरक्षा", "val": "100% DBT बैंक ट्रांसफर"}
            ]
        else:
            resp_text = f"The official Minimum Support Price (MSP) for {c_name} is {msp_val}. State procurement agencies and FCI/NAFED centers procure FAQ grade directly from registered growers."
            action_title = "Government MSP & Procurement Framework"
            action_desc = f"Mandatory registration on state farmer portals with Aadhaar-seeded bank accounts and land registry records. Moisture must not exceed {crop['moisture_limit']}."
            stats = [
                {"label": "Statutory MSP", "val": msp_val},
                {"label": "Moisture Ceiling", "val": crop['moisture_limit']},
                {"label": "Settlement", "val": "48-72h Direct DBT"}
            ]

    # 4. SATELLITE CROP HEALTH & WEATHER
    elif is_weather_health:
        if is_mr:
            resp_text = f"सेंटिनेल-२ (Sentinel-2) उपग्रहाच्या माहितीनुसार {c_name} पिकाचे कॅनोपी आरोग्य (NDVI 0.74) उत्तम स्थितीत आहे. पुढील ४८ तासांत हवामान कोरडे असल्याने कीटकनाशक फवारणीसाठी योग्य काळ आहे."
            action_title = "उपग्रह पीक आरोग्य व हवामान सल्ला"
            action_desc = "मातीतील ओलावा समाधानकारक पातळीवर आहे. उष्णतेच्या लाटेचा कोणताही गंभीर धोका नाही. नियमित पाणी व्यवस्थापन चालू ठेवावे."
            stats = [
                {"label": "NDVI पीक निर्देशांक", "val": "0.74 (उत्तम)"},
                {"label": "फवारणी योग्यता", "val": "योग्य वेळ (Ideal)"},
                {"label": "उष्णता ताण", "val": "कमी धोका"}
            ]
        elif is_hi:
            resp_text = f"सेंटिनेल-2 उपग्रह स्कैन के अनुसार {c_name} का वनस्पति स्वास्थ्य (NDVI 0.74) मजबूत है। अगले 48 घंटों में मौसम साफ रहने के कारण कीटनाशक छिड़काव के लिए आदर्श समय है।"
            action_title = "उपग्रह फसल निगरानी एवं मौसम परामर्श"
            action_desc = "मिट्टी में नमी की स्थिति अनुकूल है। अगले 3 दिनों में कोई गंभीर हीटवेव अलर्ट नहीं है। निर्धारित समय पर सिंचाई एवं पोषण प्रबंधन जारी रखें।"
            stats = [
                {"label": "कैनोपी NDVI", "val": "0.74 (स्वस्थ)"},
                {"label": "स्प्रे विंडो", "val": "आदर्श समय"},
                {"label": "हीट स्ट्रेस", "val": "नगण्य जोखिम"}
            ]
        else:
            resp_text = f"Sentinel-2 MSI remote sensing indicates robust vegetative vigor (Canopy NDVI 0.74) across core {c_name} growing clusters. Ambient microclimate is favorable for scheduled ag-chemical spray."
            action_title = "Satellite Canopy Index & Microclimate Radar"
            action_desc = "Surface soil moisture (0-7cm) is hovering in the optimal 28-34% band. No high-heat stress alerts are triggered over the next 72 hours."
            stats = [
                {"label": "Canopy NDVI", "val": "0.74 (Optimal)"},
                {"label": "Spraying Window", "val": "Ideal (Low Wind Drift)"},
                {"label": "Heat Stress Risk", "val": "Low / Safe"}
            ]

    # 5. MANDI ARBITRAGE / WHERE TO SELL OR BUY
    elif is_mandi_arbitrage:
        if is_buyer_query:
            if is_mr:
                resp_text = f"थोक खरेदीदारांसाठी {c_name} सर्वात कमी दरात {crop.get('mr_best_buyer_mandi', crop['best_buyer_mandi'])} बाजार समितीत उपलब्ध आहे. वाहतूक खर्च वजा जाता सरासरी भाव ₹{crop['buyer_landed_cost']}/क्विंटल पडेल."
                action_title = "किफायतशीर खरेदी केंद्र"
                action_desc = f"थेट आवकेच्या काळात खरेदी केल्यास ₹१०० ते ₹१५० प्रति क्विंटलची बचत शक्य आहे."
                stats = [
                    {"label": "किफायतशीर बाजार", "val": crop.get('mr_best_buyer_mandi', crop['best_buyer_mandi'])},
                    {"label": "अपेक्षित खरेदी दर", "val": f"₹{crop['buyer_landed_cost']}/Q"}
                ]
            elif is_hi:
                resp_text = f"थोक खरीदारों के लिए {c_name} सबसे किफायती भाव पर {crop['best_buyer_mandi']} में उपलब्ध है। ट्रांसपोर्ट भाड़ा मिलाकर आपकी लैंडेड लागत लगभग ₹{crop['buyer_landed_cost']}/क्विंटल आएगी।"
                action_title = "न्यूनतम लैंडेड कॉस्ट सोर्सिंग हब"
                action_desc = f"इस मंडी से 500+ MT का बड़ा लॉट उठाने पर आपको स्थानीय मंडियों की तुलना में ₹80 से ₹140 प्रति क्विंटल का सीधा मार्जिन मिलेगा।"
                stats = [
                    {"label": "सर्वश्रेष्ठ खरीद मंडी", "val": crop['hi_best_buyer_mandi']},
                    {"label": "लैंडेड लागत", "val": f"₹{crop['buyer_landed_cost']}/Q"}
                ]
            else:
                resp_text = f"For bulk procurement of {c_name}, the most competitive sourcing cluster is {crop['best_buyer_mandi']} with an estimated delivered landed cost of ₹{crop['buyer_landed_cost']}/Quintal."
                action_title = "Lowest Landed Sourcing Optimization"
                action_desc = f"Direct sourcing from these terminal aggregation hubs unlocks a net margin benefit of ₹80-₹150/Q compared to retail secondary mandis."
                stats = [
                    {"label": "Optimal Mandi Hub", "val": crop['best_buyer_mandi']},
                    {"label": "Delivered Cost", "val": f"₹{crop['buyer_landed_cost']}/Q"}
                ]
        else:
            if is_mr:
                resp_text = f"शेतकऱ्यांसाठी {c_name} पिकाला सर्वाधिक भाव {crop.get('mr_top_mandi', crop['top_mandi'])} बाजार समितीत मिळत आहे. वाहतूक खर्च वजा जाता हा नफा सर्वोत्तम ठरतो."
                action_title = "सर्वोच्च नफा देणारी बाजार समिती"
                action_desc = f"नजीकच्या बाजार समितीपेक्षा या बाजारात माल नेल्यास प्रति क्विंटल ₹१२० ते ₹२२० अतिरिक्त नफा मिळू शकतो."
                stats = [
                    {"label": "सर्वोच्च भाव बाजार", "val": crop.get('mr_top_mandi', crop['top_mandi'])},
                    {"label": "अतिरिक्त नफा", "val": "+₹१२० ते ₹२२०/Q"}
                ]
            elif is_hi:
                resp_text = f"किसानों के लिए {c_name} में सर्वाधिक शुद्ध मुनाफा {crop['hi_top_mandi']} में मिल रहा है। स्थानीय मंडी की तुलना में भाड़ा काटकर भी ₹150 से ₹250/Q का अतिरिक्त लाभ होगा।"
                action_title = "उच्चतम मंडी मुनाफा आर्बिट्राज"
                action_desc = f"यदि दूरी 150 किमी से कम है तो सीधे {crop['top_mandi']} में माल ले जाना आर्थिक रूप से सबसे अधिक फायदेमंद है।"
                stats = [
                    {"label": "उच्चतम भाव मंडी", "val": crop['hi_top_mandi']},
                    {"label": "अतिरिक्त मुनाफा", "val": "+₹150-₹250/Q"}
                ]
            else:
                resp_text = f"For farmers selling {c_name}, the highest net realization after freight deduction is currently observed at {crop['top_mandi']}."
                action_title = "Inter-Mandi Arbitrage Optimization"
                action_desc = f"Dispatching aggregated produce to these terminal markets yields an extra ₹150 to ₹250 per quintal over regional primary yards."
                stats = [
                    {"label": "Highest Realization Hub", "val": crop['top_mandi']},
                    {"label": "Net Price Advantage", "val": "+₹150 to ₹250/Q"}
                ]

    # 6. PRICE FORECAST & TREND TARGETS
    else:
        if is_mr:
            resp_text = f"{c_name} पिकाचा सध्याचा हाजिर भाव ₹{crop['spot']}/क्विंटल आहे. एआय मॉडेलनुसार पुढील १५ दिवसांत ₹{crop['forecast_15d']} आणि ३० दिवसांत ₹{crop['forecast_30d']}/क्विंटल पर्यंत भाव वाढण्याचा अंदाज ({crop.get('mr_trend', crop['trend'])}) आहे. {crop.get('mr_key_driver', crop['key_driver'])}."
            action_title = f"{c_name} १५ व ३० दिवसांचा संभाव्य भाव"
            action_desc = f"बाजार कल: {crop.get('mr_trend', crop['trend'])}। जर पैशांची तातडीची गरज नसेल तर माल गोदामात साठवून ठेवावा किंवा थेट B2B बाजारात विक्री करावी."
            stats = [
                {"label": "सध्याचा भाव", "val": f"₹{crop['spot']}/Q"},
                {"label": "१५-दिवस लक्ष्य", "val": f"₹{crop['forecast_15d']}/Q"},
                {"label": "३०-दिवस लक्ष्य", "val": f"₹{crop['forecast_30d']}/Q"},
                {"label": "बाजार कल", "val": crop.get('mr_trend', crop['trend'])}
            ]
        elif is_hi:
            resp_text = f"{c_name} का वर्तमान हाजिर भाव ₹{crop['spot']}/क्विंटल है। एआई पूर्वानुमान के अनुसार 15 दिनों में भाव ₹{crop['forecast_15d']} और 30 दिनों में ₹{crop['forecast_30d']}/क्विंटल तक जाने की संभावना ({crop['hi_trend']}) है। प्रमुख कारण: {crop['hi_key_driver']}।"
            action_title = f"{c_name} 15 व 30-दिवसीय मूल्य पूर्वानुमान"
            action_desc = f"बाजार रुख: {crop['hi_trend']}। यदि तुरंत नकदी की आवश्यकता नहीं है, तो 30 से 45 दिन माल को WDRA गोदाम में रोकना सबसे समझदारी भरा निर्णय है।"
            stats = [
                {"label": "हाजिर भाव", "val": f"₹{crop['spot']}/Q"},
                {"label": "15-दिन टारगेट", "val": f"₹{crop['forecast_15d']}/Q"},
                {"label": "30-दिन टारगेट", "val": f"₹{crop['forecast_30d']}/Q"},
                {"label": "मार्केट आउटलुक", "val": crop['hi_trend']}
            ]
        else:
            resp_text = f"{c_name} is trading at a spot benchmark of ₹{crop['spot']}/Quintal. AgriPulse AI models project prices reaching ₹{crop['forecast_15d']} in 15 days and ₹{crop['forecast_30d']} in 30 days ({crop['trend']}). Core driver: {crop['key_driver']}."
            action_title = f"{c_name} 15 & 30-Day Multi-Horizon Forecast"
            action_desc = f"Market structure: {crop['trend']}. Recommendation: Hold in accredited warehouse to capture forward seasonal upside."
            stats = [
                {"label": "Current Spot", "val": f"₹{crop['spot']}/Q"},
                {"label": "15-Day Target", "val": f"₹{crop['forecast_15d']}/Q"},
                {"label": "30-Day Target", "val": f"₹{crop['forecast_30d']}/Q"},
                {"label": "Price Signal", "val": crop['trend']}
            ]

    followups = [
        (f"{c_name} चा ३० दिवसांचा भाव आलेख दाखवा" if is_mr else (f"{c_name} का 30 दिन का भाव ग्राफ दिखाएं" if is_hi else f"Show 30-day forecast curves for {crop['en_name']}")),
        (f"{c_name} साठवणूक विरुद्ध थेट विक्री नफा तपासा" if is_mr else (f"{c_name} के लिए बेस्ट मंडी और स्टोरेज ROI देखें" if is_hi else f"Compare Sell Now vs 60-Day Storage ROI for {crop['en_name']}")),
        (f"थेट B2B एस्क्रो बाजारात माल कसा विकावा?" if is_mr else (f"सीधे खरीदारों/किसानों से B2B सौदे कैसे करें?" if is_hi else f"How to trade directly on B2B Escrow Marketplace for {crop['en_name']}"))
    ]

    return {
        "status": "success",
        "crop_id": crop_id,
        "crop_name": crop["en_name"],
        "language_detected": "mr" if is_mr else ("hi" if is_hi else "en"),
        "role_detected": "buyer" if is_buyer_query else "farmer",
        "voice_response": resp_text,
        "action_title": action_title,
        "action_details": action_desc,
        "key_stats": stats,
        "suggested_followups": followups
    }
