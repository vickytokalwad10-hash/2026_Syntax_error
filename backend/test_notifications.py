import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from services.notification_service import notification_service

client = TestClient(app)

def run_tests():
    print("🌾 ==========================================================================")
    print("🌾 TESTING AGRIPULSE AI NOTIFICATION & AUTO-ALERT PIPELINE")
    print("🌾 ==========================================================================\n")

    user_id = "test_farmer_88"
    
    # 1. GET INITIAL NOTIFICATIONS
    print("✅ 1. Fetch initial notification feed")
    res = client.get(f"/api/notifications?user_id={user_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "unread_count" in data
    assert "category_counts" in data
    print(f"   Initial Total: {data['total_count']}, Unread: {data['unread_count']}")

    # 2. TRIGGER WEATHER ALERT (Rain > 70%)
    print("\n✅ 2. Simulate Weather Alert Trigger (Rain = 85%)")
    wth_res = client.post("/api/notifications/trigger-simulation", json={
        "user_id": user_id,
        "trigger_type": "weather",
        "rain_probability": 85,
        "severe_flag": None
    })
    assert wth_res.status_code == 200
    wth_data = wth_res.json()
    assert wth_data["status"] == "triggered"
    assert "Rainfall Alert" in wth_data["notification"]["title"]
    assert wth_data["notification"]["color_type"] == "terracotta"
    print(f"   Generated: {wth_data['notification']['title']}")

    # 3. VERIFY COOLDOWN DEDUPLICATION (Immediate duplicate weather trigger suppressed)
    print("\n✅ 3. Verify Weather Cooldown Deduplication")
    dup_res = client.post("/api/notifications/trigger-simulation", json={
        "user_id": user_id,
        "trigger_type": "weather",
        "rain_probability": 90
    })
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["status"] == "suppressed_or_unmet"
    print(f"   Suppression confirmed: {dup_data['message']}")

    # 4. TRIGGER PRICE SURGE ALERT (>5% price spike on watchlisted crop)
    print("\n✅ 4. Simulate Watchlist Crop Price Alert (Wheat +6.2% Surge)")
    prc_res = client.post("/api/notifications/trigger-simulation", json={
        "user_id": user_id,
        "trigger_type": "price",
        "crop": "wheat",
        "current_price": 2880.0,
        "price_change_pct": 6.2
    })
    assert prc_res.status_code == 200
    prc_data = prc_res.json()
    assert prc_data["status"] == "triggered"
    assert "Surged" in prc_data["notification"]["title"]
    assert prc_data["notification"]["color_type"] == "crop-green"
    notif_id = prc_data["notification"]["id"]
    print(f"   Generated: {prc_data['notification']['title']} (ID: {notif_id})")

    # 5. MARK SINGLE NOTIFICATION AS READ
    print("\n✅ 5. Mark single notification as read")
    mark_res = client.post(f"/api/notifications/mark-read/{notif_id}?user_id={user_id}")
    assert mark_res.status_code == 200
    mark_data = mark_res.json()
    assert mark_data["success"] is True
    print(f"   Marked Read ID: {mark_data['marked_id']}, Remaining Unread: {mark_data['unread_count']}")

    # 6. MARK ALL AS READ
    print("\n✅ 6. Mark all notifications as read")
    all_read_res = client.post(f"/api/notifications/mark-all-read?user_id={user_id}")
    assert all_read_res.status_code == 200
    all_read_data = all_read_res.json()
    assert all_read_data["success"] is True
    assert all_read_data["unread_count"] == 0
    print(f"   All marked read. Unread count: {all_read_data['unread_count']}")

    # 7. GET & UPDATE USER NOTIFICATION SETTINGS
    print("\n✅ 7. Update user notification preferences & thresholds")
    settings_res = client.get(f"/api/notifications/settings?user_id={user_id}")
    assert settings_res.status_code == 200
    current_settings = settings_res.json()
    
    current_settings["price_change_threshold"] = 4.0
    current_settings["rain_probability_threshold"] = 65
    current_settings["watchlist_crops"].append("maize")
    
    update_res = client.post("/api/notifications/settings", json=current_settings)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["price_change_threshold"] == 4.0
    assert updated["rain_probability_threshold"] == 65
    assert "maize" in updated["watchlist_crops"]
    print(f"   Updated settings: Rain Threshold={updated['rain_probability_threshold']}%, Price Threshold=±{updated['price_change_threshold']}%, Watchlist={updated['watchlist_crops']}")

    print("\n🎉 ALL NOTIFICATION & AUTO-ALERT TEST CASES PASSED PERFECTLY!\n")

if __name__ == "__main__":
    run_tests()
