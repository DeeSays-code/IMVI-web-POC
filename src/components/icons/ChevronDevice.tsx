import { memo } from 'react';

interface ChevronDeviceProps {
  /** Height in px. Defaults to 14 per mobile spec §2.6.3. */
  height?: number;
  className?: string;
}

/**
 * Brand motif: three overlapping chevron strokes with brushed-gold gradient
 * fill at cascading opacity (0.3, 0.6, 1.0). Used on IMVI Awards banner and
 * anywhere the app needs a brand signature beat.
 */
export const ChevronDevice = memo(function ChevronDevice({
  height = 14,
  className,
}: ChevronDeviceProps) {
  const width = Math.round(height * 2.2);
  const gradientId = 'chevron-device-gradient';
  return (
    <svg
      viewBox="0 0 22 14"
      width={width}
      height={height}
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B6A2F" />
          <stop offset="50%" stopColor="#F0D286" />
          <stop offset="100%" stopColor="#8B6A2F" />
        </linearGradient>
      </defs>
      <path d="M2 3 L7 7 L2 11" opacity="0.3" />
      <path d="M9 3 L14 7 L9 11" opacity="0.6" />
      <path d="M16 3 L20 7 L16 11" opacity="1" />
    </svg>
  );
});
