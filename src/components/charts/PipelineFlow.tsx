import { memo } from 'react';
import type { PipelineStage } from '../../mock/data';

interface PipelineFlowProps {
  stages: PipelineStage[];
  className?: string;
}

const toneColor: Record<PipelineStage['tone'], string> = {
  muted: 'rgba(168, 163, 153, 0.7)',
  gold: '#C9A24E',
  red: '#E53935',
};

const toneBg: Record<PipelineStage['tone'], string> = {
  muted: 'rgba(168, 163, 153, 0.08)',
  gold: 'rgba(201, 162, 78, 0.12)',
  red: 'rgba(229, 57, 53, 0.14)',
};

/**
 * Horizontal production pipeline. Each stage has a dot + count + label, with
 * connecting hairline lines between stages. The "Shipped" stage gets a
 * pulsing red indicator — the live signal that work is flowing out.
 */
export const PipelineFlow = memo(function PipelineFlow({
  stages,
  className,
}: PipelineFlowProps) {
  return (
    <div className={`relative flex items-start justify-between ${className ?? ''}`}>
      {stages.map((stage, i) => {
        const color = toneColor[stage.tone];
        const bg = toneBg[stage.tone];
        const isLast = i === stages.length - 1;
        const isRedPulse = stage.tone === 'red' && isLast;
        return (
          <div key={stage.stage} className="relative flex flex-1 flex-col items-center">
            {/* connecting line — right side of each stage except last */}
            {!isLast && (
              <div
                className="absolute left-1/2 top-4 h-px"
                style={{
                  width: '100%',
                  background:
                    'linear-gradient(90deg, rgba(168, 163, 153, 0.15) 0%, rgba(168, 163, 153, 0.3) 50%, rgba(168, 163, 153, 0.15) 100%)',
                }}
              />
            )}
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: bg,
                boxShadow: `inset 0 0 0 1.5px ${color}`,
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: color }}
              />
              {isRedPulse && (
                <span
                  className="absolute inset-0 rounded-full animate-soft-pulse"
                  style={{ boxShadow: `0 0 0 4px ${color}33` }}
                />
              )}
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span
                className="font-display font-bold tracking-data-tight leading-none"
                style={{ color, fontSize: 22 }}
              >
                {stage.count}
              </span>
              <span
                className="mt-1.5 font-display text-[9px] font-medium uppercase tracking-label-lg"
                style={{ color: 'rgba(168, 163, 153, 0.7)' }}
              >
                {stage.stage}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});
