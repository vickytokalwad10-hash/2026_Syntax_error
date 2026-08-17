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
Build Code:     7
Built On:       {build_time}
File Size:      {size_mb:.2f} MB
Standard APK:   AgriPulse_AI.apk
Versioned APK:  AgriPulse_AI_v{version}.apk

Key Features in v{version}:
1. Multi-Source Government Mandi Integration (Agmarknet Spot & e-NAM Electronic Auction)
2. 3-Way Source Toggle on Overview (AgriPulse Network / Agmarknet / e-NAM Electronic)
3. Dynamic Reporting Mandis Telemetry (no hardcoded coverage claims)
4. 3-Way Cross-Verification Table on Arbitrage Floor (Spot vs Agmarknet vs e-NAM)
5. Multi-Source Attribution under NDSAP & SFAC Terms
6. Two-Tier e-NAM Architecture with Documented Service Provider Empanelment Roadmap
7. High-Performance Multi-Tier Caching (Memory + Disk JSON) with 4-Hour TTL
8. Android Hardware & Gesture Back Button Navigation Engine (@capacitor/app)
9. Modal & Drawer Priority Close Stack (LIFO overlay management)
10. Unified Multilingual System Across 11 Indian Languages with 100% Key Parity
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
