# IMVI Web Portal — POC Build Specification

**Version:** 1.8
**Date:** April 2026
**Audience:** Engineering (Claude Code build prompt)
**Scope:** Proof-of-Concept clickable prototype
**Related artifacts:** `imvi-moodboard.html`, `IMVI_MOBILE_POC_SPEC.md` (v1.4+), `DASHBOARD_DYNAMIC_PANEL_AMENDMENT.md`

**Changelog:**
- **v1.8** — **Dashboard Zone 1 · Dynamic Focus Panel** (per `DASHBOARD_DYNAMIC_PANEL_AMENDMENT.md`). The legacy 4-card Attention Required strip at the top of Zone 1 OPERATIONS is replaced by a single **Dynamic Focus Panel** — gold-top-bordered container, "TODAY'S OPERATIONAL FOCUS · UPDATED BY IMVI+" eyebrow, a compact right-aligned mode selector dropdown, a 4-tile count-bar row (Design Queue · Print Approval · New Teams · Exceptions), a mode-swapping body region, and an agent footer strip with a deep-link CTA. Three hardcoded body views swap via the dropdown: **Queue Clearance** (default — stacked age-distribution bar + four "Approve" rows), **Exception Resolution** (horizontal exceptions-by-type bar + four IMVI+-drafted response rows with "READY · 1-TAP SEND" pills), **Steady State** (throughput line chart with overlay hero + all-clear status panel). Count-bar elevation tracks the mode: Print Approval elevated (gold-3, 44px, sparkle) in Queue Clearance; Exceptions elevated (live-red, 44px, sparkle) in Exception Resolution; none elevated in Steady State. 300ms cross-fade on mode change. Fulfillment Pipeline and Exceptions List below remain unchanged. Mock data added to §5.10a: `operationalCounts`, `queueAgeDistribution`, `batchesReadyToApprove`, `exceptionsByType`, `agentPreparedResponses`, `weeklyThroughput`, `weeklyTotal`, `weekOverWeekChange`. Legacy `attentionStrip` / `AttentionCardData` removed. New positive accent `#7BA87F` (muted sage) scoped to the panel — not promoted to global tokens. Implemented as `src/components/DynamicFocusPanel.tsx`.
- **v1.7** — **Phase 2C · inline management controls.** `AppState` extended with live `users`, `videos`, `sponsors` arrays and mutators (`updateUser` / `removeUser` / `updateVideo` / `pushVideo` / `assignSponsorToTeam` / `unassignSponsorFromTeam`) so edits made in the consolidated surfaces actually change state within the session. **Player Detail (§4.12)** gains a **Parent Accounts card** (1–2 parent rows per athlete with a 3-dot menu: Edit email · Re-register · Disable/Enable · Remove), an **interactive videos strip** (every tile click opens a Drawer with slot toggle Front/Back/None, privacy toggle, athlete reassignment dropdown, Download, Unlink), and a new **"Upload new" button** on the videos strip (simulated, pushes a placeholder video). Edit-email is a small `Modal` with validation. **Team drawer (§4.6)** gains a **sponsor-management section** ("Assign sponsor" → Modal listing unassigned sponsors, per-chip × to unassign) and a **Club admins section** (lists team-scoped `club_admin` users with an "Add admin" stub toast). Card counts on team cards in the grid reflect live state too (unassign a sponsor from the drawer → the team card's sponsor count updates). All mutations are ephemeral (reload resets to seed).
- **v1.6** — **Nav reorder + management consolidation.** Sidebar primary nav reordered to match the operational sequence Kevin actually walks: **(1) Dashboard · (2) Design · (3) Bulk Upload · (4) Review Queue · (5) Teams**. **Media Library (§4.8), User Management (§4.9), and Sponsorship Management (§4.10) are no longer standalone screens.** Their concerns are already surfaced inside Player Detail (videos strip, sponsor chips) and Team drawer (sponsor chips, roster); the remaining management **controls** (edit parent account, re-register, disable, assign/unassign sponsor, edit video slot / privacy / reassign, upload new video) will be added as **inline controls** inside those two surfaces. `/media`, `/users`, `/sponsorships` routes now redirect to `/teams` (no 404s on prior deep-links). Dashboard Zone 3 quick-access tiles all point to `/teams` with sub-copy that tells the user where each concern is now edited ("edit from roster row · player detail", "manage from player detail", "assign from team drawer"). IMVI+ (§4.11) stays as its own standalone screen (Digital Workers concept). **Phase 2C reframed** from "build Media + Users screens" to "wire management controls into Team drawer and Player Detail"; **Phase 2D reduced** to just IMVI+.
- **v1.5** — **Bulk Onboarding correction (§4.7).** A team's card template is locked at the end of the Design Workspace (§4.5); Bulk must not re-offer the 4-variation picker. §4.7 rewritten: the template step is a **read-only confirmation panel** ("locked at design · every athlete in this batch inherits this template") showing the team's own signature card via the existing `ComposedCardPreview` primitive — no SAFC placeholder. Flow collapsed from 5 steps to 4: **Team → Upload → Preview → Confirm**. Upload format changed from **CSV → Excel (.xlsx)**. The screen was also re-framed from a card-only action to a **three-output onboarding action**: each Excel row creates a parent account, an athlete on the roster, and a card. Hero sub, Step 2 copy, Step 4 stat block (`N Parent accounts · N Athletes · N Cards`), primary CTA (**"Onboard batch · create cards"**), and success headline (**"N parent accounts · N athletes · N cards for [Team]"**) all make the three outputs visible. Sponsor-slot and video-panel compositing are referenced in the sub-copy so the downstream §4.8/§4.10 handoff reads directly from the flow. Dropdown copy clarifies "only teams with a finalized template appear here" — v1.1 invariant preserved.
- **v1.4** — **Session 2 scope expansion + spec amendments.** Folds in ten expanded requirements from the Session 2 kickoff: bulk upload **template picker** (§4.7), media **front/back slot tagging** (§4.8), user **re-register + inline edits + permission matrix UI** (§4.9), sponsor **ad-slot editor** (§4.10), and a new **§4.12 Player Detail** (data-model viewer showing athlete ↔ card ↔ videos ↔ sponsor chips, with team/club/org breadcrumb). Data model extended: `Team.organization` (third grouping level above club), `Athlete.paid` + `Athlete.cardStatus` + `Athlete.mediaStatus` (operational-status flags), `RolePermission[]` matrix data, `Sponsor`/`Video`/`User`/`DigitalWorker` types filled in. §1.2 invariant clarified: role separation is **UI-only** in POC — the User Management screen shows roles and a permission matrix, but runtime authorization stays super-admin-sees-all. §5 expanded with all new mock tables. §10 adds five shared chrome components (`DataTable`, `Drawer`, `Modal`, `FileUploadZone`, `FilterPills`) used across every Session 2 screen. Card back stays future scope (§13.2 unchanged) — media "back slot" is a tag surface only, no renderer. Phased build: **2A** shared infra + mock; **2B** Teams + Bulk + Player Detail; **2C** Media + Users + Permissions UI; **2D** Sponsorships + IMVI+.
- **v1.3** — **Dashboard three-zone rework (§4.3).** Replaces the Session-1 single-stream layout (big hero KPI + growth area chart + top teams + sport mix + scale tiles) with three explicit zones: (1) Operations — attention strip, fulfillment pipeline, 7-day throughput, exceptions list; (2) Business Growth — orders/revenue/subscriptions trio, club health matrix (bubble chart), signups-by-team, engagement-by-team, athlete visibility leaderboard with sponsorship flagging; (3) Management Access — four quick-access tiles and a live activity feed. Data viz is the surface — every number carries a trend, sparkline, or chart. All charts implemented with **Recharts** (now a dependency). Mock `teams` list pruned from the 12-team Session-1 drift back to the spec-§5.2 five (NxLVL, PFA, SAFC, Raiders, Batrs) so dashboard counts, Club Health Matrix, and tile copy align with the spec. §5 expanded with dashboard-specific mock tables (attention queues, fulfillment pipeline, throughput, exceptions, orders/revenue/subs series, club health points, signups/engagement per team, visibility leaderboard, quick-access tiles). Activity feed rewritten to stay inside POC invariants — Kevin/bulk-driven actions only, no parent self-submissions. Legacy chart primitives (`AnimatedNumber`, `Sparkline`, `AreaChart`, `DonutChart`, `HBarRanking`, `PipelineFlow`) are dead code after this rework but left in the repo for now.
- **v1.2** — Session 1 reconciliation. **Design Workspace (§4.5)** pivoted from 9-background / cool-neutral-warm multi-palette grid to a 4-card single-palette flow (Splatter Band / Diagonal Brush / Torn Paper / Geometric Shards) anchored to the extracted palette; right-panel preview uses staged empty states and only shows a card once one is selected; the preview is a flat PNG from the card compositor (not a React-composed overlay stack); Save-as-draft button and "Nudge" tweak pills removed; approve copy changed to "Apply template to team" / "Template applied to team." **Mock team count** reduced from 12 to 5 (NxLVL Chicago, PFA San Fernando, San Antonio FC, Raiders San Antonio, Batrs Soccer) across §5.2, §5.3, §4.6, §4.9. **§5.10** rewritten from pre-baked AI backgrounds to card-variation PNGs produced by the new compositor. New **§13 "Card Generator"** documents the Python/Pillow compositor (templates, silhouette, name lockup, number treatment, background families, font library, wordmark, variation↔background swap). **Single-sided only for POC**; card back is future scope. **Silhouette is a POC placeholder** — production uses a real photo slot. New **§14 "Session 1 Actuals"** captures planned vs. built. Dashboard §4.3 intentionally untouched — a three-zone redesign is a later-session concern outside this reconciliation.
- **v1.1** — Clarified data flow: teams only exist in the system after going through Design Workspace. Removed the "NEEDS DESIGN" state from Review Queue (impossible state — you can't queue cards for a team that doesn't exist yet). Every Review Queue item is "READY TO APPROVE." Teams Directory shows only complete teams. Bulk Onboarding dropdown has no greyed-out entries. Dashboard's secondary metric changed from "IN DESIGN · N teams" to "NEW TEAMS THIS MONTH · N."
- **v1.0** — Full rewrite. Architecture locked around a single super-admin role (Kevin) with a queue-centric operational flow. Bulk Onboarding uses existing team templates only; new team design is a separate Design Workspace with AI-assisted background generation. Single Review Queue handles all pending cards regardless of source.
- **v0.2** — Aligned typography with mobile spec v1.1 (Oswald + Inter). Superseded.
- **v0.1** — Initial skeleton. Superseded.

---

## 1. Context and intent

### 1.1 What this POC proves

The web portal is the **production and administration surface** of the IMVI platform — everything the mobile app deliberately doesn't do. Its job in the demo is to prove:

1. Kevin has a credible operational console that matches how his business actually runs — rosters come in from club owners, cards get designed once per team, cards get reviewed and shipped one batch at a time
2. The AI-assisted design workspace gives Kevin creative leverage without surrendering brand control — AI only generates the background, everything else is template-locked
3. The template-plus-skin card system is protected by the workflow itself — bulk uploads can only use existing team templates, so brand consistency is structurally impossible to break
4. The queue-centric architecture scales cleanly — the same Review Queue handles cards from bulk uploads today and individual parent submissions in the future, without workflow changes
5. The same brand language from mobile carries into a desktop experience without losing its voice

### 1.2 What this POC explicitly does NOT do

- No real authentication (magic-link entry is simulated, same pattern as mobile)
- No real payment processing or print fulfillment (print approval triggers a "sent to print" state, nothing more)
- No real CSV parsing (uploads are mocked — clicking "Upload" triggers a 2-second processing state that returns a predefined roster)
- No real backend database — all state is frontend React state, hardcoded mock data
- No real file upload persistence (photos accept files but don't persist across reloads)
- No **functional** club admin role (Kevin sees everything at runtime). Role separation exists as a **UI surface** — the User Management screen shows roles and a permission matrix per v1.4 — but there is no `useRole()`-style gate on any screen. Full runtime role enforcement is Phase 2.
- No parent-facing portal (Phase 2; the architecture supports it but no parent screens are built here)

### 1.3 AI integration approach

The demo includes an AI-assisted background generator in the Design Workspace. Built in two phases:

- **POC build phase (primary):** AI generation is simulated. Clicking "Generate variations" returns pre-baked background images. UI is identical to the real version.
- **Final enhancement phase (if time permits):** A lightweight serverless proxy calls a real image generation API (OpenAI DALL-E 3 or Replicate FLUX). API key lives server-side. Latency managed with a good loading state.

The UI is built once and works for both phases. The swap from simulated to real is a backend-only change at the end of the build. This protects the demo from AI-API instability.

### 1.4 Relationship to the mobile POC

Mobile is for **consumption** (scan, watch, share, vote). Web is for **creation and administration** (design, onboard, review, approve, ship). Shared: brand tokens, iconography library, template-plus-skin card system, sponsorship model (team/club-level). Not shared: navigation patterns, authentication entry, screen real estate, routing model.

### 1.5 User path

Single authenticated role for the POC: **Kevin (super admin)**. Full access to all screens. Phase 2 adds club admin (scoped) and parent (self-submission). Both future roles produce submissions that land in Kevin's Review Queue — the queue is the universal endpoint for pending work regardless of entry surface.

---

## 2. Brand and design language

### 2.1 Design tokens

**Inherit from mobile spec Section 2.1.** Same colors, typography stack, motion curves, radii. Do not duplicate; reference the source.

Web-specific layout additions:

```
--sidebar-width-expanded:  240px
--sidebar-width-collapsed: 72px       (icon-only state, optional for POC)
--topbar-height:           64px
--content-max-width:       1440px
--content-padding:         32px       (horizontal)
--section-gap:             40px       (vertical between major sections)
```

### 2.2 Motion principles

**Inherit from mobile.** Web adds one pattern: route transitions between sidebar items use a 220ms horizontal fade — content fades out at 100ms, new content fades in at 120ms.

### 2.3 Web-specific component conventions

- **Sidebar** — 240px wide, ink-2 background, sticky, persists across authenticated screens. IMVI wordmark at top in brushed gold. Brushed-gold accent marks active route.
- **Topbar** — 64px tall, ink-2 bg, 1px bone-muted 8% bottom border. Breadcrumbs left, search (stub) center, bell + user right.
- **Content area** — fills remaining viewport, ink canvas, 32px horizontal padding, max 1440px centered.
- **Data tables** — ink-2 bg, 1px bone-muted 8% dividers, Oswald 500 14px uppercase letter-spacing 0.08em headers, Oswald 500 for numeric cells (tight 0.02em), Inter 300 for text cells. Hover: ink-3 fill. 56px row height.
- **Panels/drawers** — slide from right, 400-480px wide, ink-2 bg, 1px bone-muted 10% left border.
- **Modals** — center-screen, ink-2 bg, brushed-gold 1px border (primary) or live-red (destructive). 480-640px wide.
- **Dashboard cards** — ink-2 bg, 16px padding, 12px radius. Label: Oswald 500 10px uppercase letter-spacing 0.25em bone-muted. Value: Oswald 700 40-56px.
- **File upload zones** — ink-2 bg, dashed gold-3 2px border, centered icon + instruction. Hover: solid border. Filled state: gold-3 at 10% opacity.
- **Queue cards** — full-width in content, ink-2 bg, 20px padding.
- **Empty states** — centered, custom icon, Oswald 500 headline, Inter 300 body, primary CTA.

### 2.4 Desktop frame

No device chrome — fills the browser viewport. **Minimum 1200px;** below shows "Best viewed on desktop" overlay. **Maximum content 1440px** centered. Full-viewport ink canvas, panels use ink-2/ink-3 for elevation. No scrollbars on chrome; only content scrolls.

### 2.5 Design quality bar

**Inherit mobile Section 2.5.** Web additions:

- **Anti-pattern: generic admin aesthetic** — Bootstrap tables, Material cards, stock SaaS dashboards. Fight them.
- **Anti-pattern: density without hierarchy** — 20-column tables with no weighting. Use Oswald at varying weights; let typography carry hierarchy.
- **Anti-pattern: flat dashboards** — walls of equal-weight cards. Establish hierarchy through scale and atmosphere.
- **Required: data as broadcast chyron** — numbers feel like ESPN lower-thirds, not spreadsheets.
- **Required: sidebar as premium navigation** — think Linear, Arc, Superhuman. Not a file tree.
- **Required: gold floor-fade** — appears at minimum on Login and Dashboard. Keeps web connected to mobile's signature.

### 2.6 Custom iconography

**Inherit mobile Section 2.6.** Web additions (custom SVGs, not Lucide):

- **Template thumbnail frame** — replicates card frame + chevron corner device. Used in Teams Directory and Design Workspace preview.
- **Queue item status icon** — small badge variants: "Needs design," "Ready to approve," "Sent to print"
- **Upload zone icon** — large outlined arrow-into-tray, used in upload zones
- **AI generation icon** — stylized spark/flash on the "Generate variations" button, subtle pulse during loading

Lucide remains acceptable for functional UI.

---

## 3. App architecture

### 3.1 Navigation model

```
┌──────────────────────────────────────────────────────────────────┐
│  PUBLIC: Login → Magic link → Authenticated shell                │
└───────────────────────────────┬──────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│               AUTHENTICATED APP SHELL                            │
│                                                                  │
│  ┌───────────┐  ┌─────────────────────────────────────────────┐  │
│  │           │  │                TOPBAR                       │  │
│  │  SIDEBAR  │  ├─────────────────────────────────────────────┤  │
│  │           │  │           CONTENT AREA                      │  │
│  │           │  │        (route-dependent)                    │  │
│  └───────────┘  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar structure

```
✦ IMVI (wordmark, brushed gold)
────────────────────────────
○ DASHBOARD
○ DESIGN
○ BULK UPLOAD
○ REVIEW QUEUE
○ TEAMS

─── PLATFORM ───
○ IMVI+ (coming soon)

────────────────────────────
○ Kevin · Super Admin (at bottom)
```

Order (v1.6) mirrors Kevin's actual operating sequence: plan a new team → bulk-onboard players → review → browse the roster. Media / Users / Sponsorships are **not** separate nav items; those concerns are managed inline inside Team drawer (§4.6) and Player Detail (§4.12). Legacy `/media`, `/users`, `/sponsorships` paths redirect to `/teams`.

Active route: gold-3 icon + 2px left accent bar + ink-3 fill. Inactive: bone-muted icon, bone text. Hover: ink-3 fill.

### 3.3 Topbar structure

- **Left:** breadcrumbs in Oswald 500 14px letter-spacing 0.05em bone
- **Center:** search pill (stubbed, inert, "Search teams, athletes, sponsors…" placeholder)
- **Right:** bell icon (Lucide Bell, bone-muted with gold-3 dot indicator), user avatar (40px, gold-3 ring), "Kevin · Super Admin" label, dropdown with Settings/Sign out

---

## 4. Screen specifications

### 4.1 Login

**Route:** `/login`

Full-viewport ink canvas with gold floor-fade anchored to bottom. Centered container max 420px:
- IMVI wordmark: Oswald 700 56px brushed gold, letter-spacing 0.1em
- Sub: "Portal · Administration" Oswald 500 11px uppercase letter-spacing 0.25em bone-muted
- 48px gap
- Headline: "Welcome back." Oswald 700 28px bone
- Sub: "Enter your email and we'll send you a sign-in link." Inter 300 14px bone-muted
- Email input: ink-2 bg, 1px bone-muted 20% border, 52px tall, 15px Inter 400 bone
- Primary button: "Send sign-in link" gold-brushed, 52px tall, full width
- Footer: "v1.0 · Proof of Concept" Oswald 500 10px uppercase letter-spacing 0.3em bone-muted 50%

Motion: wordmark fades in (300ms), sub + floor-fade stagger (500ms delayed 200ms), form fades in (500ms delayed 400ms).

### 4.2 Check your email (simulated)

Same canvas. Centered:
- Brushed-gold envelope icon (Lucide Mail, 72px, gold gradient)
- Headline: "Check your email." Oswald 700 32px bone
- Sub: "We sent a sign-in link to [email]. Tap it to continue." Inter 300 15px bone-muted max-width 320px
- Simulated pill: "✦ Simulated for demo: click to continue" gold-3 bg, ink text, Oswald 500 12px uppercase letter-spacing 0.15em. Click → Dashboard.

### 4.3 Dashboard

**Route:** `/dashboard`

**Purpose:** Kevin's operational command center and business pulse. Organized around his three jobs: **(1) operations**, **(2) business growth**, **(3) management access**. Data visualization is the surface — every number is accompanied by a trend, comparison, sparkline, or chart. Lone numbers are banned.

**Layout (top to bottom):**

1. **Header**
   - Eyebrow: "SUPER ADMIN · COMMAND CENTER" Oswald 500 10px uppercase letter-spacing 0.3em gold-3
   - Hero: "Dashboard" Oswald 700 40px bone
   - Sub-rule: "Operations · Business · Management" Oswald 500 11px uppercase bone-muted, preceded by a 64px gold hairline
   - Top-right live signal: pulsing live-red dot + "Live · N in queue" Oswald 500 11px uppercase letter-spacing 0.2em live-red

Each zone opens with a numbered zone header: `01 OPERATIONS · what needs me…` format, Oswald 700 20px bone, trailing hairline.

#### Zone 1 — Operations

*"What needs me, what's in flight, what's broken."*

**1A. Dynamic Focus Panel** — full content-width container, ink-2 bg, 14px radius, 20px internal padding, 1px gold-3/40 top border (signals the "agent layer above"), 40px bottom margin. Replaces the legacy 4-card Attention Required strip; a demo simulation of the agentic dashboard concept. Implementation: `src/components/DynamicFocusPanel.tsx`.

The panel has four stacked regions:

1. **Header row.** Left: eyebrow "TODAY'S OPERATIONAL FOCUS · UPDATED BY IMVI+" in Oswald 500 10px uppercase letter-spacing 0.3em gold-3. Right: **compact cycle button** "Mode · [current mode] · 1/3" (ink-3 bg, 32px tall, small gold-3 RotateCw icon on the left, numeric position on the right). Each click advances to the next mode in a fixed cycle: Queue Clearance → Exception Resolution → Steady State → Queue Clearance. Tooltip shows the next mode. Chose cycle-on-click over a dropdown because the panel is walked through live on-stage — one-click rotation is faster and less fiddly than opening a menu.

2. **Count-bar row** (4-tile horizontal grid, ~72px row height, 16px gap). Tiles: Design Queue / Print Approval / New Teams / Exceptions, drawing from `operationalCounts`. **Mode-based elevation**: in Queue Clearance mode the Print Approval tile's value scales to 44px gold-3 with a sparkle icon beside the label; in Exception Resolution the Exceptions tile scales to 44px live-red with sparkle; in Steady State no tile is elevated. Non-elevated tiles render at 36px bone. Transition: 300ms ease-out on font-size + color.

3. **Body region** (mode-specific, 200–240px, 50/50 two-column split, 300ms cross-fade between modes via `AnimatePresence` mode="wait").
   - **Mode 1 — Queue Clearance** (default on load). Left: "QUEUE AGE DISTRIBUTION" — single horizontal stacked bar with 4 segments (0-1d green `#7BA87F` / 1-2d bone / 2-3d gold-3 / 3+d live-red), legend row below shows "6 · 0-1d · 5 · 1-2d · 2 · 2-3d · 1 · 3+d". Right: "BATCHES READY TO APPROVE" — four 40px rows, each team + "N cards · Nh ago" + brushed-gold 28px Approve button that navigates to `/review`.
   - **Mode 2 — Exception Resolution**. Left: "EXCEPTIONS BY TYPE" — Recharts horizontal BarChart, 4 bars (Photo quality red / Address validation gold / Stuck shipment red / Missing info bone) with count labels on the right end. Right: "IMVI+ RESPONSES PREPARED" — four 44px rows, each FileEdit icon + agent-drafted action + "READY · 1-TAP SEND" gold-3 pill.
   - **Mode 3 — Steady State**. Left: "THIS WEEK'S THROUGHPUT" — Recharts LineChart over `weeklyThroughput`, gold-3 stroke, gradient fade under line, Y ticks [0, 3, 6, 9, 12], X weekday abbrevs; overlay hero top-left showing "47 cards · last 7d". Right: "ALL CLEAR" gold-3 eyebrow, "47 cards shipped this week" Oswald 700 28px hero, "Your fastest week yet — up +34% from last week" sub, three gold-3 check rows (Queue clear / No exceptions / All clubs active).

4. **Agent footer strip** (48px, ink-3 bg, 2px gold-3 left border). Sparkle icon (`AIGenerationIcon`) + Inter 300 13px bone message (with gold-3 accent on named counts) + gold-3 CTA with `→` arrow. Content swaps by mode:
   - Queue Clearance: "IMVI+ has grouped your queue by team. NxLVL and PFA are oldest — start there." · → Open Review Queue (`/review`)
   - Exception Resolution: "4 responses ready. Review and send with one tap each, or approve the batch." · → Review all 4 drafts (`/review`)
   - Steady State: "IMVI+ has compiled your weekly ops digest — throughput, top teams, board-share highlights." · → View digest (`/dashboard`)

Mode state is internal React `useState`, default `queue-clearance`, no persistence, no auto-rotation — each button click advances to the next mode. Everything else (data-driven mode selection, real agent integration) is post-POC.

**1B. Fulfillment Pipeline** (full-width ink-2 card):
   - Header: "FULFILLMENT PIPELINE · Cards moving through production · stage widths scale to volume"
   - Six tone-coded stage blocks, widths proportional to count: **Submitted → In Design → Approved → At Printer → Shipped → Delivered**. Right-arrow glyphs between blocks. Each block clickable, deep-links to the relevant screen.
   - Tone → color: muted (bone-muted fill), gold (gold-3 border + gold-4 label), red (live-red), green (health-thriving `#6FA05E`).
   - Below the pipeline: **7-day throughput** — Recharts LineChart (gold-3 stroke) of daily Delivered counts, with `CartesianGrid` dashed at 8% opacity, Oswald-styled axis ticks, custom brand tooltip.

**1C. Exceptions list** (full-width ink-2 card, live-red/25 border):
   - Header: shield icon + "EXCEPTIONS · N items" + "See all exceptions" link
   - Up to 5 rows, each: severity icon (red or amber) + reason (Oswald 13px bone) + athlete / team / jersey + "stuck Nd" + action button (e.g. "Request new photo", "Contact parent", "Check with printer"). Button uses gold-3 bordered style.

#### Zone 2 — Business Growth

*"How is the business doing, where are the opportunities."*

**2A. Orders / Revenue / Subscriptions** (3-column grid):
   - **Orders · This Week** — big Oswald 40px count + WoW delta pill (gold-4 up / live-red down) + Recharts LineChart (8-week trend, last point emphasized).
   - **Revenue · This Month** — `$Nk` formatted amount + MoM delta pill + Recharts BarChart (6-month trend, current month rendered gold-4, prior months gold-3 at 55% opacity).
   - **Active Subscriptions** — count + `+N this wk` trend label + 7-day sparkline.

**2B. Club Health Matrix** (full-width ink-2 card):
   - Header + legend (green dot = Thriving, amber = Steady, live-red = Needs attention)
   - Two-column body: **Recharts ScatterChart on the left (3fr)**, **sorted list on the right (2fr)**. Both views plot the same 5 teams, so Kevin can read the health picture however he prefers.
   - Scatter: X = 30-day submissions, Y = athletes on platform, Z (bubble size range 120–1200) = 90-day orders, fill = status color. Cells clickable → `/teams` (Session 2 will open a team drawer). Tooltip shows team name, athletes, 30-day subs, 90-day orders, status.
   - List: rows sorted thriving → attention. Each row: status dot + team name + "N athletes · M subs/30d · last K" microcopy + external-arrow affordance.

**2C. Signups & Engagement** (2-column grid):
   - **Signups by Team · 30d** — Recharts horizontal BarChart. Top team rendered gold-4 (full opacity), rest gold-3 at 60%.
   - **App Engagement · per team** — Recharts stacked BarChart, DAU (gold-3) / WAU (gold-4) / MAU (live-red 70%). Three-swatch legend at top-right.

**2D. Athlete Visibility · Sponsorship Targeting** (full-width ink-2 card):
   - Top-10 leaderboard, rendered as a 2-column list. Each row: rank (01, 02, …), athlete name, optional "✦ SPONSOR" pill (gold-4 bordered) flagging sponsorship candidates, score bar (normalized to max), team short-name, trend arrow with ±%.
   - Purpose: Kevin scans for athletes he should route sponsors to.

#### Zone 3 — Management Access

*"Quick access to the things I manage."*

**3A. Quick-access tiles + activity feed** — 2-column grid (3fr / 2fr):
   - **Left (3fr)**: 2×2 grid of management tiles — Media Library, Teams Directory, User Management, Sponsorships. Each tile: themed icon (gold/bone/red), label in Oswald uppercase, key stat as Oswald 700 24px, supporting sub-line in Inter 300 11px bone-muted. Click → respective Session 2 route. Sponsors tile uses live-red tone to flag expiring contracts.
   - **Right (2fr)**: **Recent Activity** card with the 8 most recent events. Each row: kind icon (upload/approve/design/ship/sponsor) in a 28px ink-3 circle + subject + detail + timestamp + upward-arrow affordance. Click → deep-link (href on each `ActivityItem`). Every row is interactive — no static display rows.
   - Activity feed content stays inside POC invariants: Kevin-uploaded batches, approvals, skin applications, shipments, sponsor events. No parent self-submissions (Phase 2).

**Atmospherics across the whole screen**: gold floor-fade at bottom (50vh radial from 50/100, gold-3 at 20% → transparent), subtle red drift top-right (40vh × 55vw radial, 8% alpha), grain overlay at 40% opacity over overlay blend.

**Color semantics**:
- **Green (`#6FA05E`)** — healthy / thriving / delivered
- **Amber (`#D9A441`)** — steady / attention-worthy
- **Red (`#E53935`, live-red)** — blocked / declining / exception / expiring
- **Gold-3 / gold-4** — neutral data (counts, trends without judgment)
Applied consistently across every widget.

**Motion**: header 300ms, attention strip staggered 80ms, fulfillment panel 200ms delay, exceptions 350ms delay, club health matrix 150ms delay, signups/engagement 250ms delay, visibility 300ms delay, zone 3 staggered with tiles 80ms apart. All eased with `cubic-bezier(0.19, 1, 0.22, 1)`.

**Chart implementation**: all charts use Recharts (added as a dependency in v1.3). Recharts defaults overridden: transparent backgrounds, ink-2 tooltips with Oswald typography, axis ticks in Oswald 11px bone-muted, CartesianGrid hairlines at 8% opacity with dashed pattern, `isAnimationActive={false}` to keep the reveal choreography in Framer Motion rather than Recharts.

### 4.4 Review Queue

**Route:** `/review`

**Purpose:** Main operational work surface. Cards pending Kevin's final approval before print, grouped by team.

**Key constraint:** Every item in the queue is for a team that already exists in the system with an approved skin. There is no "needs design" state — teams without skins don't exist in the system yet (they're created through the Design Workspace as a prerequisite). Review Queue = approval-only.

**Layout:**

1. **Header**
   - Eyebrow: "OPERATIONAL" Oswald 500 10px uppercase letter-spacing 0.3em gold-3
   - Hero: "Review Queue" Oswald 700 36px bone
   - Sub: "14 cards pending across 4 teams" Inter 300 14px bone-muted
   - Right: filter dropdown ("All / This week / By sport") + refresh icon
   - 32px bottom margin

2. **Queue groups** (one per team, stacked, 16px gap)

   Each group: ink-2 bg, 20px padding, 14px radius.

   **Group header row (48px, always visible):**
   - Left: team name Oswald 700 20px bone, with gold-3 dot (small active indicator)
   - Status pill: "READY TO APPROVE" gold-3 bordered, ink bg, Oswald 500 10px uppercase letter-spacing 0.2em
   - Right: count "15 cards · submitted 2h ago" Oswald 500 12px bone-muted
   - Chevron-down/right icon (click row to toggle)

   **Expanded content:**
   - Grid of card thumbnails, 3-4/row, each ~160×224px at 2.5:3.5 ratio
   - Each: composed card with background + logo + kid photo + name + jersey
   - Hover: gold-3 ring + tooltip "[Kid name]"
   - Click: opens detail modal (zoom + per-card approve/reject)
   - Top-right of expanded area: "Approve all (15)" primary gold-brushed + "Reject batch" secondary live-red-bordered

3. **Empty state**
   - Centered, 320px max, vertical center
   - Checkmark-circle icon gold-3 stroke
   - "All clear." Oswald 700 24px bone
   - "No cards pending review. New uploads will appear here." Inter 300 14px bone-muted

Motion: groups fade-in stagger (each 300ms delayed 80ms). Expand/collapse 220ms ease-out height.

### 4.5 Design Workspace

**Route:** `/design/new` or `/design/:teamId`

**Purpose:** Design a team's skin. Kevin uploads the logo, the system extracts the palette, and the compositor produces four card designs — all anchored to that single extracted palette. Kevin picks one; it becomes the team's template.

**Layout:** Two-column, 60/40 split. Left: controls (scrollable). Right: live preview (sticky).

#### Single-team, single-palette flow

The workspace never shows cards in palettes other than the one extracted from the currently-uploaded logo. There is no palette mood selector (no "cool / neutral / warm," no "tweak pills"). The four generated designs differ only in **styling** — background treatment, fonts, number treatment, composition — all on the same palette. That's how the template-plus-skin thesis reads end-to-end.

#### Left column — Design controls

1. **Header**
   - Back link: "← Back to Review Queue" or "← Back to Teams"
   - Eyebrow: "NEW TEAM · DESIGN WORKSPACE" gold-3 Oswald 500 10px uppercase letter-spacing 0.3em
   - Hero: "[Team name]" Oswald 700 32px bone
   - Sub: "Design the team skin. This skin will apply to all cards for this team, current and future." Inter 300 13px bone-muted

2. **Step 1 — Team logo upload**
   - Header: "STEP 1 · TEAM LOGO" Oswald 500 11px uppercase letter-spacing 0.25em gold-3
   - Upload zone: 200px tall, dashed gold-3 border, upload icon + "Upload team logo (PNG or SVG)"
   - Hover: solid border
   - Uploaded state: filled zone with 120px logo preview + "Replace" link

3. **Step 2 — Extracted palette** (appears after logo upload)
   - Header: "STEP 2 · PALETTE (derived from logo)" Oswald 500 11px uppercase letter-spacing 0.25em gold-3
   - Row of 4 color swatches (48px circles) with labels (Primary, Accent, Dark, Light) in Oswald 500 10px uppercase bone-muted
   - Note: "These colors will anchor every generated design." Inter 300 12px bone-muted

4. **Step 3 — Card Designs**
   - Header: "STEP 3 · CARD DESIGNS" Oswald 500 11px uppercase letter-spacing 0.25em gold-3
   - Sub: "Generate four card designs using your extracted palette. Every design uses the same team colors — they differ only in style: background treatment, fonts, number treatment, and composition."
   - Primary button: "✦ Generate designs" with AI icon, gold-brushed, 48px
   - Loading state: "Generating…" with pulsing dots + "AI is composing four card designs anchored to your palette. This typically takes 15-30 seconds."
   - After generation: **4-column grid** of the four card variation PNGs at card aspect (2.5:3.5). Each tile captioned with its design label in Oswald 500 9px uppercase bone/80:
     - **Splatter Band** (V1)
     - **Diagonal Brush** (V2)
     - **Torn Paper** (V3)
     - **Geometric Shards** (V4)
   - Click to select (adds gold-3 2px ring + checkmark badge top-right)
   - Status row above the grid: bone-muted dot + "4 designs · pick one" (left) and "Regenerate" link (right; re-runs the same loading state — in the POC this returns the same 4 PNGs)

5. **Step 4 — Apply template**
   - Header: "STEP 4 · APPLY TEMPLATE" Oswald 500 11px uppercase letter-spacing 0.25em gold-3
   - Primary button (enabled once a design is selected):
     - Active copy: "Apply template to team"
     - Confirmed copy: "Template applied to team" (with checkmark icon + green gradient background)
   - No secondary "Save as draft" button. The flow is single-primary — you pick, you apply, or you regenerate.

#### Right column — Live preview

**320×448px container, sticky to viewport. Displays one state at a time:**

1. **No logo yet (`!logoUploaded`):** dashed bone-muted border card. Headline "Awaiting logo" Oswald 500 11px uppercase. Body: "The preview appears once you select a generated design."
2. **Logo uploaded, not yet generated:** dashed border card. Headline "Click generate to see designs." Body: "Four card designs will appear below, all tied to your extracted palette."
3. **Designs generated, none selected:** dashed border card. Headline "Pick a design on the left." Body: "The card you pick will load here as the team skin preview."
4. **Design selected:** the selected variation's flat PNG is rendered at 320×448 with a soft drop-shadow (`0 20px 60px -20px rgba(0,0,0,0.6)`). No React-composed overlays — typography, chevrons, logo, number treatment, name lockup, and IMVI wordmark are all baked into the PNG by the card compositor (§13).

Below the card (only when a design is selected): "PREVIEW · [Design label] design · sample player" Oswald 500 10px uppercase letter-spacing 0.2em bone-muted centered.

Below the preview container, an info callout: "Every design is anchored to the extracted team palette. The four variations differ only in style — background treatment, fonts, number treatment, composition — so the team's identity stays consistent across the card set."

Motion: on selection, the PNG cross-fades + scales (0.98 → 1.0) over 400ms ease-out. On logo replace, everything resets (variations cleared, right panel returns to state 1).

**Sample player:** all preview PNGs use "Sample Player · #10" as a neutral placeholder. See §13.13.

### 4.6 Teams Directory (Session 2)

**Route:** `/teams`

**Purpose:** Catalog of all teams and skin status. Kevin's reference for "who's ready to bulk-upload."

1. Header: "Teams Directory" + "5 teams active"
2. Filter/search bar: search + filter pills ("All / By sport / By club / Recently added")
3. Teams grid (3-column): logo thumbnail, team name Oswald 700 20px, sport+club Inter 300 12px, small skin preview thumbnail (card-shape, 40×56px), athlete count, "Last updated [date]" in Oswald 500 10px bone-muted
4. Click team → right drawer: full info, skin preview card (160px), roster list, actions ("Edit skin" → `/design/:id`, "Bulk upload to this team" → `/bulk?team=:id`)
5. Top-right of page: "Design new team" primary button (gold-brushed) → navigates to `/design/new` (the entry point for creating a new team record)

**v1.7 inline controls in the Team drawer** (consolidation per v1.6 — Media/Users/Sponsors no longer have standalone screens):

- **Sponsors section** — chips plus a "+ Assign sponsor" button (disabled if no available sponsors). Clicking it opens a `Modal` listing every sponsor not currently assigned to this team; picking one calls `assignSponsorToTeam(sponsorId, teamId)`. Each chip in the list has a small `×` that calls `unassignSponsorFromTeam`. Expiring-soon chips keep the gold-4 highlight. Mutations propagate to the team-card sponsor count in the grid.
- **Club admins section** — lists every `user.role === 'club_admin'` whose `teamIds` include this team (one row per admin: avatar stub, name, email, last-active timestamp). "+ Add admin" is a stub toast for POC; real invite flow is Phase 2-plus.
- **Permission matrix** is surfaced only as read data; no standalone UI in the drawer yet. Future placement would be an expander at the bottom of the drawer.

### 4.7 Bulk Onboarding (Session 2 · v1.5)

**Route:** `/bulk` · `/bulk?team=:id` (team pre-selected, dropdown still editable)

**Purpose:** Onboard a batch of new athletes to a team whose card template is already finalized. **Each row in the Excel roster produces three things in one pass:** (a) a **parent account** (user record), (b) an **athlete on the team roster**, and (c) a **card queued for review**, composed from the team's template. Every athlete in the batch inherits that template — no per-athlete variation, no template re-selection. The flow is an accounts-and-roster intake, not a design surface.

**Invariants:**
- A team's template is locked at the end of the Design Workspace (§4.5). Bulk **never** re-offers the 4-variation picker; it displays the locked template as a read-only confirmation.
- Only teams with a finalized template appear in the dropdown. Teams without templates don't exist in the system per v1.1.
- When the batch ships to processing, each card is composed from **team template + per-athlete panel images** (sponsor ad slots from §4.10, video front/back assignments from §4.8). The Bulk screen doesn't run the compositor itself — it queues the batch for the existing production path.

**Flow — four steps:**

1. **Step 1 — Team**
   - Searchable dropdown listing teams that have a finalized template (all v1.1 teams by definition)
   - Helper text: "Don't see your team? Finalize its template in the Design Workspace first." → `/design/new`
   - Selection fires the **locked-template panel** (below) and advances to Step 2
   - `/bulk?team=:id` pre-selects that team but leaves the dropdown editable

2. **Locked template panel** (always visible once a team is selected, between Step 1 and Step 2)
   - Eyebrow: lock icon + "Template · locked at design"
   - Shows the team's actual signature card via the shared `ComposedCardPreview` primitive (same renderer Review Queue uses) with the team's palette, logo, and `skinBackground` — no SAFC placeholder, no cross-team assets
   - Headline: "Every athlete in this batch inherits this template."
   - Sub: "No per-athlete variation. The team's template was finalized in the Design Workspace and applies to every card produced for [Team] — today's batch and every future upload."
   - Processing note: "When the batch is sent for processing, any sponsor ad slots and assigned video panels are composited into the card alongside the template."

3. **Step 2 — Roster upload · 2 files**
   - Section label explicitly reads **"Roster upload · 2 files"** so the two-file requirement reads at a glance.
   - A gold-tinted **name-match callout** sits above the upload slots: headline "Filenames must match"; body reminds that each Excel row's `photo_filename` must exist in the ZIP, with an example. Unmatched rows are flagged in the next step.
   - **Two upload slots side-by-side** (not a single combined dropzone). Each is a numbered, labeled card:
     - **Slot 1 — Excel roster** · `roster.xlsx` · spreadsheet icon · "All player + parent fields · one row per player"
     - **Slot 2 — Photo folder** · `photos.zip` · folder-archive icon · "One image per player · filenames match the Excel"
     - Each slot has its own idle / uploading / done state. Both must reach done before the flow advances (Excel simulated at 1.6s, ZIP at 2.2s so they don't finish in lockstep).
   - "Download Excel template" gold-3 link top-right (simulated).
   - Excel columns: kid_first_name, kid_last_name, dob, jersey_number, photo_filename, parent_email, parent_name, shipping_address_line1, city, state, zip — rendered as a small hint line below the upload slots.
   - POC behavior: 15-row predefined roster (13 matched cleanly + 2 flagged — one photo missing, one field invalid). Once both slots are done, a single banner replaces the upload area: "Parsed · photos matched · N matched · M flagged. Review below."

4. **Step 3 — Preview**
   - Info line above the table: "Issues are things we couldn't resolve automatically — missing photos, addresses we couldn't parse. Dismiss any row you can't fix right now; the rest will still be onboarded."
   - Shared `DataTable`: Status · Name · # · DOB · Parent · Shipping · (Dismiss action for flagged rows). Sort default: Status ascending, so flagged rows float to the top. DataTable has `gap-x-6` between columns so right-aligned numerics don't visually touch adjacent text columns.
   - Ready rows: gold-3 "Ready" pill; flagged rows: live-red "Issue" pill (single-word, width-matched to Ready per v1.5 refinement) + inline reason beneath the name ("Photo missing · kid_theo_kim.jpg not in uploaded ZIP" / "Address invalid · no street / city / zip detected"). Dismiss simulated via toast; dismissed rows vanish from the table and are excluded from the batch.

5. **Step 4 — Confirm & onboard** (section label)
   - Eyebrow: **"Ready to onboard · [Team]"**
   - **Three-stat block** (left-to-right, divider between each): **"N Parent accounts · N Athletes · N Cards"** — makes all three outcomes of the batch visible before submission.
   - Sub: "Each row creates a parent account, adds the athlete to the [Team] roster, and generates a card composed from the team template plus any sponsor ad slots and assigned video panels. · N dismissed · dismissed rows produce no account, athlete, or card"
   - Primary: **"Onboard batch · create cards"** gold-brushed → for each ready row, creates a parent user + an athlete on the roster + a `QueueItem` in a new `QueueGroup` via `pushQueueGroup`. Copy deliberately names both halves (onboard + cards) so it's clear the action is creating accounts and roster entries, not just queuing cards. State is ephemeral (resets on reload).
   - Success panel eyebrow: **"Batch onboarded · sent for review"**. Headline: **"N parent accounts · N athletes · N cards for [Team]"** · body: "Each athlete is now on the [Team] roster; each parent has an account linked to their athlete; each card is queued for review and will be composed from the team template plus any per-athlete panel images (sponsor slots, assigned videos) as they become available." Two buttons: "View Review Queue" (primary) + "Upload another batch" (secondary, resets the flow).

### 4.8 Media Library — inline controls (Session 2)

**v1.6 change:** No longer a standalone screen. The field requirements below are implemented as **inline controls inside Player Detail (§4.12)**: the videos strip becomes interactive — assign front/back slot, toggle privacy, reassign athlete, download, upload-new. Route `/media` redirects to `/teams`.

**Legacy spec (retained as the control-field checklist for §4.12):**

1. Header: "Media Library" + "342 videos · 30 athletes" (aligned to v1.3 mock state; dashboard tile and this header must stay in sync)
2. Filter bar: search + **shared `FilterPills`** for state (All / Unassigned / Private / Public) + two dropdowns (Team · Time). Replaces the old 8-pill layout — team and time pick from dropdowns to free up horizontal space.
3. **Upload new video** — button top-right, opens a `FileUploadZone` modal; on submit, prepends a new video (unassigned, placeholder thumbnail) to the mock. Ephemeral.
4. Videos grid (4-column): 240×180 tiles, duotone thumbnail, duration badge top-right, athlete overlay bottom, privacy lock icon top-left if private, **slot badge** top-right below duration (`FRONT` / `BACK` / blank if unassigned). Slot badge is color-coded: gold-3 for front, bone-muted for back, hidden if no slot.
5. Click video → right `Drawer`: video thumbnail (large), assignment info (athlete name + team), **slot assignment** (two-button toggle: Front / Back), actions (Reassign dropdown of athletes, Download gold-brushed, Privacy toggle), metadata (upload date, size, views, votes). Back-slot tag is UI-only — the card renderer still only draws the front per §13.2.

### 4.9 User Management — inline controls (Session 2)

**v1.6 change:** No longer a standalone screen. The field requirements below are implemented as **inline controls** in two places: (a) **Player Detail (§4.12)** gains a Parent Accounts card for that athlete (edit email, re-register, disable) and inline player-name editing; (b) **Team drawer (§4.6)** gains a club-admin management list (add / remove admins scoped to that team). The permission-matrix concept survives as a small read-only tab inside the Team drawer's settings section. Route `/users` redirects to `/teams`.

**Legacy spec (retained as the control-field checklist for those two surfaces):**

1. Header: "Users" + "51 users · 47 parents · 3 club admins · 1 super admin" (aligned to v1.3 mock state)
2. Filter bar: search + `FilterPills` (All / Parents / Club admins / Super admins) + status pill (Active / Disabled / Pending re-registration) + `paid/unpaid` quick filter (surfaces which parents are paid up — operational filter per v1.4)
3. **`DataTable` (shared)**: Avatar+Name (Oswald 500 14px bone) · Email (Inter 300 13px bone-muted, inline-editable with pencil hover) · Role pill · Associated teams (chips) · Status pill · Last active (Oswald 500 11px bone-muted) · Actions (3-dot menu: **Edit**, **Re-register**, **Disable**, **Delete**)
4. Row hover: ink-3 fill. Row click opens the edit `Drawer`.
5. Edit `Drawer`: form (name, email, role, associated teams, "paid" toggle for parents, disabled toggle). For child accounts, includes **"Edit associated player"** (inline editable player name via the athlete whose parent this user is). Kevin's own row is visible but the edit drawer is read-only with a "Self · cannot edit" banner.
6. Action outcomes (all simulated — no persistence):
   - **Re-register**: toast "Re-registration link sent to [email]"; status flips to `pending_reregister` in ephemeral state.
   - **Disable**: status flips to `disabled`.
   - **Delete**: row removed from the mock list for the session. If the deleted user's re-registration is needed later, Kevin uses "Re-register deleted users" (a separate action surfaced in a filter view of `disabled` users).
7. **Permission matrix view** (v1.4): a secondary tab on this screen (default tab is User list). The Matrix tab renders a `DataTable` with actions down the left ("Edit team skins", "Approve cards", "Upload rosters", "Manage sponsors", "View analytics", etc.) and role columns (Super admin / Club admin / Parent). Checkmarks where the role has permission. Read-only for POC — illustrates the intended permission model per §1.2. A top banner reminds the reader: "UI-only for POC · runtime authorization is super-admin-sees-all."

### 4.10 Sponsorship Management — inline controls (Session 2)

**v1.6 change:** No longer a standalone screen. Sponsor concerns are already shown as chips in both **Team drawer (§4.6)** and **Player Detail (§4.12)**. The remaining controls — assign / unassign sponsor on a team, edit contract window, manage ad slots, geo-targeting stub — are added as actions inside the **Team drawer** (sponsor section gains an "Assign sponsor" button and per-chip actions). Global sponsor listing is a read-only sub-view reachable from any team drawer. Route `/sponsorships` redirects to `/teams`.

**Legacy spec (retained as the control-field checklist for the Team drawer sponsor section):**

1. Header: "Sponsorships" + "8 sponsors · N team assignments · 2 expiring within 30 days" (derives from mock; dashboard tile stays in sync)
2. Two-tab toggle: "Sponsors" / "Assignments"
3. **Sponsors tab**: grid of sponsor cards (wordmark — no raster logos per §6 — name, contract period, team chips, "expiring soon" gold-4 pill when applicable). "Add sponsor" button top-right opens a **stub `Modal`** with a toast ("Sponsor CRUD is a Phase 2 path") — no real form in POC. Clicking a card opens a right `Drawer` with full details:
   - Name, contract window, status
   - Assigned teams (chips)
   - **Ad slots editor (v1.4)**: visual list of the card's sponsor slots (4 slots per team per card per §13 compositor — top-left sponsor patch, bottom-right sponsor patch, name-lockup sidebar, wordmark-adjacent strip). Each slot shows: slot name, reserved sponsor (if any, or "Open"), a mini card preview with that slot highlighted. For POC, clicking a slot cycles through (empty) → (this sponsor reserved) → (empty) — no persistence.
   - **Geo-targeting block (minimal stub per v1.4)**: "GEO-TARGETING · COMING SOON" label, a disabled button, no map art. Matches the IMVI+ coming-soon pattern for consistency.
4. **Assignments tab**: shared `DataTable` — Team | Sponsor(s) | Contract | Status. Multi-sponsor per team row (chips). "Assign sponsor to team" button opens a `Modal` (team dropdown + sponsor dropdown + contract dates) → toast "Assignment saved · ephemeral for POC."

### 4.11 IMVI+ / Digital Workers (Session 2)

**Route:** `/imvi-plus`

1. Header:
   - Eyebrow: "IMVI+" Oswald 700 18px brushed-gold
   - Hero: "Digital Workers" Oswald 700 40px bone
   - Sub: "AI agents that run parts of your operation. Coming soon." Inter 300 14px bone-muted

2. Agent tiles grid (3-column), each 280px tall, ink-2 bg, gold-3 brushed top border:
   - **Sales Agent** — briefcase icon, "Finds clubs and leagues open to partnerships. Drafts outreach emails. Logs contact history."
   - **Marketing Agent** — megaphone icon, "Generates campaign ideas and social posts. Learns from engagement data."
   - **Operations Agent** — gears icon, "Automates roster management, parent communications, season rollovers."
   - **Venue AR** — location pin icon, "Enables scan-to-content AR experiences at games and venues."
   - Each: icon + title + description + "Coming soon" pill (gold-3 bg, ink text, Oswald 500 10px uppercase letter-spacing 0.25em)
   - Hover: subtle gold-3 glow + slight lift (-2px translate-y)
   - Click: modal "IMVI+ · [Agent Name] · Arriving later in 2026. Get notified when it's ready." with "Notify me" (toast on click: "You'll be notified when [Agent] ships.") + "Close"

### 4.12 Player Detail (Session 2 · v1.4)

**Route:** `/player/:athleteId`

**Purpose:** Data-model viewer centered on a single athlete. Makes the player ↔ card ↔ videos ↔ sponsor relationship visually legible in one surface. Reachable from: Review Queue card click, Teams Directory roster row, Media Library assignment, User Management edit drawer, Athlete Visibility leaderboard row.

**Layout (top to bottom):**

1. **Breadcrumb bar** — `Organization / Club / Team / Athlete` using the `Team.organization` v1.4 field. Each crumb is a link back up the hierarchy: org → teams-filtered view; club → teams-filtered view; team → Teams Directory drawer.

2. **Hero block** (two-column 3fr/2fr)
   - **Left**: athlete photo placeholder (silhouette crest for POC), name (Oswald 700 40px bone), jersey number, age, "Paid · up-to-date" / "Unpaid · N days overdue" badge driven by `Athlete.paid`, card-status pill, media-status pill.
   - **Right**: the player's rendered card — `ComposedCardPreview` at 260px width using their team's skin.

3. **Relationship map** — a horizontal node diagram:
   ```
     Player ──┬── Card (template · status · approved/sent/delivered)
              ├── Videos · N linked (chips with slot tags)
              └── Sponsors · N team-level (chips)
   ```
   Each node is a click target that navigates to the relevant filtered view (card → Review Queue, videos → Media Library filtered to athlete, sponsors → Sponsorships tab filtered to team). Rendered with simple SVG/HTML — no graph library. The visual intent is "Kevin can see how these pieces connect," not an interactive editable graph.

4. **Videos strip** — horizontal scroller of the athlete's videos (thumbnail tiles, duration badges, slot tags). Click → Media Library drawer for that video.

5. **Activity timeline** — compact list of events for this athlete (card submitted, approved, shipped, delivered; media uploaded; sponsor assigned). Pulled from the global `activityFeed` filtered to this `athleteId`. For POC, only a subset of athletes have timelines — the named trio (Leigha, Bryce, Levi) and a few others.

**v1.7 inline controls on Player Detail** (consolidation per v1.6):

- **Parent Accounts card** — between the Sponsors row and the Videos strip. Lists 1–2 parent users per athlete with a three-dot action menu: **Edit email** (opens a small `Modal` with a validated email input; saves via `updateUser`), **Re-register** (flips status to `pending_reregister` + toast), **Disable / Re-enable** (toggles `status` between `active` and `disabled`), **Remove** (live-red; calls `removeUser`). Status pill, paid/unpaid, and last-active are shown inline on the row.
- **Interactive videos strip** — every tile click opens a right-slide `Drawer` with: slot toggle (None / Front / Back), privacy toggle (public/private), reassign-to-another-athlete dropdown (lists every athlete across all teams), Download button (simulated), and Unlink (removes the video from this player, keeping the record as unassigned). A "+ Upload new" button top-right of the strip simulates an upload and pushes a placeholder Video into AppState linked to this athlete.
- Everything mutates real AppState so the dashboard's Athlete Visibility row, Review Queue, and Teams grid all reflect the change within the session. State resets on reload — no persistence.

The relationship map and activity timeline remain read-only signals; editing happens via the cards and drawers above.

---

## 5. Mock data spec

Single `src/mock/data.ts` file.

### 5.1 Super admin (Kevin)
```
{ id: "admin_kevin", name: "Kevin Sterling", email: "kevin@imvi.me", role: "super_admin", avatar: "/avatars/kevin.jpg" }
```

### 5.2 Teams (5 total)
Each: id, name, club, sport, age_group, logo path, skin_id (always present — every team has a skin), athlete_count, last_updated.

The five teams in the POC — every team has both a card-compositor configuration (§13.3) and a completed skin:

1. **NxLVL Chicago** — soccer, U12 (matches Leigha)
2. **PFA San Fernando** — baseball, U12 (matches Bryce)
3. **San Antonio FC** — soccer, U12 (session 1 reference team; the 4 approved sample variations ship for SAFC)
4. **Raiders San Antonio** — football, U14
5. **Batrs Soccer** — soccer, U10 (matches Levi)

### 5.3 Skins (5 — one per team)
Each: id, team_id, background_image path, palette array, created_date, logo path.

### 5.4 Athletes (~40)
Real: Leigha Ghafari, Bryce Opoku, Levi Sterling. Filler per team, distributed U10-U14.

### 5.5 Review Queue items
4-5 groups, all in "READY TO APPROVE" state. Each group: team info, batch of 3-15 composed card previews (with real kid photos where available, placeholders otherwise), submission timestamp.

### 5.6 Sponsors (8)
Athletic Co, Bruce & Bolt, Prep Nation (from mobile) + 5 invented local businesses. Each: id, name, logo_path, contract_start, contract_end, status, assigned_teams.

### 5.7 Activity feed (8-10)
Mix of actions with realistic timestamps.

### 5.8 Videos (30-40)
Reuse mobile's mock pattern across multiple athletes/teams.

### 5.9 Users (15-20)
12-15 parents (fake names+emails, assigned to teams), 2-3 club admins (stubbed), Kevin as super admin.

### 5.10b Session 2 / v1.4 extensions

Added in v1.4 to support §4.6–§4.12:

- **`Team.organization: string`** — third grouping level above `club`. Two teams share an organization ("Alamo Athletic Holdings" owns SAFC + Raiders San Antonio) so the group-by-org view demonstrates N-to-1 mapping. The other three orgs are 1-to-1 with their teams.
- **`Athlete.paid: boolean`** — parent payment status. ~90% paid, a few unpaid to demonstrate the filter.
- **`Athlete.cardStatus: 'not_ready' | 'in_queue' | 'approved' | 'shipped' | 'delivered'`** — operational status driving row-level icons in Teams/Users/Queue.
- **`Athlete.mediaStatus: 'none' | 'uploaded' | 'assigned' | 'complete'`** — video coverage status.
- **`organizations: Organization[]`** — `{ id, name, teamIds }`. Four orgs for 5 teams (one shared). Exists as a derived convenience for the Player Detail breadcrumb + Teams grouping view.
- **`sponsors: Sponsor[]`** — 8 total per §5.6. Each: `{ id, name, contractStart, contractEnd, status, assignedTeamIds, adSlotsReserved }`. Two sponsors (Bruce & Bolt, Compass Rx) have `contractEnd` within 30 days of 2026-04-22 so the dashboard "2 expiring" tile reads true.
- **`videos: Video[]`** — 36 video records. Each: `{ id, athleteId | null, title, durationSec, uploadedAgo, privacy, cardSlot: 'front' | 'back' | null, thumbUrl }`. ~4 unassigned, ~6 back-slot tagged, ~10 private, rest public and front-slot.
- **`users: User[]`** — 51 total: 47 parents (each linked to an athlete's team), 3 club admins (scoped to 1-2 teams each), Kevin. `{ id, name, email, role, teamIds, status, paid, lastActiveAgo, initials }`. ~3 disabled, ~2 pending_reregister to demonstrate states.
- **`rolePermissions: RolePermission[]`** — the permission matrix data. Each: `{ action, superAdmin, clubAdmin, parent }`. ~10 actions covering the operational surface. Read-only, drives the §4.9 Matrix tab.
- **`digitalWorkers: DigitalWorker[]`** — 4 agents per §4.11. `{ id, name, shortName, description, eta, icon }`. Used by IMVI+ tiles.
- **`cardSlots: CardSlot[]`** — 4 sponsor slots per card (top-left, bottom-right, name-lockup side, wordmark strip). Used by the §4.10 ad-slot editor.

### 5.10a Dashboard v1.3 mock tables

Added to `src/mock/data.ts` in v1.3 to drive the three-zone Dashboard (§4.3). Every dataset is hardcoded and realistic — no placeholder zeros, no lorem.

- **Dynamic Focus Panel (v1.8)** — `operationalCounts` (Design Queue / Print Approval / New Teams / Exceptions), `queueAgeDistribution` (4 age buckets), `batchesReadyToApprove` (4 rows), `exceptionsByType` (4 rows with tone), `agentPreparedResponses` (4 rows), `weeklyThroughput` (7 weekday points), plus `weeklyTotal` and `weekOverWeekChange` constants. Replaces the removed `attentionStrip` / `AttentionCardData`.
- **`fulfillmentPipeline: FulfillmentStage[]`** — six stages with count + tone (`muted` / `gold` / `red` / `green`) + `href`.
- **`sevenDayThroughput: TrendPoint[]`** — 7 daily Delivered counts keyed by weekday.
- **`exceptionsList: DashboardException[]`** — 3 items (POC defaults); each carries reason + athlete + team + jersey + age + action + severity (`red` | `amber`).
- **`ordersThisWeek`** — current count + WoW % delta + `last8Weeks: TrendPoint[]`.
- **`revenueThisMonth`** — amount (USD) + MoM % delta + `last6Months: TrendPoint[]` with a December dip for realism.
- **`activeSubscriptions`** — count + `deltaWeek` + 7-point `last7` array.
- **`clubHealthMatrix: ClubHealthPoint[]`** — one row per team (5) with `activity30d` + `athletes` + `orders90d` + `status` (`thriving` / `steady` / `attention`) + `lastActivity`. Drives both the scatter bubble chart and the sorted list.
- **`signupsByTeam: SignupDatum[]`** — new-athlete signups per team, 30-day window.
- **`engagementByTeam: EngagementDatum[]`** — `dau` / `wau` / `mau` per team, stacked in the engagement chart.
- **`visibilityLeaderboard: VisibilityRow[]`** — top-10 athletes with score (normalized) + delta (7-day %) + `sponsorshipCandidate` flag.
- **`quickAccessTiles: QuickAccessTile[]`** — four tiles (Media / Teams / Users / Sponsors) with label + `href` + `stat` + `sub` + tone (`gold` / `bone` / `red`).
- **`activityFeed: ActivityItem[]`** — rewritten to include per-item `href` so every row is a deep link. Content restricted to POC invariants: Kevin-uploaded batches, approvals, skin applications, shipments, sponsor events. No parent self-submissions.

Status colors live in `Dashboard.tsx` (`HEALTH.thriving`, `HEALTH.steady`, `HEALTH.attention`), scoped to dashboard visuals rather than promoted into the global token file.

### 5.10 Card variation PNGs (compositor output)

Flat PNGs produced by the Python card generator (§13), consumed by the Design Workspace preview. Four variations per team: V1 Splatter Band, V2 Diagonal Brush, V3 Torn Paper, V4 Geometric Shards. Each at 800×1120 (2.5:3.5), single-sided.

- **File naming:** `sample_player_{team_key}_v{1-4}.png` (e.g. `sample_player_safc_v1.png`)
- **Location in web app:** `src/assets/card-variations/`
- **Sample player:** all POC cards use "Sample Player · #10" as the neutral placeholder athlete — see §13.13
- **Session 1 ships:** four approved SAFC variations (`sample_player_safc_v{1-4}.png`)
- **Session 2 produces:** the remaining four team sets (NxLVL, PFA, Raiders, Batrs) using the same compositor pipeline

These PNGs replace the pre-baked "AI-generated backgrounds" from prior spec versions. The compositor IS the generator. There are no separate background assets.

---

## 6. Assets required

| Asset | Source | Notes |
|---|---|---|
| Mobile card PDFs | Same as mobile | Reuse for Teams Directory consistency |
| Team logos (5 teams) | Use real NxLVL / PFA / SAFC / Raiders / Batrs logos where available; generate simple abstract marks only if missing | Cleaned to transparent backgrounds via `tools/card-generator/clean_logos.py` |
| Card variation PNGs | Produced by Python card compositor (§13) | 4 per team × 5 teams = 20 PNGs. Session 1: SAFC only (4 PNGs); Session 2: the other 16 |
| Sample player silhouette | CC0 standing figure (OpenClipart #35263) | Gradient-filled at composite time per team palette. POC placeholder for photo slot — real photos apply in production (§13.6) |
| Card compositor fonts | Google Fonts (CSS endpoint at fonts.gstatic.com) | See §13.10 for the full list; these are card-specific and distinct from the web chrome two-font rule |
| Video thumbnails | Reuse Girl_Soccer_Image with duotone varied crops | |
| Sponsor logos | Text wordmarks, no real images | Per mobile's sponsor strip pattern |

---

## 7. Future-feature placements

| Source mention | Where in web portal | How it appears |
|---|---|---|
| Parent self-registration | Phase 2 | Architecturally supported via Review Queue funnel |
| Club admin role | Phase 2 | Users screen allows Kevin to see/create club admins |
| Bulk photo collection via parent email | Not built | Real op is photos included upfront |
| Digital Workers | IMVI+ screen | "Coming soon" tiles with detail modals |
| Geo-targeted sponsorship | Sponsorship Management | Stubbed at bottom of sponsor detail |
| Skin editing | Teams Directory drawer | "Edit skin" → Design Workspace in edit mode |
| Cross-club analytics | Dashboard | Platform stats strip |
| IMVI Awards configuration | Not built in web POC | Exists on mobile; admin config is Phase 2 |

---

## 8. Interaction state map

Single React context `AppState`:

```
AppState:
  route: string
  admin: SuperAdmin
  sidebarCollapsed: boolean
  teams: Team[]
  skins: Skin[]
  athletes: Athlete[]
  reviewQueue: QueueGroup[]
  expandedQueueGroups: string[]
  sponsors: Sponsor[]
  videos: Video[]
  users: User[]
  activityFeed: ActivityItem[]
  modals:
    approveModal: { open, targetGroupId }
    userEdit: { open, userId }
    sponsorEdit: { open, sponsorId }
    imviPlus: { open, agentType }
  drawers:
    teamDetail: { open, teamId }
    videoDetail: { open, videoId }
  designWorkspace:
    teamId
    logoUploaded: boolean
    uploading: boolean
    extractedPalette: { primary, accent, dark, light }
    variationsReady: boolean        # Generate has completed
    generating: boolean             # loading state
    selectedIdx: number | null      # 0..3 → card variation, null → no selection
    approved: boolean               # template applied to team
  toasts: Toast[]
```

---

## 9. Acceptance criteria

1. All screens reachable via sidebar, render per spec
2. Login → CheckEmail → Dashboard completes with simulated pill
3. Dashboard queue cards show mock counts, navigate correctly
4. Review Queue displays grouped items with correct status tags, expand/collapse works
5. Design Workspace flow end-to-end: upload logo → palette extracted (4 swatches visible) → right panel shows "Click generate to see designs" blank state → click Generate → 2-3s loading state → 4 card variation PNGs appear in a 4-column grid (Splatter Band / Diagonal Brush / Torn Paper / Geometric Shards) → right panel updates to "Pick a design on the left" blank state → click a card → selected PNG loads into right panel preview with cross-fade → click "Apply template to team" → confirmed state with green gradient + checkmark. "Regenerate" link re-runs the loading state and returns the same 4 PNGs (deterministic in POC).
6. Bulk Onboarding: team selection (existing-skin only) → mock upload → roster preview → confirm → cards added to queue
7. Media Library grid with functional filter pills (logic can be mocked)
8. User Management table with role pills, row hover, edit drawer
9. Sponsorship Management: sponsors list, assignments table, Add Sponsor modal
10. IMVI+ screen: 4 tiles with "Coming soon" + modal on click
11. Sidebar persists, shows active state
12. Topbar shows correct breadcrumbs per route
13. Brand tokens applied consistently — no hardcoded colors, no system-font fallbacks
14. Gold floor-fade on Login and Dashboard
15. Below 1200px viewport: "Best viewed on desktop" overlay
16. Clean `npm run build`, no console errors, no TypeScript errors

---

## 10. File structure

```
imvi-web-poc/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Shell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── QueueCard.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── TeamCard.tsx
│   │   ├── DataTable.tsx            # shared — rendered in Users, Bulk preview, Sponsorships Assignments, Permission matrix
│   │   ├── FileUploadZone.tsx       # shared — rendered in Bulk, Media upload, Design Workspace
│   │   ├── FilterPills.tsx          # shared — rendered in Teams, Media, Users
│   │   ├── PaletteSwatch.tsx
│   │   ├── BackgroundVariation.tsx
│   │   ├── ComposedCardPreview.tsx
│   │   ├── StatusPill.tsx
│   │   ├── Drawer.tsx               # shared — right-slide, 400–480px, used by Teams / Media / Users / Sponsorships
│   │   ├── Modal.tsx                # shared — center-screen, default + destructive variants
│   │   ├── Toast.tsx
│   │   ├── icons/
│   │   └── ui/
│   ├── screens/
│   │   ├── Login.tsx
│   │   ├── CheckEmail.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ReviewQueue.tsx
│   │   ├── DesignWorkspace.tsx
│   │   ├── Teams.tsx
│   │   ├── BulkOnboarding.tsx
│   │   ├── MediaLibrary.tsx
│   │   ├── UserManagement.tsx
│   │   ├── Sponsorships.tsx
│   │   ├── ImviPlus.tsx
│   │   └── PlayerDetail.tsx         # §4.12 — data-model viewer (v1.4)
│   ├── mock/
│   │   └── data.ts
│   ├── tokens/
│   │   └── theme.ts
│   ├── motion/
│   │   └── variants.ts
│   └── assets/
│       ├── fonts/
│       ├── card-variations/         # compositor output consumed by Design Workspace (§5.10)
│       ├── team-logos/
│       ├── card-thumbnails/
│       └── avatars/
├── tools/
│   └── card-generator/              # Python/Pillow card compositor (§13)
│       ├── generate_card.py
│       ├── clean_logos.py
│       ├── teams.json
│       ├── assets/
│       │   ├── fonts/               # card-specific font library (§13.10)
│       │   ├── logos/               # raw + /transparent/ cleaned
│       │   └── silhouettes/
│       └── output/                  # sample_player_{team}_v{1-4}.png
├── api/                             # Phase 2 real AI integration (optional)
│   └── generate-background.ts
├── index.html
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 11. Build prompt for Claude Code

> This is a frontend-only clickable POC for a youth sports platform admin portal called IMVI. It will be demoed live to the IMVI founder to secure further engagement. **Demo impact matters more than feature completeness. Design quality is the product.**
>
> Source material in working directory:
> - `IMVI_WEB_PORTAL_POC_SPEC.md` — this project's spec
> - `IMVI_MOBILE_POC_SPEC.md` — mobile companion spec (brand/tokens/iconography inherited)
> - `imvi-moodboard.html` — approved brand direction (open in browser before writing CSS)
> - `assets/` — pre-existing imagery to reuse
>
> **Before writing any code:**
>
> 1. **Load the `frontend-design` skill.** Read end-to-end. It prevents generic-AI design.
> 2. **Read both specs in full.** Mobile first (defines the brand inherited from), then web portal.
> 3. **Open the moodboard in a browser.** Feel the brand before writing CSS.
> 4. **Confirm understanding in your first message:** (a) brand direction summary, (b) one-paragraph architecture summary, (c) Session 1 build plan, (d) any clarifying questions.
>
> **Tech stack:** Vite + React 18 + TypeScript + Tailwind + Framer Motion + lucide-react (functional icons only). Self-hosted Google Fonts (Oswald, Inter) — two-font system, no Orbitron. React Router for multi-page routing.
>
> **Session 1 scope (build these only):**
> 1. Project scaffold + package installs
> 2. Design tokens inherited from mobile + web-specific layout tokens
> 3. Tailwind config with tokens
> 4. Self-hosted fonts (reuse mobile's if already converted)
> 5. Custom SVG icon components (mobile's set + web additions from Section 2.6)
> 6. Shell component: Sidebar + Topbar + Content wrapper
> 7. Login screen (4.1) + CheckEmail screen (4.2)
> 8. Dashboard (4.3)
> 9. Review Queue (4.4)
> 10. Design Workspace (4.5) with simulated AI (pre-baked samples)
> 11. Mock data for Session 1 screens (teams, skins, review queue, activity, Kevin)
> 12. React Router routing wired so sidebar nav works between Dashboard, Review Queue, Design Workspace
>
> **Session 1 stops after those screens.** Do NOT build Teams Directory, Bulk Onboarding, Media Library, User Management, Sponsorships, or IMVI+ until Session 2 kicks off.
>
> **Quality requirements:**
> - Every color from tokens. Zero hardcoded hex.
> - Two-font system (Oswald + Inter). No Orbitron.
> - Real brushed-gold gradients, not flat colors.
> - Gold floor-fade on Login and Dashboard.
> - Every brand-expressive icon is custom SVG, not Lucide.
> - Motion uses cubic-bezier(0.19, 1, 0.22, 1) or cubic-bezier(0.4, 0, 0.2, 1). No spring, no ease-in-out defaults.
> - No Playwright, no self-review loops, no screenshot automation — per CLAUDE.md standing rules.
>
> **When Session 1 is done:** stop building, start dev server, report what was built in plain text, wait for my feedback before Session 2.

---

## 12. Phased build instructions

### 12.1 Why phased

Same logic as mobile. Build foundation + highest-leverage screens first (Session 1), validate the brand lands on composed data-rich screens (Dashboard) and on the demo-critical creative flow (Design Workspace), then build remaining breadth (Session 2) with the foundation locked.

### 12.2 Session 1 — Shell + Dashboard + Review Queue + Design Workspace

**In scope:** Scaffold, tokens, fonts, icons, shell, Login, CheckEmail, Dashboard, Review Queue, Design Workspace (simulated AI), mock data subset, routing.

**Out of scope:** Teams Directory, Bulk Onboarding, Media Library, User Management, Sponsorship Management, IMVI+.

**Kickoff prompt:** Section 11 above.

### 12.3 Session 2 — Everything else

**Kickoff only after Session 1 reviewed and approved.**

> This is Session 2 of the IMVI web portal POC. Shell, Dashboard, Review Queue, and Design Workspace are built and approved. Do not rebuild them.
>
> Read `IMVI_WEB_PORTAL_POC_SPEC.md` to refresh. Moodboard and mobile spec remain source of truth. `frontend-design` skill still applies.
>
> Session 2 scope, in order:
> 1. Expand mock data (sponsors, videos, users, IMVI+ metadata)
> 2. Teams Directory (4.6)
> 3. Bulk Onboarding (4.7)
> 4. Media Library (4.8)
> 5. User Management (4.9)
> 6. Sponsorship Management (4.10)
> 7. IMVI+ (4.11)
> 8. Cross-screen drawer/modal components
>
> Quality requirements same as Session 1.
>
> When complete: walk through Section 9 acceptance criteria, confirm all pass, start dev server for full walkthrough.

### 12.4 Session 3 (optional) — Real AI integration

Only if time allows and simulated version is demo-tested and full build is stable:

1. Spin up Vercel Function at `api/generate-background.ts`
2. Store OpenAI/Replicate API key as server-side env variable
3. Endpoint accepts: palette + logo + optional style keywords
4. Calls AI API with prompt template producing 2.5:3.5 ratio backgrounds matching palette
5. Swap simulated call in `DesignWorkspace.tsx` to real endpoint
6. Maintain loading state UI (15-30 second real-world latency)
7. Fallback: if real endpoint fails, use simulated with non-blocking warning toast

### 12.5 If Session 1 requires iteration

Don't proceed to Session 2. Identify gap → follow-up message same session → iterate only affected files → re-review → repeat until first three screens locked → only then Session 2.

---

## 13. Card Generator

The **Python/Pillow card compositor** is the system that produces every card image the web portal displays as a generated design. It is the visual source of truth for cards — Design Workspace consumes its PNG output directly (no re-rendering in React).

### 13.1 Purpose and location

- **Path:** `tools/card-generator/`
- **Entry point:** `generate_card.py` — CLI tool that takes `--first-name`, `--last-name`, `--number`, `--team`, `--variation`, `--output` and emits a single 800×1120 PNG.
- **Support:** `clean_logos.py` strips solid backgrounds from raw team logos (corner flood-fill with tolerance + soft alpha blur) and writes cleaned PNGs to `assets/logos/transparent/`.
- **Configuration:** `teams.json` defines palette, logo, default texture, and default silhouette per team.

### 13.2 Output format

- **Dimensions:** 800×1120 px (2.5:3.5 aspect, matches mobile card + web preview surfaces)
- **File type:** PNG, optimized
- **Single-sided only for POC.** Card back is **future scope** and not built in this phase.

### 13.3 Team coverage

Five teams have compositor configurations (§5.2 list):
`nxlvl · pfa · safc · raiders · batrs`

Each team entry in `teams.json` carries: `display_name`, `logo`, `colors` (primary / accent / dark / light, optional `silhouette`), `default_texture`, optional `default_silhouette`.

Session 1 ships the four approved SAFC variations. Session 2 runs the compositor across the remaining four teams to fill out `src/assets/card-variations/`.

### 13.4 Locked layout (the "template")

Every card, across every variation, across every team, obeys the same compositional frame:

- **Silhouette** — center, ~92% card height, gradient-filled per team palette
- **Name lockup** — bottom zone, two-color, two-font
- **Number** — top-right
- **Team logo** — top-left region (exact scale and position varies per variation — see §13.5)
- **IMVI wordmark** — centered on the bottom frame line
- **Frame border** — rounded-rectangle cream outline, inset ~3.5% from each edge, with a gap knocked out behind the IMVI wordmark so the border "breaks" around it (§13.11)

**This is the template.** It is the mechanism by which brand consistency is structurally enforced. No variation — present or future — may reflow the template.

### 13.5 Four variations per team

Within the locked template, four named variations differ in styling:

| Variation | Label             | Fonts (name lockup)        | Number treatment                         | Background style           | Notes |
|----------:|-------------------|-----------------------------|-------------------------------------------|-----------------------------|-------|
| **V1**    | Splatter Band     | Bangers + Oswald-Bold       | Accent fill + dark outline + drop shadow  | Splatter band (§13.9)       | |
| **V2**    | Diagonal Brush    | Bungee                      | Outlined-only (cream stroke)              | **V4's Geometric Shards**   | Background swap — see §13.12 |
| **V3**    | Torn Paper        | Homemade-Apple + Bowlby-One (or Staatliches pair) | Primary fill + dark outline | Torn-paper rip (§13.9)      | Silhouette shifted right; logo enlarged and placed prominently mid-left |
| **V4**    | Geometric Shards  | Bowlby-One + script         | Light fill + dark outline                 | **V2's Diagonal Brush**     | Background swap — see §13.12 |

Additional per-variation treatment:
- **Chevron device** — thin `>`, `<`, `^`, or `v` marks with progressive fade, placed in different regions per variation (e.g. V3: top-left row of upward chevrons + bottom-right row pointing left). All clusters respect `SAFE_PAD = 32` from the frame border.
- **Logo scale and position** — V1 0.24 top-left; V2 0.28 mid-left (x=47, y=0.26h); V3 0.38 mid-left (x=55, y=0.23h); V4 0.20 upper-left.

### 13.6 Silhouette treatment

A single shared silhouette — CC0 "man silhouette" (OpenClipart #35263) copied to `assets/silhouettes/_silhouette_preview.png` — is the POC placeholder subject. It is filled at composite time with a 4-stop vertical gradient derived from the team palette:

- Accent at top ~88% alpha
- Accent / primary blend at ~80%
- Primary at ~60%
- Dark at ~22%
- Dark transparent at the feet (0%) — so the figure dissolves into the torn-paper / background base rather than cutting off hard

Subject takes ~92% of the card height; the head sits just below the top frame; the feet extend into the name-lockup overlap zone.

**The silhouette is a POC placeholder.** In production, the card compositor will receive a real athlete photo (aligned to the same center slot) instead of the silhouette.

### 13.7 Name lockup

Two-color, two-font. Size contrast between first and last name, and horizontal overlap chosen per variation's composition. "Sample Player" renders across the bottom zone. Per-variation font pairs are listed in §13.5.

### 13.8 Number treatment

Locked top-right. Treatment varies per §13.5: solid+outlined + shadow (V1); outlined-only (V2); primary-fill + outline (V3); light-fill + outline (V4).

### 13.9 Background style families

Four families, each a distinct compositional treatment rendered with Pillow drawing + noise + Gaussian blur:

- **Splatter band** — dense splatter concentrated top/bottom thirds, clean middle zone for silhouette legibility; multi-color palette (primary / accent / dark) with gray tonal wash bands + silver radial glow behind subject
- **Diagonal brush** — centered dark middle zone (y≈24-78%), red top + bottom, jagged transitions, silver scratches + red peek-through inside the dark zone
- **Torn-paper rip** — softened jagged horizontal tear (±10px jag, blur ≈5), layered gray washes (light / mid / deeper) + silver radial glow, mist overlay
- **Geometric shards (broken glass)** — angular polygon shards biased to left/right edges (~72% to edges), palette variation (dark + dark/red mix + dark/primary + subtle primary), silver hairline outlines + scratch streaks; wide dark-red horizontal brush stroke at y≈82% behind the name zone

All four honor the palette — no mood shifting, no extra hues.

### 13.10 Card font library (separate from web chrome)

The card compositor uses a wide pool of character fonts, sourced via the Google Fonts CSS endpoint (`fonts.gstatic.com`):

Oswald Bold / Medium / Light, Bangers, Bungee, Bungee-Shade, Caveat-Bold, Anton, Permanent-Marker, Rock-Salt, Black-Ops-One, Staatliches, Shrikhand, Sacramento, Big-Shoulders-Stencil-Display, Faster-One, Kalam-Bold, Homemade-Apple, Luckiest-Guy, Sigmar-One, Bowlby-One.

**This pool is card-only.** The web chrome's two-font rule (Oswald + Inter) is unchanged and still governs the portal UI.

### 13.11 IMVI wordmark treatment

Centered on the bottom frame line. Oswald-Bold 26pt, straight (no shear), per-letter tracking of 3px, drop shadow + 1px stroke. The frame border is knocked out behind the wordmark via a snapshot/paste technique: capture the background strip before drawing the frame → draw the rounded-rectangle frame → paste the snapshot back over the wordmark's bounding area → draw the wordmark on top. Visual result: the border appears to break cleanly around the wordmark.

### 13.12 Variation ↔ background decoupling

V2 and V4 use swapped backgrounds:
- **V2** (Diagonal Brush name) renders on **V4's Geometric Shards** bg so the dark / outlined lockup has enough red base to read
- **V4** (Geometric Shards name) renders on **V2's Diagonal Brush** bg so the light-script lockup has the dark zone to sit on

This swap is an intentional readability decision, not a bug. The variation name refers to the **styling family** (fonts / number / composition), not the specific background. The compositor's `_compose_locked()` accepts `variation` and `bg_style` as independent parameters.

### 13.13 Sample player placeholder

All POC card outputs use `first_name="Sample"`, `last_name="Player"`, `number="10"`. Keeps the demo neutral — no team-specific player identity burned into the template sample.

### 13.14 Integration with Design Workspace

Design Workspace (§4.5) consumes the compositor output **as flat PNGs** imported into `src/assets/card-variations/`. The React `ComposedCardPreview` component is not used on this screen — typography, chevrons, logo, number treatment, name lockup, and wordmark are all baked into the PNG. Selecting a variation in the UI loads the PNG as an `<img>` into the right panel with a cross-fade.

Review Queue (§4.4) continues to use the React `ComposedCardPreview` component for its thumbnail grid. The two screens are intentionally asymmetric in POC; unifying on PNGs for Review Queue is a Session 2 / later decision.

### 13.15 Logo cleaner

`clean_logos.py` prepares raw team logos for composite:
- Detects if the image already has meaningful alpha (>5% transparent pixels) → leaves it alone
- Otherwise: samples the dominant corner/edge color, flood-fills all four corners with a marker color at tolerance 42, builds a new alpha channel from the marker mask, applies a 0.7px Gaussian blur to soften anti-aliased halos
- Writes cleaned output to `assets/logos/transparent/`

---

## 14. Session 1 Actuals

A retrospective of what was planned for Session 1 versus what actually shipped.

### 14.1 Planned (per §12.2)

1. Project scaffold + package installs
2. Design tokens inherited from mobile + web layout tokens
3. Tailwind config with tokens
4. Self-hosted fonts (Oswald + Inter)
5. Custom SVG icon components
6. Shell: Sidebar + Topbar + Content wrapper
7. Login + CheckEmail
8. Dashboard (§4.3)
9. Review Queue (§4.4)
10. Design Workspace with simulated AI (§4.5)
11. Mock data for Session 1 screens
12. React Router routing

### 14.2 Actually built

- **1–7** built per spec. Self-hosted Oswald + Inter WOFF2s. Custom SVG icons for Upload Zone, AI Generation, Team Monogram. Sidebar/Topbar per §2.3.
- **Login + CheckEmail (§4.1, §4.2)** — per spec.
- **Dashboard (§4.3)** — Session-1 ship was a single-stream layout using hand-built chart primitives (Sparkline, AreaChart, DonutChart, HBarRanking, PipelineFlow). **Rebuilt in v1.3** as the three-zone Command Center (Operations · Business Growth · Management Access) with Recharts-powered visualizations. The hand-built chart primitives and `AnimatedNumber` are now dead code in `src/components/charts/` and `src/components/AnimatedNumber.tsx` — left in place so we can grep and delete in a dedicated cleanup pass rather than stacking deletions onto this rework.
- **Review Queue (§4.4)** — per spec, using `ComposedCardPreview` React component.
- **Design Workspace (§4.5)** — rebuilt per v1.2 of this spec: 4-card single-palette flow on Python PNGs, progressive blank-state right panel, PNG preview, no Save-as-draft, no Nudge pills, approve copy "Apply template to team."
- **Responsiveness fix** — sidebar tokens moved from `width`/`height` into Tailwind's `spacing` extension so `ml-sidebar`, `left-sidebar`, etc. emit the expected utilities.
- **NEW track — Python card generator (§13)** — ~1500-line Pillow compositor. Four approved SAFC variations shipped. Not in the original Session 1 plan; became a major track.

### 14.3 Deferred / not built (Session 2 or later)

- Teams Directory, Bulk Onboarding, Media Library, User Management, Sponsorship Management, IMVI+ — all Session 2 per §12.3.
- Card compositor runs for NxLVL / PFA / Raiders / Batrs — Session 2.
- Review Queue thumbnail switch to compositor PNGs — not planned; the two screens stay asymmetric in POC.
- **Three-zone Dashboard redesign** (Operations / Business Growth / Management Access) — **completed in v1.3**, see §4.3.
- Real AI integration — §12.4 (optional).
- Card back (second side) — future scope beyond POC.

### 14.4 Scope shifts

- **Team count:** 12 → 5 (`nxlvl · pfa · safc · raiders · batrs`). The v1.2 spec locked this at 5 but the Session-1 mock data drifted to a different 12; v1.3 brings the mock back in line with the spec.
- **Card variations:** from 9 pre-baked AI backgrounds to 4 compositor-generated card PNGs per team
- **Card preview machinery:** Design Workspace moved off React `ComposedCardPreview` and onto flat PNG `<img>`; Review Queue still uses the React component
- **Wordmark:** italic-sheared cursive-feel IMVI → straight Oswald-Bold with border-break snapshot technique
- **"Save as draft":** removed from Design Workspace
- **"Nudge" tweak pills:** removed from Design Workspace
- **Approve copy:** "Approve skin and apply to batch" → "Apply template to team" / "Template applied to team"

---

**End of specification.**
