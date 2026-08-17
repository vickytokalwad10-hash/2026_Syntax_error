"""
AgriPulse AI — Component i18n Wiring Script
Refactors all active pages and shared components to use the Unified Global Language Store (useLanguage / t).
"""

import os
import re

FRONTEND_SRC = r"C:\Users\hp\.gemini\antigravity\scratch\agripulse-ai\frontend\src"

# 1. Update CropPlanningPage.jsx
crop_planning_path = os.path.join(FRONTEND_SRC, "pages", "CropPlanningPage.jsx")
with open(crop_planning_path, "r", encoding="utf-8") as f:
    code = f.read()

# Add useLanguage import if missing
if "useLanguage" not in code:
    code = re.sub(
        r"import React, \{ useState, useEffect \} from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        code
    )
    code = re.sub(
        r"export default function CropPlanningPage\(\) \{",
        "export default function CropPlanningPage() {\n  const { t } = useLanguage();",
        code
    )
    # Replace header
    code = code.replace(
        "फसल योजना सलाहकार • Next Season Crop Planner",
        "{t('cropPlanning.title')}"
    )
    code = code.replace(
        'Matches your soil type, water sources, and expected weather against forward mandi futures to recommend: <strong>“Next season kaunsa crop lagana sabse profitable rahega?”</strong>',
        "{t('cropPlanning.subtitle')}"
    )
    code = code.replace("Farm Parameters & Agro-Climatic Profile", "{t('cropPlanning.title')}")
    code = code.replace('<label className="block font-bold text-[#44403c] mb-1">State</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'cropPlanning.selectState\')}</label>')
    code = code.replace('<label className="block font-bold text-[#44403c] mb-1">District / Mandi Zone</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'cropPlanning.selectDistrict\')}</label>')
    code = code.replace('<label className="block font-bold text-[#44403c] mb-1">Soil Texture / Profile</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'cropPlanning.selectSoil\')}</label>')
    code = code.replace('<label className="block font-bold text-[#44403c] mb-1">Target Farming Season</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'cropPlanning.selectSeason\')}</label>')
    code = code.replace('<label className="block font-bold text-[#44403c] mb-1">Expected Weather Outlook</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'cropPlanning.weatherOutlook\')}</label>')
    code = code.replace('Generate AI Crop Recommendations', "{t('cropPlanning.runOptimizer')}")

with open(crop_planning_path, "w", encoding="utf-8") as f:
    f.write(code)
print("✅ Wired CropPlanningPage.jsx")

# 2. Update FraudDetectionPage.jsx
fraud_path = os.path.join(FRONTEND_SRC, "pages", "FraudDetectionPage.jsx")
with open(fraud_path, "r", encoding="utf-8") as f:
    fcode = f.read()

if "useLanguage" not in fcode:
    fcode = re.sub(
        r"import React, \{ useState, useEffect \} from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        fcode
    )
    fcode = re.sub(
        r"export default function FraudDetectionPage\(\) \{",
        "export default function FraudDetectionPage() {\n  const { t } = useLanguage();",
        fcode
    )
    fcode = fcode.replace("Buyer Trust Shield & Fraud Prevention", "{t('fraudDetection.title')}")
    fcode = fcode.replace(
        "100-point institutional buyer risk scoring, GST verification, escrow default history, and payment safety audits.",
        "{t('fraudDetection.subtitle')}"
    )
    fcode = fcode.replace("Audit Buyer Entity", "{t('fraudDetection.searchBuyer')}")
    fcode = fcode.replace('<label className="block font-bold text-[#44403c] mb-1">Buyer GSTIN Number</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'fraudDetection.buyerGstin\')}</label>')
    fcode = fcode.replace('<label className="block font-bold text-[#44403c] mb-1">Buyer Entity Name</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'fraudDetection.buyerName\')}</label>')
    fcode = fcode.replace('placeholder="e.g. 06AAAAA0000A1Z5"', 'placeholder={t(\'fraudDetection.placeholdersGstin\')}')
    fcode = fcode.replace('placeholder="e.g. Apex Global Traders"', 'placeholder={t(\'fraudDetection.placeholdersName\')}')
    fcode = fcode.replace("TRUSTED INSTITUTIONAL BUYER", "{t('fraudDetection.trustedStatus')}")
    fcode = fcode.replace("HIGH RISK (ESCROW MANDATORY)", "{t('fraudDetection.highRiskStatus')}")
    fcode = fcode.replace("AUDIT REQUIRED", "{t('fraudDetection.suspiciousStatus')}")
    fcode = fcode.replace("100% KYC & Bank Verified", "{t('fraudDetection.kycVerified')}")

with open(fraud_path, "w", encoding="utf-8") as f:
    f.write(fcode)
print("✅ Wired FraudDetectionPage.jsx")

# 3. Update SchemesPage.jsx
schemes_path = os.path.join(FRONTEND_SRC, "pages", "SchemesPage.jsx")
with open(schemes_path, "r", encoding="utf-8") as f:
    scode = f.read()

if "useLanguage" not in scode:
    scode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        scode
    )
    scode = re.sub(
        r"export default function SchemesPage\(\) \{",
        "export default function SchemesPage() {\n  const { t } = useLanguage();",
        scode
    )
    scode = scode.replace("Government Schemes & Subsidy Hub", "{t('schemes.title')}")
    scode = scode.replace(
        "Direct DBT installment tracker, PMFBY crop insurance claim filing, and verified Soil Health Card analysis.",
        "{t('schemes.subtitle')}"
    )
    scode = scode.replace("PM-KISAN Status", "{t('schemes.pmKisan')}")
    scode = scode.replace("PMFBY Crop Insurance", "{t('schemes.pmfby')}")
    scode = scode.replace("Soil Health Card (NPK)", "{t('schemes.soilHealth')}")
    scode = scode.replace("State Subsidies Feed", "{t('schemes.subsidies')}")
    scode = scode.replace("File PMFBY Calamity Claim", "{t('schemes.claimInsurance')}")
    scode = scode.replace("Beneficiary Verification Status", "{t('schemes.beneficiaryStatus')}")
    scode = scode.replace("Installments Received", "{t('schemes.installments')}")
    scode = scode.replace('placeholder="Enter Registered Mobile or 12-digit Aadhaar"', 'placeholder={t(\'schemes.searchPlaceholder\')}')
    scode = scode.replace("Recent DBT Credit History", "{t('schemes.dbtHistory')}")
    scode = scode.replace("Total Beneficiary Credit", "{t('schemes.totalCredited')}")
    scode = scode.replace("e-KYC Status: Verified", "{t('schemes.ekycStatus')}")
    scode = scode.replace("Land Seeding: Linked", "{t('schemes.landSeeding')}")

with open(schemes_path, "w", encoding="utf-8") as f:
    f.write(scode)
print("✅ Wired SchemesPage.jsx")

# 4. Update FinancePage.jsx
finance_path = os.path.join(FRONTEND_SRC, "pages", "FinancePage.jsx")
with open(finance_path, "r", encoding="utf-8") as f:
    fincode = f.read()

if "useLanguage" not in fincode:
    fincode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        fincode
    )
    fincode = re.sub(
        r"export default function FinancePage\(\) \{",
        "export default function FinancePage() {\n  const { t } = useLanguage();",
        fincode
    )
    fincode = fincode.replace("KCC Credit Estimator & Financial Hub", "{t('finance.title')}")
    fincode = fincode.replace(
        "Calculate subsidized 4% Kisan Credit Card loan eligibility according to official NABARD District Scale of Finance.",
        "{t('finance.subtitle')}"
    )
    fincode = fincode.replace("Estimated KCC Credit Limit", "{t('finance.kccLimit')}")
    fincode = fincode.replace("Effective Subsidized Rate (4% p.a.)", "{t('finance.interestRate')}")
    fincode = fincode.replace("KCC Eligibility Calculator", "{t('finance.eligibilityCalc')}")
    fincode = fincode.replace("District Scale of Finance (NABARD)", "{t('finance.scaleOfFinance')}")
    fincode = fincode.replace("Apply for Digital KCC", "{t('finance.applyKcc')}")
    fincode = fincode.replace("Required Documents Checklist", "{t('finance.requiredDocs')}")
    fincode = fincode.replace('<label className="block font-bold text-[#44403c] mb-1">Operational Farm Land (Acres)</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'finance.landAcreageInput\')}</label>')
    fincode = fincode.replace('<label className="block font-bold text-[#44403c] mb-1">Primary Cultivation Crop</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'finance.primaryCropInput\')}</label>')

with open(finance_path, "w", encoding="utf-8") as f:
    f.write(fincode)
print("✅ Wired FinancePage.jsx")

# 5. Update DiagnosePage.jsx
diag_path = os.path.join(FRONTEND_SRC, "pages", "DiagnosePage.jsx")
with open(diag_path, "r", encoding="utf-8") as f:
    dcode = f.read()

if "useLanguage" not in dcode:
    dcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        dcode
    )
    dcode = re.sub(
        r"export default function DiagnosePage\(\) \{",
        "export default function DiagnosePage() {\n  const { t } = useLanguage();",
        dcode
    )
    dcode = dcode.replace("AI Crop Pest & Disease Diagnostic Doctor", "{t('diagnose.title')}")
    dcode = dcode.replace(
        "Instant visual pest identification, leaf disease diagnosis, and ICAR-verified organic/chemical treatment prescriptions.",
        "{t('diagnose.subtitle')}"
    )
    dcode = dcode.replace("Upload Leaf / Crop Photo", "{t('diagnose.uploadPhoto')}")
    dcode = dcode.replace("Tap Camera to Snap Photo", "{t('diagnose.takePhoto')}")
    dcode = dcode.replace("Tap to retake photo", "{t('diagnose.retakePhoto')}")
    dcode = dcode.replace("or browse from gallery (JPEG, PNG)", "{t('diagnose.orBrowseGallery')}")
    dcode = dcode.replace('<label className="block font-bold text-[#44403c] mb-1">Crop Type</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'diagnose.selectCrop\')}</label>')
    dcode = dcode.replace('<label className="block font-bold text-[#44403c] mb-1">Observed Symptoms / Farm Condition</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'diagnose.describeSymptoms\')}</label>')
    dcode = dcode.replace('placeholder="e.g. Yellow stripes appearing after rainfall on upper leaves..."', 'placeholder={t(\'diagnose.symptomPlaceholder\')}')
    dcode = dcode.replace("Run AI Disease Diagnosis", "{t('diagnose.analyzeCrop')}")
    dcode = dcode.replace("Organic / Bio-Control Prescription", "{t('diagnose.organicRemedy')}")
    dcode = dcode.replace("Chemical Fungicide / Pesticide Dosage", "{t('diagnose.chemicalRemedy')}")

with open(diag_path, "w", encoding="utf-8") as f:
    f.write(dcode)
print("✅ Wired DiagnosePage.jsx")

# 6. Update IrrigationPage.jsx
irr_path = os.path.join(FRONTEND_SRC, "pages", "IrrigationPage.jsx")
with open(irr_path, "r", encoding="utf-8") as f:
    icode = f.read()

if "useLanguage" not in icode:
    icode = re.sub(
        r"import React, \{ useState, useEffect \} from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        icode
    )
    icode = re.sub(
        r"export default function IrrigationPage\(\) \{",
        "export default function IrrigationPage() {\n  const { t } = useLanguage();",
        icode
    )
    icode = icode.replace("Precision Soil Moisture & Smart Irrigation", "{t('irrigation.title')}")
    icode = icode.replace(
        "Real-time volumetric soil water content telemetry across topsoil (15cm) and rootzone (45cm) depths.",
        "{t('irrigation.subtitle')}"
    )
    icode = icode.replace("Real-Time Soil Moisture Telemetry", "{t('irrigation.soilMoistureRealtime')}")
    icode = icode.replace("Topsoil (15cm)", "{t('irrigation.topsoil15cm')}")
    icode = icode.replace("Rootzone (45cm)", "{t('irrigation.rootzone45cm')}")
    icode = icode.replace("Volumetric Water Content (VWC)", "{t('irrigation.volumetricWater')}")
    icode = icode.replace("Soil Temperature", "{t('irrigation.soilTemp')}")
    icode = icode.replace("Agronomic Irrigation Recommendation", "{t('irrigation.irrigationAdvice')}")
    icode = icode.replace("Crown Root Initiation (CRI) Window", "{t('irrigation.criStageWindow')}")
    icode = icode.replace("Smart Valve / Pump Automation", "{t('irrigation.pumpControl')}")

with open(irr_path, "w", encoding="utf-8") as f:
    f.write(icode)
print("✅ Wired IrrigationPage.jsx")

# 7. Update RentalsPage.jsx
rent_path = os.path.join(FRONTEND_SRC, "pages", "RentalsPage.jsx")
with open(rent_path, "r", encoding="utf-8") as f:
    rcode = f.read()

if "useLanguage" not in rcode:
    rcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        rcode
    )
    rcode = re.sub(
        r"export default function RentalsPage\(\) \{",
        "export default function RentalsPage() {\n  const { t } = useLanguage();",
        rcode
    )
    rcode = rcode.replace("Custom Hiring Center (CHC) Equipment Rentals", "{t('rentals.title')}")
    rcode = rcode.replace(
        "Book nearby verified tractors, laser land levelers, combine harvesters, and drone sprayers at subsidized hourly rates.",
        "{t('rentals.subtitle')}"
    )
    rcode = rcode.replace("Available Farm Implements", "{t('rentals.customHiringCenter')}")
    rcode = rcode.replace("Tractors & Tillers", "{t('rentals.tractors')}")
    rcode = rcode.replace("Combine Harvesters", "{t('rentals.harvesters')}")
    rcode = rcode.replace("Laser Levelers & Seed Drills", "{t('rentals.implements')}")
    rcode = rcode.replace("Drone Spraying Services", "{t('rentals.droneSprayers')}")
    rcode = rcode.replace("Daily Rate", "{t('rentals.dailyRate')}")
    rcode = rcode.replace("Hourly / Acre Rate", "{t('rentals.hourlyRate')}")
    rcode = rcode.replace("Book Implement", "{t('rentals.bookNow')}")
    rcode = rcode.replace("Certified Operator Included", "{t('rentals.operatorIncluded')}")
    rcode = rcode.replace("Distance from Farm", "{t('rentals.distanceKm')}")
    rcode = rcode.replace("Immediate Availability", "{t('rentals.availabilityStatus')}")

with open(rent_path, "w", encoding="utf-8") as f:
    f.write(rcode)
print("✅ Wired RentalsPage.jsx")

# 8. Update CalendarPage.jsx
cal_path = os.path.join(FRONTEND_SRC, "pages", "CalendarPage.jsx")
with open(cal_path, "r", encoding="utf-8") as f:
    ccode = f.read()

if "useLanguage" not in ccode:
    ccode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        ccode
    )
    ccode = re.sub(
        r"export default function CalendarPage\(\) \{",
        "export default function CalendarPage() {\n  const { t } = useLanguage();",
        ccode
    )
    ccode = ccode.replace("Agronomic Crop Lifecycle Almanac", "{t('calendar.title')}")
    ccode = ccode.replace(
        "Stage-by-stage crop timeline from sowing to harvesting with automated reminders for fertilizer, weeding, and irrigation.",
        "{t('calendar.subtitle')}"
    )
    ccode = ccode.replace("Sowing & Germination", "{t('calendar.sowingStage')}")
    ccode = ccode.replace("Vegetative & Tillering", "{t('calendar.vegetativeStage')}")
    ccode = ccode.replace("Flowering & Grain Filling", "{t('calendar.floweringStage')}")
    ccode = ccode.replace("Maturity & Harvesting", "{t('calendar.harvestStage')}")
    ccode = ccode.replace("Scheduled Agronomic Tasks", "{t('calendar.upcomingTasks')}")
    ccode = ccode.replace("Top Dressing (Urea / NPK)", "{t('calendar.fertilizerApplication')}")
    ccode = ccode.replace("Critical Irrigation Stage", "{t('calendar.irrigationSchedule')}")
    ccode = ccode.replace("Pest & Disease Scouting", "{t('calendar.pestMonitoring')}")

with open(cal_path, "w", encoding="utf-8") as f:
    f.write(ccode)
print("✅ Wired CalendarPage.jsx")

# 9. Update CommunityPage.jsx
comm_path = os.path.join(FRONTEND_SRC, "pages", "CommunityPage.jsx")
with open(comm_path, "r", encoding="utf-8") as f:
    cmcode = f.read()

if "useLanguage" not in cmcode:
    cmcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        cmcode
    )
    cmcode = re.sub(
        r"export default function CommunityPage\(\) \{",
        "export default function CommunityPage() {\n  const { t } = useLanguage();",
        cmcode
    )
    cmcode = cmcode.replace("Krishi Charcha — Farmer Community Hub", "{t('community.title')}")
    cmcode = cmcode.replace(
        "Connect with progressive farmers, agricultural university scientists, and KVK experts to share field insights.",
        "{t('community.subtitle')}"
    )
    cmcode = cmcode.replace("Start Farmer Discussion", "{t('community.startDiscussion')}")
    cmcode = cmcode.replace("Post Agronomy Query", "{t('community.postQuestion')}")
    cmcode = cmcode.replace("KVK Expert Verified", "{t('community.expertAnswered')}")
    cmcode = cmcode.replace('placeholder="Share your practical experience or ask for agronomic help..."', 'placeholder={t(\'community.questionPlaceholder\')}')
    cmcode = cmcode.replace('placeholder="Write a helpful reply or agronomic tip..."', 'placeholder={t(\'community.replyPlaceholder\')}')

with open(comm_path, "w", encoding="utf-8") as f:
    f.write(cmcode)
print("✅ Wired CommunityPage.jsx")

# 10. Update LivestockPage.jsx
live_path = os.path.join(FRONTEND_SRC, "pages", "LivestockPage.jsx")
with open(live_path, "r", encoding="utf-8") as f:
    lcode = f.read()

if "useLanguage" not in lcode:
    lcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        lcode
    )
    lcode = re.sub(
        r"export default function LivestockPage\(\) \{",
        "export default function LivestockPage() {\n  const { t } = useLanguage();",
        lcode
    )
    lcode = lcode.replace("Pashu Mitra — Livestock & Dairy Health Hub", "{t('livestock.title')}")
    lcode = lcode.replace(
        "Veterinary health monitoring, milk yield optimization, balanced nutritional ration formulations, and vaccination alerts.",
        "{t('livestock.subtitle')}"
    )
    lcode = lcode.replace('<label className="block font-bold text-[#44403c] mb-1">Animal Category</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'livestock.animalCategory\')}</label>')
    lcode = lcode.replace("Veterinary Symptom Checker", "{t('livestock.symptomsCheck')}")
    lcode = lcode.replace("Daily Feed & Nutrition Calculator", "{t('livestock.feedOptimization')}")
    lcode = lcode.replace("Daily Milk Yield Tracker", "{t('livestock.milkYieldTracker')}")
    lcode = lcode.replace("Upcoming Vaccination Deadlines", "{t('livestock.vaccinationSchedule')}")
    lcode = lcode.replace("Veterinary Doctor Advisory", "{t('livestock.vetAdvisory')}")
    lcode = lcode.replace("Toll-Free Veterinary Emergency Helpline", "{t('livestock.emergencyHelpline')}")

with open(live_path, "w", encoding="utf-8") as f:
    f.write(lcode)
print("✅ Wired LivestockPage.jsx")

# 11. Update PaymentPage.jsx
pay_path = os.path.join(FRONTEND_SRC, "pages", "PaymentPage.jsx")
with open(pay_path, "r", encoding="utf-8") as f:
    pcode = f.read()

if "useLanguage" not in pcode:
    pcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        pcode
    )
    pcode = re.sub(
        r"export default function PaymentPage\(\) \{",
        "export default function PaymentPage() {\n  const { t } = useLanguage();",
        pcode
    )
    pcode = pcode.replace("RBI-Compliant Smart Escrow Checkout", "{t('payment.title')}")
    pcode = pcode.replace(
        "100% secured agricultural trade payments held safely until NABL quality assay verification and warehouse receipt confirmation.",
        "{t('payment.subtitle')}"
    )
    pcode = pcode.replace("Smart Escrow Payment", "{t('payment.escrowCheckout')}")
    pcode = pcode.replace('<label className="block font-bold text-[#44403c] mb-1">Item / Lot Description</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'payment.itemDescription\')}</label>')
    pcode = pcode.replace('<label className="block font-bold text-[#44403c] mb-1">Recipient / Farmer Entity</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'payment.recipientEntity\')}</label>')
    pcode = pcode.replace('<label className="block font-bold text-[#44403c] mb-1">Payment Amount (₹ INR)</label>', '<label className="block font-bold text-[#44403c] mb-1">{t(\'payment.paymentAmount\')}</label>')
    pcode = pcode.replace(
        "Funds remain securely locked in an RBI-compliant escrow account until NABL moisture and quality assay certificate is verified by both parties.",
        "{t('payment.rbiEscrowNotice')}"
    )
    pcode = pcode.replace('placeholder="Sandbox PIN: 123456"', 'placeholder={t(\'payment.sandboxPin\')}')
    pcode = pcode.replace("Authorize & Lock Escrow Funds", "{t('payment.confirmPayment')}")

with open(pay_path, "w", encoding="utf-8") as f:
    f.write(pcode)
print("✅ Wired PaymentPage.jsx")

# 12. Update LoginPage.jsx
login_path = os.path.join(FRONTEND_SRC, "pages", "LoginPage.jsx")
with open(login_path, "r", encoding="utf-8") as f:
    logcode = f.read()

if "useLanguage" not in logcode:
    logcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        logcode
    )
    logcode = re.sub(
        r"export default function LoginPage\(\) \{",
        "export default function LoginPage() {\n  const { t } = useLanguage();",
        logcode
    )
    logcode = logcode.replace("AgriPulse AI Secure Portal", "{t('login.title')}")
    logcode = logcode.replace(
        "Access national mandi prices, B2B direct trade floor, smart escrow, and agronomic AI advisory.",
        "{t('login.subtitle')}"
    )
    logcode = logcode.replace("Farmer / FPO Producer", "{t('login.farmerOption')}")
    logcode = logcode.replace("Institutional Buyer / Mill", "{t('login.buyerOption')}")
    logcode = logcode.replace('<label className="block text-xs font-bold text-[#44403c] mb-1">Supabase User Email</label>', '<label className="block text-xs font-bold text-[#44403c] mb-1">{t(\'login.enterEmail\')}</label>')
    logcode = logcode.replace('<label className="block text-xs font-bold text-[#44403c] mb-1">Password</label>', '<label className="block text-xs font-bold text-[#44403c] mb-1">{t(\'login.enterPassword\')}</label>')
    logcode = logcode.replace("Login via One-Time PIN (OTP)", "{t('login.orOtpLogin')}")
    logcode = logcode.replace("Send One-Time PIN", "{t('login.sendOtp')}")
    logcode = logcode.replace("Enter 6-Digit OTP Code", "{t('login.enterOtp')}")
    logcode = logcode.replace("Instant 1-Click Demo Login", "{t('login.oneClickDemo')}")
    logcode = logcode.replace("Enter as Farmer (Ramesh Patil)", "{t('login.farmerDemo')}")
    logcode = logcode.replace("Enter as Buyer (ITC Agro)", "{t('login.buyerDemo')}")

with open(login_path, "w", encoding="utf-8") as f:
    f.write(logcode)
print("✅ Wired LoginPage.jsx")

# 13. Update NotificationSettingsModal.jsx
notif_modal_path = os.path.join(FRONTEND_SRC, "components", "NotificationSettingsModal.jsx")
with open(notif_modal_path, "r", encoding="utf-8") as f:
    nmcode = f.read()

if "useLanguage" not in nmcode:
    nmcode = re.sub(
        r"import React, \{ useState \} from 'react';",
        "import React, { useState } from 'react';\nimport { useLanguage } from '../context/LanguageContext';",
        nmcode
    )
    nmcode = re.sub(
        r"export default function NotificationSettingsModal\(\{ isOpen, onClose \}\) \{",
        "export default function NotificationSettingsModal({ isOpen, onClose }) {\n  const { t } = useLanguage();",
        nmcode
    )
    nmcode = nmcode.replace("Notification Alert Settings", "{t('notifications.alertSettingsTitle')}")
    nmcode = nmcode.replace("Customise weather and mandi price alert thresholds", "{t('notifications.alertSettingsSubtitle')}")
    nmcode = nmcode.replace("🌦️ Weather & Rain Alerts", "{t('notifications.weatherAlerts')}")
    nmcode = nmcode.replace("📈 Mandi Price Volatility Alerts", "{t('notifications.mandiAlerts')}")
    nmcode = nmcode.replace("🏛️ PM-KISAN & PMFBY Scheme Deadlines", "{t('notifications.schemeAlerts')}")
    nmcode = nmcode.replace("Rainfall Probability Threshold", "{t('notifications.weatherThreshold')}")
    nmcode = nmcode.replace("Mandi Price Volatility Threshold", "{t('notifications.priceThreshold')}")
    nmcode = nmcode.replace("Save Alert Preferences", "{t('notifications.saveSettings')}")

with open(notif_modal_path, "w", encoding="utf-8") as f:
    f.write(nmcode)
print("✅ Wired NotificationSettingsModal.jsx")

# 14. Update Sidebar.jsx
sidebar_path = os.path.join(FRONTEND_SRC, "components", "Sidebar.jsx")
with open(sidebar_path, "r", encoding="utf-8") as f:
    sbcode = f.read()

sbcode = sbcode.replace("'Dashboards & Trading'", "t('sidebar.dashboardGroup')")
sbcode = sbcode.replace("'Direct Trading & Arbitrage'", "t('sidebar.tradeGroup')")
sbcode = sbcode.replace("'Weather & Field Telemetry'", "t('sidebar.advisoryGroup')")
sbcode = sbcode.replace("'Government Schemes & Credit'", "t('sidebar.financeGroup')")
sbcode = sbcode.replace("'Farmer Tools & Community'", "t('sidebar.servicesGroup')")
sbcode = sbcode.replace("'Portals'", "t('sidebar.portalsGroup')")
sbcode = sbcode.replace("'Sign Out'", "t('sidebar.signOutBtn')")

with open(sidebar_path, "w", encoding="utf-8") as f:
    f.write(sbcode)
print("✅ Wired Sidebar.jsx")

# 15. Update AppLayout.jsx
layout_path = os.path.join(FRONTEND_SRC, "components", "AppLayout.jsx")
with open(layout_path, "r", encoding="utf-8") as f:
    laycode = f.read()

laycode = laycode.replace("• Live Mandi Feed", "{t('common.liveFeed')}")
laycode = laycode.replace("Live Alert", "{t('common.warning')}")

with open(layout_path, "w", encoding="utf-8") as f:
    f.write(laycode)
print("✅ Wired AppLayout.jsx")

print("\n🎉 ALL TARGET COMPONENTS SUCCESSFULLY WIRED TO i18n!")
