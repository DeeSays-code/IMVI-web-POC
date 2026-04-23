import { memo } from 'react';
import type { Team, Athlete } from '../mock/data';

interface ComposedCardPreviewProps {
  team: Team;
  athlete?: Athlete;
  background: string;
  /** Display width. Card aspect is always 2.5:3.5. */
  width?: number;
  /** Compact mode for thumbnail rendering. */
  compact?: boolean;
  className?: string;
  selected?: boolean;
  hoverable?: boolean;
}

/**
 * Composed IMVI trading card.
 *
 * Placement matches the real reference cards:
 *   - Team logo: TOP-CENTER, ~20% of width. Uses real raster logo when
 *     team.logoImage is set; falls back to an SVG shield monogram.
 *   - Jersey number: TOP-RIGHT corner, LARGE, team accent fill with a thick
 *     dark stroke and heavy drop shadow. Skewed for kinetic energy.
 *   - Athlete silhouette: center of card, over the splash background.
 *   - Name lockup: BOTTOM 28% of card. Script first name rotated, overlapping
 *     the top third of a distressed Oswald block last name. The block gets
 *     chunks punched out via a turbulence-driven mask (not just edge
 *     displacement — real pixels missing) for the stamped/ink-worn feel.
 *   - Triple chevron marker: bottom-left, in the team's accent.
 *   - "IMVI" wordmark: bottom-center, cream italic.
 *   - Outer cream hairline frame with decorative vertical ticks on right edge.
 *
 * No gold branding on the card body — gold lives in app chrome only.
 */
export const ComposedCardPreview = memo(function ComposedCardPreview({
  team,
  athlete,
  background,
  width = 200,
  compact = false,
  className,
  selected = false,
  hoverable = false,
}: ComposedCardPreviewProps) {
  const height = Math.round(width * 1.4);
  const { palette } = team;
  const cream = palette.light ?? '#F5EDDA';
  const initials = athlete?.initials ?? team.monogram;
  const firstName = athlete?.firstName ?? 'First';
  const lastName = (athlete?.lastName ?? 'Name').toUpperCase();
  const jersey = athlete ? `#${athlete.jerseyNumber}` : '#—';
  const uid = `${team.id}-${athlete?.id ?? 'team'}`;

  // Jersey number sizing — dominant chyron top-right per real cards
  const jerseyFontSize = compact ? 36 : 62;

  return (
    <div
      className={`group relative overflow-hidden rounded-[10px] ${
        selected ? 'ring-2 ring-gold-3 ring-offset-2 ring-offset-ink-2' : ''
      } ${hoverable ? 'transition-transform duration-300 ease-cinematic hover:-translate-y-0.5' : ''} ${className ?? ''}`}
      style={{
        width,
        height,
        background: palette.dark,
        boxShadow:
          '0 14px 34px -14px rgba(0,0,0,0.75), 0 4px 10px -4px rgba(0,0,0,0.5)',
      }}
    >
      {/* Splash skin background */}
      <img
        src={background}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Soft bottom vignette for name legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Team logo — top CENTER (matches real cards) */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: '50%',
          top: height * 0.035,
          transform: 'translateX(-50%)',
          width: width * 0.22,
        }}
      >
        {team.logoImage ? (
          <img
            src={team.logoImage}
            alt={team.name}
            className="h-full w-full object-contain"
            style={{
              width: width * 0.22,
              height: width * 0.22,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
            }}
            draggable={false}
          />
        ) : (
          <TeamBadge
            mark={team.monogram}
            primary={palette.primary}
            accent={palette.accent}
            size={width * 0.22}
          />
        )}
      </div>

      {/* Jersey number — TOP-RIGHT, LARGE (matches real cards) */}
      <div
        className="pointer-events-none absolute"
        style={{
          right: width * 0.06,
          top: height * 0.055,
          lineHeight: 0.85,
        }}
      >
        <span
          className="font-display font-bold"
          style={{
            fontSize: jerseyFontSize,
            letterSpacing: '-0.02em',
            color: palette.accent,
            WebkitTextStroke: `${compact ? 2 : 3.5}px ${palette.dark}`,
            paintOrder: 'stroke fill',
            textShadow: `0 3px 0 ${palette.dark}, 0 5px 10px rgba(0,0,0,0.55)`,
            display: 'inline-block',
            transform: 'skewX(-8deg)',
          }}
        >
          {jersey}
        </span>
      </div>

      {/* Centered athlete silhouette */}
      <div
        className="absolute flex items-end justify-center overflow-hidden"
        style={{
          left: width * 0.12,
          right: width * 0.12,
          top: height * 0.24,
          bottom: height * 0.30,
        }}
      >
        <svg
          viewBox="0 0 120 160"
          className="h-full w-auto"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id={`body-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={palette.accent} stopOpacity="0.9" />
              <stop offset="100%" stopColor={palette.primary} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="36" r="17" fill={`url(#body-${uid})`} opacity="0.92" />
          <path
            d="M32 62 C 40 56 50 54 60 54 C 70 54 80 56 88 62 L 96 90 L 92 110 L 88 160 L 32 160 L 28 110 L 24 90 Z"
            fill={`url(#body-${uid})`}
            opacity="0.88"
          />
          <path
            d="M52 56 L60 64 L68 56 L64 62 L60 68 L56 62 Z"
            fill={palette.dark}
            opacity="0.55"
          />
          <text
            x="60"
            y="94"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Oswald Variable', sans-serif"
            fontWeight={700}
            fontSize={20}
            letterSpacing="0.06em"
            fill={cream}
            opacity="0.88"
          >
            {initials}
          </text>
        </svg>
      </div>

      {/* Name lockup — script over distressed block with real chunk knockout */}
      <NameLockup
        uid={uid}
        firstName={firstName}
        lastName={lastName}
        width={width}
        height={height}
        lastColor={cream}
        firstColor={palette.accent}
        strokeColor={palette.dark}
        compact={compact}
      />

      {/* Triple-chevron marker bottom-left */}
      <svg
        className="pointer-events-none absolute"
        style={{ left: width * 0.075, bottom: height * 0.035 }}
        width={compact ? 14 : 22}
        height={compact ? 6 : 10}
        viewBox="0 0 22 10"
        fill="none"
        stroke={palette.accent}
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M1 1 L5 5 L1 9" opacity="0.4" />
        <path d="M8 1 L12 5 L8 9" opacity="0.7" />
        <path d="M15 1 L19 5 L15 9" />
      </svg>

      {/* IMVI wordmark bottom-center */}
      <div
        className="absolute inset-x-0 text-center"
        style={{ bottom: height * 0.025 }}
      >
        <span
          className="font-display italic font-semibold uppercase"
          style={{
            color: cream,
            fontSize: compact ? 8 : 10,
            letterSpacing: '0.22em',
            opacity: 0.92,
            textShadow: `0 1px 2px rgba(0,0,0,0.6)`,
          }}
        >
          IMVI
        </span>
      </div>

      {/* Outer cream hairline frame with decorative right-edge ticks */}
      <svg
        className="pointer-events-none absolute inset-0"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
      >
        <rect
          x={width * 0.04}
          y={height * 0.028}
          width={width * 0.92}
          height={height * 0.944}
          rx={8}
          ry={8}
          fill="none"
          stroke={cream}
          strokeOpacity={0.85}
          strokeWidth={compact ? 0.8 : 1.2}
        />
        <g stroke={cream} strokeOpacity={0.85} strokeWidth={compact ? 0.8 : 1.2} strokeLinecap="round">
          <line x1={width * 0.86} y1={height * 0.54} x2={width * 0.86} y2={height * 0.58} />
          <line x1={width * 0.86} y1={height * 0.60} x2={width * 0.86} y2={height * 0.64} />
          <line x1={width * 0.86} y1={height * 0.66} x2={width * 0.86} y2={height * 0.70} />
        </g>
      </svg>

      {hoverable && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-300 ease-cinematic group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 2px ${palette.accent}` }}
        />
      )}
    </div>
  );
});

/**
 * Name lockup — trading-card signature beat.
 *
 * The block last name is drawn as SVG text and run through TWO effects:
 *   1. feDisplacementMap with turbulence noise — roughs up letter edges
 *   2. A `<mask>` containing a high-contrast turbulence pattern — punches
 *      irregular chunks OUT of the letters (real stamped/worn texture)
 *
 * The script first name sits on top, rotated, in a contrasting accent color
 * with its own drop shadow. This reproduces the "LeLe / GHAFARI",
 * "Bryce / OPOKU", "Harlan / SPEAKS" composition from the reference cards.
 */
function NameLockup({
  uid,
  firstName,
  lastName,
  width,
  height,
  lastColor,
  firstColor,
  strokeColor,
  compact,
}: {
  uid: string;
  firstName: string;
  lastName: string;
  width: number;
  height: number;
  lastColor: string;
  firstColor: string;
  strokeColor: string;
  compact: boolean;
}) {
  const vw = 800;
  const vh = 300;
  const lockupHeight = compact ? height * 0.30 : height * 0.28;
  const lockupWidth = width * 0.92;

  // Auto-scale block size to name length
  const blockFontSize = lastName.length > 8 ? 130 : lastName.length > 6 ? 150 : 170;
  const scriptFontSize = 132;

  const distressId = `distress-${uid}`;
  const knockoutId = `knockout-${uid}`;
  const shadowId = `shadow-${uid}`;

  return (
    <svg
      className="pointer-events-none absolute"
      style={{
        left: width * 0.04,
        bottom: height * 0.065,
        width: lockupWidth,
        height: lockupHeight,
      }}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Edge-roughening filter — breaks letter outlines into ragged grunge */}
        <filter id={distressId} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>

        {/* Mask that punches actual chunks OUT of the letters — turbulence
            high-threshold gives sparse black holes across the otherwise
            white mask, which translates to missing pixels in the text. */}
        <filter id={`${knockoutId}-filter`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="13" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -14 6.5"
          />
        </filter>
        <mask id={knockoutId} maskUnits="userSpaceOnUse" x="0" y="0" width={vw} height={vh}>
          <rect x="0" y="0" width={vw} height={vh} fill="#FFFFFF" />
          <rect
            x="0"
            y="0"
            width={vw}
            height={vh}
            filter={`url(#${knockoutId}-filter)`}
          />
        </mask>

        {/* Drop shadow */}
        <filter id={shadowId} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dy="6" result="offsetBlur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.65" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shadow halo beneath block — painted as a blurred dark copy */}
      <g transform={`translate(${vw / 2}, 206) skewX(-8)`} opacity="0.75">
        <text
          textAnchor="middle"
          fontFamily="'Oswald Variable', 'Oswald', sans-serif"
          fontWeight={700}
          fontSize={blockFontSize}
          letterSpacing="0.03em"
          fill="#000000"
          filter={`url(#${distressId})`}
          style={{ filter: 'blur(3px)' }}
        >
          {lastName}
        </text>
      </g>

      {/* Block last name — skewed, thick stroke, displacement-distressed,
          with chunks knocked out by the turbulence mask */}
      <g filter={`url(#${shadowId})`}>
        <g transform={`translate(${vw / 2}, 200) skewX(-8)`} mask={`url(#${knockoutId})`}>
          {/* Outer stroke pass (dark) */}
          <text
            textAnchor="middle"
            fontFamily="'Oswald Variable', 'Oswald', sans-serif"
            fontWeight={700}
            fontSize={blockFontSize}
            letterSpacing="0.03em"
            fill="none"
            stroke={strokeColor}
            strokeWidth={blockFontSize * 0.06}
            strokeLinejoin="round"
            filter={`url(#${distressId})`}
          >
            {lastName}
          </text>
          {/* Fill pass */}
          <text
            textAnchor="middle"
            fontFamily="'Oswald Variable', 'Oswald', sans-serif"
            fontWeight={700}
            fontSize={blockFontSize}
            letterSpacing="0.03em"
            fill={lastColor}
            filter={`url(#${distressId})`}
          >
            {lastName}
          </text>
        </g>
      </g>

      {/* Script first name — sits on top, rotated, contrasting accent color.
          Drop shadow + dark stroke so it reads over any splash color. */}
      <g transform={`translate(${vw / 2 - 50}, 88) rotate(-6, 50, 0)`}>
        <text
          textAnchor="middle"
          fontFamily="'Caveat', cursive"
          fontWeight={700}
          fontSize={scriptFontSize}
          fill={firstColor}
          stroke={strokeColor}
          strokeWidth={5}
          paintOrder="stroke fill"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.65))' }}
        >
          {firstName}
        </text>
      </g>
    </svg>
  );
}

/** Compact team shield badge in team palette (fallback when no logoImage). */
function TeamBadge({
  mark,
  primary,
  accent,
  size,
}: {
  mark: string;
  primary: string;
  accent: string;
  size: number;
}) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-label={mark}>
      <path
        d="M20 2 L36 6 L36 22 C 36 30 30 36 20 38 C 10 36 4 30 4 22 L 4 6 Z"
        fill={primary}
        stroke={accent}
        strokeWidth="1.2"
      />
      <path
        d="M20 2 L36 6 L36 22 C 36 30 30 36 20 38 C 10 36 4 30 4 22 L 4 6 Z"
        fill="none"
        stroke={accent}
        strokeWidth="0.6"
        opacity="0.45"
        transform="translate(1.2, 1.2) scale(0.94)"
      />
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Oswald Variable', sans-serif"
        fontWeight={700}
        fontSize={mark.length > 2 ? 12 : 14}
        letterSpacing="0.05em"
        fill={accent}
      >
        {mark}
      </text>
    </svg>
  );
}
