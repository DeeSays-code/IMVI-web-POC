import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { EASE_CINEMATIC } from '../motion/variants';

export function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? 'you@imvi.me';
  const [pillVisible, setPillVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPillVisible(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.38) 0%, rgba(139, 106, 47, 0.16) 38%, transparent 72%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(rgba(201, 162, 78, 0.04) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[520px] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE_CINEMATIC as unknown as number[] }}
          className="relative"
        >
          {/* gold halo behind icon */}
          <div
            className="absolute inset-0 scale-150 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(201, 162, 78, 0.28) 0%, transparent 70%)',
            }}
          />
          <div className="relative">
            <Mail
              size={72}
              strokeWidth={1.2}
              className="text-gold-3"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(201, 162, 78, 0.35))' }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.2 }}
          className="mt-10 font-display text-[34px] font-bold leading-tight tracking-[0.01em] text-bone"
        >
          Check your email.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.35 }}
          className="mt-4 max-w-[380px] font-body text-[15px] font-light leading-relaxed text-bone-muted"
        >
          We sent a sign-in link to{' '}
          <span className="font-body font-normal text-bone">{email}</span>.
          Open it to continue.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: pillVisible ? 1 : 0, y: pillVisible ? 0 : 12 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="mt-14"
        >
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="specular-sweep relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-display text-[11px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px] hover:shadow-gold-glow-soft"
            style={{
              background:
                'linear-gradient(110deg, #8B6A2F 0%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 100%)',
            }}
            disabled={!pillVisible}
          >
            <span className="relative z-[2]">
              <span aria-hidden className="mr-2">✦</span>
              Simulated for demo · click to continue
            </span>
          </button>
        </motion.div>

        <p className="mt-20 font-display text-[10px] font-medium uppercase tracking-label-xl text-bone-muted/50">
          The real portal uses magic-link authentication. For this demo, the
          link is inert — click above to proceed.
        </p>
      </div>
    </div>
  );
}
