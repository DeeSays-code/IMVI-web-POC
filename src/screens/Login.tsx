import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IMVILogo } from '../components/icons/IMVILogo';
import { EASE_CINEMATIC } from '../motion/variants';

const EMAIL_RE = /.+@.+\..+/;

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('kevin@imvi.me');
  const valid = EMAIL_RE.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    navigate('/check-email', { state: { email } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      {/* brand-family gold top hairline — same accent as the sidebar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-80"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201, 162, 78, 0.0) 15%, rgba(201, 162, 78, 0.8) 50%, rgba(201, 162, 78, 0.0) 85%, transparent 100%)',
        }}
      />
      {/* ceiling gold fade — counter-weights the floor-fade so the page isn't bottom-heavy */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40vh]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201, 162, 78, 0.12) 0%, rgba(139, 106, 47, 0.04) 40%, transparent 72%)',
        }}
      />
      {/* gold floor-fade atmospheric gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.38) 0%, rgba(139, 106, 47, 0.16) 38%, transparent 72%)',
        }}
      />
      {/* softened diagonal brushed-gold accent wash, upper left */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 18% 12%, rgba(201, 162, 78, 0.14) 0%, transparent 40%)',
        }}
      />
      {/* grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(rgba(201, 162, 78, 0.04) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[460px] flex-col px-6 py-16">
        {/* micro-eyebrow at top */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[], delay: 0.1 }}
          className="text-center font-display text-[10px] font-medium uppercase tracking-label-xl text-bone-muted/70"
        >
          Youth sports · seen
        </motion.p>

        {/* hero wordmark — no localized halo; relies on the page's atmospheric gold */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="mt-10 flex flex-col items-center"
        >
          <IMVILogo height={88} tracking={0.1} />
          <p className="mt-5 font-display text-[11px] font-medium uppercase tracking-label-xl text-gold-3">
            Portal · Administration
          </p>
        </motion.div>

        {/* hairline divider — symmetric, tick in the middle, fades out both sides */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE_CINEMATIC as unknown as number[], delay: 0.3 }}
          className="mt-14 flex origin-center items-center gap-3"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-l from-gold-3/60 via-gold-3/10 to-transparent" />
          <span className="h-[5px] w-[5px] rotate-45 bg-gold-3" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-gold-3/60 via-gold-3/10 to-transparent" />
        </motion.div>

        {/* form section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.4 }}
          className="mt-10"
        >
          <h1 className="text-center font-display text-[32px] font-bold leading-tight tracking-[0.01em] text-bone">
            Welcome back.
          </h1>
          <p className="mt-3 text-center font-body text-[14px] font-light leading-relaxed text-bone-muted">
            Enter your email and we'll send you a sign-in link.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block text-center font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted/80">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@imvi.me"
                className="block h-[52px] w-full rounded-[10px] border border-bone-muted/20 bg-ink-2 px-4 text-center font-body text-[15px] font-normal text-bone transition-colors placeholder:text-bone-muted/40 focus:border-gold-3/50 focus:outline-none"
                autoComplete="email"
              />
            </label>

            <button
              type="submit"
              disabled={!valid}
              className="specular-sweep relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[10px] font-display text-[13px] font-semibold uppercase tracking-label-md text-ink transition-all duration-300 ease-cinematic disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: valid
                  ? 'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)'
                  : 'linear-gradient(110deg, #3A2D17 0%, #4D3D20 50%, #3A2D17 100%)',
              }}
            >
              <span className="relative z-[2]">Send sign-in link</span>
            </button>
          </form>
        </motion.div>

        {/* footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-auto pt-20 text-center font-display text-[10px] font-medium uppercase tracking-label-xl text-bone-muted/50"
        >
          v1.0 · Proof of Concept
        </motion.p>
      </div>
    </div>
  );
}
