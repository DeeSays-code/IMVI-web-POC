import { memo } from 'react';

interface PaletteSwatchProps {
  color: string;
  label: string;
  size?: number;
}

/**
 * A color swatch used in the Design Workspace "Extracted palette" row. A
 * softly glowing ring around the color, hex + label underneath in Oswald.
 */
export const PaletteSwatch = memo(function PaletteSwatch({
  color,
  label,
  size = 48,
}: PaletteSwatchProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 0 1px rgba(245, 241, 232, 0.1), 0 8px 20px -8px ${color}`,
        }}
      >
        <span
          className="absolute inset-[3px] rounded-full"
          style={{
            boxShadow: `inset 0 0 0 1px rgba(245, 241, 232, 0.12)`,
          }}
        />
      </div>
      <p className="mt-2.5 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
        {label}
      </p>
      <p className="mt-0.5 font-display text-[10px] font-medium uppercase tracking-data-loose text-bone">
        {color.toUpperCase()}
      </p>
    </div>
  );
});
