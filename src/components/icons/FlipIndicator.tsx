import { memo } from 'react';

interface FlipIndicatorProps {
  size?: number;
  className?: string;
}

/**
 * Card-flip affordance — two opposed arcs suggesting 3D rotation. Appears as
 * a subtle cue when a card is tappable (Design Workspace preview, Review
 * Queue detail modal). Gold-3 stroke at 60% opacity by default.
 */
export const FlipIndicator = memo(function FlipIndicator({
  size = 16,
  className,
}: FlipIndicatorProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 9 A8 8 0 0 1 18.8 7.5" />
      <path d="M18.8 3 L18.8 7.5 L14.3 7.5" />
      <path d="M20 15 A8 8 0 0 1 5.2 16.5" />
      <path d="M5.2 21 L5.2 16.5 L9.7 16.5" />
    </svg>
  );
});
