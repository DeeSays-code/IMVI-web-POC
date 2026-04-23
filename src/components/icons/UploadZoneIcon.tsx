import { memo } from 'react';

interface UploadZoneIconProps {
  size?: number;
  className?: string;
}

/**
 * Large outlined glyph for upload zones: a tray with an up-arrow entering it.
 * Used in the Design Workspace logo drop and (Session 2) bulk upload.
 * Drawn at a scale that reads at 48–72px inside a big dashed frame.
 */
export const UploadZoneIcon = memo(function UploadZoneIcon({
  size = 56,
  className,
}: UploadZoneIconProps) {
  const gradientId = 'upload-zone-gradient';
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C472" />
          <stop offset="100%" stopColor="#8B6A2F" />
        </linearGradient>
      </defs>
      {/* Tray */}
      <path
        d="M10 40 L10 52 L54 52 L54 40"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Upload arrow */}
      <path
        d="M32 42 L32 12"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M20 24 L32 12 L44 24"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
