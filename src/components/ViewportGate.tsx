import { useEffect, useState } from 'react';
import { IMVILogo } from './icons/IMVILogo';

interface ViewportGateProps {
  children: React.ReactNode;
  /** Hard-block any viewport below this width. Per web spec §2.4. */
  minWidth?: number;
}

/**
 * Desktop-only gate. Per spec §2.4 the web portal's minimum is 1200px —
 * below that, a hard full-viewport overlay takes over. Not dismissible —
 * this protects demos where a narrow window would otherwise produce broken
 * layouts mid-walkthrough.
 */
export function ViewportGate({ children, minWidth = 1200 }: ViewportGateProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : minWidth + 1,
  );

  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const tooNarrow = viewportWidth < minWidth;

  return (
    <>
      {children}
      {tooNarrow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink px-8">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.35) 0%, rgba(139, 106, 47, 0.15) 35%, transparent 70%)',
            }}
          />
          <div className="relative mx-auto max-w-md text-center">
            <div className="mb-10 flex justify-center">
              <IMVILogo height={36} tracking={0.1} withHalo />
            </div>
            <p className="font-display text-[11px] font-medium uppercase tracking-label-xl text-gold-3">
              Portal · Administration
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-bone">
              Best viewed on desktop
            </h1>
            <p className="mt-4 font-body text-[14px] font-light leading-relaxed text-bone-muted">
              The IMVI admin portal is built for a 1200px-or-wider canvas.
              Resize your window, or switch to a desktop device, to continue.
            </p>
            <p className="mt-10 font-display text-[10px] font-medium uppercase tracking-label-xl text-bone-muted/70">
              v1.0 · Proof of Concept
            </p>
          </div>
        </div>
      )}
    </>
  );
}
