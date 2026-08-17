import os
import shutil
from PIL import Image, ImageDraw, ImageOps

PROJECT_ROOT = r"C:\Users\hp\.gemini\antigravity\scratch\agripulse-ai"
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
ANDROID_RES = os.path.join(FRONTEND_DIR, "android", "app", "src", "main", "res")
PUBLIC_DIR = os.path.join(FRONTEND_DIR, "public")
ASSETS_DIR = os.path.join(FRONTEND_DIR, "assets", "icon-source")

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\bd4a0526-6a18-4166-ae7d-bc4378aa2df1"
SRC_IMG_PATH = os.path.join(ARTIFACT_DIR, ".user_uploaded", "media_1786994038304.jpg")

DENSITY_SIZES = {
    "mipmap-mdpi": (48, 108),      # (legacy_size, adaptive_fg_size)
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432)
}

def generate_all_icon_assets(option: str = "option1", bg_hex: str = "#FFFFFF"):
    """
    Generates full Android adaptive icon set, Play Store icon, and Web/PWA icons.
    option: "option1" (focused emblem) or "option2" (full branding)
    """
    img = Image.open(SRC_IMG_PATH).convert("RGBA")
    
    if option == "option1":
        # Crop to emblem
        emblem_box = (70, 25, 870, 745)
        emblem_cropped = img.crop(emblem_box)
        ew, eh = emblem_cropped.size
        max_dim = max(ew, eh)
        master_square = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 255))
        master_square.paste(emblem_cropped, ((max_dim - ew) // 2, (max_dim - eh) // 2), emblem_cropped)
        master_square = master_square.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        # Adaptive foreground (72% safe zone in 1024x1024)
        adaptive_fg_master = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        scaled_badge = master_square.resize((730, 730), Image.Resampling.LANCZOS)
        adaptive_fg_master.paste(scaled_badge, (147, 147), scaled_badge)
    else:
        # Full artwork
        master_square = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        adaptive_fg_master = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        scaled_full = img.resize((720, 720), Image.Resampling.LANCZOS)
        adaptive_fg_master.paste(scaled_full, (152, 152), scaled_full)

    # 1. Generate Android Mipmap Densities
    for folder, (legacy_size, adaptive_size) in DENSITY_SIZES.items():
        folder_path = os.path.join(ANDROID_RES, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # a. Legacy ic_launcher.png (Square / Rounded)
        legacy_icon = master_square.resize((legacy_size, legacy_size), Image.Resampling.LANCZOS)
        legacy_icon.save(os.path.join(folder_path, "ic_launcher.png"))
        
        # b. Legacy ic_launcher_round.png (Circular Mask)
        mask = Image.new("L", (legacy_size, legacy_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, legacy_size - 1, legacy_size - 1), fill=255)
        round_icon = ImageOps.fit(legacy_icon, (legacy_size, legacy_size))
        round_icon.putalpha(mask)
        round_icon.save(os.path.join(folder_path, "ic_launcher_round.png"))
        
        # c. Adaptive ic_launcher_foreground.png (108dp canvas)
        fg_icon = adaptive_fg_master.resize((adaptive_size, adaptive_size), Image.Resampling.LANCZOS)
        fg_icon.save(os.path.join(folder_path, "ic_launcher_foreground.png"))
        print(f"Generated {folder}: legacy={legacy_size}x{legacy_size}, adaptive={adaptive_size}x{adaptive_size}")

    # 2. Update ic_launcher_background.xml
    bg_xml_path = os.path.join(ANDROID_RES, "values", "ic_launcher_background.xml")
    os.makedirs(os.path.dirname(bg_xml_path), exist_ok=True)
    with open(bg_xml_path, "w", encoding="utf-8") as f:
        f.write(f'''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">{bg_hex}</color>
</resources>
''')

    # 3. Ensure anydpi-v26 XMLs are correct
    anydpi_dir = os.path.join(ANDROID_RES, "mipmap-anydpi-v26")
    os.makedirs(anydpi_dir, exist_ok=True)
    
    with open(os.path.join(anydpi_dir, "ic_launcher.xml"), "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
''')

    with open(os.path.join(anydpi_dir, "ic_launcher_round.xml"), "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
''')

    # 4. Play Store Listing Master (512x512)
    playstore_icon = master_square.resize((512, 512), Image.Resampling.LANCZOS)
    playstore_icon.save(os.path.join(ASSETS_DIR, "playstore_icon_512.png"))
    playstore_icon.save(os.path.join(ANDROID_RES, "playstore_icon_512.png"))

    # 5. Web / PWA Assets (public/)
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    master_square.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "icon-192.png"))
    master_square.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "icon-512.png"))
    master_square.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))
    
    # Favicon ICO
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    master_square.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format="ICO", sizes=ico_sizes)

    print("\n All Android & Web icon assets generated successfully!")

if __name__ == "__main__":
    generate_all_icon_assets("option1", "#FFFFFF")
