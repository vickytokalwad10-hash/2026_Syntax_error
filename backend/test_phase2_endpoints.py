import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all_phase2_endpoints():
    print("Testing Phase 2 Endpoints...")

    # 1. PM-KISAN
    res = client.post("/api/schemes/pm-kisan/status", json={"identifier": "9800000001"})
    assert res.status_code == 200, f"PM-KISAN failed: {res.text}"
    print("✅ 1. PM-KISAN lookup:", res.json()["beneficiary"]["name"])

    # 2. PMFBY Claim
    res = client.post("/api/schemes/pmfby/claim", json={
        "farmer_name": "Ramesh Patil",
        "phone": "9800000001",
        "policy_number": "PMFBY/TEST/123",
        "crop_name": "Sharbati Wheat",
        "season": "Rabi 2025-26",
        "affected_acres": 4.5,
        "calamity_type": "Hailstorm",
        "loss_percentage": 60,
        "village_district": "Dindori",
        "bank_account_last4": "4589"
    })
    assert res.status_code == 200, f"PMFBY failed: {res.text}"
    print("✅ 2. PMFBY Claim filed:", res.json()["claim"]["claim_id"])

    # 3. Soil Health
    res = client.post("/api/schemes/soil-health/analyze", json={
        "ph_level": 6.8,
        "nitrogen_level": 240,
        "phosphorus_level": 22,
        "potassium_level": 180,
        "organic_carbon_pct": 0.45,
        "target_crop": "Wheat"
    })
    assert res.status_code == 200, f"Soil Health failed: {res.text}"
    print("✅ 3. Soil Health Index:", res.json()["soil_summary"]["soil_health_index"])

    # 4. State Subsidies
    res = client.get("/api/schemes/subsidies?state=All&category=All")
    assert res.status_code == 200
    print("✅ 4. Subsidies count:", res.json()["total"])

    # 5. KCC Eligibility
    res = client.post("/api/finance/kcc-eligibility", json={
        "land_acres": 5.0,
        "primary_crop": "Wheat",
        "irrigation_status": "Irrigated",
        "existing_loan_balance": 0
    })
    assert res.status_code == 200
    print("✅ 5. KCC Limit (Year 1): ₹", res.json()["calculation"]["first_year_eligible_limit"])

    # 6. Microfinance Lenders
    res = client.get("/api/finance/lenders")
    assert res.status_code == 200
    print("✅ 6. Lenders available:", len(res.json()["lenders"]))

    # 7. Diagnose Pest
    res = client.post("/api/diagnose/pest-disease", json={"crop_type": "Wheat"})
    assert res.status_code == 200
    print("✅ 7. Diagnose condition:", res.json()["diagnosis"]["issue_name"])

    # 8. Irrigation Schedule
    res = client.post("/api/irrigation/schedule", json={
        "crop_type": "Wheat",
        "growth_stage": "Crown Root Initiation (CRI)",
        "soil_type": "Alluvial Loam",
        "irrigation_method": "Drip Irrigation",
        "land_acres": 5.0
    })
    assert res.status_code == 200
    print("✅ 8. Irrigation duration:", res.json()["recommended_flow_duration"])

    # 9. IoT Sensor Telemetry
    res = client.get("/api/irrigation/sensor-data")
    assert res.status_code == 200
    print("✅ 9. IoT Sensor Topsoil Moisture:", res.json()["telemetry"]["soil_moisture_depth_15cm"], "%")

    # 10. SMS Gateway
    res = client.post("/api/sms/send-alert", json={
        "recipient_mobile": "9800000001",
        "message_type": "Mandi_Price"
    })
    assert res.status_code == 200
    print("✅ 10. SMS Gateway dispatch ID:", res.json()["dispatch_details"]["message_id"])

    # 11. Rentals Machinery & Labor
    res = client.get("/api/rentals/equipment")
    assert res.status_code == 200
    print("✅ 11. Equipment listed:", res.json()["total"])

    # 12. Calendar Generator
    res = client.post("/api/calendar/generate", json={
        "crop_name": "Sharbati Wheat",
        "region": "Haryana / Punjab",
        "soil_type": "Alluvial Loam"
    })
    assert res.status_code == 200
    print("✅ 12. Calendar milestones:", len(res.json()["milestones"]))

    # 13. Community Feed
    res = client.get("/api/community/posts")
    assert res.status_code == 200
    print("✅ 13. Community posts:", res.json()["total"])

    # 14. Livestock Advisory
    res = client.post("/api/livestock/advisory", json={
        "animal_type": "Cow",
        "symptoms": "hard swollen udder with yellow clots in milk"
    })
    assert res.status_code == 200
    print("✅ 14. Livestock condition:", res.json()["preliminary_condition"])

    # 15. e-NAM Government Prices
    res = client.get("/api/markets/enam")
    assert res.status_code == 200
    print("✅ 15. e-NAM records:", res.json()["total_records"])

    print("\n🎉 ALL 15 PHASE 2 API ENDPOINTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all_phase2_endpoints()
