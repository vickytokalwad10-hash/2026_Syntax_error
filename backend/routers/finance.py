"""
Credit & Financial Access Router
Provides endpoints for:
1. Kisan Credit Card (KCC) limit eligibility calculation
2. Agri-loan & Microfinance lender comparison marketplace
3. Hand-drawn style financial literacy tips

NOTE: Uses realistic mock data matching NABARD / RBI scale-of-finance norms.
Comments clearly mark where JanSamarth / Fintech aggregator APIs should replace mocks.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/finance", tags=["Credit & Financial Access"])

class KCCEligibilityRequest(BaseModel):
    land_acres: float
    primary_crop: str # Wheat, Paddy, Soybean, Mustard, Cotton, Sugarcane
    irrigation_status: str # Irrigated, Rainfed
    existing_loan_balance: float = 0.0

@router.post("/kcc-eligibility")
def calculate_kcc_eligibility(req: KCCEligibilityRequest):
    """
    Kisan Credit Card (KCC) Scale of Finance Limit Estimator.
    
    [INTEGRATION SWAP POINT]:
    Replace with JanSamarth Portal (Govt Credit-Linked Portal) API:
    Endpoint: https://www.jansamarth.in/api/v1/kcc/calculate-limit
    """
    # Scale of finance (₹ per acre according to DLTC / SLBC norms)
    scale_of_finance_map = {
        "Wheat": 32000,
        "Paddy": 36000,
        "Soybean": 28000,
        "Mustard": 26000,
        "Cotton": 42000,
        "Sugarcane": 65000,
        "Vegetables": 50000
    }

    base_scale = scale_of_finance_map.get(req.primary_crop, 30000)
    if req.irrigation_status.lower() == "irrigated":
        base_scale = int(base_scale * 1.15)

    # 1. Crop cultivation limit (1st Year) = Scale of Finance x Area
    crop_component = int(base_scale * req.land_acres)
    
    # 2. Post-harvest / household / consumption needs = 10%
    post_harvest = int(crop_component * 0.10)
    
    # 3. Farm asset maintenance & repairs = 20%
    asset_maint = int(crop_component * 0.20)
    
    # Total 1st Year KCC Limit
    first_year_limit = crop_component + post_harvest + asset_maint
    
    # 5-Year Max Sanction (10% annual escalation per NABARD guideline)
    five_year_sanction = int(first_year_limit * 1.50)

    # Effective interest rate with 3% Prompt Repayment Incentive (PRI)
    subsidized_interest_rate = 4.0 # (7% standard - 3% subvention)
    eligible_upfront_amount = max(0, first_year_limit - int(req.existing_loan_balance))

    return {
        "status": "success",
        "calculation": {
            "scale_of_finance_per_acre": base_scale,
            "crop_component": crop_component,
            "post_harvest_consumption_10pct": post_harvest,
            "asset_maintenance_20pct": asset_maint,
            "first_year_eligible_limit": first_year_limit,
            "five_year_revolving_limit": five_year_sanction,
            "net_disbursable_limit": eligible_upfront_amount,
            "interest_subvention_rate": "4.0% p.a. (Under Govt 3% Prompt Repayment Subsidy up to ₹3,00,000)",
            "collateral_requirement": "Nil (Collateral-free KCC limit up to ₹1,60,000; up to ₹3,00,000 for tie-up arrangements)"
        }
    }


@router.get("/lenders")
def get_loan_marketplace():
    """
    Microfinance & Institutional Agri-Loan Comparison Marketplace.
    
    [INTEGRATION SWAP POINT]:
    Replace with Account Aggregator / FinTech Open Banking Gateway (e.g. Setu, Perfios, SBI YONO Krishi).
    """
    return {
        "status": "success",
        "lenders": [
            {
                "id": "LEND-001",
                "institution": "State Bank of India (SBI Krishi)",
                "product": "Kisan Credit Card (KCC) Plus",
                "interest_rate": "4.0% - 7.0%",
                "max_amount": "₹3,00,000 (Subsidized)",
                "tenure": "5 Years (Annual Renewal)",
                "processing_fee": "0% for limits up to ₹3 Lakh",
                "badge": "Govt Subsidized",
                "badge_type": "success",
                "features": ["3% prompt repayment incentive", "ATM-cum-Debit KCC Card", "Crop insurance integration"]
            },
            {
                "id": "LEND-002",
                "institution": "NABARD / Regional Rural Bank (RRB)",
                "product": "SHG & Joint Liability Group (JLG) Micro-Credit",
                "interest_rate": "7.5% - 9.0%",
                "max_amount": "₹1,50,000 per member",
                "tenure": "24 - 36 Months",
                "processing_fee": "0.5%",
                "badge": "For Landless / Tenant Farmers",
                "badge_type": "warning",
                "features": ["Group guarantee without land mortgage", "Bi-weekly or monthly repayment", "Doorstep recovery"]
            },
            {
                "id": "LEND-003",
                "institution": "HDFC Bank Agri Gold Loan",
                "product": "Instant Agricultural Gold Overdraft",
                "interest_rate": "8.25% - 9.50%",
                "max_amount": "₹25,00,000",
                "tenure": "12 Months (Bullet Repayment)",
                "processing_fee": "₹500 + GST",
                "badge": "Instant 30-Min Disbursal",
                "badge_type": "neutral",
                "features": ["Immediate cash for fertilizer/seeds", "Pay interest only during harvest", "Zero land record scrutiny"]
            },
            {
                "id": "LEND-004",
                "institution": "Samunnati Agri Value Chain Finance",
                "product": "FPO Working Capital & Harvest Loan",
                "interest_rate": "10.5% - 12.0%",
                "max_amount": "₹50,00,000",
                "tenure": "90 - 180 Days",
                "processing_fee": "1.0%",
                "badge": "For Farmer Cooperatives / FPOs",
                "badge_type": "info",
                "features": ["Warehouse receipt backing", "Post-harvest distress sale avoidance", "Structured repayment against buyer receivables"]
            }
        ]
    }


@router.get("/literacy-tips")
def get_financial_literacy_tips():
    """Hand-drawn styled financial literacy guides & anti-predatory borrowing alerts."""
    return {
        "status": "success",
        "tips": [
            {
                "id": "TIP-01",
                "title": "Beware of 'Meter Byaaj' (Informal Money Lender Traps)",
                "summary": "Local arhtiyas / moneylenders often charge 2% to 3% per month. That is 24% to 36% annual interest — almost 6x higher than a KCC loan (4%)! Always prioritize institutional bank credit.",
                "icon": "payments",
                "category": "Debt Protection"
            },
            {
                "id": "TIP-02",
                "title": "Claim Your 3% Prompt Repayment Incentive (PRI)",
                "summary": "If you repay or rollover your KCC loan interest before the due date (usually 31st March), the Government of India credits a 3% interest refund directly into your account, bringing your effective cost to just 4%.",
                "icon": "savings",
                "category": "Govt Subsidies"
            },
            {
                "id": "TIP-03",
                "title": "Electronic Negotiable Warehouse Receipts (e-NWR)",
                "summary": "Never sell your crop in distress immediately after harvest when prices crash. Store it in a WDRA-registered warehouse, take an e-NWR receipt, and get up to 75% loan against it at low agri-interest rates.",
                "icon": "warehouse",
                "category": "Post-Harvest Finance"
            }
        ]
    }
