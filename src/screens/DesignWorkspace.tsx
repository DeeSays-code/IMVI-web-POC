import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { teamLogos, type Team } from '../mock/data';
import { PaletteSwatch } from '../components/PaletteSwatch';
import { TeamMonogram } from '../components/icons/TeamMonogram';
import { UploadZoneIcon } from '../components/icons/UploadZoneIcon';
import { AIGenerationIcon } from '../components/icons/AIGenerationIcon';
import { Toast } from '../components/Toast';
import { EASE_CINEMATIC, EASE_STANDARD } from '../motion/variants';
import cardV1 from '../assets/card-variations/sample_player_safc_v1.png';
import cardV2 from '../assets/card-variations/sample_player_safc_v2.png';
import cardV3 from '../assets/card-variations/sample_player_safc_v3.png';
import cardV4 from '../assets/card-variations/sample_player_safc_v4.png';

/**
 * Four card designs generated for the uploaded team's palette. Each entry
 * is a distinct style — different background treatment, fonts, number
 * treatment, composition — all anchored to the SAME palette that was
 * extracted from the logo.
 */
const cardVariations = [
  { id: 'v1', label: 'Splatter Band', src: cardV1 },
  { id: 'v2', label: 'Diagonal Brush', src: cardV2 },
  { id: 'v3', label: 'Torn Paper', src: cardV3 },
  { id: 'v4', label: 'Geometric Shards', src: cardV4 },
] as const;

/**
 * A fresh team for the demo. The Design Workspace scenario is "design a
 * new team's skin" — the team doesn't exist in the system yet. Once a skin
 * is approved, this team would be added to the mock.teams list.
 */
/**
 * San Antonio FC — real team shield logo. Red + silver + black. The Design
 * Workspace "extracts" the palette from the uploaded shield and renders all
 * 9 background variations against it.
 */
const demoTeam: Team = {
  id: 'team_san_antonio_fc',
  name: 'San Antonio FC',
  monogram: 'SAFC',
  club: 'San Antonio Football Club',
  organization: 'Alamo Athletic Holdings',
  sport: 'Soccer',
  ageGroup: 'U12',
  palette: { primary: '#E03131', accent: '#D9D4CE', dark: '#0D0D0D', light: '#F5F1E8' },
  skinBackground: cardV1,
  logoImage: teamLogos.sanAntonioFC,
  athleteCount: 0,
  createdAt: 'New',
};

type Step = 'logo' | 'palette' | 'variations' | 'approve' | 'done';

export function DesignWorkspace() {
  const navigate = useNavigate();
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [variationsReady, setVariationsReady] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [approved, setApproved] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const currentStep: Step = !logoUploaded
    ? 'logo'
    : !variationsReady
      ? 'palette'
      : selectedIdx === null
        ? 'variations'
        : approved
          ? 'done'
          : 'approve';

  const pushToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  const handleUpload = () => {
    if (uploading || logoUploaded) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setLogoUploaded(true);
    }, 900);
  };

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setSelectedIdx(null);
    setVariationsReady(false);
    setTimeout(() => {
      setGenerating(false);
      setVariationsReady(true);
    }, 2400);
  };

  const selectedCard =
    selectedIdx !== null ? cardVariations[selectedIdx] : null;

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      {/* subtle gold floor-fade — Design Workspace carries the brand too */}
      <div
        className="pointer-events-none fixed bottom-0 left-sidebar right-0 h-[40vh]"
        style={{
          background:
            'radial-gradient(ellipse at 65% 100%, rgba(201, 162, 78, 0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
        {/* back link */}
        <button
          type="button"
          onClick={() => navigate('/review')}
          className="group flex items-center gap-2 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted transition-colors hover:text-gold-3"
        >
          <ArrowLeft size={14} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Review Queue
        </button>

        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="mt-6 flex items-end justify-between gap-8"
        >
          <div>
            <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
              New Team · Design Workspace
            </p>
            <h1 className="mt-3 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
              {logoUploaded ? demoTeam.name : 'New Team'}
            </h1>
            <p className="mt-3 max-w-[540px] font-body text-[14px] font-light leading-relaxed text-bone-muted">
              {logoUploaded
                ? `Designing the skin for ${demoTeam.name}. Applied to every card for this team — today's batch and every future upload.`
                : 'Upload a team logo to start. The team name and palette are read from the logo; the four card designs use that palette as the anchor.'}
            </p>
          </div>
          <StepRail currentStep={currentStep} />
        </motion.header>

        {/* two-column layout */}
        <div className="mt-12 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-12">
          {/* LEFT — controls */}
          <div className="flex flex-col gap-10">
            {/* Step 1 — logo upload */}
            <section>
              <StepHeader index={1} label="Team Logo" active={currentStep === 'logo'} />
              <p className="mt-2 max-w-[440px] font-body text-[13px] font-light text-bone-muted">
                Upload the team's logo. We'll read it for the color palette and use it
                as the anchor lockup on every card.
              </p>

              <div className="mt-5">
                {!logoUploaded ? (
                  <button
                    type="button"
                    onClick={handleUpload}
                    className={`relative flex h-[200px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[14px] border-2 border-dashed transition-colors ${
                      uploading
                        ? 'border-gold-3/80 bg-gold-3/5'
                        : 'border-gold-3/40 bg-ink-2/60 hover:border-gold-3/80 hover:bg-gold-3/5'
                    }`}
                  >
                    <UploadZoneIcon size={48} />
                    <p className="font-display text-[13px] font-medium uppercase tracking-label-md text-bone">
                      {uploading ? 'Uploading…' : 'Upload team logo'}
                    </p>
                    <p className="font-body text-[12px] font-light text-bone-muted">
                      PNG or SVG · drop or click to browse
                    </p>
                  </button>
                ) : (
                  <div className="flex items-center gap-6 rounded-[14px] border border-gold-3/30 bg-gold-3/5 px-6 py-5">
                    <div
                      className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center rounded-[10px] overflow-hidden"
                      style={{
                        background: demoTeam.palette.dark,
                        boxShadow: `inset 0 0 0 1px ${demoTeam.palette.accent}44`,
                      }}
                    >
                      {demoTeam.logoImage ? (
                        <img
                          src={demoTeam.logoImage}
                          alt={`${demoTeam.name} logo`}
                          className="h-[96px] w-[96px] object-contain"
                        />
                      ) : (
                        <TeamMonogram
                          mark={demoTeam.monogram}
                          primary={demoTeam.palette.primary}
                          accent={demoTeam.palette.accent}
                          size={88}
                          variant="crest"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-gold-3">
                        Uploaded
                      </p>
                      <p className="mt-1.5 font-display text-[18px] font-bold tracking-data-tight text-bone">
                        san_antonio_fc_shield.png
                      </p>
                      <p className="mt-1 font-body text-[12px] font-light text-bone-muted">
                        PNG · 34 KB · palette read in 112ms
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUploaded(false);
                          setVariationsReady(false);
                          setSelectedIdx(null);
                          setApproved(false);
                        }}
                        className="mt-3 font-display text-[11px] font-medium uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Step 2 — palette */}
            <AnimatePresence>
              {logoUploaded && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
                >
                  <StepHeader index={2} label="Extracted Palette" active={currentStep === 'palette'} />
                  <p className="mt-2 max-w-[440px] font-body text-[13px] font-light text-bone-muted">
                    Derived from the logo. These colors guide the background generation —
                    the AI holds tight to them.
                  </p>

                  <div className="mt-5 flex items-start gap-10 rounded-[14px] border border-bone-muted/10 bg-ink-2 px-6 py-5">
                    <PaletteSwatch color={demoTeam.palette.primary} label="Primary" />
                    <PaletteSwatch color={demoTeam.palette.accent} label="Accent" />
                    <PaletteSwatch color={demoTeam.palette.dark} label="Dark" />
                    <PaletteSwatch color={demoTeam.palette.light} label="Light" />
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Step 3 — variations */}
            <AnimatePresence>
              {logoUploaded && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[], delay: 0.1 }}
                >
                  <StepHeader
                    index={3}
                    label="Card Designs"
                    active={currentStep === 'variations'}
                  />
                  <p className="mt-2 max-w-[460px] font-body text-[13px] font-light text-bone-muted">
                    Generate four card designs using your extracted palette. Every
                    design uses the same team colors — they differ only in style:
                    background treatment, fonts, number treatment, and composition.
                  </p>

                  <div className="mt-5">
                    {!variationsReady && !generating && (
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="specular-sweep relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-[10px] px-6 font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
                        style={{
                          background:
                            'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
                        }}
                      >
                        <AIGenerationIcon size={18} />
                        <span className="relative z-[2]">Generate designs</span>
                      </button>
                    )}

                    {generating && (
                      <div className="flex items-center gap-4 rounded-[12px] border border-gold-3/30 bg-ink-2 px-5 py-4">
                        <AIGenerationIcon size={22} animated />
                        <div>
                          <p className="font-display text-[13px] font-medium uppercase tracking-label-md text-bone">
                            Generating…
                          </p>
                          <p className="mt-0.5 font-body text-[12px] font-light text-bone-muted">
                            AI is composing four card designs anchored to your palette.
                            This typically takes 15–30 seconds.
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-gold-3"
                              style={{
                                animation: 'soft-pulse 1.4s cubic-bezier(0.4,0,0.2,1) infinite',
                                animationDelay: `${i * 0.18}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {variationsReady && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="flex items-center gap-2 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold-3" />
                            4 designs · pick one
                          </p>
                          <button
                            type="button"
                            onClick={handleGenerate}
                            className="font-display text-[11px] font-medium uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4"
                          >
                            Regenerate
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          {cardVariations.map((card, idx) => (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => setSelectedIdx(idx)}
                              className={`relative overflow-hidden rounded-[10px] transition-transform duration-300 ease-cinematic hover:-translate-y-0.5 ${
                                selectedIdx === idx
                                  ? 'ring-2 ring-gold-3 ring-offset-2 ring-offset-ink'
                                  : 'ring-1 ring-bone-muted/10 hover:ring-gold-3/60'
                              }`}
                              style={{ aspectRatio: '2.5 / 3.5' }}
                            >
                              <img
                                src={card.src}
                                alt={`${card.label} design`}
                                className="h-full w-full object-cover"
                              />
                              {selectedIdx === idx && (
                                <div
                                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full"
                                  style={{
                                    background:
                                      'linear-gradient(110deg, #C9A24E 0%, #F0D286 50%, #C9A24E 100%)',
                                  }}
                                >
                                  <Check size={13} strokeWidth={3} className="text-ink" />
                                </div>
                              )}
                              <div className="absolute bottom-1.5 left-2 font-display text-[9px] font-medium uppercase tracking-label-md text-bone/80">
                                {card.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Step 4 — approve */}
            <AnimatePresence>
              {variationsReady && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
                >
                  <StepHeader index={4} label="Approve Skin" active={currentStep === 'approve'} />
                  <p className="mt-2 max-w-[460px] font-body text-[13px] font-light text-bone-muted">
                    Approving saves this skin for <span className="text-bone">Coastline Arsenal</span>.
                    New uploads for this team will automatically apply it.
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={selectedIdx === null || approved}
                      onClick={() => {
                        setApproved(true);
                        pushToast('Skin approved · Coastline Arsenal is ready for onboarding');
                      }}
                      className={`specular-sweep relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[10px] font-display text-[13px] font-semibold uppercase tracking-label-md transition-all duration-300 ease-cinematic ${
                        approved ? 'cursor-default' : 'text-ink'
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                      style={{
                        background: approved
                          ? 'linear-gradient(110deg, #2E3B26 0%, #4C6238 40%, #618447 60%, #2E3B26 100%)'
                          : selectedIdx !== null
                            ? 'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)'
                            : 'linear-gradient(110deg, #3A2D17 0%, #4D3D20 50%, #3A2D17 100%)',
                        color: approved ? '#F5F1E8' : '',
                      }}
                    >
                      <span className="relative z-[2] flex items-center gap-2">
                        {approved ? (
                          <>
                            <Check size={16} strokeWidth={2.4} />
                            Template applied to team
                          </>
                        ) : (
                          'Apply template to team'
                        )}
                      </span>
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — sticky preview */}
          <div className="sticky top-[88px] self-start">
            <div className="ink-card relative overflow-hidden rounded-[14px] border border-bone-muted/10 p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.2) 0%, transparent 60%)',
                }}
              />

              <div className="relative flex flex-col items-center">
                <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
                  Live Preview
                </p>

                <div className="mt-6 flex items-center justify-center" style={{ minHeight: 448 }}>
                  <AnimatePresence mode="wait">
                    {selectedCard ? (
                      <motion.img
                        key={`preview-${selectedCard.id}`}
                        src={selectedCard.src}
                        alt={`${selectedCard.label} card preview`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: EASE_STANDARD as unknown as number[] }}
                        className="h-[448px] w-[320px] rounded-[14px] object-cover shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
                      />
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex h-[448px] w-[320px] flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-bone-muted/15 bg-ink-3/30"
                      >
                        <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-bone-muted">
                          {!logoUploaded
                            ? 'Awaiting logo'
                            : !variationsReady
                              ? 'Click generate to see designs'
                              : 'Pick a design on the left'}
                        </p>
                        <p className="max-w-[220px] px-2 text-center font-body text-[12px] font-light leading-relaxed text-bone-muted/70">
                          {!logoUploaded
                            ? 'The preview appears once you select a generated design.'
                            : !variationsReady
                              ? 'Four card designs will appear below, all tied to your extracted palette.'
                              : 'The card you pick will load here as the team skin preview.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedCard && (
                  <p className="mt-6 text-center font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
                    Preview ·{' '}
                    <span className="text-bone">{selectedCard.label}</span>{' '}
                    design · sample player
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-bone-muted/8 bg-ink-2 px-4 py-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-3/15">
                <span className="text-[10px] font-bold text-gold-3">i</span>
              </span>
              <p className="font-body text-[12px] font-light leading-relaxed text-bone-muted">
                Every design is anchored to the extracted team palette. The
                four variations differ only in style — background treatment,
                fonts, number treatment, composition — so the team's identity
                stays consistent across the card set.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

function StepRail({ currentStep }: { currentStep: Step }) {
  const steps: Step[] = ['logo', 'palette', 'variations', 'approve'];
  const activeIdx = Math.min(steps.indexOf(currentStep), 3);
  return (
    <div className="flex items-center gap-2">
      {['Logo', 'Palette', 'Variations', 'Approve'].map((label, idx) => {
        const done = idx < activeIdx || currentStep === 'done';
        const active = idx === activeIdx && currentStep !== 'done';
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 font-display text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                active
                  ? 'bg-gold-3 text-ink'
                  : done
                    ? 'border border-gold-3/60 bg-ink text-gold-3'
                    : 'border border-bone-muted/20 bg-ink text-bone-muted/60'
              }`}
            >
              {done ? <Check size={11} strokeWidth={3} /> : idx + 1}
            </span>
            <span
              className={`font-display text-[10px] font-medium uppercase tracking-label-md ${
                active ? 'text-bone' : 'text-bone-muted/60'
              }`}
            >
              {label}
            </span>
            {idx < 3 && <span className="mx-1 h-px w-4 bg-bone-muted/15" />}
          </div>
        );
      })}
    </div>
  );
}

function StepHeader({
  index,
  label,
  active,
}: {
  index: number;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-[11px] font-semibold tracking-[0.02em] transition-colors ${
          active
            ? 'bg-gold-3 text-ink'
            : 'border border-gold-3/45 bg-ink text-gold-3'
        }`}
      >
        {index}
      </span>
      <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-gold-3">
        Step {index} · {label}
      </p>
    </div>
  );
}

