import os
import re

FRONTEND_SRC = r"C:\Users\hp\.gemini\antigravity\scratch\agripulse-ai\frontend\src"
PAGES_DIR = os.path.join(FRONTEND_SRC, "pages")
COMPONENTS_DIR = os.path.join(FRONTEND_SRC, "components")

ACTIVE_PAGES = [
    "OverviewPage.jsx",
    "MarketplacePage.jsx",
    "VoiceCopilotPage.jsx",
    "SatellitePage.jsx",
    "WeatherPage.jsx",
    "SimulatorPage.jsx",
    "ArbitragePage.jsx",
    "CropPlanningPage.jsx",
    "FraudDetectionPage.jsx",
    "FarmerDashboardPage.jsx",
    "BuyerDashboardPage.jsx",
    "SchemesPage.jsx",
    "FinancePage.jsx",
    "DiagnosePage.jsx",
    "IrrigationPage.jsx",
    "RentalsPage.jsx",
    "CalendarPage.jsx",
    "CommunityPage.jsx",
    "LivestockPage.jsx",
    "PaymentPage.jsx",
    "LoginPage.jsx"
]

COMPONENTS = [
    "AppLayout.jsx",
    "NotificationDrawer.jsx",
    "NotificationSettingsModal.jsx",
    "Sidebar.jsx",
    "Header.jsx"
]

# Proper nouns / technical acronyms that do not require translation
PROPER_NOUNS = {
    "AgriPulse", "AI", "NABL", "GI", "MSP", "APMC", "e-NAM", "PM-KISAN", "PMFBY",
    "KCC", "NPK", "NDVI", "Sharbati", "Pusa", "1121", "ITC", "Adani", "Wilmar",
    "Kargil", "Bayer", "Mahindra", "Sonalika", "John Deere", "Deere", "WDRA",
    "FPO", "INR", "₹", "USD", "kg", "MT", "qtl", "Acres", "Ha", "CRI"
}

def analyze_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    has_use_language = "useLanguage" in content or "useTranslation" in content
    has_t_call = bool(re.search(r'\bt\(', content))
    
    # Extract plain text inside JSX like >Some Text< or title="Some Text" or placeholder="Some Text"
    raw_jsx_texts = re.findall(r'>([^<>{}\n\r\t]+)<', content)
    raw_placeholders = re.findall(r'placeholder=["\']([^"\']+)["\']', content)
    raw_titles = re.findall(r'title=["\']([^"\']+)["\']', content)
    
    clean_texts = []
    for t in raw_jsx_texts:
        cleaned = t.strip()
        # Filter out numbers, symbols, single characters, proper nouns, and code artifacts
        if len(cleaned) > 2 and not cleaned.startswith('&') and not cleaned.isdigit():
            # Check if it's not purely punctuation / currency
            words = [w for w in cleaned.split() if w not in PROPER_NOUNS and not w.isdigit()]
            if words and any(re.search(r'[A-Za-z]', w) for w in words):
                clean_texts.append(cleaned)
                
    clean_placeholders = [p.strip() for p in raw_placeholders if any(re.search(r'[A-Za-z]', w) for w in p.split() if w not in PROPER_NOUNS)]
    clean_titles = [ti.strip() for ti in raw_titles if any(re.search(r'[A-Za-z]', w) for w in ti.split() if w not in PROPER_NOUNS)]
    
    return {
        "has_use_language": has_use_language,
        "has_t_call": has_t_call,
        "hardcoded_texts_count": len(clean_texts),
        "sample_hardcoded_texts": clean_texts[:8],
        "hardcoded_placeholders": clean_placeholders,
        "hardcoded_titles": clean_titles
    }

print("=== SCREEN-BY-SCREEN MULTILINGUAL COVERAGE AUDIT ===")
for p in ACTIVE_PAGES:
    path = os.path.join(PAGES_DIR, p)
    if os.path.exists(path):
        res = analyze_file(path)
        print(f"\n📄 {p}:")
        print(f"  - Uses i18n/useLanguage: {'✅' if res['has_use_language'] and res['has_t_call'] else '❌'}")
        print(f"  - Hardcoded strings count: {res['hardcoded_texts_count']}")
        if res['sample_hardcoded_texts']:
            print(f"  - Samples: {res['sample_hardcoded_texts']}")
        if res['hardcoded_placeholders']:
            print(f"  - Placeholders: {res['hardcoded_placeholders']}")

print("\n=== SHARED COMPONENTS AUDIT ===")
for c in COMPONENTS:
    path = os.path.join(COMPONENTS_DIR, c)
    if os.path.exists(path):
        res = analyze_file(path)
        print(f"\n🧩 {c}:")
        print(f"  - Uses i18n/useLanguage: {'✅' if res['has_use_language'] and res['has_t_call'] else '❌'}")
        print(f"  - Hardcoded strings count: {res['hardcoded_texts_count']}")
        if res['sample_hardcoded_texts']:
            print(f"  - Samples: {res['sample_hardcoded_texts']}")
