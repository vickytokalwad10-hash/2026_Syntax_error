import urllib.request
import json

def test_api(url, method="GET", payload=None):
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload).encode('utf-8') if payload else None
        with urllib.request.urlopen(req, data=data, timeout=5) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body)
    except Exception as e:
        return 500, str(e)

print("--- Testing API Endpoints ---")

# 1. Crop Planning
status, body = test_api("http://127.0.0.1:8000/api/crop-planning/recommend", "POST", {
    "state": "Haryana",
    "district": "Karnal",
    "soil_type": "Alluvial Loam",
    "target_season": "Rabi (Winter)",
    "land_size_acres": 10.0
})
print("Crop Planning:", status, "Top Choice:", body.get("recommendations", [{}])[0].get("name") if status == 200 else body)

# 2. Disease Diagnose
status, body = test_api("http://127.0.0.1:8000/api/diagnose/pest-disease", "POST", {
    "crop_type": "Wheat",
    "farmer_notes": "Observed linear yellow rust pustules on leaf veins",
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    "is_offline_sync": False
})
print("Diagnose:", status, "Issue:", body.get("diagnosis", {}).get("issue_name") if status == 200 else body)

# 3. Healthy Crop Diagnose
status, body = test_api("http://127.0.0.1:8000/api/diagnose/pest-disease", "POST", {
    "crop_type": "Wheat",
    "farmer_notes": "Healthy foliage clean leaves",
    "image_base64": None,
    "is_offline_sync": False
})
print("Healthy Diagnose:", status, "Issue:", body.get("diagnosis", {}).get("issue_name") if status == 200 else body)

# 4. Crop Calendar (Mustard)
status, body = test_api("http://127.0.0.1:8000/api/calendar/generate", "POST", {
    "crop_name": "Mustard",
    "region": "Rajasthan",
    "soil_type": "Sandy Loam",
    "sowing_date": "2025-10-15"
})
print("Calendar (Mustard):", status, "Duration:", body.get("total_crop_duration_days") if status == 200 else body, "Stages:", len(body.get("milestones", [])) if status == 200 else 0)

# 5. Crop Calendar (Basmati Rice)
status, body = test_api("http://127.0.0.1:8000/api/calendar/generate", "POST", {
    "crop_name": "Basmati Rice",
    "region": "Haryana / Punjab",
    "soil_type": "Alluvial Loam",
    "sowing_date": "2026-06-15"
})
print("Calendar (Rice):", status, "Duration:", body.get("total_crop_duration_days") if status == 200 else body, "Stages:", len(body.get("milestones", [])) if status == 200 else 0)
