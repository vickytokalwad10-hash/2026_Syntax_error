import os
import shutil
import subprocess
import sys

DEST_DIR = r"C:\Users\hp\OneDrive\Documents\Scratch"
DEST_FILE = os.path.join(DEST_DIR, "AgriPulse_AI.apk")
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
ANDROID_DIR = os.path.join(FRONTEND_DIR, "android")
APK_SRC = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "debug", "app-debug.apk")

def build_apk():
    print("🌾 Building AgriPulse AI Production APK...")
    
    # 1. Vite Build
    print("1. Compiling frontend assets (Vite)...")
    subprocess.run(["npm.cmd", "run", "build"], cwd=FRONTEND_DIR, check=True)
    
    # 2. Capacitor Sync
    print("2. Syncing assets to Capacitor Android project...")
    subprocess.run(["npx.cmd", "cap", "sync", "android"], cwd=FRONTEND_DIR, check=True)
    
    # 3. Gradle Assemble
    print("3. Assembling Android APK with Gradle...")
    gradlew = os.path.join(ANDROID_DIR, "gradlew.bat")
    subprocess.run([gradlew, "assembleDebug"], cwd=ANDROID_DIR, check=True)
    
    # 4. Copy to Target Directory
    os.makedirs(DEST_DIR, exist_ok=True)
    shutil.copyfile(APK_SRC, DEST_FILE)
    
    # Also keep root copy for repo consistency
    root_copy = os.path.join(PROJECT_ROOT, "AgriPulse_AI.apk")
    shutil.copyfile(APK_SRC, root_copy)
    
    size_mb = os.path.getsize(DEST_FILE) / (1024 * 1024)
    print(f"\n✅ SUCCESS! APK successfully generated and saved to:")
    print(f"📁 {DEST_FILE} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    build_apk()
