import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from services.agri_copilot_service import detect_language, classify_domain, generate_response

client = TestClient(app)

def run_tests():
    print("🌾 ==========================================================================")
    print("🌾 TESTING DOMAIN-RESTRICTED MULTILINGUAL AGRI COPILOT (PIPELINE & ENDPOINTS)")
    print("🌾 ==========================================================================\n")

    test_cases = [
        {
            "desc": "1. Hindi (Devanagari) — Fertilizer Query",
            "query": "गेहूं की फसल में कौन सी खाद डालनी चाहिए?",
            "expected_lang": "hi",
            "expected_domain": True,
            "expected_script": "Devanagari"
        },
        {
            "desc": "2. Marathi (Devanagari) — Pest & Crop Protection",
            "query": "कापूस पिकावर कीड आली आहे, काय करावे?",
            "expected_lang": "mr",
            "expected_domain": True,
            "expected_script": "Devanagari"
        },
        {
            "desc": "3. Punjabi (Gurmukhi) — Mandi Price Query",
            "query": "ਕਣਕ ਦਾ ਭਾਅ ਕੀ ਹੈ?",
            "expected_lang": "pa",
            "expected_domain": True,
            "expected_script": "Gurmukhi"
        },
        {
            "desc": "4. Gujarati — Peanut Fertilizer Query",
            "query": "મગફળીના પાક માટે કયું ખાતર સારું છે?",
            "expected_lang": "gu",
            "expected_domain": True,
            "expected_script": "Gujarati"
        },
        {
            "desc": "5. Telugu — Paddy Fertilizer Scheduling",
            "query": "వరి పంటకు ఎరువులు ఎప్పుడు వేయాలి?",
            "expected_lang": "te",
            "expected_domain": True,
            "expected_script": "Telugu"
        },
        {
            "desc": "6. Tamil — Paddy Nutrition Advice",
            "query": "நெல் பயிருக்கு எந்த உரம் நல்லது?",
            "expected_lang": "ta",
            "expected_domain": True,
            "expected_script": "Tamil"
        },
        {
            "desc": "7. Kannada — Rice Crop Fertilizer",
            "query": "ಭತ್ತದ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಒಳ್ಳೆಯದು?",
            "expected_lang": "kn",
            "expected_domain": True,
            "expected_script": "Kannada"
        },
        {
            "desc": "8. Bengali — Paddy Fertilizer Advisory",
            "query": "ধান চাষে কোন সার ব্যবহার করা ভালো?",
            "expected_lang": "bn",
            "expected_domain": True,
            "expected_script": "Bengali"
        },
        {
            "desc": "9. Malayalam — Paddy Cultivation Management",
            "query": "നെൽകൃഷിക്ക് ഏത് വളമാണ് നല്ലത്?",
            "expected_lang": "ml",
            "expected_domain": True,
            "expected_script": "Malayalam"
        },
        {
            "desc": "10. Odia — Crop Nutrition Advisory",
            "query": "ଧାନ ଫସଲରେ କେଉଁ ସାର ପ୍ରୟୋଗ କରିବା ଭଲ?",
            "expected_lang": "or",
            "expected_domain": True,
            "expected_script": "Odia"
        },
        {
            "desc": "11. Romanized Hindi (Hinglish) — Fertilizer Dosage",
            "query": "wheat ki fasal me kaunsi khad daalu",
            "expected_lang": "hi-Latn",
            "expected_domain": True,
            "expected_script": "Latin"
        },
        {
            "desc": "12. English — Wheat Fertilizer Advice",
            "query": "What fertilizer should I use for wheat?",
            "expected_lang": "en",
            "expected_domain": True,
            "expected_script": "Latin"
        },
        {
            "desc": "13. Off-Topic Query in Hindi (Cricket Match Weather)",
            "query": "आज का मौसम कैसा है क्रिकेट मैच के लिए?",
            "expected_lang": "hi",
            "expected_domain": False,
            "must_refuse": True
        },
        {
            "desc": "14. Off-Topic Query in English (Poem on Love)",
            "query": "Write me a poem about love",
            "expected_lang": "en",
            "expected_domain": False,
            "must_refuse": True
        },
        {
            "desc": "15. Off-Topic Query in Marathi (Movie Recommendation)",
            "query": "मला एक चांगला चित्रपट किंवा सिनेमा सुचवा",
            "expected_lang": "mr",
            "expected_domain": False,
            "must_refuse": True
        },
        {
            "desc": "16. Edge Case: Single Word Agri Query ('गेहूं')",
            "query": "गेहूं",
            "expected_lang": "hi",
            "expected_domain": True
        },
        {
            "desc": "17. Edge Case: Empty Query",
            "query": "",
            "expected_lang": "en",
            "expected_domain": False,
            "must_refuse": True
        }
    ]

    all_passed = True

    for case in test_cases:
        query = case["query"]
        lang = detect_language(query)
        domain = classify_domain(query, lang)
        
        # Test HTTP API endpoint
        res = client.post("/api/copilot/query", json={"query": query, "language": "auto"})
        if res.status_code != 200:
            print(f"❌ {case['desc']} - Endpoint returned HTTP {res.status_code}")
            all_passed = False
            continue
            
        data = res.json()
        detected_lang = data["language"]["code"]
        is_agri = data["domain"]["is_agri"]
        response_text = data["response_text"]

        # Validate Language
        if detected_lang != case["expected_lang"]:
            print(f"❌ {case['desc']} - Language Mismatch! Expected: {case['expected_lang']}, Got: {detected_lang}")
            all_passed = False
            continue

        # Validate Domain
        if is_agri != case["expected_domain"]:
            print(f"❌ {case['desc']} - Domain Mismatch! Expected is_agri: {case['expected_domain']}, Got: {is_agri}")
            all_passed = False
            continue

        # Validate Refusal for Off-Topic
        if case.get("must_refuse"):
            if not ("खेती" in response_text or "farming" in response_text or "शेती" in response_text or "कृषि" in response_text or "help with farming" in response_text or "kheti" in response_text):
                print(f"❌ {case['desc']} - Refusal text did not contain agricultural redirection!")
                all_passed = False
                continue

        print(f"✅ {case['desc']}")
        print(f"   Detected: {data['language']['name']} ({detected_lang}) | Domain: {'AGRICULTURE' if is_agri else 'OFF_TOPIC REFUSAL'}")
        print(f"   Response Preview: {response_text[:80]}...\n")

    if all_passed:
        print("🎉 ALL 17 MULTILINGUAL & DOMAIN-RESTRICTED TEST CASES PASSED PERFECTLY!")
    else:
        print("❌ Some test cases failed. Please review errors above.")

if __name__ == "__main__":
    run_tests()
