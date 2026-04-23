import { memo } from 'react';

interface IMVILogoProps {
  /** Pixel height; width auto-scales. Default 30px per mobile spec §2.6.1. */
  height?: number;
  /** Letter-spacing in em. */
  tracking?: number;
  /** Subtle gold halo behind wordmark (AppHeader uses this). */
  withHalo?: boolean;
  className?: string;
  title?: string;
}

/**
 * IMVI wordmark — Oswald 700 rendered as SVG <text> with brushed-gold gradient fill.
 * Not a font-styled div: a real SVG so it carries identically across contexts and
 * the gradient is pixel-faithful. Gradient stops must use literal hex per spec §2.5.2
 * (SVG stopColor exception).
 */
export const IMVILogo = memo(function IMVILogo({
  height = 30,
  tracking = 0.1,
  withHalo = false,
  className,
  title = 'IMVI',
}: IMVILogoProps) {
  const width = Math.round(height * 3.6);
  const gradientId = 'imvi-logo-gradient';
  const haloId = 'imvi-logo-halo';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(110, 0.5, 0.5)">
          <stop offset="0%" stopColor="#5C4620" />
          <stop offset="15%" stopColor="#8B6A2F" />
          <stop offset="35%" stopColor="#C9A24E" />
          <stop offset="50%" stopColor="#F0D286" />
          <stop offset="65%" stopColor="#C9A24E" />
          <stop offset="85%" stopColor="#8B6A2F" />
          <stop offset="100%" stopColor="#5C4620" />
        </linearGradient>
        {withHalo && (
          <radialGradient id={haloId} cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#C9A24E" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C9A24E" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      {withHalo && <rect x="0" y="0" width={width} height={height} fill={`url(#${haloId})`} />}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="'Oswald Variable', 'Oswald', sans-serif"
        fontWeight={700}
        fontSize={height * 0.95}
        letterSpacing={`${tracking}em`}
        fill={`url(#${gradientId})`}
      >
        IMVI
      </text>
    </svg>
  );
});
