import { memo } from 'react';

interface AIGenerationIconProps {
  size?: number;
  className?: string;
  /** Add a subtle pulse animation during generation. */
  animated?: boolean;
}

/**
 * The ✦ spark used on the "Generate variations" button and inside the
 * AI loading state. Four-point star with two smaller orbiting stars.
 * Brushed-gold gradient fill. Pulses at 1.8s cubic when animated.
 */
export const AIGenerationIcon = memo(function AIGenerationIcon({
  size = 18,
  className,
  animated = false,
}: AIGenerationIconProps) {
  const gradientId = 'ai-gen-gradient';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`${className ?? ''} ${animated ? 'animate-soft-pulse' : ''}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCE6A3" />
          <stop offset="50%" stopColor="#C9A24E" />
          <stop offset="100%" stopColor="#8B6A2F" />
        </linearGradient>
      </defs>
      {/* Main four-point star (diamond-spike) */}
      <path
        d="M13 2 L14.2 10 L22 11 L14.2 12 L13 20 L11.8 12 L4 11 L11.8 10 Z"
        fill={`url(#${gradientId})`}
      />
      {/* Smaller orbit sparks */}
      <path
        d="M5 3.5 L5.4 5.1 L7 5.5 L5.4 5.9 L5 7.5 L4.6 5.9 L3 5.5 L4.6 5.1 Z"
        fill={`url(#${gradientId})`}
        opacity="0.7"
      />
      <path
        d="M20 17 L20.4 18.6 L22 19 L20.4 19.4 L20 21 L19.6 19.4 L18 19 L19.6 18.6 Z"
        fill={`url(#${gradientId})`}
        opacity="0.5"
      />
    </svg>
  );
});
