import { memo } from 'react';

interface SponsorSlotMarkerProps {
  size?: number;
  className?: string;
}

/**
 * Rhombus (◆) with brushed-gold gradient fill. Used as the separator between
 * sponsor names in the scrolling sponsor strip and as a small brand beat in
 * activity feed rows ("Sponsor assigned to team").
 */
export const SponsorSlotMarker = memo(function SponsorSlotMarker({
  size = 10,
  className,
}: SponsorSlotMarkerProps) {
  const gradientId = 'sponsor-slot-gradient';
  return (
    <svg
      viewBox="0 0 10 10"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A24E" />
          <stop offset="100%" stopColor="#8B6A2F" />
        </linearGradient>
      </defs>
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={`url(#${gradientId})`} />
    </svg>
  );
});
