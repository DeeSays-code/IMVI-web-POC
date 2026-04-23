import { memo } from 'react';
import type { SportSlice } from '../../mock/data';

interface DonutChartProps {
  data: SportSlice[];
  size?: number;
  /** Ring thickness. */
  strokeWidth?: number;
  /** Label rendered at the center (total, unit). */
  centerLabel?: string;
  centerSub?: string;
  className?: string;
}

/**
 * Segmented donut. Each slice renders as an SVG arc with a small gap between
 * slices for a crisp, modern look. Rotated so the largest slice starts at
 * 12 o'clock.
 */
export const DonutChart = memo(function DonutChart({
  data,
  size = 240,
  strokeWidth = 28,
  centerLabel,
  centerSub,
  className,
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * r;
  // Tiny gap between slices
  const gap = 6;

  let cumulative = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {/* background ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(168, 163, 153, 0.08)"
        strokeWidth={strokeWidth}
      />
      {data.map((slice) => {
        const frac = slice.count / total;
        const length = frac * circumference - gap;
        const offset = cumulative * circumference;
        cumulative += frac;
        return (
          <circle
            key={slice.name}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      {/* center label */}
      {centerLabel && (
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Oswald Variable', sans-serif"
          fontWeight={700}
          fontSize={size * 0.19}
          letterSpacing="0.02em"
          fill="#F5F1E8"
        >
          {centerLabel}
        </text>
      )}
      {centerSub && (
        <text
          x={cx}
          y={cy + size * 0.11}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Oswald Variable', sans-serif"
          fontWeight={500}
          fontSize={size * 0.055}
          letterSpacing="0.22em"
          fill="rgba(168, 163, 153, 0.8)"
        >
          {centerSub}
        </text>
      )}
    </svg>
  );
});
