import os
import json
import shutil
import subprocess
import sys
from datetime import datetime

DEST_DIR = r"C:\Users\hp\OneDrive\Documents\Scratch"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
ANDROID_DIR = os.path.join(FRONTEND_DIR, "android")
APK_SRC = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "debug", "app-debug.apk")

def get_current_version() -> str:
    """Reads current app version from package.json."""
    pkg_path = os.path.join(FRONTEND_DIR, "package.json")
    try:
        with open(pkg_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "2.1.0")
    except Exception:
        return "2.1.0"

def build_apk():
    version = get_current_version()
    print(f"🌾 ==========================================================")
    print(f"🌾 Building AgriPulse AI Production APK — Version v{version}")
    print(f"🌾 ==========================================================\n")
    
    # 1. Vite Build
    print("1. Compiling frontend assets (Vite)...")
    subprocess.run(["npm.cmd", "run", "build"], cwd=FRONTEND_DIR, check=True)
    
    # 2. Capacitor Sync
    print("2. Syncing web assets to Capacitor Android project...")
    subprocess.run(["npx.cmd", "cap", "sync", "android"], cwd=FRONTEND_DIR, check=True)
    
    # 3. Gradle Assemble
    print("3. Assembling Android APK with Gradle...")
    gradlew = os.path.join(ANDROID_DIR, "gradlew.bat")
    subprocess.run([gradlew, "assembleDebug"], cwd=ANDROID_DIR, check=True)
    
    # 4. Target Files Setup
    os.makedirs(DEST_DIR, exist_ok=True)
    
    dest_standard = os.path.join(DEST_DIR, "AgriPulse_AI.apk")
    dest_versioned = os.path.join(DEST_DIR, f"AgriPulse_AI_v{version}.apk")
    
    # Copy both standard and versioned APKs
    shutil.copyfile(APK_SRC, dest_standard)
    shutil.copyfile(APK_SRC, dest_versioned)
    
    # Also save root copy for repo consistency
    root_copy = os.path.join(PROJECT_ROOT, "AgriPulse_AI.apk")
    root_versioned = os.path.join(PROJECT_ROOT, f"AgriPulse_AI_v{version}.apk")
    shutil.copyfile(APK_SRC, root_copy)
    shutil.copyfile(APK_SRC, root_versioned)
    
    # 5. Write Version & Update Info file in the destination folder
    info_file = os.path.join(DEST_DIR, "AgriPulse_Version_Info.txt")
    build_time = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    size_mb = os.path.getsize(dest_versioned) / (1024 * 1024)
    
    info_content = f"""🌾 AgriPulse AI — Android Build Information
==================================================
Version:        v{version} (Phase 2 Pro)
Build Code:     2
Built On:       {build_time}
File Size:      {size_mb:.2f} MB
Standard APK:   AgriPulse_AI.apk
Versioned APK:  AgriPulse_AI_v{version}.apk

Key Features in v{version}:
1. Domain-Restricted Multilingual Kisan Mitra Copilot (11+ Indian Languages)
2. Pre-LLM Domain Refusal for Off-Topic Queries (Cricket, Movies, Songs, Coding)
3. Shared Google Gemini API Integration via secure GEMINI_API_KEY
4. Supabase Authentication (Email/Password + Magic OTP + Demo 1-Click Access)
5. Supabase Relational Database + Dexie.js Offline-First Sync
6. Multi-Rail Payment Gateway (Razorpay Sandbox, UPI QR Intent, 100% Escrow)
7. Human-Crafted Editorial UI with Natural Warm Linen Palette & Fraunces Serif
8. 10 Farmer Modules: PM-KISAN/PMFBY Schemes, KCC Loans, Crop Doctor, Irrigation, Almanac
==================================================
"""
    with open(info_file, "w", encoding="utf-8") as f:
        f.write(info_content)
    
    print(f"\n🎉 SUCCESS! APKs and Version Info generated:")
    print(f"📁 Versioned APK: {dest_versioned} ({size_mb:.2f} MB)")
    print(f"📁 Standard APK:  {dest_standard}")
    print(f"📄 Version Log:   {info_file}")

if __name__ == "__main__":
    build_apk()
