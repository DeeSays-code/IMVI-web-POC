import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms
  delay?: number; // ms
  className?: string;
  /** Format the rendered number (e.g. to add comma thousands). */
  format?: (n: number) => string;
}

/**
 * Count-up number animation. Uses an ease-out cubic so the reveal feels
 * broadcast-graphic, not linear. Mobile spec §4.4.7 — stats count up from 0
 * over 800ms staggered.
 */
export function AnimatedNumber({
  value,
  duration = 900,
  delay = 0,
  className,
  format = (n) => n.toLocaleString('en-US'),
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      const tick = (ts: number) => {
        if (startRef.current == null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const t = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(value * eased));
        if (t < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [value, duration, delay]);

  return <span className={className}>{format(display)}</span>;
}
