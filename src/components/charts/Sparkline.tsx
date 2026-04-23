import { memo } from 'react';
import type { TrendPoint } from '../../mock/data';

interface SparklineProps {
  data: TrendPoint[];
  width?: number;
  height?: number;
  /** Stroke color — defaults to live-red so KPI trends read hot. */
  stroke?: string;
  /** Area fill color (stroke at reduced alpha). */
  fill?: string;
  className?: string;
}

/**
 * Small inline sparkline — draws a single curve + filled area. Designed to
 * sit inside KPI cards next to big numbers. End-point dot reinforces the
 * "latest value" so the eye lands on the current state, not the history.
 */
export const Sparkline = memo(function Sparkline({
  data,
  width = 180,
  height = 48,
  stroke = '#E53935',
  fill = 'rgba(229, 57, 53, 0.22)',
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const pad = 2;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const pathD = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(' ');

  const areaD =
    `${pathD} L${points[points.length - 1][0]},${height - pad} L${points[0][0]},${height - pad} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <path d={areaD} fill={fill} />
      <path d={pathD} stroke={stroke} strokeWidth="1.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="3" fill={stroke} />
      <circle cx={lastX} cy={lastY} r="6" fill={stroke} opacity="0.25" />
    </svg>
  );
});
