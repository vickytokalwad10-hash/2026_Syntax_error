"""
AgriPulse AI — Fraud & Scam Detection Shield
Analyzes buyer profile, previous transactions, escrow settlement compliance,
and bidding behavior to categorize buyers as:
- TRUSTED (Score 85-100, Green Shield)
- RISKY (Score 50-84, Yellow Alert)
- SUSPICIOUS (Score 0-49, Red Warning Flag)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/api/fraud", tags=["Fraud & Scam Detection Shield"])

class BuyerAnalysisRequest(BaseModel):
    buyer_id: Optional[str] = None
    gstin: Optional[str] = "27AAACA9900A1Z5"
    company_name: Optional[str] = "AgroTrade Logistics"
    bid_price: Optional[float] = 2950.0
    spot_price: Optional[float] = 2840.0
    tenure_months: Optional[int] = 18
    completed_escrows: Optional[int] = 34
    dispute_count: Optional[int] = 0

# Mock Buyer Intelligence Database
BUYER_PROFILES = [
    {
        "buyer_id": "BUY-001",
        "company_name": "ITC Agri-Business Division",
        "representative": "Rajesh Mehta",
        "gstin": "07AAAAA0000A1Z5",
        "gstin_status": "Active & Verified",
        "pan_verified": True,
        "trust_score": 98,
        "category": "TRUSTED",
        "tenure_months": 42,
        "total_volume_tons": 24800,
        "escrow_fulfillment_rate": 100.0,
        "avg_payment_delay_days": 0.2,
        "dispute_count": 0,
        "bid_anomaly_flags": "None. Bidding strictly correlates with NCDEX indices.",
        "badges": ["WDRA Certified Partner", "100% Escrow Succeeded", "Institutional Leader"]
    },
    {
        "buyer_id": "BUY-002",
        "company_name": "Adani Wilmar Edible Oils Ltd",
        "representative": "Sunil Verma",
        "gstin": "24AAACA1234A1Z9",
        "gstin_status": "Active & Verified",
        "pan_verified": True,
        "trust_score": 96,
        "category": "TRUSTED",
        "tenure_months": 36,
        "total_volume_tons": 18200,
        "escrow_fulfillment_rate": 99.4,
        "avg_payment_delay_days": 0.4,
        "dispute_count": 0,
        "bid_anomaly_flags": "None. Verified refinery buyer.",
        "badges": ["APEDA Registered", "Zero Default History"]
    },
    {
        "buyer_id": "BUY-003",
        "company_name": "Kalyani Agro Commodities Trading",
        "representative": "Praveen Kalyani",
        "gstin": "08BBBPC4567B1Z2",
        "gstin_status": "Active (Recent Registration < 60 days)",
        "pan_verified": True,
        "trust_score": 68,
        "category": "RISKY",
        "tenure_months": 2,
        "total_volume_tons": 350,
        "escrow_fulfillment_rate": 84.0,
        "avg_payment_delay_days": 3.8,
        "dispute_count": 1,
        "bid_anomaly_flags": "Bid prices 8-12% above spot with delayed warehouse receipt endorsements.",
        "badges": ["New Trading Account", "Manual Escrow Verification Advised"]
    },
    {
        "buyer_id": "BUY-004",
        "company_name": "Sunrise Agro Commodities LLC (Shell Entity Flag)",
        "representative": "Amit S. (Unverified Alias)",
        "gstin": "06ZZZZZ9999Z1Z0",
        "gstin_status": "Cancelled / Suspended by GST Authority",
        "pan_verified": False,
        "trust_score": 24,
        "category": "SUSPICIOUS",
        "tenure_months": 1,
        "total_volume_tons": 0,
        "escrow_fulfillment_rate": 0.0,
        "avg_payment_delay_days": 14.0,
        "dispute_count": 4,
        "bid_anomaly_flags": "Bidding +35% above spot without locking escrow funds; unbacked post-dated cheques requested.",
        "badges": ["⚠️ Flagged Fraud Entity", "Suspended GSTIN", "Do Not Dispatch"]
    }
]

@router.get("/buyers")
def list_buyers_with_trust():
    return {
        "status": "success",
        "total_monitored_buyers": len(BUYER_PROFILES),
        "buyers": BUYER_PROFILES
    }

@router.post("/analyze-buyer")
def analyze_buyer(payload: BuyerAnalysisRequest):
    # If buyer_id matches existing DB
    if payload.buyer_id:
        match = next((b for b in BUYER_PROFILES if b["buyer_id"] == payload.buyer_id), None)
        if match:
            return {
                "status": "success",
                "analysis": match,
                "timestamp": datetime.now().isoformat()
            }
            
    # Real-time algorithm scoring
    score = 70.0
    flags = []
    
    # 1. Price deviation anomaly check
    if payload.bid_price and payload.spot_price:
        pct_diff = ((payload.bid_price - payload.spot_price) / payload.spot_price) * 100
        if pct_diff > 25.0:
            score -= 30
            flags.append("Abnormally inflated bid price (+25% above APMC spot) — typical advance fee or fake demand scam pattern.")
        elif pct_diff > 10.0:
            score -= 10
            flags.append("Bid is 10-25% above mandi average. Require 100% upfront escrow lock.")
            
    # 2. Tenure and transaction history
    if payload.tenure_months and payload.tenure_months < 3:
        score -= 15
        flags.append("New buyer account with less than 90 days operating history.")
    elif payload.tenure_months and payload.tenure_months > 12:
        score += 15
        
    if payload.completed_escrows and payload.completed_escrows > 15:
        score += 15
    elif (payload.completed_escrows or 0) == 0:
        score -= 15
        flags.append("Zero previous completed escrow settlements on AgriPulse platform.")
        
    # 3. Dispute count penalty
    if payload.dispute_count and payload.dispute_count > 0:
        score -= (payload.dispute_count * 25)
        flags.append(f"{payload.dispute_count} historical payment disputes recorded.")
        
    score = max(5, min(99, round(score)))
    
    category = "TRUSTED" if score >= 85 else "RISKY" if score >= 50 else "SUSPICIOUS"
    
    return {
        "status": "success",
        "analysis": {
            "buyer_id": payload.buyer_id or "ANON-EVAL",
            "company_name": payload.company_name,
            "gstin": payload.gstin,
            "trust_score": score,
            "category": category,
            "risk_flags": flags,
            "recommendation": (
                "Safe to transact via standard Escrow." if category == "TRUSTED"
                else "Proceed with caution. Enforce 100% upfront digital escrow before releasing gate pass." if category == "RISKY"
                else "⚠️ CRITICAL FRAUD RISK: Do not dispatch grain without verified bank guarantee."
            )
        },
        "timestamp": datetime.now().isoformat()
    }
