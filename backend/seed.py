"""
AgriPulse AI — Seed Test Accounts
Runs at server startup via FastAPI lifespan to pre-register 2 fixed test accounts.
These accounts are always available for immediate login without going through signup.

TEST ACCOUNTS:
  FARMER  → phone: 9800000001  password: Farmer@123
  BUYER   → phone: 9900000001  password: Buyer@123
"""

import uuid
import hashlib
import os
from datetime import datetime, timezone
from database import get_db

def hash_pw(password: str, salt: str = "agripulse_salt_2026") -> str:
    try:
        import bcrypt
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")
    except Exception:
        return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()

# ─── Fixed Test Credentials ──────────────────────────────────────────────────
TEST_ACCOUNTS = [
    {
        "role": "farmer",
        "user_id": "test_farmer_001",
        "name": "Ram Lal Patel",
        "phone": "9800000001",
        "village_district": "Karnal West, Haryana",
        "crops_grown": ["Wheat (Sharbati)", "Mustard", "Soybean", "Basmati Rice"],
        "aadhar_id": "1234-5678-9001",
        "password": "Farmer@123",
        "collection": "farmers",
    },
    {
        "role": "buyer",
        "user_id": "test_buyer_001",
        "name": "Rajesh Mehta (ITC Agri Procurements)",
        "phone": "9900000001",
        "email": "rajesh@itcagriprocurements.com",
        "company_name": "ITC Agri-Business Division",
        "gstin": "07AAAAA0000A1Z5",
        "password": "Buyer@123",
        "collection": "buyers",
    },
]


async def seed_test_accounts():
    """Called at startup — inserts fixed test accounts if they don't already exist."""
    db = await get_db()
    seeded = []

    for acct in TEST_ACCOUNTS:
        collection_name = acct["collection"]
        coll = getattr(db, collection_name)
        existing = await coll.find_one({"phone": acct["phone"]})
        if existing:
            seeded.append(f"[SKIP] {acct['role'].upper()} {acct['phone']} already exists")
            continue

        hashed_pw = hash_pw(acct["password"])

        if acct["role"] == "farmer":
            doc = {
                "_id": acct["user_id"],
                "user_id": acct["user_id"],
                "role": "farmer",
                "name": acct["name"],
                "phone": acct["phone"],
                "village_district": acct["village_district"],
                "crops_grown": acct["crops_grown"],
                "aadhar_id": acct["aadhar_id"],
                "password_hash": hashed_pw,
                "is_verified": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        else:
            doc = {
                "_id": acct["user_id"],
                "user_id": acct["user_id"],
                "role": "buyer",
                "name": acct["name"],
                "phone": acct["phone"],
                "email": acct.get("email"),
                "company_name": acct.get("company_name"),
                "gstin": acct.get("gstin"),
                "password_hash": hashed_pw,
                "is_verified": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

        await coll.insert_one(doc)
        seeded.append(f"[OK]   {acct['role'].upper()} {acct['phone']} → {acct['name']}")

    print("\n" + "="*55)
    print("  AgriPulse AI — Test Account Seeder")
    print("="*55)
    for line in seeded:
        print(f"  {line}")
    print("="*55)
    print("  FARMER login: phone=9800000001  pass=Farmer@123")
    print("  BUYER  login: phone=9900000001  pass=Buyer@123")
    print("="*55 + "\n")
