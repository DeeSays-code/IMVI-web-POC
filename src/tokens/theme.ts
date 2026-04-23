/**
 * IMVI brand tokens — inherited from mobile spec v1.4, extended with web layout tokens.
 * Single source of truth. Every color, gradient, and motion curve referenced anywhere
 * in the codebase resolves back here. Tailwind config mirrors these values so utility
 * classes stay in lockstep with the token file.
 */

export const colors = {
  ink: '#0A0A0A',
  ink2: '#111111',
  ink3: '#1A1A1A',
  ink4: '#242220',
  bone: '#F5F1E8',
  boneMuted: '#A8A399',
  gold1: '#5C4620',
  gold2: '#8B6A2F',
  gold3: '#C9A24E',
  gold4: '#E8C472',
  gold5: '#FCE6A3',
  liveRed: '#E53935',
} as const;

export const gradients = {
  brushedGold:
    'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
  brushedGoldVertical:
    'linear-gradient(180deg, #8B6A2F 0%, #C9A24E 45%, #F0D286 55%, #C9A24E 70%, #5C4620 100%)',
  goldFloorFade:
    'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.35) 0%, rgba(139, 106, 47, 0.15) 35%, transparent 70%)',
  goldFloorFadeIntense:
    'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.48) 0%, rgba(139, 106, 47, 0.22) 40%, transparent 75%)',
  goldCeilingFade:
    'radial-gradient(ellipse at 50% 0%, rgba(201, 162, 78, 0.22) 0%, rgba(139, 106, 47, 0.08) 40%, transparent 70%)',
  appHeaderBase:
    'linear-gradient(180deg, #0E0E0E 0%, #131110 50%, #1A1610 100%)',
  sidebarBase:
    'linear-gradient(180deg, #101010 0%, #0E0D0B 100%)',
  cardInset:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 40%, rgba(0, 0, 0, 0.15) 100%)',
  grain:
    'radial-gradient(rgba(201, 162, 78, 0.035) 1px, transparent 1px)',
} as const;

export const font = {
  display: "'Oswald Variable', 'Oswald', 'Bebas Neue', system-ui, sans-serif",
  body: "'Inter Variable', 'Inter', -apple-system, system-ui, sans-serif",
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  card: '14px',
} as const;

export const space = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const layout = {
  sidebarWidthExpanded: 240,
  sidebarWidthCollapsed: 72,
  topbarHeight: 64,
  contentMaxWidth: 1440,
  contentPadding: 32,
  sectionGap: 40,
  minSupportedViewport: 1200,
} as const;

export const motion = {
  /** Mobile spec default — long deceleration, cinematic reveals. */
  easeCinematic: [0.19, 1, 0.22, 1] as const,
  /** Material-style standard — UI state changes. */
  easeStandard: [0.4, 0, 0.2, 1] as const,
  /** Quick ease-out for hover affordances. */
  easeOut: [0.22, 0.61, 0.36, 1] as const,
  durations: {
    xs: 0.15,
    sm: 0.22,
    md: 0.4,
    lg: 0.6,
    xl: 0.8,
  },
} as const;

export const shadow = {
  goldGlow: '0 0 40px rgba(201, 162, 78, 0.18)',
  goldGlowSoft: '0 0 20px rgba(201, 162, 78, 0.12)',
  cardDepth: '0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 8px 16px -8px rgba(0, 0, 0, 0.5)',
  insetGold: 'inset 0 0 0 1px rgba(201, 162, 78, 0.28)',
  insetGoldStrong: 'inset 0 0 0 1px rgba(201, 162, 78, 0.5)',
  topbarBottom: '0 1px 0 0 rgba(168, 163, 153, 0.08)',
} as const;

/** Tracking values for Oswald uppercase labels. Spec §2.1. */
export const tracking = {
  dataTight: '0.02em',
  dataLoose: '0.05em',
  labelSmall: '0.12em',
  labelMedium: '0.2em',
  labelWide: '0.25em',
  labelExtraWide: '0.3em',
} as const;
