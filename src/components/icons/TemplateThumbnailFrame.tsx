import { memo } from 'react';

interface TemplateThumbnailFrameProps {
  size?: number;
  className?: string;
}

/**
 * A small card-frame device used wherever the app references "a card template."
 * Card silhouette with chevron corner markers. Used in Teams Directory and
 * inside the Design Workspace preview caption.
 */
export const TemplateThumbnailFrame = memo(function TemplateThumbnailFrame({
  size = 20,
  className,
}: TemplateThumbnailFrameProps) {
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
      <rect x="5.5" y="2.5" width="13" height="19" rx="1.8" />
      {/* chevron corners */}
      <path d="M7.5 5.2 L9 6.2 L7.5 7.2" opacity="0.75" />
      <path d="M16.5 5.2 L15 6.2 L16.5 7.2" opacity="0.75" />
      {/* photo slot */}
      <rect x="8" y="9" width="8" height="7" rx="0.8" opacity="0.55" />
      {/* name bar */}
      <line x1="8.5" y1="18.2" x2="15.5" y2="18.2" opacity="0.55" />
    </svg>
  );
});
