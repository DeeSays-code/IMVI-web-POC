import { memo } from 'react';

type Tone = 'ready' | 'shipped' | 'rejected' | 'draft' | 'info';

interface StatusPillProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  /** Optional small dot prefix. */
  withDot?: boolean;
}

const toneMap: Record<Tone, string> = {
  ready: 'border-gold-3/60 text-gold-3 bg-ink',
  shipped: 'border-live-red/60 text-live-red bg-ink',
  rejected: 'border-live-red/60 text-live-red bg-ink',
  draft: 'border-bone-muted/40 text-bone-muted bg-ink',
  info: 'border-bone-muted/30 text-bone bg-ink-3',
};

const dotMap: Record<Tone, string> = {
  ready: 'bg-gold-3',
  shipped: 'bg-live-red',
  rejected: 'bg-live-red',
  draft: 'bg-bone-muted',
  info: 'bg-bone-muted',
};

/**
 * Oswald 500 10px uppercase label-wide pill. The classic broadcast-chyron tag
 * used on Review Queue group headers and everywhere a state needs marking.
 */
export const StatusPill = memo(function StatusPill({
  tone = 'info',
  children,
  className,
  withDot = false,
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 font-display text-[10px] font-medium uppercase tracking-label-md ${toneMap[tone]} ${className ?? ''}`}
    >
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${dotMap[tone]}`} />}
      {children}
    </span>
  );
});
