import { memo } from 'react';

interface ScanReticleProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Optional center dot. Mobile spec includes it in the FAB icon. */
  withCenterDot?: boolean;
  className?: string;
}

/**
 * Four L-shaped corners forming an open rectangle with an optional center dot.
 * Per mobile spec §2.6.1, stroke varies by context (ink on the FAB, gold-3 on
 * viewfinder overlays).
 */
export const ScanReticle = memo(function ScanReticle({
  size = 24,
  stroke = 'currentColor',
  strokeWidth = 2,
  withCenterDot = true,
  className,
}: ScanReticleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden
    >
      {/* top-left */}
      <path d="M3 8 V4 H8" />
      {/* top-right */}
      <path d="M16 4 H20 V8" />
      {/* bottom-right */}
      <path d="M20 16 V20 H16" />
      {/* bottom-left */}
      <path d="M8 20 H4 V16" />
      {withCenterDot && <circle cx="12" cy="12" r="1.4" fill={stroke} stroke="none" />}
    </svg>
  );
});
