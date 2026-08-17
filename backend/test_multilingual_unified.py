"""
AgriPulse AI — Unified Multilingual Test Suite (Standard Unittest)
Verifies:
1. Unicode Script Range Detection across all 10 non-English Indic scripts
2. Single-source build_language_instruction output
3. Romanized / Hinglish detection
4. Off-domain classification and localized refusal messages
5. Copilot response generation using unified language pipeline
"""

import os
import sys
import unittest

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from services.language_utils import (
    SUPPORTED_LANGUAGES,
    detect_unicode_script,
    detect_language_pipeline,
    build_language_instruction,
    OFF_TOPIC_REFUSALS,
    DEFAULT_AGRI_SUGGESTIONS
)
from services.agri_copilot_service import detect_language, classify_domain, generate_response

client = TestClient(app)


class TestUnifiedMultilingualPipeline(unittest.TestCase):

    def test_unicode_script_detection_all_10_scripts(self):
        """Tests deterministic Unicode script detection across all 10 non-English Indic scripts."""
        test_cases = [
            {"script": "Devanagari (Hindi)", "text": "गेहूं की फसल में यूरिया कब डालना चाहिए?", "expected_code": "hi", "expected_script": "Devanagari"},
            {"script": "Devanagari (Marathi)", "text": "कापूस पिकावर बोंडअळी नियंत्रणासाठी काय करावे?", "expected_code": "mr", "expected_script": "Devanagari"},
            {"script": "Gurmukhi (Punjabi)", "text": "ਕਣਕ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?", "expected_code": "pa", "expected_script": "Gurmukhi"},
            {"script": "Gujarati", "text": "મગફળીના પાક માટે કયું ખાતર સારું છે?", "expected_code": "gu", "expected_script": "Gujarati"},
            {"script": "Telugu", "text": "వరి పంటకు ఎరువులు ఎప్పుడు వేయాలి?", "expected_code": "te", "expected_script": "Telugu"},
            {"script": "Tamil", "text": "நெல் பயிருக்கு எந்த உரம் நல்லது?", "expected_code": "ta", "expected_script": "Tamil"},
            {"script": "Kannada", "text": "ಭತ್ತದ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಒಳ್ಳೆಯದು?", "expected_code": "kn", "expected_script": "Kannada"},
            {"script": "Bengali", "text": "ধান চাষে কোন সার ব্যবহার করা ভালো?", "expected_code": "bn", "expected_script": "Bengali"},
            {"script": "Malayalam", "text": "നെൽകൃഷിക്ക് ഏത് വളമാണ് നല്ലത്?", "expected_code": "ml", "expected_script": "Malayalam"},
            {"script": "Odia", "text": "ଧାନ ଫସଲରେ କେଉଁ ସାର ପ୍ରୟୋଗ କରିବା ଭଲ?", "expected_code": "or", "expected_script": "Odia"},
        ]

        for case in test_cases:
            with self.subTest(script=case["script"]):
                res = detect_unicode_script(case["text"])
                self.assertIsNotNone(res, f"Failed to detect Unicode script for {case['script']}")
                code, script, confidence = res
                self.assertEqual(code, case["expected_code"], f"Expected code {case['expected_code']}, got {code}")
                self.assertEqual(script, case["expected_script"], f"Expected script {case['expected_script']}, got {script}")
                self.assertGreaterEqual(confidence, 0.85, f"Confidence too low: {confidence}")

    def test_romanized_hinglish_detection(self):
        text = "wheat ki fasal me urea aur dap kitna daalu"
        res = detect_language_pipeline(text)
        self.assertEqual(res["code"], "hi-Latn")
        self.assertTrue(res["is_romanized"])
        self.assertEqual(res["script"], "Latin")

    def test_english_detection(self):
        text = "What is the recommended NPK dosage for sugarcane cultivation?"
        res = detect_language_pipeline(text)
        self.assertEqual(res["code"], "en")
        self.assertFalse(res["is_romanized"])

    def test_build_language_instruction_centralized(self):
        # Test Hindi
        hi_instr = build_language_instruction("hi")
        self.assertIn("Devanagari", hi_instr)
        self.assertIn("Hindi", hi_instr)

        # Test Marathi
        mr_instr = build_language_instruction("mr")
        self.assertIn("Devanagari", mr_instr)
        self.assertIn("Marathi", mr_instr)

        # Test Punjabi
        pa_instr = build_language_instruction("pa")
        self.assertIn("Gurmukhi", pa_instr)
        self.assertIn("Punjabi", pa_instr)

        # Test Telugu
        te_instr = build_language_instruction("te")
        self.assertIn("Telugu", te_instr)

        # Test Hinglish
        hinglish_instr = build_language_instruction("hi-Latn", is_romanized=True)
        self.assertTrue("Hinglish" in hinglish_instr or "Romanized" in hinglish_instr)
        self.assertIn("Latin", hinglish_instr)

    def test_off_topic_refusal_marathi(self):
        query = "मला सांगा कालचा क्रिकेट मॅच कोण जिंकला?"
        lang_info = detect_language(query)
        domain_res = classify_domain(query, lang_info)
        self.assertFalse(domain_res.is_agri)
        self.assertIsNotNone(domain_res.refusal_message)
        self.assertTrue("शेती" in domain_res.refusal_message or "AgriPulse" in domain_res.refusal_message)

    def test_off_topic_refusal_english(self):
        query = "Write a python script to reverse a binary tree."
        lang_info = detect_language(query)
        domain_res = classify_domain(query, lang_info)
        self.assertFalse(domain_res.is_agri)
        self.assertIn("agriculture", domain_res.refusal_message.lower())

    def test_api_copilot_query_punjabi(self):
        res = client.post("/api/copilot/query", json={
            "query": "ਕਣਕ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?",
            "language": "pa",
            "user_id": "test_farmer"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["language"]["code"], "pa")
        self.assertTrue(data["domain"]["is_agri"])
        self.assertGreater(len(data["response_text"]), 0)

    def test_api_copilot_query_bengali(self):
        res = client.post("/api/copilot/query", json={
            "query": "ধান চাষে কোন সার ব্যবহার করা ভালো?",
            "language": "bn",
            "user_id": "test_farmer"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["language"]["code"], "bn")
        self.assertTrue(data["domain"]["is_agri"])
        self.assertGreater(len(data["response_text"]), 0)


if __name__ == "__main__":
    unittest.main()
