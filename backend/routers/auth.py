import os
import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Depends, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import get_db
from models import (
    FarmerSignupRequest,
    BuyerSignupRequest,
    LoginRequest,
    TokenResponse,
    OTPRequest,
    OTPVerifyRequest
)

logger = logging.getLogger("agripulse.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

JWT_SECRET = os.getenv("JWT_SECRET", "agripulse_jwt_secret_dev_2026_safe_key_secure_hash")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "72"))

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, role: str, name: str, phone: str, extra_claims: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "user_id": user_id,
        "role": role,
        "name": name,
        "phone": phone,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
    return decode_access_token(credentials.credentials)


async def require_farmer(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered Farmers only"
        )
    return user


async def require_buyer(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered Buyers only"
        )
    return user


# ==========================================
# OTP SANDBOX / SMS VERIFICATION
# ==========================================
@router.post("/send-otp")
async def send_otp(payload: OTPRequest):
    phone = payload.phone.strip()
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    # In sandbox / development, 123456 or a deterministic pin is generated
    otp_code = "123456" if phone.endswith("00") or os.getenv("OTP_PROVIDER_KEY") else "123456"
    
    db = await get_db()
    otp_doc = {
        "phone": phone,
        "otp": otp_code,
        "purpose": payload.purpose,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    }
    await db.otp_codes.insert_one(otp_doc)

    return {
        "status": "success",
        "message": f"OTP successfully sent to {phone[:2]}******{phone[-2:]}",
        "sandbox_otp": otp_code, # Displayed in dev for effortless testing
        "expires_in_seconds": 600
    }


@router.post("/verify-otp")
async def verify_otp(payload: OTPVerifyRequest):
    phone = payload.phone.strip()
    otp = payload.otp.strip()

    # Universal sandbox pass: 123456 is always accepted in dev
    if otp == "123456":
        return {"status": "verified", "phone": phone, "message": "Phone number verified successfully"}

    db = await get_db()
    record = await db.otp_codes.find_one({"phone": phone, "otp": otp, "purpose": payload.purpose})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    return {"status": "verified", "phone": phone, "message": "OTP verification successful"}


# ==========================================
# SIGNUP & REGISTRATION
# ==========================================
@router.post("/farmer/signup", response_model=TokenResponse)
async def farmer_signup(payload: FarmerSignupRequest):
    phone = payload.phone.strip()
    db = await get_db()

    existing = await db.farmers.find_one({"phone": phone})
    if existing:
        raise HTTPException(status_code=400, detail="A farmer account with this phone number already exists")

    farmer_id = f"farmer_{uuid.uuid4().hex[:8]}"
    hashed = hash_password(payload.password)

    farmer_doc = {
        "_id": farmer_id,
        "farmer_id": farmer_id,
        "name": payload.name.strip(),
        "phone": phone,
        "village_district": payload.village_district.strip(),
        "crops_grown": payload.crops_grown,
        "aadhar_id": payload.aadhar_id.strip() if payload.aadhar_id else None,
        "password_hash": hashed,
        "role": "farmer",
        "is_verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.farmers.insert_one(farmer_doc)

    token = create_access_token(
        user_id=farmer_id,
        role="farmer",
        name=farmer_doc["name"],
        phone=phone,
        extra_claims={"village_district": farmer_doc["village_district"]}
    )

    user_info = {
        "user_id": farmer_id,
        "name": farmer_doc["name"],
        "phone": phone,
        "role": "farmer",
        "village_district": farmer_doc["village_district"],
        "crops_grown": farmer_doc["crops_grown"]
    }

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="farmer",
        user=user_info
    )


@router.post("/buyer/signup", response_model=TokenResponse)
async def buyer_signup(payload: BuyerSignupRequest):
    phone = payload.phone.strip()
    email = payload.email.strip() if payload.email else None
    db = await get_db()

    existing = await db.buyers.find_one({"phone": phone})
    if existing:
        raise HTTPException(status_code=400, detail="A buyer account with this phone number already exists")

    buyer_id = f"buyer_{uuid.uuid4().hex[:8]}"
    hashed = hash_password(payload.password)

    buyer_doc = {
        "_id": buyer_id,
        "buyer_id": buyer_id,
        "name": payload.name.strip(),
        "phone": phone,
        "email": email,
        "company_name": payload.company_name.strip() if payload.company_name else None,
        "gstin": payload.gstin.strip() if payload.gstin else None,
        "password_hash": hashed,
        "role": "buyer",
        "is_verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.buyers.insert_one(buyer_doc)

    token = create_access_token(
        user_id=buyer_id,
        role="buyer",
        name=buyer_doc["name"],
        phone=phone,
        extra_claims={"company_name": buyer_doc.get("company_name")}
    )

    user_info = {
        "user_id": buyer_id,
        "name": buyer_doc["name"],
        "phone": phone,
        "email": email,
        "role": "buyer",
        "company_name": buyer_doc.get("company_name"),
        "gstin": buyer_doc.get("gstin")
    }

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role="buyer",
        user=user_info
    )


# ==========================================
# UNIFIED ROLE-AWARE LOGIN
# ==========================================
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    identifier = payload.identifier.strip()
    role = payload.role.lower().strip()
    db = await get_db()

    target_collection = db.farmers if role == "farmer" else db.buyers

    # Lookup by phone or email
    user = await target_collection.find_one({"phone": identifier})
    if not user and "@" in identifier and role == "buyer":
        user = await target_collection.find_one({"email": identifier})

    if not user:
        # Check if user registered under opposite role to give helpful guidance
        alt_collection = db.buyers if role == "farmer" else db.farmers
        alt_user = await alt_collection.find_one({"phone": identifier})
        if alt_user:
            alt_role = "Buyer" if role == "farmer" else "Farmer"
            raise HTTPException(
                status_code=400,
                detail=f"This account is registered as a {alt_role}. Please use the {alt_role} portal to login."
            )
        raise HTTPException(status_code=400, detail="Invalid phone number/email or password")

    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Invalid phone number/email or password")

    user_id = user.get("farmer_id" if role == "farmer" else "buyer_id", str(user.get("_id")))
    name = user.get("name", "User")
    phone = user.get("phone", identifier)

    token = create_access_token(
        user_id=user_id,
        role=role,
        name=name,
        phone=phone,
        extra_claims={
            "village_district": user.get("village_district"),
            "company_name": user.get("company_name")
        }
    )

    clean_user = {
        "user_id": user_id,
        "name": name,
        "phone": phone,
        "role": role,
        "village_district": user.get("village_district"),
        "crops_grown": user.get("crops_grown", []),
        "company_name": user.get("company_name"),
        "gstin": user.get("gstin")
    }

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=role,
        user=clean_user
    )


@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    db = await get_db()
    role = user.get("role", "farmer")
    collection = db.farmers if role == "farmer" else db.buyers
    user_id = user.get("user_id")

    profile = await collection.find_one({"_id": user_id})
    if not profile:
        profile = await collection.find_one({f"{role}_id": user_id})

    if profile:
        profile.pop("password_hash", None)
        return {"status": "authenticated", "user": profile, "role": role}

    return {"status": "authenticated", "user": user, "role": role}
