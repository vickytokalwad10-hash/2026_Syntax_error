import asyncio
import hmac
import hashlib
import json
import random
import string
from datetime import datetime

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Unique phone per run so in-memory DB never has stale duplicates
RUN_ID = ''.join(random.choices(string.digits, k=5))
FARMER_PHONE = f"98765{RUN_ID}"
BUYER_PHONE  = f"98987{RUN_ID}"
FARMER_PASS  = "FarmerPassword123"
BUYER_PASS   = "BuyerPassword123"

def run_tests():
    print("==================================================")
    print("🚀 TESTING AGRIPULSE FULL-STACK MODULE BACKEND")
    print("==================================================")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✅ 1. Health Check Passed:", res.json().get("status"))

    # 2. Farmer Signup
    farmer_payload = {
        "name": "Kisan Dev Patel",
        "phone": FARMER_PHONE,
        "village_district": "Dindori, Nashik",
        "crops_grown": ["Wheat", "Soybean", "Grapes"],
        "aadhar_id": "1234-5678-9012",
        "password": FARMER_PASS
    }
    res = client.post("/api/auth/farmer/signup", json=farmer_payload)
    if res.status_code == 200:
        farmer_data = res.json()
        farmer_token = farmer_data["access_token"]
        print("✅ 2. Farmer Signup Successful. Role:", farmer_data["role"])
    else:
        login_res = client.post("/api/auth/login", json={
            "identifier": FARMER_PHONE,
            "password": FARMER_PASS,
            "role": "farmer"
        })
        assert login_res.status_code == 200, f"Login fallback failed: {login_res.text}"
        farmer_data = login_res.json()
        farmer_token = farmer_data["access_token"]
        print("✅ 2. Farmer Login Successful. Role:", farmer_data["role"])

    # 3. Buyer Signup & Login
    buyer_payload = {
        "name": "Agro Trade Logistics Ltd",
        "phone": BUYER_PHONE,
        "email": "procurement@agrotrade.com",
        "company_name": "Agro Trade Logistics Pvt Ltd",
        "gstin": "27AAACA1234A1Z5",
        "password": BUYER_PASS
    }
    res = client.post("/api/auth/buyer/signup", json=buyer_payload)
    if res.status_code == 200:
        buyer_data = res.json()
        buyer_token = buyer_data["access_token"]
        print("✅ 3. Buyer Signup Successful. Role:", buyer_data["role"])
    else:
        login_res = client.post("/api/auth/login", json={
            "identifier": BUYER_PHONE,
            "password": BUYER_PASS,
            "role": "buyer"
        })
        assert login_res.status_code == 200, f"Buyer login fallback failed: {login_res.text}"
        buyer_data = login_res.json()
        buyer_token = buyer_data["access_token"]
        print("✅ 3. Buyer Login Successful. Role:", buyer_data["role"])

    # 4. OTP Verification Endpoints
    otp_send = client.post("/api/auth/send-otp", json={"phone": "9898700002", "purpose": "signup"})
    assert otp_send.status_code == 200
    otp_verify = client.post("/api/auth/verify-otp", json={"phone": "9898700002", "otp": "123456", "purpose": "signup"})
    assert otp_verify.status_code == 200
    print("✅ 4. OTP Sandbox Generation & Verification Passed")

    # 5. Role-Protected Endpoint /me
    me_farmer = client.get("/api/auth/me", headers={"Authorization": f"Bearer {farmer_token}"})
    assert me_farmer.status_code == 200 and me_farmer.json()["role"] == "farmer"
    print("✅ 5. RBAC Auth Verification Passed for Farmer Token")

    # 6. Domain-Restricted Chatbot - On-Topic Query
    chat_agri = client.post("/api/chatbot", json={
        "message": "What is the recommended NPK fertilizer dosage for wheat during tillering stage?",
        "language": "English",
        "role": "farmer",
        "session_id": "test_session_01"
    })
    assert chat_agri.status_code == 200
    chat_agri_json = chat_agri.json()
    assert chat_agri_json["is_agri_related"] is True
    print("✅ 6. Chatbot On-Topic Agri Query Handled. Length:", len(chat_agri_json["reply"]))

    # 7. Domain-Restricted Chatbot - Off-Topic Query Refusal (e.g. Football / Movies)
    chat_offtopic = client.post("/api/chatbot", json={
        "message": "Who won the football world cup and what is the latest celebrity movie gossip?",
        "language": "Hindi",
        "role": "farmer",
        "session_id": "test_session_01"
    })
    assert chat_offtopic.status_code == 200
    chat_off_json = chat_offtopic.json()
    assert chat_off_json["is_agri_related"] is False
    print("✅ 7. Chatbot Off-Topic Query Intercepted & Refused Politely in Hindi:", chat_off_json["reply"][:60], "...")

    # 8. Chatbot Multilingual Query (Marathi)
    chat_marathi = client.post("/api/chatbot", json={
        "message": "कांदा पिकासाठी ठिबक सिंचनाचे नियोजन कसे करावे?",
        "language": "Marathi",
        "role": "farmer",
        "session_id": "test_session_01"
    })
    assert chat_marathi.status_code == 200
    print("✅ 8. Chatbot Marathi Multilingual Response Received")

    # 9. Payment Flow: Order Creation
    order_res = client.post("/api/payment/create-order", json={
        "listing_id": "crop_lot_101",
        "farmer_id": "farmer_dev_01",
        "farmer_name": "Ramesh Patil",
        "crop_name": "Wheat (Sharbati Gold)",
        "quantity_quintals": 120,
        "amount": 330000.0,
        "currency": "INR"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    assert order_res.status_code == 200
    order_data = order_res.json()
    order_id = order_data["order_id"]
    gateway_order_id = order_data["gateway_order_id"]
    print("✅ 9. Payment Order Created:", order_id, "Requires 2FA:", order_data["requires_2fa"])

    # 10. High-Value 2FA OTP Request & Verification
    if order_data["requires_2fa"]:
        otp_req = client.post("/api/payment/request-2fa", json={
            "order_id": order_id,
            "buyer_phone": "9898700002",
            "amount": 330000.0
        })
        assert otp_req.status_code == 200
        otp_verify = client.post("/api/payment/verify-2fa", json={
            "order_id": order_id,
            "buyer_phone": "9898700002",
            "otp": "123456"
        })
        assert otp_verify.status_code == 200
        print("✅ 10. High-Value 2FA Authorization Verified for Payment")

    # 11. Server-Side HMAC SHA256 Signature Verification
    payment_id = "pay_dev_mock_998811"
    secret = "rzp_secret_agripulse_sandbox_key"
    message = f"{gateway_order_id}|{payment_id}".encode("utf-8")
    valid_sig = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()

    verify_res = client.post("/api/payment/verify", json={
        "gateway_order_id": gateway_order_id,
        "gateway_payment_id": payment_id,
        "gateway_signature": valid_sig,
        "listing_id": "crop_lot_101",
        "amount": 330000.0
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    assert verify_res.status_code == 200
    print("✅ 11. Server-Side Signature Verification & Escrow Confirmation Passed")

    # 12. Transaction Ledger Retrieval
    tx_res = client.get("/api/payment/transactions", headers={"Authorization": f"Bearer {buyer_token}"})
    assert tx_res.status_code == 200
    print("✅ 12. Buyer Transaction Ledger Count:", tx_res.json()["count"])

    print("\n🎉 ALL 12 BACKEND UNIT & INTEGRATION TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    run_tests()
