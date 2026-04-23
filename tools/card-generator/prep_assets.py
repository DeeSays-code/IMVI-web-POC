"""
One-time asset preparation for the IMVI card generator.

Produces two deliverables from the high-res reference PDFs already rendered
to /tmp/imvi-basecards/ and /tmp/imvi-card-previews/:
  1. Splatter textures — middle crops of each team's base card, used as the
     photographic splatter backgrounds the compositor blends into new cards.
     Cards/logos/IMVI wordmark are cropped OUT so the texture is pure splatter.
  2. Player photo — a cutout of Leigha Ghafari extracted from her reference
     card, with feathered alpha so the edges fade into whatever new splash
     background she's composed over.

Run once before first use:
    python prep_assets.py
"""

from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw

HERE = Path(__file__).parent
BASECARDS_DIR = Path("/tmp/imvi-basecards")
LEIGHA_SRC = Path("/tmp/imvi-card-previews/leigha_hires.png")

TEXTURES_OUT = HERE / "assets" / "textures"
INPUT_OUT = HERE / "input"

# Proportional crop windows — each chosen as a small, genuinely text-free
# region of a base card (usually a corner or edge strip where only paint
# splatter lives). The crop is then scaled up to card proportions and blurred,
# which gives us painted texture energy with no readable source-card text.
# Each entry: (source_filename, (left_frac, top_frac, right_frac, bottom_frac))
TEXTURE_CROPS: list[tuple[str, tuple[float, float, float, float]]] = [
    ("NXLVL_CARD.png",              (0.05, 0.65, 0.45, 0.88)),  # bottom-left smoke+splatter
    ("Batrs_CARD.png",              (0.04, 0.04, 0.96, 0.22)),  # top edge yellow spray only
    ("PFA_CARD.png",                (0.04, 0.04, 0.36, 0.26)),  # top-left corner yellow burst
    ("BLUEPRINT_HOOPS_2_-_CARD.png",(0.62, 0.04, 0.98, 0.30)),  # top-right royal splatter
    ("CYBM_CARD.png",               (0.04, 0.68, 0.96, 0.92)),  # bottom edge orange/black splatter
    ("FIRE_-_CARD.png",             (0.04, 0.04, 0.96, 0.22)),  # top orange flames
    ("FOX_CREEK_CARD.png",          (0.04, 0.72, 0.96, 0.94)),  # bottom red brush band
    ("IV_ELITE_-_CARD.png",         (0.04, 0.78, 0.96, 0.94)),  # bottom pink confetti
    ("RAPIDS_COLORADO_CARD.png",    (0.04, 0.04, 0.36, 0.28)),  # top-left red/blue corner
]


def prep_textures() -> list[Path]:
    TEXTURES_OUT.mkdir(parents=True, exist_ok=True)
    produced: list[Path] = []
    for i, (name, frac) in enumerate(TEXTURE_CROPS, start=1):
        src = BASECARDS_DIR / name
        if not src.exists():
            print(f"[skip] {src} not present")
            continue
        img = Image.open(src).convert("RGB")
        W, H = img.size
        l, t, r, b = frac
        box = (int(W * l), int(H * t), int(W * r), int(H * b))
        crop = img.crop(box)
        # Resize the small crop up to full card size. The loss of detail at
        # upscale is intentional — helps obliterate any residual fine
        # typography while preserving large-scale paint character.
        crop = crop.resize((800, 1120), Image.LANCZOS)
        # Soft blur removes high-frequency artifacts (tiny text, jagged
        # compression noise) while keeping the brush/splatter feel intact.
        crop = crop.filter(ImageFilter.GaussianBlur(radius=1.6))
        out = TEXTURES_OUT / f"splatter-{i:02d}.png"
        crop.save(out, "PNG", optimize=True)
        produced.append(out)
        print(f"[ok]   {out.name:<20} from {name}")
    return produced


def prep_leigha_cutout() -> Path:
    """
    Crop Leigha's body from the high-res reference card and add a feathered
    alpha channel so the edges fade into transparency. No ML background
    removal — deliberately lightweight. The new compositor will place her
    over fresh splash backgrounds; the feather masks the original purple
    halo around her edges.
    """
    INPUT_OUT.mkdir(parents=True, exist_ok=True)
    src = LEIGHA_SRC
    if not src.exists():
        raise FileNotFoundError(f"{src} missing — render it first with sips")

    img = Image.open(src).convert("RGB")
    W, H = img.size

    # Body crop — narrowed so the original card's jersey #7, NxLVL wordmark,
    # and name lockup are excluded. We want just the head + torso region.
    crop_box = (int(W * 0.30), int(H * 0.19), int(W * 0.68), int(H * 0.66))
    body = img.crop(crop_box)
    cw, ch = body.size

    # Build a radial-ish alpha mask that's solid in the center, fades at edges.
    alpha = Image.new("L", (cw, ch), 255)
    draw = ImageDraw.Draw(alpha)
    # Inset ellipse to feather outside edges
    draw.ellipse(
        (-int(cw * 0.1), -int(ch * 0.05),
         int(cw * 1.1), int(ch * 1.05)),
        fill=255,
    )
    # Soften the edge
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=max(cw, ch) * 0.05))
    # Trim the mask at the very bottom so the legs fade out cleanly
    # (the bottom of the crop includes her arms/waist area).
    bottom_fade = Image.new("L", (cw, ch), 0)
    bd = ImageDraw.Draw(bottom_fade)
    for y in range(ch):
        if y < ch * 0.82:
            v = 255
        else:
            # linear ramp from 255 → 0 over the bottom 18%
            v = int(255 * max(0.0, (ch - y) / (ch * 0.18)))
        bd.line([(0, y), (cw, y)], fill=v)
    alpha = Image.fromarray(
        (
            (alpha.getdata())
        ),
    ) if False else alpha  # keep alpha as-is; merging via paste below
    alpha = _multiply(alpha, bottom_fade)

    body.putalpha(alpha)
    out = INPUT_OUT / "leigha_ghafari.png"
    body.save(out, "PNG", optimize=True)
    print(f"[ok]   {out.name} ({cw}×{ch})")
    return out


def _multiply(a: Image.Image, b: Image.Image) -> Image.Image:
    """Multiply two L-mode images pixel-wise (normalized to [0,1])."""
    from PIL import ImageChops
    return ImageChops.multiply(a, b)


def main() -> None:
    print("→ Preparing splatter textures")
    prep_textures()
    print("→ Preparing player photo")
    prep_leigha_cutout()
    print("Done.")


if __name__ == "__main__":
    main()
