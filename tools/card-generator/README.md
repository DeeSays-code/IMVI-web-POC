# IMVI card generator

A standalone Python + Pillow compositor that produces finished player trading
cards in the IMVI reference style. Takes:

- **Team** — colors, logo, default splatter texture (from `teams.json`)
- **Player photo** — a JPG/PNG, ideally with transparent background
- **Name + jersey number**

Outputs a single **800×1120 PNG** ready for print or digital display.

Matches the visual language of the Kevin-designed reference cards in the
project's `cards/` folder: photographic splatter texture backgrounds tinted
to team palette, top-center team logo, top-right jersey number, centered
athlete photo, dual-font name lockup (Caveat script + distressed Oswald
block), cream hairline frame, triple-chevron marker, and "IMVI" wordmark.

## Directory layout

```
tools/card-generator/
├── generate_card.py       # main compositor (library + CLI)
├── prep_assets.py         # one-time asset prep from reference cards
├── teams.json             # team presets (colors, logo, default texture)
├── requirements.txt       # Pillow
├── README.md              # this file
├── assets/
│   ├── fonts/             # Oswald-Bold, Oswald-Medium, Caveat-Bold TTFs
│   ├── logos/             # team logos (jpg/png)
│   └── textures/          # splatter textures (populated by prep_assets.py)
├── input/                 # player photos
│   └── leigha_ghafari.png # populated by prep_assets.py
└── output/                # generated cards
```

## Setup

```bash
# 1. Install Pillow
python3 -m pip install -r requirements.txt

# 2. Populate textures and the sample player photo from the reference cards.
#    prep_assets.py expects these upstream files to already exist:
#      /tmp/imvi-basecards/*.png       (base card PDFs rendered via sips)
#      /tmp/imvi-card-previews/leigha_hires.png
#    Re-render via sips if needed:
#      sips -s format png --resampleHeightWidthMax 1600 ... --out ...
python3 prep_assets.py
```

The fonts (`Oswald-Bold.ttf`, `Oswald-Medium.ttf`, `Caveat-Bold.ttf`) are
already committed under `assets/fonts/`. They were downloaded from
`fonts.gstatic.com`.

## Usage

```bash
python3 generate_card.py \
    --first-name "Leigha" \
    --last-name "Ghafari" \
    --number 7 \
    --team nxlvl \
    --player-image input/leigha_ghafari.png \
    --output output/leigha_nxlvl.png
```

Flags:

| Flag | Required | Purpose |
|---|---|---|
| `--first-name` | ✓ | Rendered in Caveat script (first name, mixed case) |
| `--last-name`  | ✓ | Rendered in Oswald block (UPPERCASE with distress knockout) |
| `--number`     | ✓ | Jersey number, will be prefixed with `#` |
| `--team`       | ✓ | Team key from `teams.json` (`nxlvl`, `pfa`, `safc`, `raiders`, `batrs`) |
| `--player-image` | ✓ | Path to player photo. PNG with alpha is ideal but a JPG works |
| `--texture`    | · | Override the team's default splatter texture |
| `--output`     | ✓ | Output PNG path |

## Library usage

```python
from pathlib import Path
from generate_card import generate_card

generate_card(
    first_name="Bryce",
    last_name="Opoku",
    jersey_number=3,
    team_key="pfa",
    player_image=Path("input/bryce.png"),
    output_path=Path("output/bryce_pfa.png"),
)
```

## Adding a new team

Edit `teams.json`:

```json
{
  "my_team": {
    "display_name": "My Team",
    "logo": "my_team.png",        // place in assets/logos/
    "colors": {
      "primary": "#HEX",          // dominant brand color (tints the bg)
      "accent":  "#HEX",          // jersey number + script first name + chevrons
      "dark":    "#HEX",          // deep shadow anchor + text strokes
      "light":   "#HEX"           // frame + IMVI wordmark + block last name
    },
    "default_texture": "splatter-05.png"
  }
}
```

`logo` is optional — if `null`, a team-color monogram disc is rendered.

## How the composition works

1. **Base canvas** filled with `colors.dark`.
2. **Splatter texture** (an 800×1120 PNG under `assets/textures/`) loaded,
   blurred slightly, then **luminance-remapped** to the team's palette curve
   (`dark → primary → accent` from shadows to highlights). Decouples the
   texture from its source card's colors. A thin 8% bleed of the original
   texture comes back in to preserve paint/grain character.
3. **Vignette** darkening at bottom (for name legibility) and a softer top
   darkening (for logo contrast).
4. **Player photo** scaled to fit the central 76%×60% zone and pasted with
   its alpha channel preserved.
5. **Team logo** pasted top-center at 22% of card width, with a soft shadow.
6. **Jersey number** rendered in Oswald Bold 220pt, filled with `accent`
   over a thick `dark` stroke, then affine-skewed -9° and drop-shadowed
   onto the top-right corner.
7. **Name lockup**:
   - *Last name*: Oswald Bold, uppercase, rendered with stroke + fill. Then
     run through a **distress knockout** pass — a generated grayscale mask
     with hundreds of dots + scratch lines is multiplied into the text's
     alpha channel to punch real chunks out of the letters. Skewed -8°.
   - *First name*: Caveat Bold with `accent` fill + `dark` stroke, rotated
     -5° and placed overlapping the top third of the block.
8. **Frame + footer**: cream rounded inner frame, decorative vertical ticks
   on right edge, triple-chevron marker bottom-left, italicized "IMVI"
   wordmark bottom-center.

## Sample outputs

After running setup + the commands below you'll have four Leigha cards
demonstrating the script's team-agnostic reuse:

```bash
for team in nxlvl pfa safc batrs; do
  python3 generate_card.py \
    --first-name "Leigha" --last-name "Ghafari" --number 7 \
    --team "$team" \
    --player-image input/leigha_ghafari.png \
    --output "output/leigha_${team}.png"
done
```

## Swapping in real cut-out photos

`prep_assets.py` extracts Leigha's body from her reference card with a
feathered alpha crop — lightweight, no ML. In production you'd supply real
cut-out PNGs from a photo pipeline (green-screen booth, `rembg`, or a
commercial cutout service). The compositor accepts any PNG with an alpha
channel — just drop it into `input/` and pass it as `--player-image`.

## Not in this script

- Back-of-card compositing
- Multi-page PDF export for print
- Automatic background removal (supply pre-cut photos)
- Team skin design tooling (that's the web portal's Design Workspace — see
  `src/screens/DesignWorkspace.tsx` in the parent project)
