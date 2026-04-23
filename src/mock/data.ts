/**
 * Single source of truth for POC state. Every screen hardcodes against this.
 * State is ephemeral (React useState) — no persistence across reloads.
 *
 * v1.1 data flow rule: every team in the system has a completed skin.
 * Teams without skins don't exist yet (they're created in Design Workspace).
 *
 * v1.3 reconciliation: team count aligned to spec §5.2 — 5 teams
 * (NxLVL, PFA, SAFC, Raiders, Batrs). Dashboard-specific data added
 * at the bottom of this file.
 */

import bg01 from '../assets/ai-samples/bg-01.svg';
import bg02 from '../assets/ai-samples/bg-02.svg';
import bg03 from '../assets/ai-samples/bg-03.svg';
import bg04 from '../assets/ai-samples/bg-04.svg';
import bg05 from '../assets/ai-samples/bg-05.svg';
import bg06 from '../assets/ai-samples/bg-06.svg';
import bg07 from '../assets/ai-samples/bg-07.svg';
import bg08 from '../assets/ai-samples/bg-08.svg';
import bg09 from '../assets/ai-samples/bg-09.svg';

import logoNxLVL from '../assets/team-logos/nxlvl_chicago.jpg';
import logoPFA from '../assets/team-logos/pfa_san_fernando.jpg';
import logoSAFC from '../assets/team-logos/san_antonio_fc.png';
import logoRaiders from '../assets/team-logos/raiders_sa.jpg';

export const aiSamples = [bg01, bg02, bg03, bg04, bg05, bg06, bg07, bg08, bg09];

export const teamLogos = {
  nxlvlChicago: logoNxLVL,
  pfaSanFernando: logoPFA,
  sanAntonioFC: logoSAFC,
  raidersSA: logoRaiders,
} as const;

export interface Palette {
  primary: string;
  accent: string;
  dark: string;
  light: string;
}

export interface Team {
  id: string;
  name: string;
  monogram: string;
  club: string;
  /** v1.4 — third grouping level above club. Multiple teams can share one organization. */
  organization: string;
  sport: string;
  ageGroup: string;
  palette: Palette;
  skinBackground: string; // one of aiSamples
  /** Real logo image path. When present, renders instead of the monogram SVG. */
  logoImage?: string;
  athleteCount: number;
  createdAt: string; // human-readable for POC
  recentlyAdded?: boolean;
}

export type CardStatus = 'not_ready' | 'in_queue' | 'approved' | 'shipped' | 'delivered';
export type MediaStatus = 'none' | 'uploaded' | 'assigned' | 'complete';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  teamId: string;
  initials: string;
  /** v1.4 — parent payment up-to-date. */
  paid: boolean;
  /** v1.4 — operational status driving row-level icons in Teams/Users/Queue. */
  cardStatus: CardStatus;
  /** v1.4 — video coverage status for this athlete. */
  mediaStatus: MediaStatus;
}

export interface QueueItem {
  id: string;
  athleteId: string;
  submittedAgo: string;
  /**
   * v1.4 — denormalized athlete for ephemeral items created via Bulk
   * Onboarding (§4.7). Bulk-pushed roster entries aren't in the mock
   * `athletes` table, so we carry the data inline. Review Queue renders
   * `item.athlete ?? athleteById(item.athleteId)`.
   */
  athlete?: Athlete;
}

export interface QueueGroup {
  id: string;
  teamId: string;
  status: 'ready'; // v1.1 — only state possible
  items: QueueItem[];
  submittedAgo: string;
}

export interface ActivityItem {
  id: string;
  kind: 'upload' | 'approve' | 'design' | 'ship' | 'sponsor';
  subject: string;
  detail: string;
  timestamp: string;
  /** Route to open when the row is clicked. */
  href: string;
}

export interface Admin {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: string;
  initials: string;
}

export const admin: Admin = {
  id: 'admin_kevin',
  name: 'Kevin Sterling',
  firstName: 'Kevin',
  email: 'kevin@imvi.me',
  role: 'Super Admin',
  initials: 'KS',
};

/**
 * Five teams per spec §5.2 (v1.2 reconciliation). Every team has a completed
 * skin — teams without skins don't exist in the system per v1.1.
 */
export const teams: Team[] = [
  {
    id: 'team_nxlvl_chi',
    name: 'NxLVL Chicago',
    monogram: 'NXL',
    club: 'NxLVL',
    organization: 'NxLVL Sports Inc',
    sport: 'Soccer',
    ageGroup: 'U12',
    // Purple + cream — real NxLVL palette
    palette: { primary: '#5A2590', accent: '#E7E5EA', dark: '#2A0F4A', light: '#F5F1E8' },
    skinBackground: bg03,
    logoImage: logoNxLVL,
    athleteCount: 18,
    createdAt: 'Jan 2026',
  },
  {
    id: 'team_pfa_sf',
    name: 'PFA San Fernando',
    monogram: 'PFA',
    club: 'PFA Elite',
    organization: 'PFA Baseball Federation',
    sport: 'Baseball',
    ageGroup: 'U12',
    // Sunshine yellow + black
    palette: { primary: '#FFD60A', accent: '#0E0E0E', dark: '#050505', light: '#F5F1E8' },
    skinBackground: bg07,
    logoImage: logoPFA,
    athleteCount: 15,
    createdAt: 'Feb 2026',
  },
  {
    id: 'team_safc',
    name: 'San Antonio FC',
    monogram: 'SAFC',
    club: 'San Antonio Football Club',
    organization: 'Alamo Athletic Holdings',
    sport: 'Soccer',
    ageGroup: 'U12',
    // Red + silver + black — real SAFC shield palette
    palette: { primary: '#E03131', accent: '#D9D4CE', dark: '#0D0D0D', light: '#F5F1E8' },
    skinBackground: bg06,
    logoImage: logoSAFC,
    athleteCount: 16,
    createdAt: 'Feb 2026',
  },
  {
    id: 'team_raiders_sa',
    name: 'Raiders San Antonio',
    monogram: 'RSA',
    club: 'Raiders',
    organization: 'Alamo Athletic Holdings',
    sport: 'Football',
    ageGroup: 'U14',
    // Silver + black — Raiders heritage
    palette: { primary: '#C4C4C4', accent: '#0A0A0A', dark: '#000000', light: '#F5F1E8' },
    skinBackground: bg02,
    logoImage: logoRaiders,
    athleteCount: 22,
    createdAt: 'Mar 2026',
    recentlyAdded: true,
  },
  {
    id: 'team_batrs',
    name: 'Batrs Soccer',
    monogram: 'BTR',
    club: 'Batrs',
    organization: 'Batrs Sports',
    sport: 'Soccer',
    ageGroup: 'U10',
    // Navy + sunflower yellow
    palette: { primary: '#11204A', accent: '#F4C21C', dark: '#0B1736', light: '#F5F1E8' },
    skinBackground: bg04,
    athleteCount: 14,
    createdAt: 'Feb 2026',
  },
];

/** Quick lookup helper — used everywhere. */
export const teamById = (id: string): Team | undefined =>
  teams.find((t) => t.id === id);

/**
 * Athletes — named-real trio + filler per team across the 5 spec teams.
 * v1.4 adds per-athlete operational status (paid / cardStatus / mediaStatus)
 * to drive filter pills, row icons, and Player Detail §4.12.
 */
export const athletes: Athlete[] = [
  // Real names
  { id: 'ath_leigha', firstName: 'Leigha', lastName: 'Ghafari', jerseyNumber: 7, teamId: 'team_nxlvl_chi', initials: 'LG', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },
  { id: 'ath_bryce', firstName: 'Bryce', lastName: 'Opoku', jerseyNumber: 24, teamId: 'team_pfa_sf', initials: 'BO', paid: true, cardStatus: 'in_queue', mediaStatus: 'complete' },
  { id: 'ath_levi', firstName: 'Levi', lastName: 'Sterling', jerseyNumber: 9, teamId: 'team_batrs', initials: 'LS', paid: true, cardStatus: 'approved', mediaStatus: 'uploaded' },

  // NxLVL Chicago
  { id: 'ath_nx_01', firstName: 'Amara', lastName: 'Okonkwo', jerseyNumber: 3, teamId: 'team_nxlvl_chi', initials: 'AO', paid: true, cardStatus: 'delivered', mediaStatus: 'assigned' },
  { id: 'ath_nx_02', firstName: 'Priya', lastName: 'Narang', jerseyNumber: 5, teamId: 'team_nxlvl_chi', initials: 'PN', paid: true, cardStatus: 'shipped', mediaStatus: 'complete' },
  { id: 'ath_nx_03', firstName: 'Mila', lastName: 'Fontaine', jerseyNumber: 8, teamId: 'team_nxlvl_chi', initials: 'MF', paid: true, cardStatus: 'in_queue', mediaStatus: 'uploaded' },
  { id: 'ath_nx_04', firstName: 'Sloane', lastName: 'Archer', jerseyNumber: 10, teamId: 'team_nxlvl_chi', initials: 'SA', paid: true, cardStatus: 'in_queue', mediaStatus: 'uploaded' },
  { id: 'ath_nx_05', firstName: 'Imani', lastName: 'Park', jerseyNumber: 11, teamId: 'team_nxlvl_chi', initials: 'IP', paid: false, cardStatus: 'not_ready', mediaStatus: 'none' },
  { id: 'ath_nx_06', firstName: 'Vera', lastName: 'Solano', jerseyNumber: 14, teamId: 'team_nxlvl_chi', initials: 'VS', paid: true, cardStatus: 'approved', mediaStatus: 'assigned' },
  { id: 'ath_nx_07', firstName: 'Nadia', lastName: 'Reyes', jerseyNumber: 15, teamId: 'team_nxlvl_chi', initials: 'NR', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },
  { id: 'ath_nx_08', firstName: 'Juno', lastName: 'Hollis', jerseyNumber: 17, teamId: 'team_nxlvl_chi', initials: 'JH', paid: true, cardStatus: 'delivered', mediaStatus: 'assigned' },

  // PFA San Fernando
  { id: 'ath_pf_01', firstName: 'Marcus', lastName: 'Diaz', jerseyNumber: 1, teamId: 'team_pfa_sf', initials: 'MD', paid: true, cardStatus: 'in_queue', mediaStatus: 'uploaded' },
  { id: 'ath_pf_02', firstName: 'Elias', lastName: 'Hunter', jerseyNumber: 6, teamId: 'team_pfa_sf', initials: 'EH', paid: true, cardStatus: 'in_queue', mediaStatus: 'uploaded' },
  { id: 'ath_pf_03', firstName: 'Caleb', lastName: 'Mireles', jerseyNumber: 13, teamId: 'team_pfa_sf', initials: 'CM', paid: true, cardStatus: 'in_queue', mediaStatus: 'assigned' },
  { id: 'ath_pf_04', firstName: 'Theo', lastName: 'Bishop', jerseyNumber: 19, teamId: 'team_pfa_sf', initials: 'TB', paid: false, cardStatus: 'not_ready', mediaStatus: 'none' },
  { id: 'ath_pf_05', firstName: 'Josiah', lastName: 'Malik', jerseyNumber: 22, teamId: 'team_pfa_sf', initials: 'JM', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },

  // Batrs Soccer
  { id: 'ath_bt_01', firstName: 'Rhys', lastName: 'Calder', jerseyNumber: 2, teamId: 'team_batrs', initials: 'RC', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },
  { id: 'ath_bt_02', firstName: 'Mateo', lastName: 'Ashford', jerseyNumber: 4, teamId: 'team_batrs', initials: 'MA', paid: true, cardStatus: 'shipped', mediaStatus: 'assigned' },
  { id: 'ath_bt_03', firstName: 'Zane', lastName: 'Okello', jerseyNumber: 6, teamId: 'team_batrs', initials: 'ZO', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },
  { id: 'ath_bt_04', firstName: 'Isaiah', lastName: 'Prescott', jerseyNumber: 12, teamId: 'team_batrs', initials: 'IP', paid: false, cardStatus: 'in_queue', mediaStatus: 'uploaded' },
  { id: 'ath_bt_05', firstName: 'Noor', lastName: 'Haddad', jerseyNumber: 16, teamId: 'team_batrs', initials: 'NH', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },

  // San Antonio FC
  { id: 'ath_sf_01', firstName: 'Diego', lastName: 'Velasquez', jerseyNumber: 7, teamId: 'team_safc', initials: 'DV', paid: true, cardStatus: 'shipped', mediaStatus: 'complete' },
  { id: 'ath_sf_02', firstName: 'Santiago', lastName: 'Cruz', jerseyNumber: 10, teamId: 'team_safc', initials: 'SC', paid: true, cardStatus: 'approved', mediaStatus: 'complete' },
  { id: 'ath_sf_03', firstName: 'Andres', lastName: 'Moreno', jerseyNumber: 11, teamId: 'team_safc', initials: 'AM', paid: true, cardStatus: 'delivered', mediaStatus: 'assigned' },
  { id: 'ath_sf_04', firstName: 'Emilio', lastName: 'Navarro', jerseyNumber: 14, teamId: 'team_safc', initials: 'EN', paid: true, cardStatus: 'in_queue', mediaStatus: 'uploaded' },
  { id: 'ath_sf_05', firstName: 'Lucas', lastName: 'Ortiz', jerseyNumber: 18, teamId: 'team_safc', initials: 'LO', paid: true, cardStatus: 'delivered', mediaStatus: 'complete' },

  // Raiders San Antonio
  { id: 'ath_rs_01', firstName: 'Dante', lastName: 'Harris', jerseyNumber: 4, teamId: 'team_raiders_sa', initials: 'DH', paid: true, cardStatus: 'approved', mediaStatus: 'uploaded' },
  { id: 'ath_rs_02', firstName: 'Cole', lastName: 'Bennett', jerseyNumber: 22, teamId: 'team_raiders_sa', initials: 'CB', paid: true, cardStatus: 'approved', mediaStatus: 'assigned' },
  { id: 'ath_rs_03', firstName: 'Xavier', lastName: 'Paulson', jerseyNumber: 55, teamId: 'team_raiders_sa', initials: 'XP', paid: true, cardStatus: 'shipped', mediaStatus: 'complete' },
  { id: 'ath_rs_04', firstName: 'Malik', lastName: 'Jennings', jerseyNumber: 81, teamId: 'team_raiders_sa', initials: 'MJ', paid: true, cardStatus: 'approved', mediaStatus: 'uploaded' },
  { id: 'ath_rs_05', firstName: 'Tariq', lastName: 'Wade', jerseyNumber: 99, teamId: 'team_raiders_sa', initials: 'TW', paid: false, cardStatus: 'in_queue', mediaStatus: 'none' },
];

export const athleteById = (id: string): Athlete | undefined =>
  athletes.find((a) => a.id === id);

export const athletesByTeam = (teamId: string): Athlete[] =>
  athletes.filter((a) => a.teamId === teamId);

/**
 * Review queue — 4 groups, all READY TO APPROVE per v1.1.
 * One big batch, two medium, one small — feels like a real operator inbox.
 */
export const reviewQueue: QueueGroup[] = [
  {
    id: 'qg_nxlvl',
    teamId: 'team_nxlvl_chi',
    status: 'ready',
    submittedAgo: '2h ago',
    items: [
      { id: 'qi_001', athleteId: 'ath_leigha', submittedAgo: '2h ago' },
      { id: 'qi_002', athleteId: 'ath_nx_01', submittedAgo: '2h ago' },
      { id: 'qi_003', athleteId: 'ath_nx_02', submittedAgo: '2h ago' },
      { id: 'qi_004', athleteId: 'ath_nx_03', submittedAgo: '2h ago' },
      { id: 'qi_005', athleteId: 'ath_nx_04', submittedAgo: '2h ago' },
      { id: 'qi_006', athleteId: 'ath_nx_05', submittedAgo: '2h ago' },
      { id: 'qi_007', athleteId: 'ath_nx_06', submittedAgo: '2h ago' },
      { id: 'qi_008', athleteId: 'ath_nx_07', submittedAgo: '2h ago' },
      { id: 'qi_009', athleteId: 'ath_nx_08', submittedAgo: '2h ago' },
    ],
  },
  {
    id: 'qg_pfa',
    teamId: 'team_pfa_sf',
    status: 'ready',
    submittedAgo: '5h ago',
    items: [
      { id: 'qi_010', athleteId: 'ath_bryce', submittedAgo: '5h ago' },
      { id: 'qi_011', athleteId: 'ath_pf_01', submittedAgo: '5h ago' },
      { id: 'qi_012', athleteId: 'ath_pf_02', submittedAgo: '5h ago' },
      { id: 'qi_013', athleteId: 'ath_pf_03', submittedAgo: '5h ago' },
    ],
  },
  {
    id: 'qg_batrs',
    teamId: 'team_batrs',
    status: 'ready',
    submittedAgo: 'Yesterday',
    items: [
      { id: 'qi_014', athleteId: 'ath_levi', submittedAgo: 'Yesterday' },
      { id: 'qi_015', athleteId: 'ath_bt_01', submittedAgo: 'Yesterday' },
      { id: 'qi_016', athleteId: 'ath_bt_02', submittedAgo: 'Yesterday' },
      { id: 'qi_017', athleteId: 'ath_bt_03', submittedAgo: 'Yesterday' },
      { id: 'qi_018', athleteId: 'ath_bt_04', submittedAgo: 'Yesterday' },
      { id: 'qi_019', athleteId: 'ath_bt_05', submittedAgo: 'Yesterday' },
    ],
  },
  {
    id: 'qg_safc',
    teamId: 'team_safc',
    status: 'ready',
    submittedAgo: '2 days ago',
    items: [
      { id: 'qi_020', athleteId: 'ath_sf_01', submittedAgo: '2 days ago' },
    ],
  },
];

export const totalQueueItems = reviewQueue.reduce(
  (acc, g) => acc + g.items.length,
  0,
);

/** Activity feed — POC invariants: Kevin/bulk-driven actions only, no parent submits. */
export const activityFeed: ActivityItem[] = [
  {
    id: 'af_1',
    kind: 'upload',
    subject: 'Batch uploaded',
    detail: 'NxLVL Chicago · 9 cards',
    timestamp: '12 min ago',
    href: '/review',
  },
  {
    id: 'af_2',
    kind: 'approve',
    subject: 'Approved to print',
    detail: 'Bryce Opoku · PFA San Fernando',
    timestamp: '28 min ago',
    href: '/review',
  },
  {
    id: 'af_3',
    kind: 'design',
    subject: 'Skin applied to team',
    detail: 'Raiders San Antonio · Splatter Band',
    timestamp: '2 hrs ago',
    href: '/design/new',
  },
  {
    id: 'af_4',
    kind: 'ship',
    subject: 'Sent to print',
    detail: 'San Antonio FC · batch of 16',
    timestamp: '4 hrs ago',
    href: '/review',
  },
  {
    id: 'af_5',
    kind: 'sponsor',
    subject: 'Sponsor assigned',
    detail: 'Bruce & Bolt → Batrs Soccer',
    timestamp: 'Yesterday',
    href: '/teams',
  },
  {
    id: 'af_6',
    kind: 'upload',
    subject: 'Batch uploaded',
    detail: 'PFA San Fernando · 4 cards',
    timestamp: 'Yesterday',
    href: '/review',
  },
  {
    id: 'af_7',
    kind: 'approve',
    subject: 'Approved batch',
    detail: 'Batrs Soccer · 6 cards',
    timestamp: '2 days ago',
    href: '/review',
  },
  {
    id: 'af_8',
    kind: 'sponsor',
    subject: 'Contract expiring',
    detail: 'Bruce & Bolt · 12 days remaining',
    timestamp: '3 days ago',
    href: '/teams',
  },
];

/** Dashboard top-level numbers. */
export const platformStats = {
  queuePending: totalQueueItems,
  queueNewToday: 3,
  newTeamsThisMonth: teams.filter((t) => t.recentlyAdded).length,
  shippedThisWeek: 47,
  teamsActive: teams.length,
  athletes: athletes.length,
  sponsors: 8,
  cardsShipped: 341,
};

/** Retained for legacy Session 1 widgets that still reference it. */
export interface TrendPoint {
  label: string; // short week label
  value: number;
}

export const weeklyShipped: TrendPoint[] = [
  { label: 'W1',  value: 12 },
  { label: 'W2',  value: 18 },
  { label: 'W3',  value: 15 },
  { label: 'W4',  value: 22 },
  { label: 'W5',  value: 19 },
  { label: 'W6',  value: 28 },
  { label: 'W7',  value: 24 },
  { label: 'W8',  value: 31 },
  { label: 'W9',  value: 29 },
  { label: 'W10', value: 36 },
  { label: 'W11', value: 41 },
  { label: 'W12', value: 47 },
];

export interface SportSlice {
  name: string;
  count: number;
  color: string;
}

export const sportBreakdown: SportSlice[] = [
  { name: 'Soccer',   count: 63, color: '#C9A24E' },
  { name: 'Baseball', count: 15, color: '#E8C472' },
  { name: 'Football', count: 22, color: '#E53935' },
];

export interface TeamRanking {
  teamId: string;
  cards: number;
  color: string;
}

export const topTeamsByVolume: TeamRanking[] = [
  { teamId: 'team_nxlvl_chi',    cards: 47, color: '#C9A24E' },
  { teamId: 'team_safc',         cards: 38, color: '#E53935' },
  { teamId: 'team_pfa_sf',       cards: 34, color: '#E8C472' },
  { teamId: 'team_raiders_sa',   cards: 26, color: '#C9A24E' },
  { teamId: 'team_batrs',        cards: 22, color: '#E53935' },
];

export interface PipelineStage {
  stage: string;
  count: number;
  tone: 'muted' | 'gold' | 'red';
}

export const productionPipeline: PipelineStage[] = [
  { stage: 'Uploaded',  count: 26, tone: 'muted' },
  { stage: 'In review', count: 20, tone: 'gold' },
  { stage: 'Approved',  count: 12, tone: 'gold' },
  { stage: 'Printing',  count: 18, tone: 'red' },
  { stage: 'Shipped',   count: 47, tone: 'red' },
];

export const lifetimeCardsShipped = 341;
export const growthVsPriorMonth = 0.63; // +63% MoM

/* ────────────────────────────────────────────────────────────────────────
 * DASHBOARD v1.3 — three-zone rework (spec §4.3 amendment)
 * ──────────────────────────────────────────────────────────────────────── */

// ZONE 1 — OPERATIONS

/**
 * v1.8 — Dynamic Focus Panel replaces the legacy 4-card Attention Required
 * strip. The four operational counts live in `operationalCounts`; the
 * sparkline/bar data is gone (replaced by mode-specific visualizations in
 * the new panel). See DASHBOARD_DYNAMIC_PANEL_AMENDMENT.md.
 */

export interface OperationalCounts {
  designQueue: number;
  printApproval: number;
  newTeams: number;
  exceptions: number;
}

export const operationalCounts: OperationalCounts = {
  designQueue: 7,
  printApproval: 14,
  newTeams: 2,
  exceptions: 3,
};

export interface QueueAgeBucket {
  ageRange: '0-1d' | '1-2d' | '2-3d' | '3+d';
  count: number;
}

export const queueAgeDistribution: QueueAgeBucket[] = [
  { ageRange: '0-1d', count: 6 },
  { ageRange: '1-2d', count: 5 },
  { ageRange: '2-3d', count: 2 },
  { ageRange: '3+d', count: 1 },
];

export interface BatchReadyToApprove {
  team: string;
  cardCount: number;
  timeInQueue: string;
}

export const batchesReadyToApprove: BatchReadyToApprove[] = [
  { team: 'NxLVL Chicago',       cardCount: 15, timeInQueue: '2 days ago' },
  { team: 'PFA San Fernando',    cardCount: 8,  timeInQueue: '1 day ago' },
  { team: 'Batrs Soccer',        cardCount: 6,  timeInQueue: '8 hours ago' },
  { team: 'Riverside Warriors',  cardCount: 4,  timeInQueue: '6 hours ago' },
];

export interface ExceptionByType {
  type: 'Photo quality' | 'Address validation' | 'Stuck shipment' | 'Missing info';
  count: number;
  /** Tone applied to the bar and count. */
  tone: 'red' | 'gold' | 'bone';
}

export const exceptionsByType: ExceptionByType[] = [
  { type: 'Photo quality',       count: 4, tone: 'red' },
  { type: 'Address validation',  count: 2, tone: 'gold' },
  { type: 'Stuck shipment',      count: 1, tone: 'red' },
  { type: 'Missing info',        count: 1, tone: 'bone' },
];

export interface AgentPreparedResponse {
  description: string;
  status: 'READY';
}

export const agentPreparedResponses: AgentPreparedResponse[] = [
  { description: 'Drafted parent outreach for Sloane Archer (photo request)', status: 'READY' },
  { description: 'Retry sequence prepared for Marcus Diaz (address fix)', status: 'READY' },
  { description: 'Printer escalation email drafted for Santiago Cruz (stalled 3 days)', status: 'READY' },
  { description: 'Parent question drafted for Mia Chen (missing jersey)', status: 'READY' },
];

export interface ThroughputPoint {
  day: string;
  count: number;
}

export const weeklyThroughput: ThroughputPoint[] = [
  { day: 'Wed', count: 5 },
  { day: 'Thu', count: 6 },
  { day: 'Fri', count: 8 },
  { day: 'Sat', count: 7 },
  { day: 'Sun', count: 9 },
  { day: 'Mon', count: 7 },
  { day: 'Tue', count: 5 },
];

export const weeklyTotal = 47;
export const weekOverWeekChange = '+34%';

/**
 * Fulfillment pipeline — six stages, card-level. Width of each stage block
 * is proportional to count so the "shape" of the pipeline reads instantly.
 */
export interface FulfillmentStage {
  stage: string;
  count: number;
  tone: 'muted' | 'gold' | 'red' | 'green';
  href: string;
}

export const fulfillmentPipeline: FulfillmentStage[] = [
  { stage: 'Submitted',  count: 22, tone: 'muted', href: '/review' },
  { stage: 'In Design',  count: 7,  tone: 'muted', href: '/design/new' },
  { stage: 'Approved',   count: 14, tone: 'gold',  href: '/review' },
  { stage: 'At Printer', count: 18, tone: 'gold',  href: '/review' },
  { stage: 'Shipped',    count: 31, tone: 'red',   href: '/review' },
  { stage: 'Delivered',  count: 47, tone: 'green', href: '/review' },
];

/** 7-day throughput — cards reaching Delivered, per day (oldest → today). */
export const sevenDayThroughput: TrendPoint[] = [
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 7 },
  { label: 'Fri', value: 4 },
  { label: 'Sat', value: 8 },
  { label: 'Sun', value: 6 },
  { label: 'Mon', value: 9 },
  { label: 'Tue', value: 8 },
];

export interface DashboardException {
  id: string;
  reason: string;
  athlete: string;
  team: string;
  jersey: string;
  age: string; // "3 days", "1 day"
  action: string;
  severity: 'red' | 'amber';
}

export const exceptionsList: DashboardException[] = [
  {
    id: 'exc_1',
    reason: 'Photo below resolution threshold',
    athlete: 'Sloane Archer',
    team: 'NxLVL Chicago',
    jersey: '#10',
    age: '2 days',
    action: 'Request new photo',
    severity: 'amber',
  },
  {
    id: 'exc_2',
    reason: 'Address validation failed',
    athlete: 'Marcus Diaz',
    team: 'PFA San Fernando',
    jersey: '#1',
    age: '1 day',
    action: 'Contact parent',
    severity: 'amber',
  },
  {
    id: 'exc_3',
    reason: 'Printer stalled — no confirmation',
    athlete: 'Santiago Cruz',
    team: 'San Antonio FC',
    jersey: '#10',
    age: '3 days',
    action: 'Check with printer',
    severity: 'red',
  },
];

// ZONE 2 — BUSINESS GROWTH

export const ordersThisWeek = {
  count: 58,
  weekOverWeekPct: 0.18, // +18%
  last8Weeks: [
    { label: 'W05', value: 29 },
    { label: 'W06', value: 34 },
    { label: 'W07', value: 31 },
    { label: 'W08', value: 42 },
    { label: 'W09', value: 39 },
    { label: 'W10', value: 46 },
    { label: 'W11', value: 49 },
    { label: 'W12', value: 58 },
  ] as TrendPoint[],
};

export const revenueThisMonth = {
  amountUSD: 18420,
  monthOverMonthPct: 0.22, // +22%
  last6Months: [
    { label: 'Nov', value: 9200 },
    { label: 'Dec', value: 8100 }, // holiday dip
    { label: 'Jan', value: 10450 },
    { label: 'Feb', value: 12800 },
    { label: 'Mar', value: 15100 },
    { label: 'Apr', value: 18420 },
  ] as TrendPoint[],
};

export const activeSubscriptions = {
  count: 142,
  deltaWeek: 11,
  last7: [121, 124, 128, 130, 135, 138, 142],
};

/**
 * Club health matrix — one row per team. Plotted as a bubble chart:
 *   x = activity (30-day submissions)
 *   y = athletes on platform
 *   size = 90-day orders
 *   color = status bucket
 */
export type HealthStatus = 'thriving' | 'steady' | 'attention';

export interface ClubHealthPoint {
  teamId: string;
  teamName: string;
  activity30d: number;
  athletes: number;
  orders90d: number;
  status: HealthStatus;
  lastActivity: string;
}

export const clubHealthMatrix: ClubHealthPoint[] = [
  {
    teamId: 'team_nxlvl_chi',
    teamName: 'NxLVL Chicago',
    activity30d: 24,
    athletes: 18,
    orders90d: 47,
    status: 'thriving',
    lastActivity: '2 hours ago',
  },
  {
    teamId: 'team_safc',
    teamName: 'San Antonio FC',
    activity30d: 18,
    athletes: 16,
    orders90d: 38,
    status: 'thriving',
    lastActivity: '4 hours ago',
  },
  {
    teamId: 'team_pfa_sf',
    teamName: 'PFA San Fernando',
    activity30d: 12,
    athletes: 15,
    orders90d: 34,
    status: 'steady',
    lastActivity: '5 hours ago',
  },
  {
    teamId: 'team_raiders_sa',
    teamName: 'Raiders San Antonio',
    activity30d: 9,
    athletes: 22,
    orders90d: 26,
    status: 'steady',
    lastActivity: '2 days ago',
  },
  {
    teamId: 'team_batrs',
    teamName: 'Batrs Soccer',
    activity30d: 2,
    athletes: 14,
    orders90d: 22,
    status: 'attention',
    lastActivity: '18 days ago',
  },
];

/** 30-day new-athlete signups per team — horizontal bar. */
export interface SignupDatum {
  teamId: string;
  teamName: string;
  signups: number;
}

export const signupsByTeam: SignupDatum[] = [
  { teamId: 'team_nxlvl_chi',  teamName: 'NxLVL Chicago',        signups: 9 },
  { teamId: 'team_safc',       teamName: 'San Antonio FC',       signups: 7 },
  { teamId: 'team_raiders_sa', teamName: 'Raiders San Antonio',  signups: 6 },
  { teamId: 'team_pfa_sf',     teamName: 'PFA San Fernando',     signups: 4 },
  { teamId: 'team_batrs',      teamName: 'Batrs Soccer',         signups: 1 },
];

/** DAU / WAU / MAU per team — stacked bar. */
export interface EngagementDatum {
  teamId: string;
  teamName: string;
  dau: number;
  wau: number;
  mau: number;
}

export const engagementByTeam: EngagementDatum[] = [
  { teamId: 'team_nxlvl_chi',  teamName: 'NxLVL',   dau: 8, wau: 14, mau: 18 },
  { teamId: 'team_safc',       teamName: 'SAFC',    dau: 7, wau: 12, mau: 16 },
  { teamId: 'team_pfa_sf',     teamName: 'PFA',     dau: 5, wau: 10, mau: 15 },
  { teamId: 'team_raiders_sa', teamName: 'Raiders', dau: 6, wau: 11, mau: 22 },
  { teamId: 'team_batrs',      teamName: 'Batrs',   dau: 2, wau: 4,  mau: 14 },
];

/** Athlete visibility leaderboard — mocked engagement score + trend. */
export interface VisibilityRow {
  athleteId: string;
  firstName: string;
  lastName: string;
  teamName: string;
  /** Mocked engagement metric — pct of leader. */
  score: number;
  /** Last-7 delta pct; positive = rising. */
  delta: number;
  /** Top N get a "Consider for sponsorship" flag. */
  sponsorshipCandidate: boolean;
}

export const visibilityLeaderboard: VisibilityRow[] = [
  { athleteId: 'ath_leigha', firstName: 'Leigha', lastName: 'Ghafari',     teamName: 'NxLVL Chicago',       score: 100, delta: 0.18, sponsorshipCandidate: true },
  { athleteId: 'ath_bryce',  firstName: 'Bryce',  lastName: 'Opoku',       teamName: 'PFA San Fernando',    score: 94,  delta: 0.12, sponsorshipCandidate: true },
  { athleteId: 'ath_sf_02',  firstName: 'Santiago', lastName: 'Cruz',      teamName: 'San Antonio FC',      score: 88,  delta: 0.22, sponsorshipCandidate: true },
  { athleteId: 'ath_levi',   firstName: 'Levi',   lastName: 'Sterling',    teamName: 'Batrs Soccer',        score: 82,  delta: 0.08, sponsorshipCandidate: false },
  { athleteId: 'ath_rs_03',  firstName: 'Xavier', lastName: 'Paulson',     teamName: 'Raiders San Antonio', score: 78,  delta: 0.14, sponsorshipCandidate: false },
  { athleteId: 'ath_nx_04',  firstName: 'Sloane', lastName: 'Archer',      teamName: 'NxLVL Chicago',       score: 72,  delta: 0.04, sponsorshipCandidate: false },
  { athleteId: 'ath_sf_03',  firstName: 'Andres', lastName: 'Moreno',      teamName: 'San Antonio FC',      score: 68,  delta: -0.02, sponsorshipCandidate: false },
  { athleteId: 'ath_pf_04',  firstName: 'Theo',   lastName: 'Bishop',      teamName: 'PFA San Fernando',    score: 63,  delta: 0.09, sponsorshipCandidate: false },
  { athleteId: 'ath_rs_04',  firstName: 'Malik',  lastName: 'Jennings',    teamName: 'Raiders San Antonio', score: 59,  delta: 0.16, sponsorshipCandidate: false },
  { athleteId: 'ath_nx_05',  firstName: 'Imani',  lastName: 'Park',        teamName: 'NxLVL Chicago',       score: 54,  delta: -0.06, sponsorshipCandidate: false },
];

// ZONE 3 — MANAGEMENT ACCESS

export interface QuickAccessTile {
  id: string;
  label: string;
  href: string;
  stat: string;
  sub: string;
  tone: 'gold' | 'bone' | 'red';
}

/**
 * v1.6: Media / Users / Sponsorships folded into Team drawer + Player Detail.
 * All four tiles now deep-link to /teams; sub-copy hints where each concern
 * lives now (team drawer, roster rows → player detail).
 */
export const quickAccessTiles: QuickAccessTile[] = [
  {
    id: 'tile_teams',
    label: 'Teams',
    href: '/teams',
    stat: `${teams.length} teams active`,
    sub: `${teams.filter((t) => t.recentlyAdded).length} added this month`,
    tone: 'gold',
  },
  {
    id: 'tile_users',
    label: 'Users',
    href: '/teams',
    stat: '47 parents',
    sub: 'edit from roster row · player detail',
    tone: 'bone',
  },
  {
    id: 'tile_media',
    label: 'Media',
    href: '/teams',
    stat: '342 videos',
    sub: 'manage from player detail',
    tone: 'bone',
  },
  {
    id: 'tile_sponsors',
    label: 'Sponsors',
    href: '/teams',
    stat: '8 active · 2 expiring',
    sub: 'assign from team drawer',
    tone: 'red',
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * SESSION 2 / v1.4 — organizations, sponsors, videos, users, permissions,
 * digital workers, card slots. Supports §4.6–§4.12.
 * ──────────────────────────────────────────────────────────────────────── */

// ORGANIZATIONS — third grouping level above club

export interface Organization {
  id: string;
  name: string;
  teamIds: string[];
}

export const organizations: Organization[] = [
  { id: 'org_nxlvl', name: 'NxLVL Sports Inc', teamIds: ['team_nxlvl_chi'] },
  { id: 'org_pfa', name: 'PFA Baseball Federation', teamIds: ['team_pfa_sf'] },
  { id: 'org_alamo', name: 'Alamo Athletic Holdings', teamIds: ['team_safc', 'team_raiders_sa'] },
  { id: 'org_batrs', name: 'Batrs Sports', teamIds: ['team_batrs'] },
];

export const organizationForTeam = (teamId: string): Organization | undefined =>
  organizations.find((o) => o.teamIds.includes(teamId));

// SPONSORS — 8 total, 2 expiring within 30 days of 2026-04-22

export type SponsorStatus = 'active' | 'expiring_soon' | 'expired';

export interface Sponsor {
  id: string;
  name: string;
  /** Contract window in human-readable form (POC — not real dates). */
  contractStart: string;
  contractEnd: string;
  status: SponsorStatus;
  assignedTeamIds: string[];
  /** Number of card ad slots currently reserved by this sponsor across its teams. */
  adSlotsReserved: number;
}

export const sponsors: Sponsor[] = [
  {
    id: 'spon_athletic_co',
    name: 'Athletic Co',
    contractStart: 'Sep 2025',
    contractEnd: 'Sep 2026',
    status: 'active',
    assignedTeamIds: ['team_nxlvl_chi', 'team_safc'],
    adSlotsReserved: 3,
  },
  {
    id: 'spon_bruce_bolt',
    name: 'Bruce & Bolt',
    contractStart: 'May 2025',
    contractEnd: 'May 4, 2026',
    status: 'expiring_soon', // 12 days out per dashboard activity feed
    assignedTeamIds: ['team_batrs', 'team_pfa_sf'],
    adSlotsReserved: 2,
  },
  {
    id: 'spon_prep_nation',
    name: 'Prep Nation',
    contractStart: 'Oct 2025',
    contractEnd: 'Oct 2026',
    status: 'active',
    assignedTeamIds: ['team_raiders_sa'],
    adSlotsReserved: 1,
  },
  {
    id: 'spon_trailhead',
    name: 'Trailhead Coffee',
    contractStart: 'Jan 2026',
    contractEnd: 'Jan 2027',
    status: 'active',
    assignedTeamIds: ['team_nxlvl_chi'],
    adSlotsReserved: 1,
  },
  {
    id: 'spon_fairline',
    name: 'Fairline Realty',
    contractStart: 'Feb 2026',
    contractEnd: 'Feb 2027',
    status: 'active',
    assignedTeamIds: ['team_pfa_sf'],
    adSlotsReserved: 2,
  },
  {
    id: 'spon_north_shore',
    name: 'North Shore Pediatrics',
    contractStart: 'Mar 2026',
    contractEnd: 'Mar 2027',
    status: 'active',
    assignedTeamIds: ['team_safc', 'team_batrs'],
    adSlotsReserved: 2,
  },
  {
    id: 'spon_rhodes_auto',
    name: 'Rhodes Auto',
    contractStart: 'Feb 2026',
    contractEnd: 'Feb 2027',
    status: 'active',
    assignedTeamIds: ['team_raiders_sa'],
    adSlotsReserved: 1,
  },
  {
    id: 'spon_compass_rx',
    name: 'Compass Rx',
    contractStart: 'Jun 2025',
    contractEnd: 'May 10, 2026',
    status: 'expiring_soon', // 18 days out
    assignedTeamIds: ['team_safc'],
    adSlotsReserved: 1,
  },
];

export const sponsorById = (id: string): Sponsor | undefined =>
  sponsors.find((s) => s.id === id);

export const sponsorsForTeam = (teamId: string): Sponsor[] =>
  sponsors.filter((s) => s.assignedTeamIds.includes(teamId));

// CARD SLOTS — 4 sponsor slots per card, driving the §4.10 ad-slot editor

export interface CardSlot {
  id: 'top_left' | 'bottom_right' | 'name_lockup_side' | 'wordmark_strip';
  label: string;
  description: string;
}

export const cardSlots: CardSlot[] = [
  { id: 'top_left', label: 'Top-left patch', description: 'Primary sponsor · sits above the team logo' },
  { id: 'bottom_right', label: 'Bottom-right patch', description: 'Secondary sponsor · diagonal from name lockup' },
  { id: 'name_lockup_side', label: 'Name-lockup side', description: 'Vertical strip alongside the athlete name' },
  { id: 'wordmark_strip', label: 'Wordmark strip', description: 'Thin horizontal band under the IMVI wordmark' },
];

// VIDEOS — 36 records, mix of assigned/unassigned/private/public/front-back

export type VideoPrivacy = 'public' | 'private';
export type CardSlotTag = 'front' | 'back' | null;

export interface Video {
  id: string;
  athleteId: string | null;
  title: string;
  durationSec: number;
  uploadedAgo: string;
  privacy: VideoPrivacy;
  cardSlot: CardSlotTag;
}

/** Realistic clip titles that read as youth-sports highlights. */
export const videos: Video[] = [
  { id: 'vid_01', athleteId: 'ath_leigha', title: 'First-half hat trick vs. Naperville', durationSec: 92, uploadedAgo: '3 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_02', athleteId: 'ath_leigha', title: 'Solo run down the wing', durationSec: 31, uploadedAgo: '5 days ago', privacy: 'public', cardSlot: 'back' },
  { id: 'vid_03', athleteId: 'ath_leigha', title: 'Penalty save highlight', durationSec: 18, uploadedAgo: '1 wk ago', privacy: 'public', cardSlot: null },
  { id: 'vid_04', athleteId: 'ath_bryce', title: 'Bases-clearing double', durationSec: 42, uploadedAgo: '2 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_05', athleteId: 'ath_bryce', title: 'Pitcher mound debut', durationSec: 128, uploadedAgo: '6 days ago', privacy: 'public', cardSlot: null },
  { id: 'vid_06', athleteId: 'ath_bryce', title: 'Batting practice cuts', durationSec: 64, uploadedAgo: '2 wks ago', privacy: 'private', cardSlot: null },
  { id: 'vid_07', athleteId: 'ath_levi', title: 'Long-range strike from 25 yards', durationSec: 22, uploadedAgo: '1 day ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_08', athleteId: 'ath_levi', title: 'Defensive clearance', durationSec: 15, uploadedAgo: '4 days ago', privacy: 'public', cardSlot: 'back' },
  { id: 'vid_09', athleteId: 'ath_nx_01', title: 'Corner-kick assist', durationSec: 28, uploadedAgo: '2 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_10', athleteId: 'ath_nx_02', title: 'Midfield breakaway', durationSec: 56, uploadedAgo: '3 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_11', athleteId: 'ath_nx_03', title: 'Recovery tackle of the week', durationSec: 12, uploadedAgo: '4 days ago', privacy: 'public', cardSlot: null },
  { id: 'vid_12', athleteId: 'ath_nx_04', title: 'Volley from the 18', durationSec: 19, uploadedAgo: '5 days ago', privacy: 'private', cardSlot: null },
  { id: 'vid_13', athleteId: 'ath_nx_05', title: 'Training drills · ladder', durationSec: 42, uploadedAgo: '1 wk ago', privacy: 'private', cardSlot: null },
  { id: 'vid_14', athleteId: 'ath_nx_06', title: 'Free-kick curl', durationSec: 24, uploadedAgo: '2 wks ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_15', athleteId: 'ath_nx_07', title: 'Nutmeg highlight', durationSec: 8, uploadedAgo: '3 wks ago', privacy: 'public', cardSlot: 'back' },
  { id: 'vid_16', athleteId: 'ath_nx_08', title: 'Cross into the box', durationSec: 14, uploadedAgo: '3 wks ago', privacy: 'public', cardSlot: null },
  { id: 'vid_17', athleteId: 'ath_pf_01', title: 'Diving catch in the outfield', durationSec: 11, uploadedAgo: '1 day ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_18', athleteId: 'ath_pf_02', title: 'Stolen base sequence', durationSec: 22, uploadedAgo: '2 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_19', athleteId: 'ath_pf_03', title: 'Double-play turn', durationSec: 9, uploadedAgo: '4 days ago', privacy: 'public', cardSlot: null },
  { id: 'vid_20', athleteId: 'ath_pf_05', title: 'Walk-off home run', durationSec: 34, uploadedAgo: '1 wk ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_21', athleteId: 'ath_bt_01', title: 'Wing-back overlap', durationSec: 26, uploadedAgo: '2 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_22', athleteId: 'ath_bt_02', title: 'Set-piece header', durationSec: 11, uploadedAgo: '4 days ago', privacy: 'public', cardSlot: 'back' },
  { id: 'vid_23', athleteId: 'ath_bt_03', title: 'Skill move in traffic', durationSec: 7, uploadedAgo: '1 wk ago', privacy: 'public', cardSlot: null },
  { id: 'vid_24', athleteId: 'ath_bt_04', title: 'Training session · passing drill', durationSec: 51, uploadedAgo: '2 wks ago', privacy: 'private', cardSlot: null },
  { id: 'vid_25', athleteId: 'ath_bt_05', title: 'Throw-in routine', durationSec: 14, uploadedAgo: '2 wks ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_26', athleteId: 'ath_sf_01', title: 'Counter-attack finish', durationSec: 18, uploadedAgo: '2 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_27', athleteId: 'ath_sf_02', title: 'Captain\'s pre-game speech', durationSec: 96, uploadedAgo: '3 days ago', privacy: 'private', cardSlot: null },
  { id: 'vid_28', athleteId: 'ath_sf_03', title: 'Goalkeeper double save', durationSec: 17, uploadedAgo: '5 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_29', athleteId: 'ath_sf_05', title: 'Clean sheet highlights', durationSec: 58, uploadedAgo: '1 wk ago', privacy: 'public', cardSlot: 'back' },
  { id: 'vid_30', athleteId: 'ath_rs_01', title: 'Kick return touchdown', durationSec: 21, uploadedAgo: '1 day ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_31', athleteId: 'ath_rs_02', title: 'Interception return', durationSec: 13, uploadedAgo: '3 days ago', privacy: 'public', cardSlot: 'front' },
  { id: 'vid_32', athleteId: 'ath_rs_03', title: 'Sack of the QB', durationSec: 9, uploadedAgo: '4 days ago', privacy: 'public', cardSlot: 'back' },
  { id: 'vid_33', athleteId: 'ath_rs_04', title: 'Sideline catch, toe-drag', durationSec: 14, uploadedAgo: '1 wk ago', privacy: 'public', cardSlot: 'front' },
  // Unassigned (4)
  { id: 'vid_34', athleteId: null, title: 'Unidentified athlete · needs tagging', durationSec: 46, uploadedAgo: '6 hrs ago', privacy: 'private', cardSlot: null },
  { id: 'vid_35', athleteId: null, title: 'Sideline crowd footage', durationSec: 82, uploadedAgo: '1 day ago', privacy: 'private', cardSlot: null },
  { id: 'vid_36', athleteId: null, title: 'Raw footage · tournament mix', durationSec: 212, uploadedAgo: '2 days ago', privacy: 'private', cardSlot: null },
];

export const videosForAthlete = (athleteId: string): Video[] =>
  videos.filter((v) => v.athleteId === athleteId);

// USERS — 51 total (47 parents + 3 club admins + Kevin)

export type UserRole = 'super_admin' | 'club_admin' | 'parent';
export type UserStatus = 'active' | 'disabled' | 'pending_reregister';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamIds: string[];
  status: UserStatus;
  /** Parent payment up-to-date (only meaningful for role = parent). */
  paid: boolean;
  lastActiveAgo: string;
  initials: string;
  /** Athlete this user is a parent of (parent role only). */
  athleteId?: string;
}

/** 51 users total — matches dashboard tile copy. */
export const users: User[] = [
  // Super admin
  { id: 'user_kevin', name: 'Kevin Sterling', email: 'kevin@imvi.me', role: 'super_admin', teamIds: [], status: 'active', paid: true, lastActiveAgo: 'Active now', initials: 'KS' },

  // Club admins (3)
  { id: 'user_claire', name: 'Claire Donovan', email: 'claire@nxlvl.io', role: 'club_admin', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '2 hrs ago', initials: 'CD' },
  { id: 'user_ramon', name: 'Ramon Escobar', email: 'ramon@pfaelite.com', role: 'club_admin', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '1 day ago', initials: 'RE' },
  { id: 'user_grace', name: 'Grace Mendez', email: 'grace@alamoathletic.com', role: 'club_admin', teamIds: ['team_safc', 'team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '4 hrs ago', initials: 'GM' },

  // Parents — NxLVL (11)
  { id: 'user_p_01', name: 'Amer Ghafari', email: 'amer.ghafari@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '3 hrs ago', initials: 'AG', athleteId: 'ath_leigha' },
  { id: 'user_p_02', name: 'Obi Okonkwo', email: 'obi.o@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '6 hrs ago', initials: 'OO', athleteId: 'ath_nx_01' },
  { id: 'user_p_03', name: 'Rohan Narang', email: 'rnarang@outlook.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '1 day ago', initials: 'RN', athleteId: 'ath_nx_02' },
  { id: 'user_p_04', name: 'Camille Fontaine', email: 'camille@fontaine.co', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '2 days ago', initials: 'CF', athleteId: 'ath_nx_03' },
  { id: 'user_p_05', name: 'Peter Archer', email: 'p.archer@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '3 days ago', initials: 'PA', athleteId: 'ath_nx_04' },
  { id: 'user_p_06', name: 'Sujin Park', email: 'sujin.park@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'pending_reregister', paid: false, lastActiveAgo: '10 days ago', initials: 'SP', athleteId: 'ath_nx_05' },
  { id: 'user_p_07', name: 'Luisa Solano', email: 'luisa.solano@yahoo.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '4 days ago', initials: 'LS', athleteId: 'ath_nx_06' },
  { id: 'user_p_08', name: 'Daniel Reyes', email: 'd.reyes@hey.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '5 days ago', initials: 'DR', athleteId: 'ath_nx_07' },
  { id: 'user_p_09', name: 'Anya Hollis', email: 'anya.hollis@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '1 wk ago', initials: 'AH', athleteId: 'ath_nx_08' },
  { id: 'user_p_10', name: 'Tomás Ghafari', email: 'tomas.ghafari@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '2 wks ago', initials: 'TG', athleteId: 'ath_leigha' },
  { id: 'user_p_11', name: 'Adaeze Okonkwo', email: 'ada.o@gmail.com', role: 'parent', teamIds: ['team_nxlvl_chi'], status: 'active', paid: true, lastActiveAgo: '2 wks ago', initials: 'AO', athleteId: 'ath_nx_01' },

  // Parents — PFA (8)
  { id: 'user_p_12', name: 'Kwame Opoku', email: 'kwame@opoku.net', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '3 hrs ago', initials: 'KO', athleteId: 'ath_bryce' },
  { id: 'user_p_13', name: 'Elena Opoku', email: 'elena@opoku.net', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '5 hrs ago', initials: 'EO', athleteId: 'ath_bryce' },
  { id: 'user_p_14', name: 'Ricardo Diaz', email: 'ricardo.diaz@gmail.com', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '1 day ago', initials: 'RD', athleteId: 'ath_pf_01' },
  { id: 'user_p_15', name: 'Sarah Hunter', email: 'sarah.hunter@gmail.com', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '2 days ago', initials: 'SH', athleteId: 'ath_pf_02' },
  { id: 'user_p_16', name: 'Isabel Mireles', email: 'isabel@mireles.io', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '3 days ago', initials: 'IM', athleteId: 'ath_pf_03' },
  { id: 'user_p_17', name: 'Gerard Bishop', email: 'gbishop@outlook.com', role: 'parent', teamIds: ['team_pfa_sf'], status: 'disabled', paid: false, lastActiveAgo: '3 wks ago', initials: 'GB', athleteId: 'ath_pf_04' },
  { id: 'user_p_18', name: 'Noor Malik', email: 'noor.malik@gmail.com', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '4 days ago', initials: 'NM', athleteId: 'ath_pf_05' },
  { id: 'user_p_19', name: 'Hanif Malik', email: 'hanif@malik.co', role: 'parent', teamIds: ['team_pfa_sf'], status: 'active', paid: true, lastActiveAgo: '1 wk ago', initials: 'HM', athleteId: 'ath_pf_05' },

  // Parents — Batrs (9)
  { id: 'user_p_20', name: 'Eitan Sterling', email: 'eitan@sterling.family', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '2 hrs ago', initials: 'ES', athleteId: 'ath_levi' },
  { id: 'user_p_21', name: 'Maya Sterling', email: 'maya@sterling.family', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '4 hrs ago', initials: 'MS', athleteId: 'ath_levi' },
  { id: 'user_p_22', name: 'Owen Calder', email: 'owen.calder@gmail.com', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '1 day ago', initials: 'OC', athleteId: 'ath_bt_01' },
  { id: 'user_p_23', name: 'Rita Ashford', email: 'rita@ashford.io', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '2 days ago', initials: 'RA', athleteId: 'ath_bt_02' },
  { id: 'user_p_24', name: 'Chike Okello', email: 'chike.okello@gmail.com', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '3 days ago', initials: 'CO', athleteId: 'ath_bt_03' },
  { id: 'user_p_25', name: 'Marie Prescott', email: 'marie@prescott.family', role: 'parent', teamIds: ['team_batrs'], status: 'disabled', paid: false, lastActiveAgo: '1 mo ago', initials: 'MP', athleteId: 'ath_bt_04' },
  { id: 'user_p_26', name: 'Faisal Haddad', email: 'faisal@haddad.co', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '5 days ago', initials: 'FH', athleteId: 'ath_bt_05' },
  { id: 'user_p_27', name: 'Rania Haddad', email: 'rania@haddad.co', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: true, lastActiveAgo: '1 wk ago', initials: 'RH', athleteId: 'ath_bt_05' },
  { id: 'user_p_28', name: 'Pete Prescott', email: 'pete.prescott@outlook.com', role: 'parent', teamIds: ['team_batrs'], status: 'active', paid: false, lastActiveAgo: '2 wks ago', initials: 'PP', athleteId: 'ath_bt_04' },

  // Parents — SAFC (9)
  { id: 'user_p_29', name: 'Rosa Velasquez', email: 'rosa.v@gmail.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '3 hrs ago', initials: 'RV', athleteId: 'ath_sf_01' },
  { id: 'user_p_30', name: 'Hector Velasquez', email: 'hector.v@gmail.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '6 hrs ago', initials: 'HV', athleteId: 'ath_sf_01' },
  { id: 'user_p_31', name: 'Patricia Cruz', email: 'patricia.cruz@yahoo.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '1 day ago', initials: 'PC', athleteId: 'ath_sf_02' },
  { id: 'user_p_32', name: 'Mario Cruz', email: 'mario@cruz.io', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '2 days ago', initials: 'MC', athleteId: 'ath_sf_02' },
  { id: 'user_p_33', name: 'Jose Moreno', email: 'jose.moreno@gmail.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '3 days ago', initials: 'JM', athleteId: 'ath_sf_03' },
  { id: 'user_p_34', name: 'Carmen Navarro', email: 'carmen.navarro@hey.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '5 days ago', initials: 'CN', athleteId: 'ath_sf_04' },
  { id: 'user_p_35', name: 'Javier Navarro', email: 'javier@navarro.co', role: 'parent', teamIds: ['team_safc'], status: 'pending_reregister', paid: false, lastActiveAgo: '3 wks ago', initials: 'JN', athleteId: 'ath_sf_04' },
  { id: 'user_p_36', name: 'Sofia Ortiz', email: 'sofia.ortiz@gmail.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '1 wk ago', initials: 'SO', athleteId: 'ath_sf_05' },
  { id: 'user_p_37', name: 'Raul Ortiz', email: 'raul.ortiz@gmail.com', role: 'parent', teamIds: ['team_safc'], status: 'active', paid: true, lastActiveAgo: '1 wk ago', initials: 'RO', athleteId: 'ath_sf_05' },

  // Parents — Raiders (10)
  { id: 'user_p_38', name: 'Terrence Harris', email: 'terrence@harris.family', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '4 hrs ago', initials: 'TH', athleteId: 'ath_rs_01' },
  { id: 'user_p_39', name: 'Dionne Harris', email: 'dionne@harris.family', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '8 hrs ago', initials: 'DH', athleteId: 'ath_rs_01' },
  { id: 'user_p_40', name: 'Karen Bennett', email: 'karen.bennett@outlook.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '1 day ago', initials: 'KB', athleteId: 'ath_rs_02' },
  { id: 'user_p_41', name: 'Ron Bennett', email: 'ron.bennett@outlook.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '2 days ago', initials: 'RB', athleteId: 'ath_rs_02' },
  { id: 'user_p_42', name: 'Luke Paulson', email: 'lpaulson@gmail.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '3 days ago', initials: 'LP', athleteId: 'ath_rs_03' },
  { id: 'user_p_43', name: 'Emily Paulson', email: 'emily.paulson@gmail.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '4 days ago', initials: 'EP', athleteId: 'ath_rs_03' },
  { id: 'user_p_44', name: 'Kendra Jennings', email: 'kendra.j@gmail.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '5 days ago', initials: 'KJ', athleteId: 'ath_rs_04' },
  { id: 'user_p_45', name: 'Greg Jennings', email: 'greg.j@gmail.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: true, lastActiveAgo: '1 wk ago', initials: 'GJ', athleteId: 'ath_rs_04' },
  { id: 'user_p_46', name: 'Samira Wade', email: 'samira.wade@gmail.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'disabled', paid: false, lastActiveAgo: '1 mo ago', initials: 'SW', athleteId: 'ath_rs_05' },
  { id: 'user_p_47', name: 'Omar Wade', email: 'omar.wade@gmail.com', role: 'parent', teamIds: ['team_raiders_sa'], status: 'active', paid: false, lastActiveAgo: '2 wks ago', initials: 'OW', athleteId: 'ath_rs_05' },
];

export const userById = (id: string): User | undefined =>
  users.find((u) => u.id === id);

export const usersForAthlete = (athleteId: string): User[] =>
  users.filter((u) => u.athleteId === athleteId);

// ROLE PERMISSIONS — matrix data for the §4.9 Matrix tab

export interface RolePermission {
  action: string;
  superAdmin: boolean;
  clubAdmin: boolean;
  parent: boolean;
  /** Optional qualifier shown in parens next to a checked cell. */
  clubAdminNote?: string;
  parentNote?: string;
}

export const rolePermissions: RolePermission[] = [
  { action: 'Edit team skins',          superAdmin: true, clubAdmin: false, parent: false },
  { action: 'Approve cards for print',  superAdmin: true, clubAdmin: false, parent: false },
  { action: 'Upload rosters',           superAdmin: true, clubAdmin: true,  parent: false, clubAdminNote: 'own teams' },
  { action: 'Manage sponsors',          superAdmin: true, clubAdmin: false, parent: false },
  { action: 'Invite parents',           superAdmin: true, clubAdmin: true,  parent: false, clubAdminNote: 'own teams' },
  { action: 'View analytics',           superAdmin: true, clubAdmin: true,  parent: false, clubAdminNote: 'scoped' },
  { action: 'Edit player info',         superAdmin: true, clubAdmin: true,  parent: true,  parentNote: 'own child' },
  { action: 'Upload media',             superAdmin: true, clubAdmin: true,  parent: true },
  { action: 'Assign media to cards',    superAdmin: true, clubAdmin: true,  parent: false },
  { action: 'Delete users',             superAdmin: true, clubAdmin: false, parent: false },
];

// DIGITAL WORKERS — §4.11 IMVI+ tiles

export interface DigitalWorker {
  id: string;
  name: string;
  shortName: string;
  description: string;
  eta: string;
  /** Corresponds to a Lucide icon name, resolved in the IMVI+ screen. */
  icon: 'sales' | 'marketing' | 'ops' | 'venue';
}

export const digitalWorkers: DigitalWorker[] = [
  {
    id: 'dw_sales',
    name: 'Sales Agent',
    shortName: 'Sales',
    description: 'Finds clubs and leagues open to partnerships. Drafts outreach emails. Logs contact history.',
    eta: 'Q3 2026',
    icon: 'sales',
  },
  {
    id: 'dw_marketing',
    name: 'Marketing Agent',
    shortName: 'Marketing',
    description: 'Generates campaign ideas and social posts. Learns from engagement data.',
    eta: 'Q4 2026',
    icon: 'marketing',
  },
  {
    id: 'dw_ops',
    name: 'Operations Agent',
    shortName: 'Operations',
    description: 'Automates roster management, parent communications, season rollovers.',
    eta: 'Q3 2026',
    icon: 'ops',
  },
  {
    id: 'dw_venue',
    name: 'Venue AR',
    shortName: 'Venue AR',
    description: 'Enables scan-to-content AR experiences at games and venues.',
    eta: '2027',
    icon: 'venue',
  },
];
