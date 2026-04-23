import { memo } from 'react';
import { teamById, type TeamRanking } from '../../mock/data';

interface HBarRankingProps {
  data: TeamRanking[];
  className?: string;
}

/**
 * Horizontal ranking bars. Each row: rank # (Oswald heavy), team label,
 * bar fill (team-accent color), count. No chart library — just a flex row
 * per team with a width-proportional fill div.
 */
export const HBarRanking = memo(function HBarRanking({
  data,
  className,
}: HBarRankingProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.cards));

  return (
    <ul className={`flex flex-col gap-4 ${className ?? ''}`}>
      {data.map((row, idx) => {
        const team = teamById(row.teamId);
        const frac = row.cards / max;
        return (
          <li key={row.teamId} className="group relative">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3 min-w-0">
                <span
                  className="font-display text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: 'rgba(168, 163, 153, 0.55)', minWidth: 20 }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-[14px] font-medium tracking-data-tight text-bone truncate">
                  {team?.name ?? row.teamId}
                </span>
                <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/60">
                  {team?.sport}
                </span>
              </div>
              <span
                className="font-display text-[18px] font-bold leading-none tracking-data-tight"
                style={{ color: row.color }}
              >
                {row.cards}
              </span>
            </div>
            <div className="relative mt-1.5 h-[6px] overflow-hidden rounded-full bg-bone-muted/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${frac * 100}%`,
                  background: `linear-gradient(90deg, ${row.color}33 0%, ${row.color} 100%)`,
                  boxShadow: `0 0 8px ${row.color}44`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
});
