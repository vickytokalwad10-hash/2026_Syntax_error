from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ==========================================
# AUTHENTICATION & RBAC MODELS
# ==========================================
class FarmerSignupRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Farmer full name")
    phone: str = Field(..., min_length=10, max_length=15, description="Registered 10-digit mobile number")
    village_district: str = Field(..., min_length=2, description="Village and District location")
    crops_grown: List[str] = Field(default_factory=list, description="Primary crops cultivated")
    aadhar_id: Optional[str] = Field(None, description="Optional Aadhar / Kisan ID")
    password: str = Field(..., min_length=6, description="Account password")


class BuyerSignupRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Buyer or Representative full name")
    phone: str = Field(..., min_length=10, max_length=15, description="Contact phone number")
    email: Optional[str] = Field(None, description="Business email address")
    company_name: Optional[str] = Field(None, description="Company, mill, or trading firm name")
    gstin: Optional[str] = Field(None, description="Optional GST identification number for verified trade")
    password: str = Field(..., min_length=6, description="Account password")


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or Email")
    password: str = Field(..., description="Account password")
    role: str = Field("farmer", description="Account role: 'farmer' or 'buyer'")


class OTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number to send OTP to")
    purpose: str = Field("signup", description="'signup', 'login', or 'payment_2fa'")


class OTPVerifyRequest(BaseModel):
    phone: str = Field(..., description="Phone number")
    otp: str = Field(..., min_length=4, max_length=6, description="Verification OTP code")
    purpose: str = Field("signup", description="'signup', 'login', or 'payment_2fa'")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: Dict[str, Any]


# ==========================================
# CHATBOT & VOICE ASSISTANT MODELS
# ==========================================
class ChatbotRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or voice transcript")
    language: str = Field("English", description="Target language: 'English', 'Hindi', 'Marathi'")
    role: str = Field("farmer", description="Active role: 'farmer' or 'buyer'")
    session_id: Optional[str] = Field(None, description="Client session ID for multi-turn history")
    user_id: Optional[str] = Field(None, description="Authenticated user ID if logged in")


class ChatbotResponse(BaseModel):
    reply: str
    is_agri_related: bool
    language: str
    timestamp: str
    suggested_actions: List[str] = Field(default_factory=list)


# ==========================================
# PAYMENT & ESCROW MODELS
# ==========================================
class CreateOrderRequest(BaseModel):
    listing_id: str
    farmer_id: str
    farmer_name: Optional[str] = "Farmer"
    crop_name: Optional[str] = "Agricultural Produce"
    quantity_quintals: float = 1.0
    amount: float = Field(..., gt=0, description="Total amount in INR (e.g. 50000.0)")
    currency: str = "INR"
    notes: Optional[Dict[str, Any]] = None


class Payment2FARequest(BaseModel):
    order_id: str
    buyer_phone: str
    amount: float


class Payment2FAVerifyRequest(BaseModel):
    order_id: str
    buyer_phone: str
    otp: str


class VerifyPaymentRequest(BaseModel):
    gateway_order_id: str
    gateway_payment_id: str
    gateway_signature: str
    listing_id: str
    amount: float
    notes: Optional[Dict[str, Any]] = None


class CropListingCreateRequest(BaseModel):
    crop_name: str
    category: str = "Grains"
    variety: str
    quantity_quintals: float
    price_per_quintal: float
    location: str
    harvest_date: str
    quality_grade: str = "Grade A"
    moisture_pct: Optional[float] = 12.0
