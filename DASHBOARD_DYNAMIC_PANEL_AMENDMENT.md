AMENDMENT TO SECTION 4.3 (DASHBOARD) — replace Attention Required strip with Dynamic Focus Panel

Replace the existing 4-card ATTENTION REQUIRED strip at the top of Zone 1 (OPERATIONS) with a single dynamic panel that carries both the operational counts AND a demo simulation of agentic dashboard behavior.

Zone 1 new structure (top to bottom):
  1. Dynamic Focus Panel (NEW — replaces Attention Required strip)
  2. Fulfillment Pipeline (unchanged)
  3. Exceptions List (unchanged)

Zones 2 and 3 unchanged.

═══════════════════════════════════════════
DYNAMIC FOCUS PANEL
═══════════════════════════════════════════

A single panel, full content-area width, that includes the four operational counts AND a mode-switching visualization region. Demo-only simulation — three hardcoded JSX views swapped via a toggle. No real state logic, no data-driven triggers.

Container:
- Full content-area width
- ink-2 background, 14px radius, 20px internal padding
- 1px gold-3 top border at 40% opacity (signals "agent layer above")
- 40px bottom margin before Fulfillment Pipeline

═══════════════════════════════════════════
HEADER ROW (always present, doesn't change with mode)
═══════════════════════════════════════════

Two-zone horizontal layout:

Left:
  - Eyebrow "TODAY'S OPERATIONAL FOCUS · UPDATED BY IMVI+"
  - Oswald 500 10px uppercase letter-spacing 0.3em gold-3

Right:
  - Mode selector: compact dropdown button
  - Label "Mode · [current mode name]" with chevron-down icon
  - ink-3 bg pill, 32px tall, 12px padding
  - Clicking reveals three options: "Queue Clearance" / "Exception Resolution" / "Steady State"

═══════════════════════════════════════════
COUNT-BAR ROW (always present — replaces old 4-card strip)
═══════════════════════════════════════════

Horizontal row of 4 count tiles below the header. Each tile shows one of the operational counts:
  1. Design Queue: 7
  2. Print Approval: 14
  3. New Teams: 2
  4. Exceptions: 3

Tile layout (compact — smaller than the old cards):
- Row height ~72px
- Each tile 1fr width, 16px internal padding
- Label: Oswald 500 10px uppercase letter-spacing 0.25em bone-muted
- Value: Oswald 700 36px (or 44px when elevated)
- 16px gap between tiles

Mode-based elevation:
- In Queue Clearance mode: "Print Approval" tile is elevated (value Oswald 700 44px gold-3, small sparkle icon beside the label "PRINT APPROVAL ✦")
- In Exception Resolution mode: "Exceptions" tile is elevated (value live-red, sparkle beside label)
- In Steady State mode: no tile elevated (all four at 36px bone)
- Non-elevated tiles render at 36px with bone value, bone-muted label
- Transition between elevation states: 300ms ease-out

═══════════════════════════════════════════
BODY REGION (changes by mode)
═══════════════════════════════════════════

Below the count-bar row, the panel body fills with mode-specific content. Roughly 200-240px tall.

MODE 1 — "Queue Clearance"  (DEFAULT on dashboard load)

  Two-column layout, 50/50 split.

  Left column:
    Label: "QUEUE AGE DISTRIBUTION" — Oswald 500 10px uppercase letter-spacing 0.2em bone-muted
    Horizontal stacked bar chart (Recharts BarChart, horizontal orientation).
    X-axis hidden. Bars stacked in a single horizontal bar showing proportions.
    Segments, left to right:
      - 0–1 days: 6 items (green, harmonious with brand — use existing brand-green token if defined, else muted gold-green)
      - 1–2 days: 5 items (bone)
      - 2–3 days: 2 items (gold-3)
      - 3+ days: 1 item (live-red)
    Segment labels rendered below the bar: "6 · 0-1d" / "5 · 1-2d" / "2 · 2-3d" / "1 · 3+d"

  Right column:
    Label: "BATCHES READY TO APPROVE" — same style
    Vertical list of 4 rows, each 40px tall:
      Row layout: [team name left] [card count + time middle] [Approve button right]
      - NxLVL Chicago · 15 cards · 2 days ago · [Approve]
      - PFA San Fernando · 8 cards · 1 day ago · [Approve]
      - Batrs Soccer · 6 cards · 8 hours ago · [Approve]
      - Riverside Warriors · 4 cards · 6 hours ago · [Approve]
    Team name: Oswald 700 14px bone
    Count+time: Inter 300 12px bone-muted
    Approve button: gold-brushed, 28px tall, 10px horizontal padding, Oswald 500 11px uppercase letter-spacing 0.15em, ink text

MODE 2 — "Exception Resolution"

  Two-column layout, 50/50 split.

  Left column:
    Label: "EXCEPTIONS BY TYPE"
    Horizontal bar chart (Recharts) with 4 bars, one per exception category:
      - Photo quality — 4 (live-red)
      - Address validation — 2 (gold-3)
      - Stuck shipment — 1 (live-red)
      - Missing info — 1 (bone)
    Each bar 24px tall, with count on right end of bar.

  Right column:
    Label: "IMVI+ RESPONSES PREPARED"
    Vertical list of 4 rows, 44px each. These are agent-drafted actions, not raw exception details (the bottom Exceptions list already carries raw details).
    Row layout: [icon + description left] [status pill right]
      Icon: small document-with-pencil SVG (16px, gold-3 stroke)
      Description: "Drafted parent outreach for Sloane Archer (photo request)"
      Status pill: "READY · 1-TAP SEND" in gold-3 bg, ink text, Oswald 500 10px uppercase letter-spacing 0.15em
    Four rows:
      - Drafted parent outreach for Sloane Archer (photo request) · [READY]
      - Retry sequence prepared for Marcus Diaz (address fix) · [READY]
      - Printer escalation email drafted for Santiago Cruz (stalled 3 days) · [READY]
      - Parent question drafted for Mia Chen (missing jersey) · [READY]

MODE 3 — "Steady State"

  Two-column layout, 50/50 split.

  Left column:
    Label: "THIS WEEK'S THROUGHPUT"
    Line chart (Recharts LineChart) showing daily cards-delivered count over last 7 days.
    Data: [5, 6, 8, 7, 9, 7, 5] with day labels Wed-Tue (or similar weekday sequence).
    Line color: gold-3, 2px stroke. Subtle gold floor-fade gradient under the line (opacity 10%).
    Y-axis: ticks at 0, 3, 6, 9, 12. No gridlines.
    X-axis: day abbreviations.
    Hero overlay in top-left corner of chart area: "47 cards · last 7d" (Oswald 700 18px bone for number, Inter 300 12px bone-muted for label).

  Right column:
    Label: "ALL CLEAR" — gold-3 tint
    Hero stat: "47 cards shipped this week" — Oswald 700 28px bone
    Sub: "Your fastest week yet — up 34% from last week" — Inter 300 13px gold-3
    16px gap
    Three status rows, each 28px tall:
      - ✓ Queue clear (0 items > 24h old)
      - ✓ No exceptions
      - ✓ All clubs active
    Each row: gold-3 checkmark icon (14px) + Oswald 500 13px bone text

═══════════════════════════════════════════
AGENT FOOTER STRIP (always present, content changes by mode)
═══════════════════════════════════════════

Below the body region, a horizontal footer strip:
- 48px tall
- ink-3 background
- 2px gold-3 left border (vertical accent on the left edge)
- 16px horizontal padding

Layout: [sparkle icon + agent message left] [deep-link CTA right]
- Sparkle icon: the AI Generation icon from Section 2.6, 16px, gold-3 stroke
- Agent message: Inter 300 13px bone (main) with gold-3 accent on any named counts
- Deep-link: Oswald 500 11px uppercase letter-spacing 0.15em gold-3, with "→" arrow

Mode-specific footer content:

  Queue Clearance:
    "IMVI+ has grouped your queue by team. NxLVL and PFA are oldest — start there."
    → Open Review Queue

  Exception Resolution:
    "4 responses ready. Review and send with one tap each, or approve the batch."
    → Review all 4 drafts

  Steady State:
    "IMVI+ has compiled your weekly ops digest — throughput, top teams, board-share highlights."
    → View digest

═══════════════════════════════════════════
MODE TOGGLE BEHAVIOR
═══════════════════════════════════════════

- Default mode on dashboard load: Queue Clearance
- Clicking the mode selector dropdown reveals three options, clicking one swaps the body + footer + elevation styling
- Transition: 300ms ease-out cross-fade of the body region and footer; count-bar elevation transition runs in parallel
- No persistent state; refreshing the page returns to default Queue Clearance

═══════════════════════════════════════════
MOCK DATA ADDITIONS (Section 5)
═══════════════════════════════════════════

Add to `src/mock/data.ts`:

  operationalCounts: { designQueue: 7, printApproval: 14, newTeams: 2, exceptions: 3 }

  queueAgeDistribution: [
    { ageRange: '0-1d', count: 6 },
    { ageRange: '1-2d', count: 5 },
    { ageRange: '2-3d', count: 2 },
    { ageRange: '3+d', count: 1 }
  ]

  batchesReadyToApprove: [
    { team: 'NxLVL Chicago', cardCount: 15, timeInQueue: '2 days ago' },
    { team: 'PFA San Fernando', cardCount: 8, timeInQueue: '1 day ago' },
    { team: 'Batrs Soccer', cardCount: 6, timeInQueue: '8 hours ago' },
    { team: 'Riverside Warriors', cardCount: 4, timeInQueue: '6 hours ago' }
  ]

  exceptionsByType: [
    { type: 'Photo quality', count: 4 },
    { type: 'Address validation', count: 2 },
    { type: 'Stuck shipment', count: 1 },
    { type: 'Missing info', count: 1 }
  ]

  agentPreparedResponses: [
    { description: 'Drafted parent outreach for Sloane Archer (photo request)', status: 'READY' },
    { description: 'Retry sequence prepared for Marcus Diaz (address fix)', status: 'READY' },
    { description: 'Printer escalation email drafted for Santiago Cruz (stalled 3 days)', status: 'READY' },
    { description: 'Parent question drafted for Mia Chen (missing jersey)', status: 'READY' }
  ]

  weeklyThroughput: [
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 6 },
    { day: 'Fri', count: 8 },
    { day: 'Sat', count: 7 },
    { day: 'Sun', count: 9 },
    { day: 'Mon', count: 7 },
    { day: 'Tue', count: 5 }
  ]

  weeklyTotal: 47
  weekOverWeekChange: '+34%'

═══════════════════════════════════════════
IMPLEMENTATION NOTES
═══════════════════════════════════════════

- Single component: DynamicFocusPanel.tsx with internal sub-components for each of the three body views (QueueClearanceView, ExceptionResolutionView, SteadyStateView).
- Mode is internal React state (useState), default 'queue-clearance'.
- No real data-driven mode selection. This is a demo simulation.
- All three mode views use hardcoded JSX and hardcoded mock data.
- Recharts usage: one chart per mode, kept compact and brand-styled.
- Existing tokens: leverage existing brand colors. If no brand-harmonious green exists in the token system, introduce one token (--color-positive) at roughly #7BA87F or similar muted sage — check with the mobile spec first to see if anything already exists.

═══════════════════════════════════════════
DEMO NARRATIVE
═══════════════════════════════════════════

When walking Kevin through the dashboard, this is the moment to frame the dynamic dashboard concept. Suggested script:

"This panel at the top of operations changes what it emphasizes based on what's happening right now. Today it's in Queue Clearance mode because print approvals are aging — see the Print Approval count is highlighted, and below you see batches ready to approve with the oldest first. If I switch to Exception Resolution — [toggle] — now Exceptions is the highlighted count, and instead of batches you see the responses IMVI+ has already drafted for you, ready to send with one tap. If everything's caught up — [toggle to Steady State] — it celebrates wins and compiles your ops digest. In production this switches automatically based on real state; I'm toggling manually here so you can see all three."

═══════════════════════════════════════════
WHAT TO REMOVE
═══════════════════════════════════════════

Delete the existing ATTENTION REQUIRED strip (the 4-card row with Design Queue / Print Approval / New Team Submissions / Exceptions and their sparklines/bar charts). Its operational counts are preserved in the new panel's count-bar row; its sparklines are replaced by the mode-specific visualizations below.

Keep the Fulfillment Pipeline section unchanged.
Keep the Exceptions list section unchanged (its specificity complements, not duplicates, the new panel's Exception Resolution mode which focuses on agent-prepared responses).
