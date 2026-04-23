"""
IMVI card compositor — locked-layout edition.

The layout is IDENTICAL across all variations (v1–v4). The design system is
expressed through:
  - Name lockup font pairing (script + block)
  - Jersey number treatment (solid/outlined/rotated/shadowed)
  - Background texture (DEFERRED this round — minimal solid+grain+vignette only)
  - Color palette (extracted from logo)

Locked layout — never varies:
  • Rounded rectangle frame with thin cream inner border
  • Subject centered, dominates ~65% of card height, gradient-transparency fill
  • Team logo top-left, small
  • Jersey number top-right, large
  • Name lockup bottom-center, overlapping subject's lower body
  • IMVI wordmark bottom-center small italic
  • Chevron clusters: top-right + bottom-left (4 per cluster)
  • Plus-sign sparkles: 4 per corner
"""

from __future__ import annotations

import argparse
import json
import math
import random
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from PIL import (
    Image,
    ImageChops,
    ImageDraw,
    ImageFilter,
    ImageFont,
)

# ──────────────────────────────────────────────────────────────────────────
# Paths, constants
# ──────────────────────────────────────────────────────────────────────────

HERE = Path(__file__).parent
FONTS_DIR = HERE / "assets" / "fonts"
LOGOS_DIR = HERE / "assets" / "logos"
TRANSPARENT_LOGOS_DIR = LOGOS_DIR / "transparent"
TEXTURES_DIR = HERE / "assets" / "textures"
SILHOUETTES_DIR = HERE / "assets" / "silhouettes"
TEAMS_JSON = HERE / "teams.json"

CARD_W = 800
CARD_H = 1120

# Font library — script + display pairings per variation
OSWALD_BOLD = FONTS_DIR / "Oswald-Bold.ttf"
OSWALD_MEDIUM = FONTS_DIR / "Oswald-Medium.ttf"
# Display / first-name fonts — bolder and punchier than the first-pass set
BANGERS = FONTS_DIR / "Bangers.ttf"                  # V1 — distressed all-caps comic
KALAM_BOLD = FONTS_DIR / "Kalam-Bold.ttf"            # V2 — bold handwritten
HOMEMADE_APPLE = FONTS_DIR / "Homemade-Apple.ttf"    # V3 — marker script
LUCKIEST_GUY = FONTS_DIR / "Luckiest-Guy.ttf"        # V4 — bold cartoon display
# Block / last-name fonts
BUNGEE = FONTS_DIR / "Bungee.ttf"
STAATLICHES = FONTS_DIR / "Staatliches.ttf"
BOWLBY_ONE = FONTS_DIR / "Bowlby-One.ttf"
SIGMAR_ONE = FONTS_DIR / "Sigmar-One.ttf"

Variation = Literal["v1", "v2", "v3", "v4"]


# ──────────────────────────────────────────────────────────────────────────
# Color + font helpers
# ──────────────────────────────────────────────────────────────────────────

def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def hex_rgba(h: str, a: int = 255) -> tuple[int, int, int, int]:
    r, g, b = hex_rgb(h)
    return (r, g, b, a)


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font missing: {path}")
    return ImageFont.truetype(str(path), size)


def _darken(rgb: tuple[int, int, int], factor: float) -> tuple[int, int, int]:
    return tuple(int(c * factor) for c in rgb)


# ──────────────────────────────────────────────────────────────────────────
# Team config
# ──────────────────────────────────────────────────────────────────────────

@dataclass
class TeamConfig:
    key: str
    display_name: str
    primary: str
    accent: str
    dark: str
    light: str
    silhouette_color: str
    logo_path: Path
    default_silhouette: Path

    @staticmethod
    def load(key: str) -> "TeamConfig":
        with TEAMS_JSON.open() as f:
            data = json.load(f)
        d = data[key]
        colors = d["colors"]
        logo_name = d.get("logo")
        if logo_name:
            stem = Path(logo_name).stem
            tp = TRANSPARENT_LOGOS_DIR / f"{stem}.png"
            logo_path = tp if tp.exists() else (LOGOS_DIR / logo_name)
        else:
            logo_path = TRANSPARENT_LOGOS_DIR / f"{key}.png"
        return TeamConfig(
            key=key,
            display_name=d["display_name"],
            primary=colors["primary"],
            accent=colors["accent"],
            dark=colors["dark"],
            light=colors["light"],
            silhouette_color=colors.get("silhouette", colors["dark"]),
            logo_path=logo_path,
            default_silhouette=SILHOUETTES_DIR / d.get(
                "default_silhouette", "_silhouette_preview.png"
            ),
        )


# ──────────────────────────────────────────────────────────────────────────
# Background — minimal (primary + grain + vignette)
# ──────────────────────────────────────────────────────────────────────────

def build_minimal_background(team: TeamConfig) -> Image.Image:
    """Primary solid + gentle corner vignette + subtle print-grain overlay.
    This is placeholder until background textures land. Nothing else."""
    primary = hex_rgb(team.primary)
    canvas = Image.new("RGBA", (CARD_W, CARD_H), primary + (255,))

    # Vignette — darken corners ~15%, concentric falloff
    mask = Image.new("L", (CARD_W, CARD_H), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((-CARD_W * 0.20, -CARD_H * 0.20, CARD_W * 1.20, CARD_H * 1.20), fill=200)
    md.ellipse((CARD_W * 0.02, CARD_H * 0.02, CARD_W * 0.98, CARD_H * 0.98), fill=120)
    md.ellipse((CARD_W * 0.18, CARD_H * 0.18, CARD_W * 0.82, CARD_H * 0.82), fill=40)
    md.ellipse((CARD_W * 0.30, CARD_H * 0.30, CARD_W * 0.70, CARD_H * 0.70), fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(100))
    darker_layer = Image.new("RGBA", (CARD_W, CARD_H), _darken(primary, 0.78) + (255,))
    canvas = Image.composite(darker_layer, canvas, mask)

    # Grain — fast Gaussian noise overlay, very subtle multiply
    noise = Image.effect_noise((CARD_W, CARD_H), 16)
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    canvas_rgb = canvas.convert("RGB")
    blended = Image.blend(canvas_rgb, ImageChops.multiply(canvas_rgb, noise_rgb), 0.10)

    return blended.convert("RGBA")


# ──────────────────────────────────────────────────────────────────────────
# Silhouette with gradient transparency
# ──────────────────────────────────────────────────────────────────────────

def load_silhouette_gradient_fill(
    path: Path,
    accent_hex: str,
    primary_hex: str,
    dark_hex: str,
) -> Image.Image:
    """Vertical 4-stop color gradient within the silhouette shape.
    Head/shoulders read as a light accent wash; mid-body transitions through
    the team primary; thighs sit in a darker mix; feet dissolve toward full
    transparency so the subject merges into whatever's below (i.e. the
    torn-paper base layer). Matches the early SAFC sample's technique."""
    img = Image.open(path).convert("RGBA")
    sil_alpha = img.split()[3]
    w, h = img.size

    accent = hex_rgb(accent_hex)
    primary = hex_rgb(primary_hex)
    dark = hex_rgb(dark_hex)

    def blend(c0, c1, t):
        return tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3))

    # (y_frac, RGB, opacity 0..1)
    stops = [
        (0.00, accent, 0.88),
        (0.25, blend(accent, primary, 0.45), 0.80),
        (0.60, primary, 0.60),
        (0.90, dark, 0.22),
        (1.00, dark, 0.00),
    ]

    # Build a 1-col RGBA gradient; resize to silhouette width
    col = Image.new("RGBA", (1, h), (0, 0, 0, 0))
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            y0, c0, o0 = stops[i]
            y1, c1, o1 = stops[i + 1]
            if y0 <= t <= y1:
                lt = (t - y0) / max(0.0001, y1 - y0)
                r, g, b = blend(c0, c1, lt)
                op = o0 + (o1 - o0) * lt
                col.putpixel((0, y), (r, g, b, int(op * 255)))
                break
    grad = col.resize((w, h), Image.BILINEAR)

    gr, gg, gb, ga = grad.split()
    combined_alpha = ImageChops.multiply(ga, sil_alpha)
    return Image.merge("RGBA", (gr, gg, gb, combined_alpha))


# ──────────────────────────────────────────────────────────────────────────
# Per-variation sporty-swash backgrounds (replaces torn-paper)
# ──────────────────────────────────────────────────────────────────────────

def add_variation_background(card: Image.Image, team: TeamConfig, style: Literal["v1", "v2", "v3", "v4"]) -> None:
    """Layer a distinct painterly swash treatment on top of the minimal
    background. Each style follows a different reference-card archetype:
      v1 — horizontal brush bands (Luc/Leigha energy)
      v2 — diagonal paint slashes (Bryce/Levi energy)
      v3 — radial burst behind subject (Harlan/Luc energy)
      v4 — dense splatter field (Levi/Bryce paint-heavy)
    """
    if style == "v1":
        _bg_v1_splatter_band(card, team)
    elif style == "v2":
        _bg_v2_diagonal_slash(card, team)
    elif style == "v3":
        _bg_v3_torn_paper_rip(card, team)
    elif style == "v4":
        _bg_v4_broken_glass(card, team)


def _painterly_blob(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, fill, rng: random.Random) -> None:
    """Irregular organic blob — not a clean circle. Used for splatter dots."""
    pts = []
    n = rng.randint(7, 11)
    for i in range(n):
        angle = (i / n) * math.tau + rng.uniform(-0.25, 0.25)
        rr = r * rng.uniform(0.7, 1.25)
        pts.append((cx + math.cos(angle) * rr, cy + math.sin(angle) * rr))
    draw.polygon(pts, fill=fill)


def _brush_stroke(draw: ImageDraw.ImageDraw, pts: list[tuple[int, int]], thickness_start: int, thickness_end: int, fill, steps: int = 10) -> None:
    """Draw a tapered brush stroke by overlapping lines of varying widths."""
    # Step through the stroke, drawing narrowing lines
    for i, width in enumerate(range(thickness_start, thickness_end - 1, -max(1, (thickness_start - thickness_end) // max(1, steps)))):
        draw.line(pts, fill=fill, width=width, joint="curve")


def _bg_v1_splatter_band(card: Image.Image, team: TeamConfig) -> None:
    """Horizontal dense splatter across the TOP third and BOTTOM third,
    clean middle where the subject sits. Multi-color splatter (primary +
    accent + dark) PLUS clearly-visible gray tonal bands + silver center
    glow — layered gradient washes (no specks, no lines) that introduce
    the palette's gray spectrum into the composition."""
    w, h = CARD_W, CARD_H
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    rng = random.Random(301)

    accent_rgb = hex_rgb(team.accent)
    primary_rgb = hex_rgb(team.primary)
    dark_rgb = hex_rgb(team.dark)

    # Derived gray shades for tonal layering (same technique as V3)
    def _blend(c0, c1, t):
        return tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3))
    mid_gray = _blend(dark_rgb, accent_rgb, 0.28)

    # Band regions: upper 0–0.33, lower 0.66–1.00
    bands = [
        (0, int(h * 0.33)),
        (int(h * 0.66), h),
    ]

    for band_top, band_bot in bands:
        # Backbone cluster — dense splatter concentrated near horizontal centerlines
        cluster_y = (band_top + band_bot) // 2
        # Big splash blobs — mostly dark + primary
        for _ in range(8):
            cx = rng.randint(20, w - 20)
            cy = rng.randint(band_top, band_bot)
            r = rng.randint(22, 55)
            palette_pick = rng.choice([dark_rgb, dark_rgb, primary_rgb, accent_rgb])
            alpha = rng.randint(140, 210)
            _painterly_blob(d, cx, cy, r, (*palette_pick, alpha), rng)

        # Medium droplets — mostly primary + accent
        for _ in range(28):
            cx = rng.randint(0, w)
            cy = rng.randint(band_top, band_bot)
            r = rng.randint(8, 20)
            palette_pick = rng.choice([primary_rgb, accent_rgb, dark_rgb, primary_rgb])
            alpha = rng.randint(150, 220)
            _painterly_blob(d, cx, cy, r, (*palette_pick, alpha), rng)

        # Small speckle — mix of all 3
        for _ in range(120):
            cx = rng.randint(0, w)
            cy = rng.randint(band_top, band_bot)
            r = rng.randint(1, 5)
            palette_pick = rng.choice([accent_rgb, dark_rgb, primary_rgb])
            alpha = rng.randint(160, 240)
            d.ellipse((cx - r, cy - r, cx + r, cy + r),
                      fill=(*palette_pick, alpha))

        # A couple of longer drip tails hanging off blobs into the clean middle
        for _ in range(4):
            drip_x = rng.randint(60, w - 60)
            drip_y1 = band_bot if band_top < int(h * 0.33) else band_top - 20
            drip_y2 = drip_y1 + (rng.randint(30, 70) if band_top < int(h * 0.33) else -rng.randint(30, 70))
            d.line([(drip_x, drip_y1), (drip_x + rng.randint(-6, 6), drip_y2)],
                   fill=(*rng.choice([dark_rgb, primary_rgb]), rng.randint(170, 220)),
                   width=rng.randint(3, 6))

    # Soft blur on everything for painted feel
    layer = layer.filter(ImageFilter.GaussianBlur(1.5))

    card.alpha_composite(layer)

    # ── Gray tonal layers (washes, not specks) ──
    # Upper gray band — sits between the top splatter and the clean middle
    band_upper = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bu = ImageDraw.Draw(band_upper, "RGBA")
    bu.rectangle((0, int(h * 0.30), w, int(h * 0.42)), fill=(*mid_gray, 105))
    band_upper = band_upper.filter(ImageFilter.GaussianBlur(30))

    # Lower gray band — between the clean middle and the bottom splatter
    band_lower = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bl = ImageDraw.Draw(band_lower, "RGBA")
    bl.rectangle((0, int(h * 0.58), w, int(h * 0.70)), fill=(*mid_gray, 105))
    band_lower = band_lower.filter(ImageFilter.GaussianBlur(30))

    # Silver radial glow behind the subject — logo-like sheen in gray
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    cx, cy = w // 2, int(h * 0.50)
    for r in range(280, 30, -25):
        alpha = int(38 * (1 - r / 280))
        gd.ellipse((cx - r, cy - int(r * 0.65), cx + r, cy + int(r * 0.65)),
                   fill=(*accent_rgb, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(55))

    card.alpha_composite(band_upper)
    card.alpha_composite(band_lower)
    card.alpha_composite(glow)


def _bg_v2_diagonal_slash(card: Image.Image, team: TeamConfig) -> None:
    """Centered dark MIDDLE zone framing the subject. Top 0–25% stays red,
    middle 25–75% is a large horizontal dark paint mass (the subject stands
    inside this dark zone), bottom 75–100% stays red. Jagged organic top and
    bottom edges on the dark mass — like a horizontal torn-paper band that
    encompasses the player. Dark zone carries the variety within: silver
    hairline scratches, primary peek-through flecks, speckle. Red top and
    bottom zones get lighter splatter for framing."""
    w, h = CARD_W, CARD_H
    rng = random.Random(402)

    accent_rgb = hex_rgb(team.accent)
    primary_rgb = hex_rgb(team.primary)
    dark_rgb = hex_rgb(team.dark)

    # ── Layer 1: Centered dark paint mass ──
    # Full card width, jagged top at y~25%, jagged bottom at y~75%.
    # Polygon is one big painted horizontal band with organic edges.
    mass = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    md = ImageDraw.Draw(mass, "RGBA")

    top_edge_y = int(h * 0.24)
    bot_edge_y = int(h * 0.78)

    # Top edge — jagged horizontal line with occasional big jag
    top_pts: list[tuple[int, int]] = [(-20, top_edge_y + rng.randint(-12, 12))]
    x = 0
    while x < w:
        x += rng.randint(22, 46)
        jag = rng.randint(-28, 28)
        if rng.random() < 0.09:  # occasional dramatic jag
            jag = rng.randint(-55, 55)
        top_pts.append((min(x, w), top_edge_y + jag))
    top_pts.append((w + 20, top_edge_y + rng.randint(-12, 12)))

    # Bottom edge — walking back right-to-left with same jagged pattern
    bot_pts: list[tuple[int, int]] = [(w + 20, bot_edge_y + rng.randint(-12, 12))]
    x = w
    while x > 0:
        x -= rng.randint(22, 46)
        jag = rng.randint(-28, 28)
        if rng.random() < 0.09:
            jag = rng.randint(-55, 55)
        bot_pts.append((max(x, 0), bot_edge_y + jag))
    bot_pts.append((-20, bot_edge_y + rng.randint(-12, 12)))

    # Combine — forms the middle dark band spanning full width
    md.polygon(top_pts + bot_pts, fill=(*dark_rgb, 238))

    # Angular dark fragments riding the jagged edges (Will Fountain chipped
    # feel) — placed along the top and bottom transitions
    for _ in range(14):
        edge_side = rng.choice(['top', 'bot'])
        cx = rng.randint(20, w - 20)
        if edge_side == 'top':
            cy = top_edge_y + rng.randint(-48, 30)
        else:
            cy = bot_edge_y + rng.randint(-30, 48)
        size = rng.randint(45, 140)
        fragment = []
        angle_offset = rng.uniform(0, math.tau)
        for i in range(3):
            ang = angle_offset + (i / 3) * math.tau + rng.uniform(-0.3, 0.3)
            rr = size * rng.uniform(0.55, 1.2)
            fragment.append((int(cx + math.cos(ang) * rr),
                             int(cy + math.sin(ang) * rr)))
        md.polygon(fragment, fill=(*dark_rgb, rng.randint(150, 220)))

    # ── Layer 2: Variety INSIDE the dark middle zone ──
    inner = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ind = ImageDraw.Draw(inner, "RGBA")

    # Silver hairline scratches — spread across the dark band at near-horizontal
    # angles with some variety
    for _ in range(22):
        x1 = rng.randint(0, w)
        y1 = rng.randint(top_edge_y + 20, bot_edge_y - 20)
        length = rng.randint(80, 260)
        angle = rng.uniform(-0.45, 0.45) if rng.random() < 0.7 else rng.uniform(-1.3, 1.3)
        x2 = x1 + int(math.cos(angle) * length)
        y2 = y1 + int(math.sin(angle) * length)
        ind.line([(x1, y1), (x2, y2)],
                 fill=(*accent_rgb, rng.randint(90, 180)),
                 width=rng.randint(1, 3))

    # Primary-red peek-through flecks inside the dark band — like red showing
    # through where dark paint chipped away
    for _ in range(26):
        x = rng.randint(0, w)
        y = rng.randint(top_edge_y + 10, bot_edge_y - 10)
        r = rng.randint(3, 14)
        _painterly_blob(ind, x, y, r, (*primary_rgb, rng.randint(150, 215)), rng)

    # Speckle — silver + red mix inside the dark band
    for _ in range(140):
        x = rng.randint(0, w)
        y = rng.randint(top_edge_y, bot_edge_y)
        r = rng.randint(1, 3)
        color = rng.choice([accent_rgb, accent_rgb, primary_rgb])
        ind.ellipse((x - r, y - r, x + r, y + r),
                    fill=(*color, rng.randint(120, 210)))

    # ── Layer 3: Top red zone — framing splatter ──
    top_zone = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    td = ImageDraw.Draw(top_zone, "RGBA")

    # Medium splatter in top zone — mix of dark + silver accents on red
    for _ in range(18):
        x = rng.randint(0, w)
        y = rng.randint(0, top_edge_y - 15)
        r = rng.randint(4, 18)
        color = rng.choice([dark_rgb, dark_rgb, accent_rgb, primary_rgb])
        _painterly_blob(td, x, y, r, (*color, rng.randint(150, 220)), rng)
    # Fine speckle top
    for _ in range(50):
        x = rng.randint(0, w)
        y = rng.randint(0, top_edge_y - 10)
        r = rng.randint(1, 3)
        color = rng.choice([dark_rgb, accent_rgb])
        td.ellipse((x - r, y - r, x + r, y + r),
                   fill=(*color, rng.randint(120, 210)))

    # ── Layer 4: Bottom red zone — framing splatter ──
    bot_zone = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd2 = ImageDraw.Draw(bot_zone, "RGBA")

    for _ in range(18):
        x = rng.randint(0, w)
        y = rng.randint(bot_edge_y + 15, h)
        r = rng.randint(4, 18)
        color = rng.choice([dark_rgb, dark_rgb, accent_rgb, primary_rgb])
        _painterly_blob(bd2, x, y, r, (*color, rng.randint(150, 220)), rng)
    for _ in range(50):
        x = rng.randint(0, w)
        y = rng.randint(bot_edge_y + 10, h)
        r = rng.randint(1, 3)
        color = rng.choice([dark_rgb, accent_rgb])
        bd2.ellipse((x - r, y - r, x + r, y + r),
                    fill=(*color, rng.randint(120, 210)))

    # Composite in order: top zone, bottom zone, dark mass, variety inside
    card.alpha_composite(top_zone)
    card.alpha_composite(bot_zone)
    card.alpha_composite(mass)
    card.alpha_composite(inner)


def _bg_v3_torn_paper_rip(card: Image.Image, team: TeamConfig) -> None:
    """SOFT torn-paper transition across the middle (~y=52%). Top half stays
    primary color with subtle grain. Bottom half is dark but LAYERED with
    multiple shades of gray (derived from the palette — dark → mid-gray →
    lighter silver) via soft gradient washes, not specks or lines.

    Key changes from the prior sharp version:
      • Tear jag amplitude reduced from ±28 to ±10 (rare ±22), giving a
        subtle wavy edge instead of a dramatic sawtooth.
      • Gaussian blur applied to the dark layer so the tear edge softens
        into a smoky transition rather than a hard line.
      • Removed the red paint flecks and accent hairline stroke that ran
        along the tear (user direction: no more specks / no more lines).
      • Added three layered gray washes (mid-gray, lighter-gray, deeper
        near bottom) + a soft silver radial glow in the lower-middle so
        the bottom half carries the palette's full gray spectrum, like
        the logo's tonal range.
    """
    w, h = CARD_W, CARD_H
    rng = random.Random(303)

    dark_rgb = hex_rgb(team.dark)
    accent_rgb = hex_rgb(team.accent)

    # Derived gray shades — interpolate between dark and accent to get a
    # three-step gray progression inspired by the logo's tonal range.
    def blend(c0, c1, t):
        return tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3))
    mid_gray = blend(dark_rgb, accent_rgb, 0.22)    # warm-tinted darker gray
    light_gray = blend(dark_rgb, accent_rgb, 0.42)  # mid-tone silver-gray

    # ── Dark bottom layer with SOFT torn edge ──
    dark_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(dark_layer, "RGBA")
    tear_y = int(h * 0.52)
    tear_pts: list[tuple[int, int]] = [(0, tear_y + rng.randint(-6, 8))]
    x = 0
    while x < w:
        step = rng.randint(24, 44)
        x = min(w, x + step)
        # Subtle wavy jag — ±10px, rare larger ±22 for occasional accent
        jag = rng.randint(-10, 10)
        if rng.random() < 0.04:
            jag = rng.randint(-22, 22)
        tear_pts.append((x, tear_y + jag))
    tear_pts.append((w, h))
    tear_pts.append((0, h))
    d.polygon(tear_pts, fill=(*dark_rgb, 240))
    # Soften the edge so it reads as a smoky transition, not a hard rip
    dark_layer = dark_layer.filter(ImageFilter.GaussianBlur(5))

    # ── Gray wash bands over the dark half — gradient-based, no specks ──
    # Band A: lighter-gray wash immediately below the tear (brightest gray)
    band_upper = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band_upper, "RGBA")
    bd.rectangle((0, tear_y - 15, w, tear_y + 90), fill=(*light_gray, 70))
    band_upper = band_upper.filter(ImageFilter.GaussianBlur(22))

    # Band B: mid-gray wash deeper in the dark zone
    band_middle = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band_middle, "RGBA")
    bd.rectangle((0, tear_y + 140, w, tear_y + 280), fill=(*mid_gray, 95))
    band_middle = band_middle.filter(ImageFilter.GaussianBlur(28))

    # Band C: subtle darkening near the very bottom for depth
    band_bottom = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band_bottom, "RGBA")
    bd.rectangle((0, h - 160, w, h), fill=(*dark_rgb, 80))
    band_bottom = band_bottom.filter(ImageFilter.GaussianBlur(24))

    # ── Silver radial glow in the lower-middle — logo-like sheen ──
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    cx, cy = w // 2, int(h * 0.70)
    for r in range(320, 40, -28):
        alpha = int(45 * (1 - r / 320))
        gd.ellipse((cx - r, cy - int(r * 0.65), cx + r, cy + int(r * 0.65)),
                   fill=(*accent_rgb, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(55))

    # ── Soft mist/smoke overlay (retained, softened) ──
    mist = Image.effect_noise((w, int(h * 0.5)), 48)
    mist_rgba = Image.new("RGBA", mist.size, (0, 0, 0, 0))
    pxs = mist.load()
    rgba = mist_rgba.load()
    for yy in range(mist.height):
        falloff = 1.0 - (yy / mist.height) * 0.55
        for xx in range(mist.width):
            v = pxs[xx, yy]
            a = int(max(0, (v - 105)) * 0.28 * falloff)
            rgba[xx, yy] = (*accent_rgb, a)
    mist_rgba = mist_rgba.filter(ImageFilter.GaussianBlur(12))
    mist_placed = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    mist_placed.paste(mist_rgba, (0, int(h * 0.50)), mist_rgba)

    # ── Subtle grain on the top half (primary side) — unchanged ──
    top_grain = Image.effect_noise((w, tear_y + 10), 18)
    grain_rgba = Image.new("RGBA", top_grain.size, (0, 0, 0, 0))
    pxs = top_grain.load()
    rgba = grain_rgba.load()
    for yy in range(top_grain.height):
        for xx in range(top_grain.width):
            v = pxs[xx, yy]
            a = int(max(0, (v - 140)) * 0.35)
            rgba[xx, yy] = (*dark_rgb, a)

    # Composite: grain → dark layer → gray bands → glow → mist
    card.paste(grain_rgba, (0, 0), grain_rgba)
    card.alpha_composite(dark_layer)
    card.alpha_composite(band_upper)
    card.alpha_composite(band_middle)
    card.alpha_composite(band_bottom)
    card.alpha_composite(glow)
    card.alpha_composite(mist_placed)


def _bg_v4_broken_glass(card: Image.Image, team: TeamConfig) -> None:
    """Broken-glass shards in the Will Fountain / Fox Creek style:
      - Shards biased to LEFT + RIGHT edges so they frame the subject
        rather than cover the center column where the silhouette lives.
      - Full palette variation: pure dark (black), dark-with-red-tint
        (mixed dark + primary), and subtle primary-red shards (red-on-red
        "broken glass red" effect) so even the red areas have texture.
      - Silver (accent) used ONLY for hairline shard outlines + scratch
        streaks — never as big shard fills (no more white triangles).
      - A wide horizontal dark-red brush stroke anchors the bottom behind
        the name lockup — wide, painterly, does not overlap subject center.
    """
    w, h = CARD_W, CARD_H
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    rng = random.Random(405)

    accent_rgb = hex_rgb(team.accent)
    dark_rgb = hex_rgb(team.dark)
    primary_rgb = hex_rgb(team.primary)

    # Color variants: dark, dark+primary mix, darker primary, plus primary
    # itself at low opacity for the "red shards on red" broken-glass effect.
    dark_primary = tuple(int(c * 0.5) for c in primary_rgb)
    dark_red_mix = tuple((dark_rgb[i] + dark_primary[i]) // 2 for i in range(3))

    # (color, opacity range) — weighted mostly dark with occasional red variants
    shard_palette = [
        (dark_rgb,      (130, 180)),
        (dark_rgb,      (130, 180)),
        (dark_rgb,      (130, 180)),
        (dark_red_mix,  (120, 170)),
        (dark_red_mix,  (120, 170)),
        (dark_primary,  (140, 190)),
        (primary_rgb,   (50,  95)),   # subtle red-on-red variant
        (primary_rgb,   (50,  95)),
    ]

    def sample_shard_center() -> tuple[int, int]:
        """Bias 70% of shards toward the left/right edge columns so the
        subject's center stays relatively clear."""
        if rng.random() < 0.72:
            if rng.random() < 0.5:
                cx = rng.randint(-80, int(w * 0.35))
            else:
                cx = rng.randint(int(w * 0.65), w + 80)
            cy = rng.randint(-60, h + 60)
        else:
            cx = rng.randint(-80, w + 80)
            cy = rng.randint(-80, h + 80)
        return cx, cy

    def _shard_polygon(size: int, n_verts: int) -> list[tuple[int, int]]:
        angle_offset = rng.uniform(0, math.tau)
        pts = []
        for i in range(n_verts):
            ang = angle_offset + (i / n_verts) * math.tau + rng.uniform(-0.35, 0.35)
            rr = size * rng.uniform(0.55, 1.25)
            pts.append((math.cos(ang) * rr, math.sin(ang) * rr))
        return pts

    # --- Big shards ---
    for _ in range(22):
        cx, cy = sample_shard_center()
        size = rng.randint(100, 300)
        rel = _shard_polygon(size, rng.choice([3, 3, 3, 4]))
        abs_pts = [(int(cx + x), int(cy + y)) for x, y in rel]
        color, op_range = rng.choice(shard_palette)
        opacity = rng.randint(*op_range)
        d.polygon(abs_pts, fill=(*color, opacity))

    # --- Medium shards ---
    for _ in range(15):
        cx, cy = sample_shard_center()
        size = rng.randint(40, 100)
        rel = _shard_polygon(size, rng.choice([3, 3, 4]))
        abs_pts = [(int(cx + x), int(cy + y)) for x, y in rel]
        color, op_range = rng.choice(shard_palette)
        opacity = rng.randint(op_range[0] + 20, op_range[1] + 30)
        d.polygon(abs_pts, fill=(*color, min(220, opacity)))

    # --- Thin silver hairline shard outlines (a dozen, scattered) ---
    for _ in range(14):
        cx, cy = sample_shard_center()
        size = rng.randint(60, 180)
        rel = _shard_polygon(size, 3)
        abs_pts = [(int(cx + x), int(cy + y)) for x, y in rel]
        abs_pts.append(abs_pts[0])
        d.line(abs_pts, fill=(*accent_rgb, rng.randint(80, 150)),
               width=rng.randint(1, 2))

    # --- Wide horizontal brush stroke at bottom behind name lockup ---
    # Dark-red color, painterly edges. Placed at y=0.76-0.88 so it frames the
    # name zone without covering the subject's torso/head.
    brush_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(brush_layer, "RGBA")
    brush_center_y = int(h * 0.82)
    # Build an irregular band polygon
    top_pts: list[tuple[int, int]] = [(-20, brush_center_y - 40 + rng.randint(-6, 6))]
    for x in range(40, w + 40, 36):
        top_pts.append((x, brush_center_y - 40 + rng.randint(-18, 18)))
    bot_pts: list[tuple[int, int]] = [(w + 20, brush_center_y + 40 + rng.randint(-6, 6))]
    for x in range(w, -40, -36):
        bot_pts.append((x, brush_center_y + 40 + rng.randint(-22, 22)))
    bd.polygon(top_pts + bot_pts, fill=(*dark_primary, 200))
    # A thinner brighter-red band on top of it for a "paint over paint" read
    top2 = [(-20, brush_center_y - 22 + rng.randint(-4, 4))]
    for x in range(40, w + 40, 36):
        top2.append((x, brush_center_y - 22 + rng.randint(-12, 12)))
    bot2 = [(w + 20, brush_center_y + 22 + rng.randint(-4, 4))]
    for x in range(w, -40, -36):
        bot2.append((x, brush_center_y + 22 + rng.randint(-14, 14)))
    bd.polygon(top2 + bot2, fill=(*primary_rgb, 180))
    brush_layer = brush_layer.filter(ImageFilter.GaussianBlur(2.5))

    # --- Scratch streaks (thin silver lines at near-horizontal angles) ---
    for _ in range(9):
        x1 = rng.randint(0, w)
        y1 = rng.randint(0, h)
        length = rng.randint(80, 220)
        # Mostly horizontal-ish with some diagonal variety
        angle = rng.uniform(-0.35, 0.35) if rng.random() < 0.7 else rng.uniform(-math.pi / 3, math.pi / 3)
        x2 = x1 + int(math.cos(angle) * length)
        y2 = y1 + int(math.sin(angle) * length)
        d.line([(x1, y1), (x2, y2)],
               fill=(*accent_rgb, rng.randint(90, 160)),
               width=rng.randint(1, 3))

    # --- Light grit/spray for surface texture ---
    for _ in range(90):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        r = rng.randint(1, 3)
        color = rng.choice([accent_rgb, dark_rgb, dark_rgb])
        d.ellipse((x - r, y - r, x + r, y + r),
                  fill=(*color, rng.randint(120, 200)))

    # Composite — brush stroke under shards + outlines + grit
    card.alpha_composite(brush_layer)
    card.alpha_composite(layer)


# ──────────────────────────────────────────────────────────────────────────
# Torn-paper base (not used in current compose path; kept for future)
# ──────────────────────────────────────────────────────────────────────────

def paste_torn_paper_base(card: Image.Image, team: TeamConfig, y_frac: float = 0.70) -> None:
    """Irregular jagged base at bottom ~30% of card. Dark fill, zigzag top
    edge with 6-8 peaks of varying heights, grunge dot scatter, and a few
    accent-color splatter dots rising above the torn edge. Silhouette
    dissolves into this layer; name lockup sits on top."""
    w, h = CARD_W, CARD_H
    base_y = int(h * y_frac)

    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")

    rng = random.Random(47)

    # Generate 7 peaks across width with jitter (→ 6-8 effective, per plan)
    n_peaks = 7
    peaks: list[tuple[int, int]] = []  # (x, height_above_base)
    for i in range(n_peaks):
        base_x = int((i / (n_peaks - 1)) * w)
        jitter_x = rng.randint(-50, 50)
        x = max(20, min(w - 20, base_x + jitter_x))
        height_above = rng.randint(40, 130)
        peaks.append((x, height_above))

    # Build sawtooth polygon from bottom-left → jagged top → bottom-right
    points: list[tuple[int, int]] = [(0, h), (0, base_y + rng.randint(-10, 15))]
    prev_x = 0
    for peak_x, peak_h in peaks:
        valley_x = (prev_x + peak_x) // 2
        valley_y = base_y + rng.randint(-8, 25)
        peak_y = base_y - peak_h
        points.append((valley_x, valley_y))
        points.append((peak_x, peak_y))
        # Add a small dip immediately after the peak for texture
        dip_x = peak_x + rng.randint(8, 24)
        dip_y = peak_y + rng.randint(20, 45)
        points.append((dip_x, dip_y))
        prev_x = peak_x
    points.append((w, base_y + rng.randint(-10, 20)))
    points.append((w, h))

    fill_color = hex_rgba(team.dark, int(255 * 0.88))
    d.polygon(points, fill=fill_color)

    # Grunge: scattered dark specks inside the base
    for _ in range(360):
        sx = rng.randint(0, w)
        sy = rng.randint(base_y - 40, h)
        sr = rng.randint(1, 4)
        sa = rng.randint(60, 180)
        d.ellipse((sx - sr, sy - sr, sx + sr, sy + sr), fill=(0, 0, 0, sa))

    # A couple of brush-strike paths running near the base
    for _ in range(3):
        ys = rng.randint(base_y + 10, h - 30)
        x0 = rng.randint(-30, w - 150)
        pts = [(x0, ys)]
        x = x0
        while x < w + 30:
            x += rng.randint(60, 160)
            pts.append((x, ys + rng.randint(-16, 16)))
        d.line(pts, fill=(0, 0, 0, 110), width=rng.randint(2, 4))

    # Accent-color splatter bits rising above the torn edge — decorative
    primary_rgba = hex_rgba(team.primary, 215)
    for i, (peak_x, peak_h) in enumerate(peaks):
        if rng.random() < 0.55:
            sx = peak_x + rng.randint(-28, 28)
            sy = base_y - peak_h - rng.randint(15, 55)
            sr = rng.randint(3, 8)
            d.ellipse((sx - sr, sy - sr, sx + sr, sy + sr), fill=primary_rgba)

    card.paste(layer, (0, 0), layer)


# ──────────────────────────────────────────────────────────────────────────
# Subject placement — LOCKED across all variations
# ──────────────────────────────────────────────────────────────────────────

def paste_subject_centered(
    card: Image.Image, silhouette: Image.Image, *, offset_x: int = 0
) -> None:
    """Subject dominates ~92% of card height to hit the target 70-80% VISIBLE
    fill (the source figure has narrow hair + between-legs gap, so bbox height
    needs to exceed visual fill). Head sits just below the top frame, feet
    extend into the name-lockup overlap zone. `offset_x` shifts the subject
    horizontally — used by V3 to make room for a prominent mid-left logo."""
    target_h = int(CARD_H * 0.92)
    ratio = target_h / silhouette.height
    sil = silhouette.resize((int(silhouette.width * ratio), target_h), Image.LANCZOS)
    x = (CARD_W - sil.width) // 2 + offset_x
    y = int(CARD_H * 0.04)
    card.paste(sil, (x, y), sil)


# ──────────────────────────────────────────────────────────────────────────
# Logo — LOCKED top-left
# ──────────────────────────────────────────────────────────────────────────

def paste_logo_top_left(
    card: Image.Image,
    team: TeamConfig,
    scale: float = 0.18,
    position: tuple[int, int] | None = None,
) -> None:
    """Logo with configurable scale + position. Defaults to the top-left
    corner; compose functions can pass a custom (x, y) to move the logo off
    the corner (e.g. V2 drops into mid-left, V4 shifts right from the corner)."""
    if not team.logo_path.exists():
        return
    logo = Image.open(team.logo_path).convert("RGBA")
    target_px = int(CARD_W * scale)
    logo.thumbnail((target_px, target_px), Image.LANCZOS)
    if position is not None:
        x, y = position
    elif scale >= 0.22:
        x = int(CARD_W * 0.055)
        y = int(CARD_H * 0.035)
    else:
        x = int(CARD_W * 0.06)
        y = int(CARD_H * 0.04)
    _paste_rgba_with_shadow(card, logo, (x, y), shadow_alpha=150)


def _paste_rgba_with_shadow(
    card: Image.Image, layer: Image.Image, xy: tuple[int, int], *, shadow_alpha: int = 140
) -> None:
    if layer.mode != "RGBA":
        layer = layer.convert("RGBA")
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    shadow_layer.paste((0, 0, 0, shadow_alpha), (0, 0) + layer.size, layer.split()[3])
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(5))
    shadow.paste(shadow_layer, (xy[0], xy[1] + 4), shadow_layer)
    card.paste(shadow, (0, 0), shadow)
    card.paste(layer, xy, layer)


# ──────────────────────────────────────────────────────────────────────────
# Number treatments — 4 distinct, top-right placement locked
# ──────────────────────────────────────────────────────────────────────────

def _apply_distress_knockout(layer: Image.Image, seed: int = 7, intensity: float = 1.0) -> Image.Image:
    """Punch irregular holes out of glyphs via randomized dot + scratch mask.
    Multiplied into the layer's alpha so chunks are literally missing. Mirrors
    the grunge-inside-letters treatment on every reference player card."""
    w, h = layer.size
    rng = random.Random(seed)
    mask = Image.new("L", (w, h), 255)
    md = ImageDraw.Draw(mask)

    base_dots = int((w * h) / 1800 * intensity)
    for _ in range(base_dots):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        r = rng.randint(1, 4)
        md.ellipse((x - r, y - r, x + r, y + r), fill=0)
    for _ in range(int(base_dots * 0.08)):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        r = rng.randint(5, 11)
        md.ellipse((x - r, y - r, x + r, y + r), fill=0)
    for _ in range(rng.randint(int(6 * intensity), int(12 * intensity))):
        y = rng.randint(int(h * 0.1), int(h * 0.9))
        x1 = rng.randint(0, int(w * 0.3))
        x2 = rng.randint(int(w * 0.7), w)
        md.line([(x1, y + rng.randint(-4, 4)), (x2, y + rng.randint(-4, 4))],
                fill=0, width=rng.randint(1, 3))
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    alpha = layer.split()[3]
    new_alpha = ImageChops.multiply(alpha, mask)
    result = layer.copy()
    result.putalpha(new_alpha)
    return result


def _with_drop_shadow(
    layer: Image.Image, offset: tuple[int, int] = (0, 8), blur: float = 8.0, alpha: int = 180
) -> Image.Image:
    """Wrap a text layer with an offset soft drop shadow beneath."""
    mask = layer.split()[3]
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, alpha), (0, 0) + layer.size, mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    ow = layer.width + abs(offset[0])
    oh = layer.height + abs(offset[1])
    composite = Image.new("RGBA", (ow, oh), (0, 0, 0, 0))
    sx = max(0, offset[0]); sy = max(0, offset[1])
    lx = max(0, -offset[0]); ly = max(0, -offset[1])
    composite.paste(shadow, (sx, sy), shadow)
    composite.paste(layer, (lx, ly), layer)
    return composite


def render_number_v1_solid_outlined(
    text: str, size: int, fill_hex: str, stroke_hex: str, font_path: Path
) -> Image.Image:
    """V1: solid white fill + thick dark outline + drop shadow."""
    font = load_font(font_path, size)
    base = _text_layer(text, font, fill=hex_rgba(fill_hex),
                       stroke=hex_rgba(stroke_hex), stroke_w=int(size * 0.09))
    return _with_drop_shadow(base, offset=(0, 8), blur=7, alpha=170)


def render_number_v2_outlined_only(
    text: str, size: int, stroke_hex: str, font_path: Path
) -> Image.Image:
    """V2: outlined only, thinner stroke, no fill, no shadow."""
    font = load_font(font_path, size)
    return _text_layer(text, font, fill=(0, 0, 0, 0),
                       stroke=hex_rgba(stroke_hex), stroke_w=int(size * 0.06))


def render_number_v3_primary_fill(
    text: str, size: int, fill_hex: str, stroke_hex: str, font_path: Path
) -> Image.Image:
    """V3: solid team-primary fill + dark outline, NO drop shadow.
    Creates a "cutout" read against the primary background — the number only
    reads through its outline, which is the design intent."""
    font = load_font(font_path, size)
    return _text_layer(text, font, fill=hex_rgba(fill_hex),
                       stroke=hex_rgba(stroke_hex), stroke_w=int(size * 0.08))


def render_number_v4_rotated_cw_shadow(
    text: str, size: int, fill_hex: str, stroke_hex: str, font_path: Path
) -> Image.Image:
    """V4: solid white fill + dark outline + drop shadow, rotated ~10° CLOCKWISE
    for kinetic energy."""
    font = load_font(font_path, size)
    base = _text_layer(text, font, fill=hex_rgba(fill_hex),
                       stroke=hex_rgba(stroke_hex), stroke_w=int(size * 0.06))
    with_shadow = _with_drop_shadow(base, offset=(0, 8), blur=8, alpha=180)
    # PIL rotate(angle) is CCW-positive, so negative angle = clockwise.
    return with_shadow.rotate(-10, resample=Image.BICUBIC, expand=True)


def _text_layer(
    text: str,
    font: ImageFont.FreeTypeFont,
    *,
    fill,
    stroke,
    stroke_w: int,
) -> Image.Image:
    measure = Image.new("RGBA", (10, 10))
    md = ImageDraw.Draw(measure)
    bbox = md.textbbox((0, 0), text, font=font, stroke_width=stroke_w)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pad = max(int(font.size * 0.25), stroke_w + 6)
    layer = Image.new("RGBA", (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((pad - bbox[0], pad - bbox[1]), text, font=font,
           fill=fill, stroke_width=stroke_w, stroke_fill=stroke)
    return layer


def paste_number_top_right(card: Image.Image, number_layer: Image.Image) -> None:
    """Top-right corner. Stays in the narrow band ABOVE the silhouette's
    shoulder line (~top 140px) and right of center so the subject and number
    are both fully visible — never overlapping."""
    x = CARD_W - number_layer.width - 14
    y = 18
    card.paste(number_layer, (x, y), number_layer)


# ──────────────────────────────────────────────────────────────────────────
# Name lockup — script over block, 4 font pairings
# ──────────────────────────────────────────────────────────────────────────

def _build_name_lockup(
    first: str,
    last: str,
    first_font_path: Path,
    last_font_path: Path,
    first_size: int,
    last_size: int,
    first_fill: str,
    last_fill: str,
    stroke: str,
    last_stroke_w_frac: float,
    first_rotate: float,
    overlap_frac: float,
    last_treatment: Literal["solid", "outlined", "shadowed"] = "solid",
    shadow_color: str = "#000000",
    distress: bool = False,
    distress_seed: int = 7,
    distress_intensity: float = 1.0,
) -> Image.Image:
    """Assemble a script-over-block lockup. Script + block colors MUST differ
    (rule, not a variation axis). Optional distress punches grunge inside the
    block glyphs — matches the texture-inside-letterforms on every reference
    player card."""
    last_font = load_font(last_font_path, last_size)

    if last_treatment == "outlined":
        last_layer = _text_layer(
            last.upper(), last_font,
            fill=(0, 0, 0, 0), stroke=hex_rgba(last_fill),
            stroke_w=int(last_size * last_stroke_w_frac),
        )
    elif last_treatment == "shadowed":
        base = _text_layer(
            last.upper(), last_font, fill=hex_rgba(last_fill),
            stroke=hex_rgba(stroke), stroke_w=int(last_size * last_stroke_w_frac),
        )
        if distress:
            base = _apply_distress_knockout(base, seed=distress_seed, intensity=distress_intensity)
        alpha = base.split()[3]
        shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
        shadow.paste(hex_rgba(shadow_color), (0, 0) + base.size, alpha)
        shadow = shadow.filter(ImageFilter.GaussianBlur(6))
        last_layer = Image.new("RGBA", (base.width + 10, base.height + 14), (0, 0, 0, 0))
        last_layer.paste(shadow, (8, 12), shadow)
        last_layer.paste(base, (0, 0), base)
    else:
        last_layer = _text_layer(
            last.upper(), last_font, fill=hex_rgba(last_fill),
            stroke=hex_rgba(stroke), stroke_w=int(last_size * last_stroke_w_frac),
        )
        if distress:
            last_layer = _apply_distress_knockout(
                last_layer, seed=distress_seed, intensity=distress_intensity
            )

    first_font = load_font(first_font_path, first_size)
    first_layer = _text_layer(
        first, first_font, fill=hex_rgba(first_fill),
        stroke=hex_rgba(stroke), stroke_w=max(2, int(first_size * 0.03)),
    )
    first_layer = first_layer.rotate(first_rotate, resample=Image.BICUBIC, expand=True)

    overlap = int(last_layer.height * overlap_frac)
    total_w = max(first_layer.width, last_layer.width)
    total_h = first_layer.height + last_layer.height - overlap
    lockup = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    lockup.paste(last_layer, ((total_w - last_layer.width) // 2,
                              first_layer.height - overlap), last_layer)
    lockup.paste(first_layer, ((total_w - first_layer.width) // 2, 0), first_layer)
    return lockup


def render_name_v1(first: str, last: str, team: TeamConfig) -> Image.Image:
    """V1 — Bangers (distressed all-caps comic) + Oswald Bold varsity.
    LIGHT script over DARK block — cream over deep purple with distress."""
    return _build_name_lockup(
        first, last,
        first_font_path=BANGERS, last_font_path=OSWALD_BOLD,
        first_size=72, last_size=160,
        first_fill=team.accent, last_fill=team.dark, stroke=team.accent,
        last_stroke_w_frac=0.045, first_rotate=-4, overlap_frac=0.40,
        last_treatment="solid",
        distress=True, distress_seed=11, distress_intensity=0.9,
    )


def render_name_v2(first: str, last: str, team: TeamConfig) -> Image.Image:
    """V2 — Kalam Bold (bold handwritten) + Bungee OUTLINED-ONLY block.
    DARK script over CREAM outlined ring — matches V2 outlined-only number."""
    return _build_name_lockup(
        first, last,
        first_font_path=KALAM_BOLD, last_font_path=BUNGEE,
        first_size=66, last_size=146,
        first_fill=team.dark,     # script is DEEP PURPLE
        last_fill=team.accent,    # block stroke is CREAM (outlined-only)
        stroke=team.dark,
        last_stroke_w_frac=0.055, first_rotate=-3, overlap_frac=0.32,
        last_treatment="outlined",
        distress=False,
    )


def render_name_v3(first: str, last: str, team: TeamConfig) -> Image.Image:
    """V3 — Homemade Apple (classic marker) + Bowlby One ultra-bold.
    ACCENT script over PRIMARY-color block with heavy distress + thick dark outline.
    Heavy overlap — script cuts deep into block."""
    return _build_name_lockup(
        first, last,
        first_font_path=HOMEMADE_APPLE, last_font_path=BOWLBY_ONE,
        first_size=64, last_size=176,
        first_fill=team.accent,      # cream script
        last_fill=team.primary,       # purple block (on deep purple torn-paper base)
        stroke=team.dark,
        last_stroke_w_frac=0.055, first_rotate=-4, overlap_frac=0.65,
        last_treatment="solid",
        distress=True, distress_seed=23, distress_intensity=1.4,
    )


def render_name_v4(first: str, last: str, team: TeamConfig) -> Image.Image:
    """V4 — Luckiest Guy (bold cartoon) + Sigmar One slab, drop-shadow.
    CREAM script over DARK block with medium distress + shadow. (Previously
    used primary red for the script, which blended with the red backdrop —
    cream reads cleanly against all backgrounds.)"""
    return _build_name_lockup(
        first, last,
        first_font_path=LUCKIEST_GUY, last_font_path=SIGMAR_ONE,
        first_size=80, last_size=150,
        first_fill=team.light,        # cream script — contrasts on any bg
        last_fill=team.dark,          # deep dark block
        stroke=team.light,
        last_stroke_w_frac=0.04, first_rotate=-5, overlap_frac=0.55,
        last_treatment="shadowed", shadow_color=team.dark,
        distress=True, distress_seed=41, distress_intensity=0.85,
    )


def paste_name_lockup_bottom(
    card: Image.Image, lockup: Image.Image, offset_x: int = 0
) -> None:
    """Bottom, overlapping the torn-paper base. Vertical position locked;
    horizontal can be offset from center for per-variation kinetic layout
    (V2 offsets left, V4 offsets right)."""
    max_w = int(CARD_W * 0.90)
    if lockup.width > max_w:
        ratio = max_w / lockup.width
        lockup = lockup.resize((max_w, int(lockup.height * ratio)), Image.LANCZOS)
    x = (CARD_W - lockup.width) // 2 + offset_x
    y = CARD_H - lockup.height - int(CARD_H * 0.06)
    card.paste(lockup, (x, y), lockup)


# ──────────────────────────────────────────────────────────────────────────
# Chevrons + sparkles — LOCKED positions (TR + BL), 4 each
# ──────────────────────────────────────────────────────────────────────────

def _draw_chevron(
    d: ImageDraw.ImageDraw,
    cx: int, cy: int,
    size: int,
    direction: Literal["right", "left", "up", "down"],
    color_rgba: tuple[int, int, int, int],
    thickness: int,
) -> None:
    """One simple > / < / ^ / v mark centered at (cx, cy). Thin, clean."""
    half = size // 2
    if direction == "right":
        p1, p2, p3 = (cx - half, cy - half), (cx + half, cy), (cx - half, cy + half)
    elif direction == "left":
        p1, p2, p3 = (cx + half, cy - half), (cx - half, cy), (cx + half, cy + half)
    elif direction == "up":
        p1, p2, p3 = (cx - half, cy + half), (cx, cy - half), (cx + half, cy + half)
    else:  # down
        p1, p2, p3 = (cx - half, cy - half), (cx, cy + half), (cx + half, cy - half)
    d.line([p1, p2], fill=color_rgba, width=thickness)
    d.line([p2, p3], fill=color_rgba, width=thickness)


def paste_chevrons(card: Image.Image, accent_hex: str, variation: str) -> None:
    """Thin > marks with progressive-fade sequence (like the early SAFC
    sample: brightest at the start, each subsequent mark more faded).
    Placement kept well inside the inner frame — roughly 30px clearance from
    the frame border on every side. Uniform size per cluster. Thickness
    varies across variations: V1/V3 use 3px (sharper, cleaner), V2/V4 use
    4px (slightly thicker without going shaggy).
      V1 — top-center row + bottom-left row
      V2 — top-right vertical column + bottom-left row
      V3 — left-edge vertical column + bottom-right row pointing LEFT
      V4 — bottom-left row only (minimal, early-SAFC-style)
    """
    w, h = CARD_W, CARD_H
    d = ImageDraw.Draw(card, "RGBA")
    color_rgb = hex_rgb(accent_hex)

    # Frame border is at inset = 28px per draw_frame_and_wordmark. Keep
    # chevrons at least ~30px inside that so they don't touch or cross the
    # cream frame line.
    FRAME_INSET = 28
    SAFE_PAD = 32
    safe_left = FRAME_INSET + SAFE_PAD          # 60
    safe_right = w - FRAME_INSET - SAFE_PAD     # 740
    safe_top = FRAME_INSET + SAFE_PAD           # 60
    safe_bottom = h - FRAME_INSET - SAFE_PAD    # 1060

    def _alpha_for(i: int) -> int:
        """Progressive fade starting at 235, stepping down 30 per mark,
        floor at 110."""
        return max(110, 235 - i * 30)

    def row_fade(x_start: int, y: int, count: int, size: int,
                 direction: Literal["right", "left", "up", "down"],
                 thickness: int,
                 gap: int = 4, reverse_fade: bool = False) -> None:
        """Draw `count` chevrons in a horizontal row. First drawn is
        brightest; subsequent marks fade. If reverse_fade=True, the BRIGHTEST
        is drawn LAST (used when the row points LEFT and we want the
        brightest mark on the right/outer edge)."""
        alphas = [_alpha_for(i) for i in range(count)]
        if reverse_fade:
            alphas = list(reversed(alphas))
        for i in range(count):
            cx = x_start + i * (size + gap) + size // 2
            _draw_chevron(d, cx, y, size, direction,
                          (*color_rgb, alphas[i]), thickness)

    def col_fade(x: int, y_start: int, count: int, size: int,
                 direction: Literal["right", "left", "up", "down"],
                 thickness: int, gap: int = 4) -> None:
        """Vertical column, first drawn (top) is brightest, fading down."""
        for i in range(count):
            cy = y_start + i * (size + gap) + size // 2
            _draw_chevron(d, x, cy, size, direction,
                          (*color_rgb, _alpha_for(i)), thickness)

    if variation == "v1":
        # Top-center row (above the silhouette's head, between logo + number)
        row_fade(x_start=int(w * 0.40), y=safe_top + 8,
                 count=5, size=16, direction="right", thickness=3, gap=5)
        # Bottom-left row — the Leigha / SAFC-sample corner cluster
        row_fade(x_start=safe_left, y=safe_bottom - 22,
                 count=4, size=16, direction="right", thickness=3, gap=5)

    elif variation == "v2":
        # Top-right vertical column — a little thicker (4px)
        col_fade(x=safe_right - 4, y_start=int(h * 0.32),
                 count=5, size=18, direction="right", thickness=4, gap=6)
        # Bottom-left row
        row_fade(x_start=safe_left, y=safe_bottom - 22,
                 count=4, size=17, direction="right", thickness=4, gap=5)

    elif variation == "v3":
        # Top-left row pointing UP — placed above the prominent mid-left
        # logo in clear space so it doesn't collide with the logo, the
        # right-shifted silhouette, or the top-right number.
        row_fade(x_start=safe_left, y=safe_top + 12,
                 count=4, size=16, direction="up", thickness=3, gap=5)
        # Bottom-right row pointing LEFT — brightest mark on the outer
        # (right) side, fading inward toward the name
        row_fade(x_start=int(w * 0.80), y=safe_bottom - 22,
                 count=4, size=16, direction="left", thickness=3, gap=5,
                 reverse_fade=True)

    elif variation == "v4":
        # Minimal — just bottom-left row. Slightly thicker (4px) so this
        # single cluster has visual weight.
        row_fade(x_start=safe_left, y=safe_bottom - 22,
                 count=5, size=18, direction="right", thickness=4, gap=5)


def paste_plus_sparkles(card: Image.Image, accent_hex: str) -> None:
    """4 plus-sign sparkles in each of the 4 corners — LOCKED."""
    color = hex_rgba(accent_hex, 200)
    d = ImageDraw.Draw(card, "RGBA")
    rng = random.Random(11)

    def draw_plus(cx: int, cy: int, size: int) -> None:
        half = size // 2
        d.line([(cx - half, cy), (cx + half, cy)], fill=color, width=2)
        d.line([(cx, cy - half), (cx, cy + half)], fill=color, width=2)

    # Define four corner regions
    regions = [
        # (x_range, y_range)
        ((CARD_W * 0.02, CARD_W * 0.18), (CARD_H * 0.08, CARD_H * 0.24)),  # TL
        ((CARD_W * 0.78, CARD_W * 0.96), (CARD_H * 0.18, CARD_H * 0.28)),  # TR (offset from chevrons)
        ((CARD_W * 0.82, CARD_W * 0.96), (CARD_H * 0.80, CARD_H * 0.94)),  # BR
        ((CARD_W * 0.18, CARD_W * 0.28), (CARD_H * 0.80, CARD_H * 0.94)),  # BL (offset from chevrons)
    ]
    for (x_lo, x_hi), (y_lo, y_hi) in regions:
        for _ in range(4):
            cx = int(rng.uniform(x_lo, x_hi))
            cy = int(rng.uniform(y_lo, y_hi))
            sz = rng.randint(10, 18)
            draw_plus(cx, cy, sz)


# ──────────────────────────────────────────────────────────────────────────
# Frame + IMVI wordmark — LOCKED
# ──────────────────────────────────────────────────────────────────────────

def draw_frame_and_wordmark(card: Image.Image, light_hex: str) -> None:
    d = ImageDraw.Draw(card, "RGBA")
    inset = int(CARD_W * 0.035)
    frame_color = hex_rgba(light_hex, 210)

    # Wordmark: straight Oswald-Bold, tracked, sized for visibility.
    font = load_font(OSWALD_BOLD, 26)
    label = "IMVI"
    tracking = 3  # per-letter extra spacing for a wordmark feel
    glyph_widths = [d.textbbox((0, 0), ch, font=font)[2] for ch in label]
    tw = sum(glyph_widths) + tracking * (len(label) - 1)
    ascent, descent = font.getmetrics()
    th = ascent + descent

    frame_bottom_y = CARD_H - inset
    text_x = (CARD_W - tw) // 2
    text_y = frame_bottom_y - ascent // 2 - 1

    # Reserve a gap in the bottom frame line so the border doesn't cut
    # through the wordmark. Snapshot the background there, draw the full
    # frame, then paste the snapshot back to punch a hole in the border.
    gap_pad_x = 14
    gap_pad_y = 6
    gap_box = (
        max(inset - 4, text_x - gap_pad_x),
        frame_bottom_y - ascent // 2 - gap_pad_y - 2,
        min(CARD_W - inset + 4, text_x + tw + gap_pad_x),
        frame_bottom_y + descent // 2 + gap_pad_y + 2,
    )
    bg_snapshot = card.crop(gap_box).copy()

    d.rounded_rectangle(
        (inset, inset, CARD_W - inset, CARD_H - inset),
        radius=22, outline=frame_color, width=2,
    )

    # Restore the background strip so the bottom border reads as "broken"
    # on either side of the wordmark.
    card.paste(bg_snapshot, (gap_box[0], gap_box[1]))

    # Draw the wordmark straight (no shear) with per-letter tracking and a
    # soft shadow underneath for readability on busy backgrounds.
    shadow_fill = (0, 0, 0, 170)
    draw = ImageDraw.Draw(card, "RGBA")
    cursor_x = text_x
    for ch, gw in zip(label, glyph_widths):
        draw.text((cursor_x + 1, text_y + 1), ch, font=font, fill=shadow_fill)
        draw.text((cursor_x, text_y), ch, font=font,
                  fill=hex_rgba(light_hex),
                  stroke_width=1, stroke_fill=(0, 0, 0, 210))
        cursor_x += gw + tracking


# ──────────────────────────────────────────────────────────────────────────
# Composition — one orchestrator, all variations share layout
# ──────────────────────────────────────────────────────────────────────────

def _compose_locked(
    team: TeamConfig,
    silhouette: Image.Image,
    first: str,
    last: str,
    number: str,
    *,
    number_layer: Image.Image,
    name_lockup: Image.Image,
    variation: Literal["v1", "v2", "v3", "v4"],
    bg_style: Literal["v1", "v2", "v3", "v4"] | None = None,
    name_offset_x: int = 0,
) -> Image.Image:
    """Assemble a card. `variation` keys the chevron layout and logo
    placement. `bg_style` picks which background pattern to draw — defaults
    to matching the variation, but can be overridden to swap backgrounds
    between variations (e.g. V2 takes V4's bg for name-readability)."""
    effective_bg = bg_style if bg_style is not None else variation

    card = build_minimal_background(team)
    add_variation_background(card, team, effective_bg)
    # V3 shifts the subject right to clear space for a prominent mid-left logo.
    subject_offset_x = 70 if variation == "v3" else 0
    paste_subject_centered(card, silhouette, offset_x=subject_offset_x)
    # Per-variation logo sizing + position.
    if variation == "v1":
        paste_logo_top_left(card, team, scale=0.24)
    elif variation == "v2":
        # Bigger + shifted right so the logo sits roughly centered in the
        # gap between the frame (x=28) and the silhouette's torso edge
        # (x ≈ 290 at y=291). Scale 0.28 = 224px wide; x=47 puts the logo
        # center at x=159 — the midpoint of the 28-290 gap.
        paste_logo_top_left(
            card, team, scale=0.28,
            position=(47, int(CARD_H * 0.26)),
        )
    elif variation == "v3":
        # Much bigger than V2, brought down + right so it reads as a
        # prominent mid-card anchor sitting in the cleared left gap next
        # to the right-shifted silhouette.
        paste_logo_top_left(
            card, team, scale=0.38,
            position=(55, int(CARD_H * 0.23)),
        )
    elif variation == "v4":
        paste_logo_top_left(
            card, team, scale=0.20,
            position=(int(CARD_W * 0.12), int(CARD_H * 0.045)),
        )
    paste_number_top_right(card, number_layer)
    paste_chevrons(card, team.accent, variation)
    paste_name_lockup_bottom(card, name_lockup, offset_x=name_offset_x)
    draw_frame_and_wordmark(card, team.light)
    return card.convert("RGB")


def compose_v1(team: TeamConfig, silhouette: Image.Image,
               first: str, last: str, number: str) -> Image.Image:
    """V1 — splatter band (dense splatter top + bottom, clean middle).
    Bangers + Oswald Bold. Number: accent fill + dark outline + drop shadow."""
    num = render_number_v1_solid_outlined(
        f"#{number}", size=108,
        fill_hex=team.accent, stroke_hex=team.dark, font_path=OSWALD_BOLD,
    )
    lockup = render_name_v1(first, last, team)
    return _compose_locked(team, silhouette, first, last, number,
                            number_layer=num, name_lockup=lockup,
                            variation="v1")


def compose_v2(team: TeamConfig, silhouette: Image.Image,
               first: str, last: str, number: str) -> Image.Image:
    """V2 — number outlined only, name offset LEFT.
    Background SWAPPED to V4's broken-glass so the dark script + outlined
    block name lockup reads cleanly against the mostly-red-base bg."""
    num = render_number_v2_outlined_only(
        f"#{number}", size=112, stroke_hex=team.accent, font_path=BUNGEE,
    )
    lockup = render_name_v2(first, last, team)
    return _compose_locked(team, silhouette, first, last, number,
                            number_layer=num, name_lockup=lockup,
                            variation="v2", bg_style="v4", name_offset_x=-40)


def compose_v3(team: TeamConfig, silhouette: Image.Image,
               first: str, last: str, number: str) -> Image.Image:
    """V3 — torn-paper horizontal rip (top half primary, bottom half dark).
    Homemade Apple + Bowlby One. Number: primary fill + dark outline."""
    num = render_number_v3_primary_fill(
        f"#{number}", size=130,
        fill_hex=team.primary, stroke_hex=team.dark, font_path=STAATLICHES,
    )
    lockup = render_name_v3(first, last, team)
    return _compose_locked(team, silhouette, first, last, number,
                            number_layer=num, name_lockup=lockup,
                            variation="v3")


def compose_v4(team: TeamConfig, silhouette: Image.Image,
               first: str, last: str, number: str) -> Image.Image:
    """V4 — cream fill + dark outline + shadow number, rotated 10° CW.
    Name offset RIGHT. Background SWAPPED to V2's centered-dark-middle —
    cream script + dark block name lockup sits on the red bottom zone for
    high contrast readability."""
    num = render_number_v4_rotated_cw_shadow(
        f"#{number}", size=108,
        fill_hex=team.light, stroke_hex=team.dark, font_path=BOWLBY_ONE,
    )
    lockup = render_name_v4(first, last, team)
    return _compose_locked(team, silhouette, first, last, number,
                            number_layer=num, name_lockup=lockup,
                            variation="v4", bg_style="v2", name_offset_x=40)


# ──────────────────────────────────────────────────────────────────────────
# Top-level + CLI
# ──────────────────────────────────────────────────────────────────────────

def generate_card(
    *,
    first_name: str,
    last_name: str,
    jersey_number: int | str,
    team_key: str,
    variation: Variation,
    output_path: Path,
    silhouette_override: Path | None = None,
) -> Path:
    team = TeamConfig.load(team_key)
    sil_path = silhouette_override or team.default_silhouette
    if not sil_path.exists():
        raise FileNotFoundError(f"Silhouette missing: {sil_path}")
    silhouette = load_silhouette_gradient_fill(
        sil_path, team.accent, team.primary, team.dark
    )

    dispatch = {"v1": compose_v1, "v2": compose_v2, "v3": compose_v3, "v4": compose_v4}
    if variation not in dispatch:
        raise ValueError(f"Unknown variation: {variation}")
    card = dispatch[variation](team, silhouette, first_name, last_name, str(jersey_number))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    card.save(output_path, "PNG", optimize=True)
    return output_path


def _cli() -> None:
    p = argparse.ArgumentParser(description="IMVI card compositor — locked layout")
    p.add_argument("--first-name", required=True)
    p.add_argument("--last-name", required=True)
    p.add_argument("--number", required=True)
    p.add_argument("--team", required=True)
    p.add_argument("--variation", default="v1", choices=["v1", "v2", "v3", "v4"])
    p.add_argument("--silhouette", type=Path, default=None)
    p.add_argument("--output", required=True, type=Path)
    args = p.parse_args()

    out = generate_card(
        first_name=args.first_name,
        last_name=args.last_name,
        jersey_number=args.number,
        team_key=args.team,
        variation=args.variation,
        output_path=args.output,
        silhouette_override=args.silhouette,
    )
    print(f"→ Wrote {out}")


if __name__ == "__main__":
    _cli()
