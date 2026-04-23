import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDevice } from '../components/icons/ChevronDevice';
import { EASE_CINEMATIC } from '../motion/variants';

const routeLabels: Record<string, { eyebrow: string; hero: string; sub: string }> = {
  '/teams': {
    eyebrow: 'Operations · Session 2',
    hero: 'Teams Directory',
    sub: '12 teams across every sport and age group. Skin previews, rosters, sponsor assignments.',
  },
  '/bulk': {
    eyebrow: 'Operations · Session 2',
    hero: 'Bulk Onboarding',
    sub: 'Upload a roster CSV plus photo folder. Existing-skin teams only — new teams start in Design Workspace.',
  },
  '/media': {
    eyebrow: 'Platform · Session 2',
    hero: 'Media Library',
    sub: 'Every video ever captured, across every athlete. Filter by privacy, team, sport, or time.',
  },
  '/users': {
    eyebrow: 'Platform · Session 2',
    hero: 'User Management',
    sub: 'Parents, club admins, and the super admin lineage. Role-based permissions, re-registration, lifecycle.',
  },
  '/sponsorships': {
    eyebrow: 'Platform · Session 2',
    hero: 'Sponsorships',
    sub: 'Sponsors attach to athletes and their teams — not to individual videos. Assignments, contracts, geo-targeting.',
  },
  '/imvi-plus': {
    eyebrow: 'Platform · Session 2',
    hero: 'IMVI+',
    sub: 'Digital Workers — Sales, Marketing, Operations Agents. Venue AR. Arriving later in 2026.',
  },
};

export function ComingSoon() {
  const { pathname } = useLocation();
  const copy = routeLabels[pathname] ?? {
    eyebrow: 'Coming soon',
    hero: 'In development',
    sub: 'This surface is part of Session 2.',
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div
        className="pointer-events-none fixed bottom-0 left-sidebar right-0 h-[50vh]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.16) 0%, transparent 75%)',
        }}
      />
      <div className="relative mx-auto flex max-w-content flex-col items-start px-8 pb-24 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
        >
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
            {copy.hero}
          </h1>
          <p className="mt-4 max-w-[560px] font-body text-[15px] font-light leading-relaxed text-bone-muted">
            {copy.sub}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.25 }}
          className="ink-card mt-14 flex w-full max-w-[640px] items-center justify-between gap-6 overflow-hidden rounded-[14px] border border-gold-3/25 px-7 py-6"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 100% 0%, rgba(201, 162, 78, 0.2) 0%, transparent 60%)',
            }}
          />
          <div className="relative">
            <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-bone-muted">
              Session 2 Roadmap
            </p>
            <p className="mt-1.5 font-display text-[18px] font-bold tracking-data-tight text-bone">
              Kicks off after Session 1 is approved
            </p>
          </div>
          <ChevronDevice height={18} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-20 font-display text-[10px] font-medium uppercase tracking-label-xl text-bone-muted/50"
        >
          v1.0 · Proof of Concept
        </motion.p>
      </div>
    </div>
  );
}
