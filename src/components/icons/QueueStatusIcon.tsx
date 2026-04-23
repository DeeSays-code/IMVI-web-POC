import { memo } from 'react';

export type QueueStatus = 'ready' | 'shipped' | 'rejected';

interface QueueStatusIconProps {
  status: QueueStatus;
  size?: number;
  className?: string;
}

/**
 * Status badges used on Review Queue groups and activity feed rows.
 * - ready: checkmark inside a gold ring — the only active state per v1.1.
 * - shipped: small stacked box + chevron, live-red accent — "sent to print".
 * - rejected: X inside a ring, live-red.
 *
 * Distinct enough at small sizes that a glance tells you the state.
 */
export const QueueStatusIcon = memo(function QueueStatusIcon({
  status,
  size = 20,
  className,
}: QueueStatusIconProps) {
  const color =
    status === 'rejected' ? '#E53935' : status === 'shipped' ? '#E53935' : '#C9A24E';

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" opacity="0.35" />
      {status === 'ready' && <path d="M7.5 12.3 L10.5 15.2 L16.5 9.2" />}
      {status === 'shipped' && (
        <>
          <path d="M7 10 L12 7 L17 10 L17 15 L12 18 L7 15 Z" />
          <path d="M7 10 L12 13 L17 10" opacity="0.7" />
          <path d="M12 13 L12 18" opacity="0.7" />
        </>
      )}
      {status === 'rejected' && (
        <>
          <path d="M8.5 8.5 L15.5 15.5" />
          <path d="M15.5 8.5 L8.5 15.5" />
        </>
      )}
    </svg>
  );
});
