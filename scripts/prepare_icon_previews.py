import os
from PIL import Image, ImageDraw, ImageOps

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\bd4a0526-6a18-4166-ae7d-bc4378aa2df1"
SRC_IMG_PATH = os.path.join(ARTIFACT_DIR, ".user_uploaded", "media_1786994038304.jpg")

ASSETS_ICON_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\agripulse-ai\frontend\assets\icon-source"
os.makedirs(ASSETS_ICON_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# Load source image (1024x1024)
img = Image.open(SRC_IMG_PATH).convert("RGBA")
width, height = img.size

# Save master source to project assets
img.save(os.path.join(ASSETS_ICON_DIR, "agripulse_source_master.png"))

# -------------------------------------------------------------
# Option 1: Focused Emblem (Crop around the central illustration badge)
# The badge is roughly y: 25 to 745, x: 75 to 865
# -------------------------------------------------------------
emblem_box = (70, 25, 870, 745)
emblem_cropped = img.crop(emblem_box)
# Make it square
ew, eh = emblem_cropped.size
max_dim = max(ew, eh)
emblem_square = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 255))
emblem_square.paste(emblem_cropped, ((max_dim - ew) // 2, (max_dim - eh) // 2), emblem_cropped)
emblem_square = emblem_square.resize((1024, 1024), Image.Resampling.LANCZOS)

# Adaptive Foreground for Option 1 (scaled to ~72% safe zone inside 1024x1024 canvas)
fg_opt1 = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
badge_scaled = emblem_square.resize((730, 730), Image.Resampling.LANCZOS)
fg_opt1.paste(badge_scaled, (147, 147), badge_scaled)

# -------------------------------------------------------------
# Option 2: Full Artwork (Emblem + AgriPulse Typography)
# -------------------------------------------------------------
fg_opt2 = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
full_scaled = img.resize((720, 720), Image.Resampling.LANCZOS)
fg_opt2.paste(full_scaled, (152, 152), full_scaled)

# -------------------------------------------------------------
# Helper to render launcher shape previews (Circle, Rounded Square, Squircle)
# -------------------------------------------------------------
def render_launcher_preview(fg_image, bg_color=(255, 255, 255)):
    canvas_size = 512
    margin = 20
    preview_canvas = Image.new("RGBA", (canvas_size * 3 + margin * 4, canvas_size + margin * 2), (245, 242, 235, 255))
    
    # 1. Circle Mask (e.g. Pixel / Stock Android)
    circle_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(circle_canvas)
    draw.ellipse((0, 0, canvas_size - 1, canvas_size - 1), fill=bg_color)
    
    fg_resized = fg_image.resize((canvas_size, canvas_size), Image.Resampling.LANCZOS)
    circle_canvas.paste(fg_resized, (0, 0), fg_resized)
    
    mask_circle = Image.new("L", (canvas_size, canvas_size), 0)
    draw_mask = ImageDraw.Draw(mask_circle)
    draw_mask.ellipse((0, 0, canvas_size - 1, canvas_size - 1), fill=255)
    circle_output = ImageOps.fit(circle_canvas, (canvas_size, canvas_size))
    circle_output.putalpha(mask_circle)
    
    # 2. Rounded Square (e.g. Xiaomi / Standard)
    round_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw_r = ImageDraw.Draw(round_canvas)
    draw_r.rounded_rectangle((0, 0, canvas_size - 1, canvas_size - 1), radius=110, fill=bg_color)
    round_canvas.paste(fg_resized, (0, 0), fg_resized)
    mask_round = Image.new("L", (canvas_size, canvas_size), 0)
    draw_rm = ImageDraw.Draw(mask_round)
    draw_rm.rounded_rectangle((0, 0, canvas_size - 1, canvas_size - 1), radius=110, fill=255)
    round_output = ImageOps.fit(round_canvas, (canvas_size, canvas_size))
    round_output.putalpha(mask_round)
    
    # 3. Squircle (e.g. Samsung One UI)
    sq_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw_sq = ImageDraw.Draw(sq_canvas)
    draw_sq.rounded_rectangle((0, 0, canvas_size - 1, canvas_size - 1), radius=170, fill=bg_color)
    sq_canvas.paste(fg_resized, (0, 0), fg_resized)
    mask_sq = Image.new("L", (canvas_size, canvas_size), 0)
    draw_sqm = ImageDraw.Draw(mask_sq)
    draw_sqm.rounded_rectangle((0, 0, canvas_size - 1, canvas_size - 1), radius=170, fill=255)
    sq_output = ImageOps.fit(sq_canvas, (canvas_size, canvas_size))
    sq_output.putalpha(mask_sq)

    # Paste onto preview canvas
    preview_canvas.paste(circle_output, (margin, margin), circle_output)
    preview_canvas.paste(round_output, (canvas_size + margin * 2, margin), round_output)
    preview_canvas.paste(sq_output, (canvas_size * 2 + margin * 3, margin), sq_output)
    
    return preview_canvas

# Generate and save preview comparison images
p1 = render_launcher_preview(fg_opt1)
p1_path = os.path.join(ARTIFACT_DIR, "preview_option1_focused_emblem.png")
p1.save(p1_path)

p2 = render_launcher_preview(fg_opt2)
p2_path = os.path.join(ARTIFACT_DIR, "preview_option2_full_branding.png")
p2.save(p2_path)

# Also save standalone preview squares
emblem_square.save(os.path.join(ARTIFACT_DIR, "preview_option1_square_master.png"))
img.save(os.path.join(ARTIFACT_DIR, "preview_option2_full_master.png"))

print("Previews successfully generated in artifact directory!")
