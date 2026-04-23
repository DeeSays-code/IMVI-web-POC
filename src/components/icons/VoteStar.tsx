import { memo } from 'react';

interface VoteStarProps {
  size?: number;
  className?: string;
  /** Draw filled with brushed-gold gradient (default) or outline only. */
  filled?: boolean;
}

/**
 * Five-pointed star with brushed-gold gradient fill. Used on vote CTAs and
 * leaderboard row markers. Not a Lucide Star — this one carries the gradient
 * natively so it stays brand-consistent everywhere it appears.
 */
export const VoteStar = memo(function VoteStar({
  size = 20,
  className,
  filled = true,
}: VoteStarProps) {
  const gradientId = 'vote-star-gradient';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C472" />
          <stop offset="50%" stopColor="#C9A24E" />
          <stop offset="100%" stopColor="#8B6A2F" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.2 L14.8 8.6 L21.7 9.35 L16.6 14 L18.05 20.8 L12 17.35 L5.95 20.8 L7.4 14 L2.3 9.35 L9.2 8.6 Z"
        fill={filled ? `url(#${gradientId})` : 'none'}
        stroke={filled ? 'none' : `url(#${gradientId})`}
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
});
