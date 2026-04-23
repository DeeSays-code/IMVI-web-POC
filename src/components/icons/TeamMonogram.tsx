import { memo } from 'react';

interface TeamMonogramProps {
  /** 2–3 letter lockup (e.g., 'NXL', 'PFA', 'BTR'). */
  mark: string;
  /** Primary hero color — fills the shield/badge body. */
  primary: string;
  /** Accent — used for the mark text and hairline stroke. */
  accent: string;
  size?: number;
  className?: string;
  /** crest (shield silhouette) or badge (circle). */
  variant?: 'crest' | 'badge';
}

/**
 * Compact team monogram lockup rendered in the team's own palette (no gold).
 * Used in Review Queue group headers, Dashboard activity rows, Design
 * Workspace logo slot. Primary fills the body; accent is the text + stroke.
 * Contrast is guaranteed because primary/accent are the team's intentional
 * bold pair.
 */
export const TeamMonogram = memo(function TeamMonogram({
  mark,
  primary,
  accent,
  size = 40,
  className,
  variant = 'crest',
}: TeamMonogramProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-label={mark}
      role="img"
    >
      {variant === 'crest' ? (
        <>
          <path
            d="M24 2 L42 8 L42 26 C42 36.5 34.2 43.4 24 46 C13.8 43.4 6 36.5 6 26 L6 8 Z"
            fill={primary}
            stroke={accent}
            strokeWidth="1.2"
          />
          <path
            d="M24 2 L42 8 L42 26 C42 36.5 34.2 43.4 24 46 C13.8 43.4 6 36.5 6 26 L6 8 Z"
            fill="none"
            stroke={accent}
            strokeWidth="0.6"
            opacity="0.45"
            transform="translate(1.6, 1.6) scale(0.93)"
            transform-origin="center"
          />
          <path d="M18 10 L24 14 L30 10" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
        </>
      ) : (
        <>
          <circle cx="24" cy="24" r="22" fill={primary} stroke={accent} strokeWidth="1.2" />
          <circle cx="24" cy="24" r="19" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.45" />
        </>
      )}
      <text
        x="50%"
        y={variant === 'crest' ? '62%' : '54%'}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Oswald Variable', sans-serif"
        fontWeight={700}
        fontSize={mark.length > 2 ? 15 : 18}
        letterSpacing="0.08em"
        fill={accent}
      >
        {mark}
      </text>
    </svg>
  );
});
