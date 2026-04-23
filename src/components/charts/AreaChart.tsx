import { memo, useId } from 'react';
import type { TrendPoint } from '../../mock/data';

interface AreaChartProps {
  data: TrendPoint[];
  height?: number;
  className?: string;
  /** Peak accent color — drives the gradient fill and stroke. */
  accent?: string;
}

/**
 * Full-width area chart. Red-forward gradient fill anchored to the baseline,
 * solid line on top. Hairline gridlines behind. Week labels along the x-axis.
 *
 * Designed to be the "this is the business growing" hero chart — Kevin's
 * primary growth signal at a glance.
 */
export const AreaChart = memo(function AreaChart({
  data,
  height = 260,
  className,
  accent = '#E53935',
}: AreaChartProps) {
  const uid = useId().replace(/:/g, '');
  const vw = 1200;
  const vh = height * 1.3; // keep some wiggle room inside the viewBox
  const padL = 46;
  const padR = 20;
  const padT = 24;
  const padB = 44;

  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const max = Math.max(...values) * 1.15; // headroom above the peak
  const min = 0;
  const innerW = vw - padL - padR;
  const innerH = vh - padT - padB;

  const stepX = innerW / (data.length - 1);

  const pts = values.map((v, i) => {
    const x = padL + i * stepX;
    const y = padT + (1 - (v - min) / (max - min)) * innerH;
    return [x, y] as const;
  });

  // Smooth the curve via Catmull-Rom → cubic Bezier
  const pathD = smoothLine(pts);
  const areaD =
    `${pathD} L${pts[pts.length - 1][0]},${padT + innerH} L${pts[0][0]},${padT + innerH} Z`;

  // Gridlines — 4 horizontal rules
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const frac = i / gridCount;
    const y = padT + frac * innerH;
    const val = Math.round(max - frac * (max - min));
    return { y, val };
  });

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className={className}
      style={{ width: '100%', height: 'auto' }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`area-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines + value labels */}
      {gridLines.map(({ y, val }, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={vw - padR}
            y1={y}
            y2={y}
            stroke="rgba(168, 163, 153, 0.1)"
            strokeWidth="1"
            strokeDasharray={i === gridCount ? '0' : '2 4'}
          />
          <text
            x={padL - 10}
            y={y + 4}
            textAnchor="end"
            fontFamily="'Oswald Variable', sans-serif"
            fontSize="13"
            fontWeight="500"
            letterSpacing="0.05em"
            fill="rgba(168, 163, 153, 0.6)"
          >
            {val}
          </text>
        </g>
      ))}

      {/* area fill */}
      <path d={areaD} fill={`url(#area-${uid})`} />
      {/* main stroke */}
      <path
        d={pathD}
        fill="none"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* data points at every other tick */}
      {pts.map(([x, y], i) => {
        const isLast = i === pts.length - 1;
        return (
          <g key={i}>
            {isLast && <circle cx={x} cy={y} r="12" fill={accent} opacity="0.18" />}
            <circle cx={x} cy={y} r={isLast ? 5.5 : 3.5} fill={isLast ? accent : '#0A0A0A'} stroke={accent} strokeWidth={isLast ? 0 : 2} />
          </g>
        );
      })}

      {/* x-axis week labels — show every other label to avoid crowding */}
      {data.map((d, i) => {
        if (i % 2 !== 0 && i !== data.length - 1) return null;
        const [x] = pts[i];
        return (
          <text
            key={d.label}
            x={x}
            y={vh - padB + 22}
            textAnchor="middle"
            fontFamily="'Oswald Variable', sans-serif"
            fontSize="13"
            fontWeight="500"
            letterSpacing="0.12em"
            fill="rgba(168, 163, 153, 0.75)"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
});

/** Catmull-Rom → cubic Bezier for a smooth line through the points. */
function smoothLine(pts: ReadonlyArray<readonly [number, number]>): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;

  const d: string[] = [`M${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const smoothing = 0.18;
    const cp1x = p1[0] + (p2[0] - p0[0]) * smoothing;
    const cp1y = p1[1] + (p2[1] - p0[1]) * smoothing;
    const cp2x = p2[0] - (p3[0] - p1[0]) * smoothing;
    const cp2y = p2[1] - (p3[1] - p1[1]) * smoothing;
    d.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }
  return d.join(' ');
}
