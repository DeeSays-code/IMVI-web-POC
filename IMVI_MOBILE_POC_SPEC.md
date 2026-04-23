# IMVI Mobile App — POC Build Specification

**Version:** 1.4
**Date:** April 2026
**Audience:** Engineering (Claude Code build prompt)
**Scope:** Proof-of-Concept clickable prototype
**Related artifacts:** `imvi-moodboard.html` (design language reference), `IMVI_WEB_PORTAL_POC_SPEC.md` (web portal — kid management, card design, registration)

---

### Changelog

**v1.4 — April 21, 2026 — Feed category strip tightened to four tabs**
- Section 4.6.1 now specifies four category tabs: **For you · Leaderboard · Trending · IMVI Awards**. "Your club" is dropped.
- **Trending** is a visible placeholder only. Rendered in the strip with a muted color + "SOON" marker next to the label. Not tappable for POC — the tab does not activate, does not change content.
- The three active tabs (For you, Leaderboard, IMVI Awards) each own a distinct content layout:
  - **For you** — default. Standard feed: leaderboard top-5 strip + per-athlete feed cards.
  - **Leaderboard** — dedicated global-leaderboard list view with a link-out to the Awards experience for per-category rankings.
  - **IMVI Awards** — the three-layer tab takeover (§4.6.2). Unchanged.

**v1.3 — April 21, 2026 — IMVI Awards tab-takeover experience**
- Rewrote Section 4.6 (Feed tab) to introduce a dedicated three-layer IMVI Awards experience. Tapping "IMVI Awards" in the Feed category strip replaces the feed content area (header + category strip remain) with a vertical-scroll longform page composed of Layer 1 — The Gate (cinematic title moment), Layer 2 — The Categories (spotlight leader card + positions #2-#10 list, per category; three categories minimum), and Layer 3 — The Ceremony (aspirational closing section with venue + "Save the date" CTA).
- Replaced the prior Feed category list with a tighter five-item strip: For you · Leaderboard · Your club · Trending · IMVI Awards. "For you" is the default.
- Architecture note: the Awards view is a content-area swap inside the Feed tab — not a separate route. State-managed like any other category filter.

**v1.2 — April 20, 2026 — Sponsorship model**
- Added Section 2.7: sponsorship model architectural decision. Sponsors attach to athletes, not to individual moments/videos. Documented where sponsors appear (Home, Feed, card back) and where they do not (Moments tab, video players).

**v1.1 — April 20, 2026 — Session 1 lock**
- Typography: dropped Orbitron entirely. Two-font system: Oswald (display + data) and Inter (body). Documented weight/spacing patterns.
- Added AppHeader as a new persistent component (Section 3.2.1). Kid switcher now lives inside AppHeader, not as a standalone row.
- Added content prohibitions section (2.5.2a): time-of-day greetings, "Hey [name]" patterns, and motivational filler are stakeholder-locked as banned.
- Updated Home layout (Section 4.4) to match built code: hero card → caption + sponsor scroll → latest moment → 4-column stats row with vote CTA → awards banner.
- Updated mock data (Section 5): two real kids (Leigha with full data, Zain as visual-only), parent name is "Amer Ghafari."
- Updated phone frame spec (Section 2.4): Dynamic Island replaces notch, frame border color is `#0e0e0e`, status bar is transparent overlay.
- Updated file structure (Section 10) to match actual codebase after Session 1 audit.
- Updated kid switcher spec (Section 3.2.1): all avatars 34px uniform size, no "Add kid" tile in UI.
- Updated active tab indicator: 3px brushed-gold metallic gradient bar replaces flat 2px gold-3 line.
- Updated player card dimensions: 180×252px, no flip indicator dots.

---

## 1. Context and intent

### 1.1 What this POC proves
This is a **clickable frontend prototype** — no backend, no real auth, no real AR, no real video transcoding. Its only job is to demonstrate, in a live demo to Kevin (IMVI founder), that:

1. The current IMVI app's UX can be replaced with a modern, mobile-first, tab-navigated experience
2. The parent-managing-multiple-kids identity model works in practice
3. The hero moment (scan → moment plays back) can feel like a premium broadcast experience, not a utility
4. IMVI's future vision (social engagement, leaderboards, IMVI Awards, AR-at-venues) has a credible home inside the app
5. The brand direction from the approved moodboard translates into real working UI

### 1.2 What this POC explicitly does NOT do
- No real authentication (magic link is simulated — visible email submission, then a "check your email" screen, then a tap-to-proceed)
- No real AR scanning (viewfinder is a visual simulation; card detection is triggered by a timer)
- No real video streaming (videos are either short local clips or YouTube embeds, loaded on demand)
- No registration flow (lives in the web portal POC — see `IMVI_WEB_PORTAL_POC_SPEC.md`)
- No card design / creation flow (lives in the web portal POC)
- No kid management / adding kids (lives in the web portal POC)
- No bulk operations, admin features, or media library management (lives in the web portal POC)
- No backend data persistence (state is held in React, resets on reload)

### 1.3 The reference architecture
The existing IMVI app has a hamburger-menu pattern that fails on mobile. The meeting notes name **Rematch** (youth sports capture app) as the UX reference model. Rematch uses a bottom tab bar with Capture / Gallery / Clips / My Dashboard. We adapt this structure to IMVI's scope — IMVI does not capture live video, so "Capture" is replaced with a **Home** tab, and scanning is handled as a floating action button persistent across all tabs.

---

## 2. Brand and design language

### 2.1 Design tokens (pull from moodboard)

```
COLORS
--ink:          #0A0A0A   Primary canvas. Not pure black — has undertone so gold catches light.
--ink-2:        #111111   Elevated surfaces (cards, modals, tab bar)
--ink-3:        #1A1A1A   Input fields, pressed states
--bone:         #F5F1E8   Primary text and iconography on dark
--bone-muted:   #A8A399   Secondary text, timestamps, meta info
--gold-1:       #5C4620   Darkest gold stop
--gold-2:       #8B6A2F
--gold-3:       #C9A24E   Primary gold (accents, indicators)
--gold-4:       #E8C472   Bright gold (hover states, highlights)
--gold-5:       #FCE6A3   Lightest gold (specular sweep)
--live-red:     #E53935   Utility only — live indicators, alerts, destructive actions
--brushed-gold: linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)

TYPOGRAPHY (two-font system)
--font-display: 'Oswald', 'Bebas Neue', system-ui, sans-serif
  Display role: 700 for headlines, 500 for subheads and labels
  Data role: 700 for large numbers (stats), 500 uppercase with wide letter-spacing for small labels and timestamps
--font-body:    'Inter', -apple-system, system-ui, sans-serif
  300 for body text and secondary info, 400 for standard text, 500 for emphasis

Oswald weight and spacing patterns:
  Headlines (card caption, awards title):     Oswald 500-700, 18-22px, letter-spacing 0.01-0.02em
  Large numbers (stat counts):                Oswald 700, 20-24px, letter-spacing 0em (tight)
  Small caps labels (LATEST MOMENT, VIEWS):   Oswald 500, 9-10px, letter-spacing 0.25em, uppercase
  Kid name labels (avatar labels):            Oswald 500, 9px, letter-spacing 0.12em, uppercase
  Small numbers/timestamps (duration, ranks): Oswald 500, 11px, letter-spacing 0.05em
  Parent name indicator:                      Oswald 500, 13px, letter-spacing 0.04em, uppercase

Production recommendation (not in POC): replace Oswald with Druk Wide or Monument Extended.
Both are on Kevin's font list and carry more editorial weight.

SPACING (mobile)
--space-xs:  4px       --space-sm:  8px       --space-md:  16px
--space-lg:  24px      --space-xl:  32px      --space-2xl: 48px

RADII
--radius-sm: 4px       --radius-md: 8px       --radius-lg: 12px       --radius-xl: 20px
card-radius: 14px      phone-frame-radius: 44px
```

### 2.2 Motion principles
- **Ease, never bounce.** Transitions use `cubic-bezier(0.19, 1, 0.22, 1)` or `cubic-bezier(0.4, 0, 0.2, 1)`. Never spring curves.
- **Gold catches light.** On hover/tap of gold surfaces, a subtle specular sweep crosses left-to-right, 800ms. Never glow, never pulse.
- **Cards have weight.** Front-to-back flip is a 3D rotation (600ms, ease-out), with the content crossfade starting at 50% of the rotation so the physics read first.
- **Stage lighting reveals.** Hero moments (card reveal after scan, welcome state) fade in from black through a gold-floor radial gradient.
- **Tab transitions.** Horizontal slide, 220ms ease-out. No vertical stacks.
- **Vote celebration.** Tapping the Vote CTA triggers a gold confetti burst — 28 thin rectangular strips in gold-3/gold-4/gold-5/bone, bursting outward from center with rotation, lasting ~1.5s. No emoji. No radial rings.

### 2.3 Component conventions
- **Buttons**
  - Primary: gold-brushed background, ink text, 48px height, 12px radius, uppercase Oswald 600, letter-spacing 0.04em
  - Secondary: 1px gold-3 border, transparent bg, gold-3 text, same dimensions
  - Tertiary (text only): bone text, no bg, no border, 16px Inter 400
  - Destructive: live-red fill, bone text
- **Tab bar**: 72px height (56px content + safe area), ink-2 bg, 1px top border using gold-3 at 12% opacity
- **Active tab indicator**: 3px brushed-gold metallic gradient bar (same 7-stop gradient as FAB), 36px wide, above the active tile. Not a flat color.
- **Cards** (IMVI player cards): 2.5:3.5 aspect ratio, 14px radius, tappable, shadow for depth. Rendered at 180×252px on Home.
- **Kid avatar**: 34px circular, initial letter in Oswald 700 13px. Active: 2px gold-3 ring, gold-3 text. Inactive: 1.5px subtle border, bone-muted text. Name label below in Oswald 500 9px uppercase.
- **FAB (scan button)**: 64px diameter, gold-brushed fill, centered in the bottom nav bar notch (raised above tab bar by 20px)
- **Icons**: split between custom SVGs (brand-expressive) and Lucide-react (functional UI). See Section 2.6 for the full map. Stroke width 1.5 for tab icons, 2 for inline UI icons. **Never use emoji as icons.**
- **Toast**: ink-2 bg at 95% opacity, 1px gold-3 border at 30% opacity, 14px border-radius, 14px/20px padding. Gold accent bar (4px wide) on left edge. Inter 400 13px bone text. Scale-up entrance animation.

### 2.4 Container / phone frame
The app renders inside a visible iPhone-style device frame on desktop, so the demo feels like an app, not a webpage:
- Outer frame: 375×812 viewport (iPhone standard)
- Frame wall: 8px `#0e0e0e` border, 44px outer radius. Border color matches the AppHeader's top gradient stop for seamless integration.
- Dynamic Island: 120×28px rounded pill centered at top, 10px from top edge, `#0e0e0e` fill
- Status bar: 50px tall transparent overlay (z-40). Shows time (9:41), signal bars, gold-3 accent dot, battery icon. No background — the AppHeader's visual treatment shows through behind the status bar elements.
- Subtle drop shadow: `0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px rgba(201,162,78,0.12)` — the gold glow is intentional, reinforcing brand atmosphere

On mobile browsers, the frame should be suppressed and the app should fill the viewport.

### 2.5 Design quality bar (non-negotiable)

**This section is the contract.** If the build doesn't meet these, it's not done — regardless of whether every feature works.

#### 2.5.1 Required before writing any styling code
- **Load the `frontend-design` skill before touching any CSS, Tailwind classes, or component visual work.** The skill exists specifically to push against generic-AI aesthetics. Read it, internalize its guidance, then apply.
- Read `imvi-moodboard.html` in full and study how the brand is expressed there. **The moodboard is the source of truth.** Any deviation from its treatment is a regression and must be justified with explicit reasoning before being made.

#### 2.5.2 Anti-patterns — do not produce any of these
- **Generic SaaS dashboard aesthetic** — white cards on gray backgrounds, blue primary buttons, Roboto/Inter-only typography stacks, generic form patterns
- **Tech-startup gradient palette** — purple-to-pink gradients, blue-to-teal gradients, rainbow hero sections
- **System font fallbacks as final typography** — if Oswald fails to load, don't fall back to Arial and call it done; fix the font pipeline
- **Lucide icons used unmodified for brand moments** — see Section 2.6; brand-expressive slots need custom SVGs
- **Emoji as icons or in any UI text** — no emoji anywhere in the app, including toasts, labels, badges, or decorative elements
- **Rounded rectangles everywhere** — use the specified radii per component; don't apply 12px radius to everything by default
- **Button-style "card" links** that look like filled buttons — cards are not buttons
- **Light-mode defaults** — this is a dark-theme app; there is no light mode in the POC
- **Hardcoded hex values outside the token file** — every color must reference a token; no `#fff` or `#000` inline. Exception: SVG gradient `stopColor` attributes cannot use CSS variables and must use literal hex values matching the token definitions.
- **"Placeholder" text like Lorem Ipsum** — use real copy from this spec; where copy isn't specified, write something that fits the brand voice
- **Motion treated as decoration** — every animation must have a purpose from Section 2.2; no bouncing, no pulsing glows, no gratuitous scale-wiggles
- **Section divider lines** between content areas on mobile screens — these create a web-page feel, not an app feel. Use spacing and background color changes to separate sections instead.

#### 2.5.2a Content prohibitions (stakeholder-locked — do not reintroduce)
The following content patterns have been explicitly reviewed and rejected during Session 1. They are permanently banned from the POC:
- **Time-of-day greetings**: "Good morning," "Monday evening," "Tuesday morning," or any dynamic greeting based on time/day
- **"Hey [name]" greetings**: "Hey, Amer" or similar casual greeting patterns anywhere in the UI
- **Motivational filler copy**: "Your kid is doing great," "Welcome back," or similar generic encouragement
- **Full standalone name displays**: The parent's full name ("Amer Ghafari") as a standalone greeting element. The compact first-name indicator ("AMER") in the AppHeader is the approved pattern.

#### 2.5.3 Required brand expressions — these must be present
- **Brushed-gold gradient as a real CSS gradient** wherever "gold" is referenced (logo, accents, primary buttons, active tab indicator). Not a flat `#C9A24E` fill.
- **The gold floor-fade** — the radial atmospheric gradient from the imvi.me site must appear on Home. Radial gradient anchored to the bottom of the content area, glowing upward: `radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.35) 0%, rgba(139, 106, 47, 0.15) 35%, transparent 70%)`. It is the brand's signature stage-lighting effect.
- **Oswald for all display type and data surfaces**, not system fonts. Web-loaded via self-hosted WOFF2, `font-display: block`. Weight 700 for headlines and large numbers, 500 for subheads and labels.
- **The chevron device** (the `›` cluster from the card corners) must appear as a subtle motif somewhere in the app chrome. Currently used on the IMVI Awards banner as a tappable indicator alongside the ChevronRight icon.
- **Specular sweep animation** on gold surfaces — 800ms left-to-right highlight band, not a glow. Applied via the `.specular-sweep` CSS class.
- **Real card images** used as card renderings — not CSS approximations. The card PDFs are the actual art; embed them as `<img>`.

#### 2.5.4 Self-review checklist before claiming done
Before marking the build complete, walk through the app and verify — out loud, one by one:

1. Does the Splash screen feel like the curtain rising on a broadcast, or a login screen? It should be the former.
2. Does the Home hero card feel like a premium collectible object with weight, or a rectangular UI element? The former.
3. Does tapping the scan FAB feel like triggering a camera, or opening a modal? The former.
4. Do the numbers (stats, counts, ranks) feel like broadcast chyrons, or body text? The former.
5. Does the IMVI Awards banner feel aspirational and premium, or like an advertisement? The former.
6. Does the gold look metallic, or like a flat yellow-brown? It must look metallic.
7. Does every icon feel brand-specific where it matters, or are all icons off-the-shelf? Brand-specific where specified.
8. When you switch between kids, does the transition feel considered, or abrupt? Considered.
9. Does the app feel premium from first glance, or does it feel like a prototype? Premium.

If any answer lands on the wrong side, the build isn't done — iterate.

### 2.6 Custom iconography

Not every icon gets drawn custom — that would waste time on icons nobody notices. The rule is: **brand-expressive slots get custom SVGs; functional UI uses Lucide.**

#### 2.6.1 Custom SVG icons (must be drawn, not pulled from a library)

| Icon | Where it appears | Design brief |
|---|---|---|
| **IMVI logo** | AppHeader (left position) | Oswald 700, 30px height, rendered as SVG `<text>` with brushed-gold gradient fill via `<linearGradient>`. Subtle gold halo behind via radial gradient. |
| **Scan reticle** | The FAB icon, scan viewfinder corners | Four L-shaped corners forming an open rectangle with a center dot. Stroke 2px, color varies by context (ink on FAB, gold-3 on viewfinder). |
| **Chevron device** | IMVI Awards banner | Three overlapping chevron strokes with brushed-gold gradient fill at cascading opacity (0.3, 0.6, 1.0). Used as a brand motif alongside navigation chevrons. |

#### 2.6.2 Lucide-react acceptable for

- Tab bar icons: `Home`, `Clapperboard`, `TrendingUp`, `UserCircle`
- Bell icon with notification dot (AppHeader)
- `ChevronRight` (IMVI Awards banner tappable indicator)
- `Star` (Vote CTA tile, filled gold-3)
- Back arrows, close/dismiss, menu dots, input clears
- Simple utility glyphs — gear, etc., for rows in Me tab

#### 2.6.3 Icon sizing system
- **Tab bar icons:** 24px square, strokeWidth 1.5
- **Inline UI icons:** 20px square
- **Small utility icons:** 16px square (bell in AppHeader)
- **Brand-expressive icons (logo, reticle):** scale to context — logo is 30px tall in AppHeader, scan reticle is 28px in FAB
- **Decorative chevron device:** 14px tall

### 2.7 Sponsorship model

Sponsors are attached to the **athlete** (or their team/club), not to individual moments or videos. This is an architectural decision that affects every surface where sponsors appear.

**Core principle:** A sponsor "backs" an athlete — typically for a season or year. The sponsorship relationship is athlete-scoped, not content-scoped. There is no "presented by" treatment on individual videos, clips, or moments.

**Where sponsors appear:**

| Surface | Behavior |
|---|---|
| **Home** (card caption area) | Scrolling "SPONSORED BY" strip shows the selected athlete's sponsors. This is the primary sponsor placement. |
| **Feed tab** (Session 2) | Each feed item surfaces the featured athlete's sponsors using the same sponsor-strip pattern, scoped to that athlete — not to the video itself. |
| **Physical card back** | Sponsors live on the card natively (Kevin's existing card design handles this). |
| **Moments tab** (Session 2) | Individual videos do NOT show sponsors. The Moments tab is a media library, not a sponsor surface. |

**Where sponsors do NOT appear:**
- On individual video players or moment detail screens
- As per-video "brought to you by" overlays
- On the Latest Moment preview card on Home (that card shows the video, not the sponsorship)

**Web portal assignment:** In the IMVI web portal, sponsors are assigned at the athlete/club level, not at the content level. See `IMVI_WEB_PORTAL_POC_SPEC.md` for the sponsor management interface.

---

## 3. App architecture

### 3.1 Navigation model

```
┌─────────────────────────────────────────────────────────────────┐
│                         SPLASH / ENTRY                          │
│  [Log in with magic link]       [Scan a card]                   │
└───────────────────┬─────────────────────────────────────────────┘
                    │                    │
          ┌─────────▼────────┐  ┌────────▼─────────┐
          │  Magic link flow │  │   AR Scan flow   │
          │  (2 screens)     │  │   (2 screens)    │
          └─────────┬────────┘  └────────┬─────────┘
                    │                    │
                    └──────────┬─────────┘
                               │
                ┌──────────────▼──────────────┐
                │   AUTHENTICATED APP SHELL   │
                │                             │
                │  [AppHeader — persistent]   │
                │                             │
                │  ┌─────────────────────┐    │
                │  │    Active screen    │    │
                │  │                     │    │
                │  │                     │    │
                │  │                     │    │
                │  └─────────────────────┘    │
                │                             │
                │  [Scan FAB — overlay]       │
                │                             │
                │  ┌─────────────────────┐    │
                │  │ Tab Bar (4 tabs)    │    │
                │  │ Home Moments Feed Me│    │
                │  └─────────────────────┘    │
                └─────────────────────────────┘
```

### 3.2 Persistent elements (visible on every authenticated screen)

#### 3.2.1 AppHeader (top of screen, extends behind status bar)

A branded header bar that extends from the very top of the phone frame (pixel y=0) through the status bar zone and down to the content area. The status bar elements (9:41, signal, battery) sit on top of the header's visual treatment.

**Visual treatment:**
- Background: vertical gradient from `#0e0e0e` (matching frame border) through `#131110` to `#1a1610` (gold-tinged)
- Asymmetric gold spotlight: radial gradient from top-left at 22% opacity
- Secondary warm wash: radial gradient from bottom-right at 10% opacity
- Fine gold grain texture overlay for materiality
- Gold atmospheric glow bleeds 32px below the header's bottom edge

**Total height:** ~96px (50px status bar zone + ~46px content zone)

**Content layout (single row, 6px/14px/10px padding):**
- **Left:** IMVI logo (SVG, 30px height, brushed-gold gradient fill, subtle gold halo behind)
- **Center:** Kid avatars — horizontal row of `KidAvatar` components. Only real kids shown (no "Add kid" tile). Each avatar is 34px with name label below. Active kid has gold-3 ring, inactive has subtle border.
- **Right:** Parent first-name indicator ("AMER" in Oswald 500 13px uppercase bone) + bell icon (16px, bone-muted) with gold-3 notification dot

**Kid switching:** Tapping an avatar in the header switches the app's context. All data on all tabs reflects the newly-selected kid. The avatar name labels animate between active/inactive states via Framer Motion.

**Adding kids:** Not available in the mobile app. Kid management lives in the IMVI web portal (see `IMVI_WEB_PORTAL_POC_SPEC.md`).

#### 3.2.2 Scan FAB (floating action button)
- Centered horizontally, vertically anchored to the tab bar with 20px raise above it
- 64px circle, brushed-gold gradient fill with metallic texture overlay, scan-reticle icon in ink
- Subtle pulse animation on ambient state (2s cycle, scale 1.0 → 1.04 → 1.0, opacity 1.0 → 0.95 → 1.0)
- Tapping opens the AR scan flow as a full-screen overlay (dismissible). In Session 1, tapping shows a toast: "Scan flow arriving in Session 2."
- Tab bar wraps around FAB with a notch cutout

#### 3.2.3 Tab Bar (bottom)
- 4 tabs: Home | Moments | [FAB slot] | Feed | Me
- Actually 5 slots in layout, middle slot reserved for FAB overlay — the FAB visually sits above the tab bar but occupies the middle position
- Tab icons: Lucide `Home`, `Clapperboard`, `TrendingUp`, `UserCircle` at 24px, strokeWidth 1.5
- Tab label (10px Inter 500 uppercase, letter-spacing 0.1em) below icon
- Active tab: gold-3 icon + gold-3 label + 3px brushed-gold metallic gradient bar on top edge of tile (36px wide, same 7-stop gradient as FAB)
- Inactive: bone-muted icon + bone-muted label

---

## 4. Screen specifications

### 4.1 Entry — Splash screen

**Purpose:** First impression of brand before the user chooses a path.

**Layout:**
- Full ink background with gold-floor radial gradient anchored to bottom (same atmospheric effect as the imvi.me marketing site)
- IMVI wordmark in brushed-gold, centered vertically, Oswald 700, 72px, letter-spacing 0.1em
- Small tagline below in Inter 300 13px bone-muted: "Youth sports, seen."
- Two buttons stacked near the bottom, 32px apart:
  - Primary: "Log in with magic link" — gold-brushed fill
  - Secondary: "Scan a card" — transparent, gold-3 border
- Footer micro-copy at very bottom (11px Oswald 500 bone-muted, letter-spacing 0.2em uppercase): "v1.0 · Proof of Concept"

**Motion:** On load, wordmark fades in first (300ms), gold floor fades in (600ms delayed 200ms), buttons stagger in from below (each 400ms, delayed 800ms and 950ms).

---

### 4.2 Entry — Magic Link flow

**Two screens, sequential.**

#### Screen A: Email input
- Top: small back arrow (top-left)
- Headline: "Welcome back." — Oswald 700, 36px, bone
- Sub: "Enter your email and we'll send you a magic link." — Inter 300, 15px, bone-muted, max 280px wide
- Single input field: email, ink-3 bg, 1px bone-muted border at 20% opacity, 52px tall, 16px Inter 400 bone text
- Primary button: "Send magic link" — full width, gold-brushed
- Disabled until email has an @ and a .

#### Screen B: Check your email (simulated)
- Full screen takeover after tap
- Centered brushed-gold envelope icon (Lucide Mail, 64px, gold gradient stroke)
- Headline: "Check your email." — Oswald 700, 32px, bone
- Sub: "We sent a link to [email]. Tap it to sign in." — Inter 300, 15px, bone-muted
- Simulated state — after 2 seconds, a gold pill appears at bottom: "Simulated for demo: tap to continue"
- Tapping the pill lands user in the authenticated app (Home tab, kid = Leigha)
- A Toast on landing: "Signed in" — 2 second fade

**Demo note:** This is the only place simulation is explicitly called out in the UI. Intentional — it signals "we know this is a prototype, we didn't pretend otherwise."

---

### 4.3 Entry — Scan flow

**Two screens, sequential.**

#### Screen A: AR viewfinder (ambient)
- Full black background
- Viewfinder rectangle centered: 280×392px (2.5:3.5 ratio matching a card), 1.5px gold-3 border
- Four corner reticles (18×18px L-shapes) in gold-3 at each corner, 12px inset from viewfinder
- Status pill top-center: "AR READY" in Oswald 500 10px gold-3 uppercase with live-red dot prefix
- Bottom hint: "Align IMVI card within the frame" — Inter 300 13px bone-muted
- Back chevron top-left (bone)

#### Screen B: Card detected → reveal
- After 2.5 seconds of ambient, simulate detection:
  - Viewfinder corners animate inward (each corner slides toward center 8px, 300ms)
  - Status pill changes to "LOCKED" in gold-3 background, ink text
  - Card image (Leigha's NxLVL card) fades in inside the viewfinder, 600ms
  - Card scales up to full-screen over 800ms with the gold-floor atmospheric gradient fading in behind
- Lands user in the authenticated app (Home tab, kid = Leigha)

---

### 4.4 Home tab

**Purpose:** The emotional front door. Makes the parent feel their kid is seen. Serves dual audiences — the parent viewing their own kid, and the stranger who scanned the card and arrived here. The Vote CTA is the activation mechanism for the scanning stranger, feeding the IMVI Awards leaderboard.

**Layout (top to bottom):**

1. **AppHeader** — persistent, as specified in 3.2.1 (not part of Home's own content)
2. **Hero card section**
   - 180×252px (2.5:3.5 aspect ratio), centered
   - Leigha's NxLVL card rendered at card-radius, with specular sweep on the gold frame (ambient)
   - Tap to flip front ↔ back (3D rotation via Framer Motion `rotateY`, 600ms, ease-out)
   - Card front: Leigha's NxLVL card image
   - Card back: NxLVL team back image
   - Gold frame border: 2px solid rgba(201, 162, 78, 0.35) with inset gold shadow
3. **Card caption**
   - "Leigha Ghafari" in Oswald 500, 20px, bone
   - "NxLVL Chicago · #7 · Soccer" in Inter 300, 12px, bone-muted
4. **Sponsor scroll strip**
   - "SPONSORED BY" static label in Inter 300 9px bone-muted uppercase, letter-spacing 0.15em
   - Sponsor names scroll horizontally in a continuous loop (CSS animation, 12s linear infinite): "ATHLETIC CO ◆ BRUCE & BOLT ◆ PREP NATION" — duplicated for seamless wrap
   - Sponsor names in Oswald 500 10px bone at 40% opacity, uppercase
   - This is the sponsorship placement — visible, recurring, never intrusive
5. **Latest moment preview** (horizontal card)
   - ink-2 bg, 14px radius, 10px/12px padding
   - Thumbnail image (100×56px) left-aligned — real soccer action photograph (`Girl_Soccer_Image.jpg`), dark overlay, gold play button circle
   - Right of thumbnail: "LATEST MOMENT" label in Oswald 500 10px gold-3 uppercase letter-spacing 0.25em
   - Title below: "Scored the equalizer vs PFA" in Inter 500 13px bone
   - Meta line: "0:18 · 2 days ago · 247 views" — durations/counts in Oswald 500 11px, connective text in Inter 300 11px bone-muted
6. **Engagement stats row** (4-column grid)
   - Three stat tiles + one Vote CTA tile, gap-2
   - Stat tiles: ink-2 bg at 50% opacity, radius-md, 10px/4px padding
     - "247 VIEWS" | "12 VOTES" | "2 MOMENTS"
     - Numbers in Oswald 700 20px gold-3, labels in Inter 300 8px bone-muted uppercase
     - Numbers animate count-up from 0 over 800ms staggered (ease-out cubic)
   - Vote CTA tile: gold-3 tinted bg (8% opacity), 1px gold-3 border (20% opacity), same dimensions
     - Lucide `Star` icon filled gold-3 at 20px, "VOTE" label in Inter 300 8px gold-3 uppercase
     - Tapping casts a simulated vote, shows gold confetti burst (28 confetti strips, ~1.5s), then toast: "Thanks for voting for Leigha"
     - `whileTap={{ scale: 0.93 }}` via Framer Motion
7. **IMVI Awards 2026 teaser banner**
   - ink-2 bg, card-radius, 14px/16px padding
   - Gold-glow radial from top-right corner: `radial-gradient(ellipse at 85% 15%, rgba(201, 162, 78, 0.3) ...)`
   - 1px gold-3 border at 15% opacity
   - Left side: "IMVI Awards" in Oswald 700 18px bone + "2026" in brushed-gold gradient text
   - Sub: "Leigha ranked #48 in U12 Soccer West" — rank number in Oswald 500 11px gold-4
   - Right side: ChevronDevice (14px) + ChevronRight (16px, gold-3)
   - Tapping opens the Awards modal

**Gold floor-fade:** Radial atmospheric gradient anchored to the bottom of the Home content area, glowing upward. `radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.35) 0%, rgba(139, 106, 47, 0.15) 35%, transparent 70%)`. Sits behind all content at z-index 0.

**Awards modal:**
- Full-screen overlay, 85% black backdrop
- Centered card: ink-2 bg, radius-xl, 1px gold-3 border at 25%, 28px/24px padding
- Gold atmospheric glow from top center + diagonal accent stripe
- Gold gradient star icon (40px) centered at top
- "IMVI AWARDS" in Oswald 700 26px uppercase bone, centered
- "2026" in Oswald 700 32px brushed-gold gradient text, centered
- Description: Inter 300 14px bone-muted, centered
- "VOTING OPENS MAY 2026" in Oswald 500 11px gold-3 uppercase, letter-spacing 0.2em
- "Got it" primary button (gold-brushed, 48px, full width)
- Scale-up entrance animation from 0.9 to 1.0

**Motion:** On first load, the hero card scales from 0.95 to 1.0 over 500ms with fade-in. Stats count up from 0 staggered. Awards banner fades in with y-offset, delayed 600ms.

---

### 4.5 Moments tab (the Gallery equivalent)

**Purpose:** Every video associated with the currently-selected kid. Watch, share, download, manage.

*Session 2 scope. Not built in Session 1.*

---

### 4.6 Feed tab (the Clips / social feed equivalent)

**Purpose:** The social-with-purpose vision teaser. Top moments across the IMVI platform, liked/voted/shared by the community, feeding the future IMVI Awards.

#### 4.6.1 Layout shell (persistent across all categories)

- **Header**: editorial eyebrow "DISCOVER" in Oswald 500 10px gold-3 wide-tracked uppercase; display headline "On the rise" in Oswald 700 28px bone.
- **Category strip**: horizontal segmented tabs (underlined active indicator — brushed-gold gradient bar, not a pill). Four tabs, in order:
  1. **For you** — the default active category. Renders the normal feed (athlete cards + leaderboard strip). Personalized surface.
  2. **Leaderboard** — dedicated global-leaderboard view: Top 5 across every sport in a rich list format, with a card that links out to the Awards experience for per-category rankings.
  3. **Trending** — visible placeholder only. Muted color + "SOON" marker. Not tappable for POC; the tab does not activate or change content.
  4. **IMVI Awards** — tab-takeover experience, see 4.6.2.
- The active category determines what renders below the strip. Header and category strip are always visible.

#### 4.6.2 IMVI Awards — "Stage-meets-Editorial with a Theater gate"

Tapping **IMVI Awards** in the category strip replaces the Feed content area with a dedicated longform awards experience. The header and category strip remain (the user can swap back by tapping another category). No separate route, no navigation — it's a content-area swap.

The experience is a vertical-scroll longform page composed of three sequential layers.

**LAYER 1 — THE GATE** *(first thing visible, full content-area height)*

A cinematic title moment that establishes the ceremony.

- Background: ink canvas with the gold floor-fade atmospheric gradient at maximum intensity — bigger, brighter than on Home.
- Centered vertical stack:
  - Eyebrow: `PRESENTED BY IMVI` — Oswald 500 11px uppercase, letter-spacing 0.3em, bone-muted
  - Hero headline: `IMVI AWARDS` — Oswald 700 48px, bone, letter-spacing 0.04em
  - Year callout: `2026` — Oswald 700 72–96px with brushed-gold gradient via `background-clip: text`, letter-spacing 0.02em, immediately below the hero headline
  - Tagline: `Voted by the community. Celebrated live.` — Inter 300 16px bone-muted, max-width 280px, centered
  - Countdown: `LIVE CEREMONY · SEPTEMBER 2026` — Oswald 500 14px uppercase, letter-spacing 0.2em, gold-3, prefixed by a live-red pulsing dot
- Scroll cue pinned near the bottom of the gate: a subtle downward chevron plus `SCROLL TO EXPLORE` (Oswald 500 10px uppercase, letter-spacing 0.25em, bone-muted). 8px vertical float animation, 2s ease-in-out infinite.

**Motion on category activation** — the gate reveals in a staggered sequence: eyebrow fades in first (300ms), hero headline slides up from 12px below with fade (500ms delayed 200ms), year callout follows (500ms delayed 400ms), tagline and countdown stagger in (each 400ms delayed 700ms and 900ms), scroll cue appears last (600ms delayed 1200ms).

**LAYER 2 — THE CATEGORIES** *(the core content, scrolls in after the gate)*

A sequence of spotlight sections, one per category. For POC, implement at least three:
- `U12 SOCCER · WEST`
- `U12 SOCCER · EAST`
- `U14 BASKETBALL · NATIONAL`

Each category section contains:

- **Section header**:
  - Label: `CATEGORY` — Oswald 500 10px uppercase, letter-spacing 0.3em, gold-3
  - Title: e.g. `U12 SOCCER · WEST` — Oswald 700 28px, bone, letter-spacing 0.02em
  - Context line: e.g. `Top 10 athletes · 1,247 votes cast this week` — Inter 300 13px, bone-muted
  - 1px bone-muted at 20% hairline divider below the header
  - 32px padding above header, 24px below

- **Leader (position #1) — elevated treatment**:
  - Full-width card, ~240px tall
  - Portrait on the left (40% width), using the real card image cropped/zoomed to a portrait focus. For Leigha's category use `leigha_front.jpg`; for Levi's category use `levi_sterling_front.jpg`.
  - Right side stack: rank `01` in Oswald 700 at ~96px with brushed-gold gradient via `background-clip: text`; athlete name in Oswald 700 22px bone; club in Inter 300 13px bone-muted; vote count `2,847 votes` in Oswald 500 14px gold-3, letter-spacing 0.02em
  - Top-right corner chyron: `LEADING` marker in live-red background, ink text, Oswald 500 10px uppercase, letter-spacing 0.2em
  - Subtle gold floor-fade atmospheric gradient emanating from the portrait side

- **Positions #2 – #10 — compact vertical list**:
  - Row height 64px, 1px bone-muted at 10% row divider
  - Layout left-to-right: rank number in Oswald 700 28px gold-3 (fixed width 56px), small portrait thumbnail 40×40 circular with gold-3 ring (use initials for synthesized athletes without card art), athlete name in Oswald 500 16px bone, club in Inter 300 12px bone-muted below name, vote count in Oswald 500 14px gold-3 right-aligned, small VoteStar icon
  - Tapping a row opens a detail panel — stub for POC (shows a toast)

- 48px spacing between consecutive category sections

**LAYER 3 — THE CEREMONY** *(closing section, aspirational)*

At the bottom of the scroll, after all category sections, a section that grounds the abstract awards in a real-world event.

- Full-width section, ~320px tall
- Background: ink-2 with a subtle gold radial glow centered
- Centered content stack:
  - Eyebrow: `THE CEREMONY` — Oswald 500 11px uppercase, letter-spacing 0.3em, gold-3
  - Headline: `SEPTEMBER 2026` — Oswald 700 40px, bone, letter-spacing 0.02em
  - Sub: `Chicago · United Center` — Oswald 500 16px bone-muted, letter-spacing 0.1em (venue is placeholder, fine for POC)
  - Body: `Every vote cast here counts toward the live IMVI Awards ceremony. Top 10 athletes across every category will be celebrated in person.` — Inter 300 14px bone-muted, max-width 320px, centered
  - Secondary CTA: `Save the date` — 1px gold-3 border, transparent bg, gold-3 text, 44px tall, 16px horizontal padding. Visual only for POC — tapping shows a toast.

#### 4.6.3 Interaction pattern

- `activeCategory === 'fc_awards'` → content area renders the Awards experience (Gate → Categories → Ceremony, vertical scroll).
- Any other `activeCategory` → content area renders the standard feed layout (leaderboard strip + vertical feed cards).
- The category strip itself never changes — it remains the same five tabs regardless of active category.
- State is managed like any other category filter. No separate route. No back-button navigation.

*Session 2 scope. Not built in Session 1.*

---

### 4.7 Me tab (My Dashboard equivalent)

**Purpose:** Parent profile, kid management, settings, sponsor preferences, IMVI+ future features teaser.

*Session 2 scope. Not built in Session 1.*

---

### 4.8 Scan FAB flow (from any tab)

Tapping the scan FAB from Home / Moments / Feed / Me opens the same AR viewfinder as Entry Screen 4.3. In Session 1, it shows a toast: "Scan flow arriving in Session 2." Full scan flow is Session 2 work.

---

## 5. Mock data spec

Everything hardcoded in a single `src/mock/data.ts` file. Single source of truth for demo state.

### 5.1 Parent
```
{
  id: "p_ghafari",
  name: "Amer Ghafari",
  firstName: "Amer",
  email: "amer@imvi.me"
}
```

### 5.2 Kids (2 real + 1 placeholder)
```
[
  {
    id: "k_leigha",
    firstName: "Leigha",
    lastName: "Ghafari",
    jerseyNumber: 7,
    club: "NxLVL Chicago",
    sport: "Soccer",
    ageGroup: "U12",
    cardFront: leighaFront,     // imported from src/assets/cards/leigha_front.jpg
    cardBack: nxlvlBack,        // imported from src/assets/cards/nxlvl_back.jpg
    stats: {
      viewsThisWeek: 247,
      votesReceived: 12,
      newMomentsThisWeek: 2,
      leaderboardRank: 48,
      leaderboardCategory: "U12 Soccer West"
    }
  },
  {
    id: "k_zain",
    firstName: "Zain",
    lastName: "Ghafari",
    jerseyNumber: 11,
    club: "PFA Elite",
    sport: "Basketball",
    ageGroup: "U10",
    cardFront: leighaFront,     // reuses Leigha's card images for POC
    cardBack: nxlvlBack,
    stats: {
      viewsThisWeek: 83,
      votesReceived: 5,
      newMomentsThisWeek: 1,
      leaderboardRank: 112,
      leaderboardCategory: "U10 Basketball Central"
    }
  },
  {
    id: "k_placeholder",
    isPlaceholder: true,
    label: "Add a kid"
  }
]
```

**Note:** Zain is visual-only in the POC. His avatar appears in the AppHeader and can be selected, but switching to him shows the same Home content with his name/stats swapped in. He reuses Leigha's card images. The placeholder entry exists in data but is filtered out in the AppHeader — the "Add kid" action lives in the web portal.

### 5.3 Latest moment
```
{
  id: "m_equalizer",
  title: "Scored the equalizer vs PFA",
  duration: "0:18",
  timeAgo: "2 days ago",
  views: 247
}
```

### 5.4 Sponsors
```
[
  { id: "s1", name: "ATHLETIC CO" },
  { id: "s2", name: "BRUCE & BOLT" },
  { id: "s3", name: "PREP NATION" }
]
```

### 5.5 Moments, Feed items, Leaderboard
Session 2 scope. Not present in Session 1 mock data.

---

## 6. Assets required

| Asset | Source | Status |
|---|---|---|
| Leigha NxLVL front card | `cards/Leigha_Ghafari_-_NXLVL.pdf` → `src/assets/cards/leigha_front.jpg` | Done (800px, quality 85) |
| NxLVL back card | `cards/NXLVL_CARD.pdf` → `src/assets/cards/nxlvl_back.jpg` | Done (800px, quality 85) |
| Soccer action thumbnail | `Girl_Soccer_Image.jpg` → `src/assets/soccer-action.jpg` | Done (400px wide) |
| Oswald variable font | Google Fonts → `src/assets/fonts/oswald-variable.woff2` | Done (21KB) |
| Inter variable font | Google Fonts → `src/assets/fonts/inter-variable.woff2` | Done (48KB) |
| IMVI logo | SVG component `src/components/icons/IMVILogo.tsx` | Done (Oswald 700, gold gradient fill) |

---

## 7. Future-feature placements (explicit map)

This section exists so nothing from the docs is missed. Every future mention has a visible home in the POC.

| Source mention | Where it lives | How it appears |
|---|---|---|
| IMVI Awards ceremony | Home (teaser banner + modal) + Feed (awards promo card + category, Session 2) | Gold-3 accent, "Voting opens May 2026" label, tappable modal |
| Votes / leaderboards (social with purpose) | Home (stats row vote CTA, confetti celebration) + Feed (Session 2) | Oswald stats, gold-star vote icon, confetti burst on vote |
| AR at venues / geo-targeted sponsorship | Me tab (Venue AR tile in IMVI+, Session 2) | "Coming soon" pill |
| Digital Workers (Sales / Marketing / Ops Agents) | Me tab (IMVI+ section, Session 2) | Tiles with "Coming soon" label (no dated commitment in the POC) |
| Social sharing (IG/TikTok/more) | Video player → Share sheet (Session 2) | Fully rendered as share-sheet icons |
| Video download with privacy | Video player → Download modal (Session 2) | Radio toggle |
| Sponsor placements | Home (scrolling sponsor strip below card caption) | Ghosted logos, explicit "Sponsored by" label, horizontal scroll |

---

## 8. Interaction state map

States held in the React tree (Session 1 — simplified, no React context):

```
App-level state (useState in App.tsx):
  activeTab: "home" | "moments" | "feed" | "me"
  selectedKidId: string                          // updated by AppHeader kid avatars
  toast: { visible: boolean, message: string }   // transient messages

Home-level state (useState in Home.tsx):
  awardsModalOpen: boolean
```

Session 2 will expand this to a full React context per the original design.

---

## 9. Acceptance criteria (what "done" looks like)

### Session 1 criteria (Home only)
The Session 1 build is complete when:

1. Home screen is fully styled and functional per Section 4.4
2. Kid switcher in AppHeader maintains context — switching between Leigha and Zain updates Home content
3. FAB is persistent and shows a toast when tapped
4. Card flip works (Home hero card, 3D rotateY)
5. Vote CTA triggers confetti burst and toast
6. IMVI Awards banner opens the awards modal
7. Sponsor scroll strip is visible and scrolling
8. Brand tokens are applied consistently — no hardcoded colors outside the token system (exception: SVG gradient stops)
9. Phone frame renders on desktop with gold-tinged drop shadow
10. Gold floor-fade atmospheric gradient is visible on Home
11. Transitions are smooth, no layout jank
12. No TypeScript errors, no console errors
13. Production build (`npx vite build`) passes with zero errors and zero warnings

### Full POC criteria (Session 2)
4–15 from original spec apply after Session 2 is complete.

---

## 10. File structure (actual, Session 1)

```
imvi-mobile-poc/
├── src/
│   ├── App.tsx                      # Shell: header, screen, FAB, tab bar, toast
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Tailwind import, @font-face, @theme tokens, utility classes
│   ├── components/
│   │   ├── AnimatedNumber.tsx       # Count-up number animation
│   │   ├── AppHeader.tsx            # Persistent branded header (logo, avatars, name, bell)
│   │   ├── AwardsBanner.tsx         # IMVI Awards 2026 teaser card
│   │   ├── AwardsModal.tsx          # Awards info modal with gold star and CTA
│   │   ├── KidAvatar.tsx            # Single kid avatar button with name label
│   │   ├── LatestMoment.tsx         # Video preview card with thumbnail
│   │   ├── PhoneFrame.tsx           # Device chrome (frame, Dynamic Island, status bar)
│   │   ├── PlayerCard.tsx           # IMVI card with 3D flip
│   │   ├── ScanFAB.tsx              # Floating scan button
│   │   ├── SponsorStrip.tsx         # Scrolling sponsor names
│   │   ├── StatsRow.tsx             # 4-column stats grid with vote CTA
│   │   ├── TabBar.tsx               # Bottom navigation (4 tabs + FAB notch)
│   │   ├── Toast.tsx                # Transient messages + vote confetti burst
│   │   └── icons/
│   │       ├── ChevronDevice.tsx    # Brand motif: 3 cascading chevrons, gold gradient
│   │       ├── IMVILogo.tsx         # SVG wordmark with brushed-gold gradient fill
│   │       └── ScanReticle.tsx      # Four L-corners + center dot
│   ├── screens/
│   │   └── Home.tsx                 # Home tab — composes section components
│   ├── mock/
│   │   └── data.ts                  # All mock data (parent, kids, moment, sponsors)
│   ├── tokens/
│   │   └── theme.ts                 # Design tokens (colors, gradients, fonts, spacing, motion)
│   └── assets/
│       ├── cards/
│       │   ├── leigha_front.jpg
│       │   └── nxlvl_back.jpg
│       ├── fonts/
│       │   ├── oswald-variable.woff2
│       │   └── inter-variable.woff2
│       └── soccer-action.jpg
├── index.html
├── package.json
├── IMVI_MOBILE_POC_SPEC.md          # This file
├── imvi-moodboard.html              # Brand direction reference
└── cards/                           # Source PDFs (not served)
```

---

## 11. Build prompt for Claude Code

*Retained from v1.0 with typography references updated to two-font system. See Section 12 for the phased approach.*

---

## 12. Phased build instructions

### 12.1 Session 1 — Foundations + Home (LOCKED)

Session 1 is complete and locked. The following was built and approved:
- Project scaffold (Vite + React 18 + TypeScript + Tailwind CSS 4)
- Framer Motion + lucide-react installed
- Self-hosted Google Fonts (Oswald, Inter) via WOFF2 with `font-display: block`
- Card PDFs converted to web-optimized JPGs
- Design tokens in `src/tokens/theme.ts`
- Tailwind `@theme` config in `src/index.css`
- Custom SVG icon components (IMVILogo, ScanReticle, ChevronDevice)
- AppHeader, KidAvatar, PhoneFrame, TabBar, ScanFAB, PlayerCard
- Section components: LatestMoment, StatsRow, AwardsBanner, AwardsModal, SponsorStrip, AnimatedNumber, Toast
- Home screen composing all section components
- App.tsx wiring everything together
- Production build passing with zero errors

### 12.2 Session 2 — Everything else

**Kickoff only after Session 1 is locked.** Session 2 builds: Splash, MagicLink, CheckEmail, ScanOverlay, Moments, Feed, Me, VideoPlayer, ShareSheet, DownloadModal, full AppState context, expanded mock data.

### 12.3 If Session 2 requires iteration

If any screen doesn't match the locked brand direction from Session 1, iterate on that screen before moving to the next. The Session 1 foundation (AppHeader, TabBar, tokens, PlayerCard, Home layout) is the reference — new screens must match its quality, not redefine it.

---

**End of specification.**
