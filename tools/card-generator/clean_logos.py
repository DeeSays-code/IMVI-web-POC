"""
Clean team logos — remove solid backgrounds so only the mark sits on a card.

Method: flood-fill from each corner with a color-distance tolerance. This
respects interior white/black areas of the logo (e.g. a white highlight
inside a crest) and only removes pixels that are CONNECTED to the edge.
Alpha is lightly blurred at the end to soften anti-aliased halos.

Run:  python clean_logos.py
Output: assets/logos/transparent/*.png
"""

from __future__ import annotations

from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
LOGOS_DIR = HERE / "assets" / "logos"
OUT_DIR = LOGOS_DIR / "transparent"

MARKER = (255, 0, 255)  # unlikely to appear in any team logo
DEFAULT_TOLERANCE = 42  # rgb-distance threshold for flood fill


def _sample_bg_color(img: Image.Image) -> tuple[int, int, int]:
    """Return the dominant color across the four corners + edge midpoints."""
    w, h = img.size
    rgb = img.convert("RGB")
    samples = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((w - 1, 0)),
        rgb.getpixel((0, h - 1)),
        rgb.getpixel((w - 1, h - 1)),
        rgb.getpixel((w // 2, 0)),
        rgb.getpixel((w // 2, h - 1)),
        rgb.getpixel((0, h // 2)),
        rgb.getpixel((w - 1, h // 2)),
    ]
    return Counter(samples).most_common(1)[0][0]


def _has_meaningful_alpha(img: Image.Image) -> bool:
    """True if the image already has >5% transparent pixels."""
    if img.mode != "RGBA":
        return False
    alpha = img.split()[3]
    w, h = img.size
    total = w * h
    n_transparent = sum(1 for v in alpha.getdata() if v < 250)
    return n_transparent > total * 0.05


def remove_background(
    src: Path, tolerance: int = DEFAULT_TOLERANCE
) -> Image.Image:
    img = Image.open(src).convert("RGBA")

    if _has_meaningful_alpha(img):
        return img

    w, h = img.size
    rgb = img.convert("RGB")
    bg = _sample_bg_color(img)

    # Flood fill from all four corners with the marker color.
    # Tolerance lets us grab anti-aliased edge pixels near the bg color.
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        corner_px = rgb.getpixel(corner)
        # Only fill if the corner actually matches the dominant bg (protects
        # against fills running off if the corner is already fg colored)
        if _rgb_dist(corner_px, bg) <= tolerance * 2:
            ImageDraw.floodfill(rgb, corner, MARKER, thresh=tolerance)

    # Build new alpha: marker pixels -> transparent, else opaque
    marker_mask = Image.new("L", (w, h), 0)
    marker_mask.putdata(
        [0 if px == MARKER else 255 for px in rgb.getdata()]
    )

    # Soften edges with a tiny blur so anti-aliased halos don't look jagged
    marker_mask = marker_mask.filter(ImageFilter.GaussianBlur(radius=0.7))

    r, g, b, _ = img.split()
    return Image.merge("RGBA", (r, g, b, marker_mask))


def _rgb_dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    srcs = [
        p for p in LOGOS_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in (".png", ".jpg", ".jpeg")
    ]
    if not srcs:
        print(f"No logo files found in {LOGOS_DIR}")
        return
    for src in sorted(srcs):
        dst = OUT_DIR / (src.stem + ".png")
        try:
            cleaned = remove_background(src)
            cleaned.save(dst, "PNG", optimize=True)
            bg = _sample_bg_color(Image.open(src).convert("RGB"))
            print(f"[ok] {src.name:<22} bg={bg} -> transparent/{dst.name}")
        except Exception as exc:
            print(f"[fail] {src.name}: {exc}")


if __name__ == "__main__":
    main()
