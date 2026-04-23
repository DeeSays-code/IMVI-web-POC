import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Lock,
  FileSpreadsheet,
  FolderArchive,
  Info,
} from 'lucide-react';
import {
  athletesByTeam,
  teams,
  type Athlete,
  type QueueGroup,
  type QueueItem,
  type Team,
} from '../mock/data';
import { ComposedCardPreview } from '../components/ComposedCardPreview';
import { DataTable, type ColumnDef } from '../components/DataTable';
import { TeamMonogram } from '../components/icons/TeamMonogram';
import { Toast } from '../components/Toast';
import { EASE_CINEMATIC, EASE_STANDARD, fadeRise } from '../motion/variants';
import { useAppState } from '../state/AppState';

/**
 * Bulk Onboarding — v1.5 rework.
 *
 * A team's card template is locked at the end of the Design Workspace
 * (§4.5). Bulk doesn't re-offer variations — it shows Kevin the team's
 * finalized template and he uploads the roster against it. Every athlete
 * in the batch inherits the same template by construction.
 *
 * Flow: Team → Upload Excel → Preview roster → Confirm & queue.
 */

type Step = 'team' | 'upload' | 'preview' | 'confirm' | 'success';

interface BulkEntry {
  tempId: string;
  firstName: string;
  lastName: string;
  jersey: number;
  dob: string;
  parentName: string;
  parentEmail: string;
  shipping: string;
  status: 'ready' | 'problem';
  reason?: string;
}

const MOCK_ROSTER: BulkEntry[] = [
  { tempId: 'br_01', firstName: 'Arlo',    lastName: 'Bennett',     jersey: 21, dob: '2013-03-12', parentName: 'Sam Bennett',    parentEmail: 'sbennett@gmail.com',    shipping: '401 Elm St, Chicago IL', status: 'ready' },
  { tempId: 'br_02', firstName: 'Hana',    lastName: 'Whitmore',    jersey: 4,  dob: '2013-07-08', parentName: 'Ayana Whitmore', parentEmail: 'ayana@whitmore.co',     shipping: '209 Oak Ave, Chicago IL', status: 'ready' },
  { tempId: 'br_03', firstName: 'Jonah',   lastName: 'Marín',       jersey: 15, dob: '2013-01-22', parentName: 'Lara Marín',     parentEmail: 'lara.marin@gmail.com',  shipping: '55 Park Rd, Oak Park IL', status: 'ready' },
  { tempId: 'br_04', firstName: 'Sage',    lastName: 'Kensington',  jersey: 11, dob: '2013-09-30', parentName: 'Ben Kensington', parentEmail: 'ben.k@outlook.com',     shipping: '1200 Maple Dr, Naperville IL', status: 'ready' },
  { tempId: 'br_05', firstName: 'Ruben',   lastName: 'Ortiz-Lee',   jersey: 7,  dob: '2013-04-17', parentName: 'Clara Ortiz',    parentEmail: 'clara@ortizlee.com',    shipping: '680 Birch Ln, Evanston IL', status: 'ready' },
  { tempId: 'br_06', firstName: 'Maddie',  lastName: "O'Hara",      jersey: 3,  dob: '2013-08-02', parentName: "John O'Hara",    parentEmail: 'john.ohara@hey.com',    shipping: '12 Cedar Ct, Chicago IL', status: 'ready' },
  { tempId: 'br_07', firstName: 'Zion',    lastName: 'Blake',       jersey: 18, dob: '2013-11-11', parentName: 'Tasha Blake',    parentEmail: 'tasha@blake.io',        shipping: '303 Sycamore Way, Skokie IL', status: 'ready' },
  { tempId: 'br_08', firstName: 'Naomi',   lastName: 'Vale',        jersey: 6,  dob: '2013-06-05', parentName: 'Isaac Vale',     parentEmail: 'isaac.vale@gmail.com',  shipping: '88 Pine St, Chicago IL', status: 'ready' },
  { tempId: 'br_09', firstName: 'Hendrix', lastName: 'Doyle',       jersey: 22, dob: '2013-02-28', parentName: 'Jules Doyle',    parentEmail: 'jules@doyle.family',    shipping: '19 River Rd, Oak Park IL', status: 'ready' },
  { tempId: 'br_10', firstName: 'Esme',    lastName: 'Fletcher',    jersey: 9,  dob: '2013-10-14', parentName: 'Robin Fletcher', parentEmail: 'robin@fletcher.co',     shipping: '765 Hill Ave, Chicago IL', status: 'ready' },
  { tempId: 'br_11', firstName: 'Calder',  lastName: 'Stone',       jersey: 14, dob: '2013-05-20', parentName: 'Nia Stone',      parentEmail: 'nia.stone@gmail.com',   shipping: '420 Lake Blvd, Chicago IL', status: 'ready' },
  { tempId: 'br_12', firstName: 'Reina',   lastName: 'Asante',      jersey: 8,  dob: '2013-12-04', parentName: 'Kofi Asante',    parentEmail: 'kofi@asante.io',        shipping: '52 Forest Ct, Evanston IL', status: 'ready' },
  { tempId: 'br_13', firstName: 'Adaeze',  lastName: 'Okwu',        jersey: 2,  dob: '2013-03-25', parentName: 'Obi Okwu',       parentEmail: 'obi.okwu@gmail.com',    shipping: '96 Spring St, Chicago IL', status: 'ready' },
  { tempId: 'br_14', firstName: 'Theodore', lastName: 'Kim',        jersey: 19, dob: '2013-07-14', parentName: 'Hyejin Kim',     parentEmail: 'hyejin.kim@gmail.com',  shipping: '730 Vine St, Naperville IL', status: 'problem', reason: 'Photo missing · kid_theo_kim.jpg not in uploaded ZIP' },
  { tempId: 'br_15', firstName: 'Solange', lastName: 'Reyes',       jersey: 5,  dob: '2013-09-18', parentName: 'Marisol Reyes',  parentEmail: 'marisol@reyes.co',      shipping: '—— unparseable ——',     status: 'problem', reason: 'Address invalid · no street / city / zip detected' },
];

export function BulkOnboarding() {
  const navigate = useNavigate();
  const { pushQueueGroup } = useAppState();
  const [searchParams] = useSearchParams();
  const initialTeamId = searchParams.get('team');

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialTeamId);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [excelState, setExcelState] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [photosState, setPhotosState] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [step, setStep] = useState<Step>('team');
  const [toast, setToast] = useState({ visible: false, message: '' });

  /** Derived overall upload status — both files must be done before preview. */
  const uploadState: 'idle' | 'uploading' | 'done' =
    excelState === 'done' && photosState === 'done'
      ? 'done'
      : excelState === 'uploading' || photosState === 'uploading'
        ? 'uploading'
        : 'idle';

  useEffect(() => {
    if (initialTeamId && teams.some((t) => t.id === initialTeamId)) {
      setStep('upload');
    }
  }, [initialTeamId]);

  const team = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) ?? null : null;

  const visibleEntries = useMemo(
    () => MOCK_ROSTER.filter((r) => !dismissedIds.includes(r.tempId)),
    [dismissedIds],
  );
  const readyCount = visibleEntries.filter((r) => r.status === 'ready').length;
  const problemCount = visibleEntries.filter((r) => r.status === 'problem').length;

  const pushToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  };

  const handleTeamSelect = (id: string) => {
    setSelectedTeamId(id);
    setTeamDropdownOpen(false);
    if (step === 'team') setStep('upload');
  };

  const handleUploadExcel = () => {
    if (excelState !== 'idle') return;
    setExcelState('uploading');
    // Different completion times so the two uploads don't finish in lockstep.
    setTimeout(() => setExcelState('done'), 1600);
  };

  const handleUploadPhotos = () => {
    if (photosState !== 'idle') return;
    setPhotosState('uploading');
    setTimeout(() => setPhotosState('done'), 2200);
  };

  // Advance to preview once both files are uploaded.
  useEffect(() => {
    if (excelState === 'done' && photosState === 'done' && step === 'upload') {
      setStep('preview');
    }
  }, [excelState, photosState, step]);

  const handleDismiss = (tempId: string) => {
    setDismissedIds((ids) => [...ids, tempId]);
    pushToast('Row dismissed · will not be queued');
  };

  const handleSubmit = () => {
    if (!team) return;
    const timestamp = Date.now();
    const readyEntries = visibleEntries.filter((r) => r.status === 'ready');

    const items: QueueItem[] = readyEntries.map((entry, i) => {
      const athlete: Athlete = {
        id: `ath_bulk_${timestamp}_${i}`,
        firstName: entry.firstName,
        lastName: entry.lastName,
        jerseyNumber: entry.jersey,
        teamId: team.id,
        initials: `${entry.firstName[0] ?? ''}${entry.lastName[0] ?? ''}`.toUpperCase(),
        paid: true,
        cardStatus: 'in_queue',
        mediaStatus: 'none',
      };
      return {
        id: `qi_bulk_${timestamp}_${i}`,
        athleteId: athlete.id,
        athlete,
        submittedAgo: 'just now',
      };
    });

    const group: QueueGroup = {
      id: `qg_bulk_${timestamp}`,
      teamId: team.id,
      status: 'ready',
      submittedAgo: 'just now',
      items,
    };
    pushQueueGroup(group);
    setStep('success');
  };

  const resetFlow = () => {
    setSelectedTeamId(null);
    setExcelState('idle');
    setPhotosState('idle');
    setDismissedIds([]);
    setStep('team');
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="flex items-end justify-between gap-8"
        >
          <div>
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="group flex items-center gap-2 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted transition-colors hover:text-gold-3"
            >
              <ArrowLeft size={14} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" />
              Back to Teams
            </button>
            <p className="mt-4 font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
              Operations · Session 2
            </p>
            <h1 className="mt-3 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
              Bulk Onboarding
            </h1>
            <p className="mt-3 max-w-[560px] font-body text-[14px] font-light leading-relaxed text-bone-muted">
              Onboard a batch of players for an existing team. One Excel row per player becomes
              a parent account, a roster entry, and a card.
            </p>
          </div>
          <StepRail step={step} />
        </motion.header>

        {/* step body */}
        <div className="mt-12 flex flex-col gap-10">
          {/* STEP 1 — team */}
          <Section active={!team && step !== 'success'} index={1} label="Team">
            <TeamSelector
              team={team}
              open={teamDropdownOpen}
              onToggle={() => setTeamDropdownOpen((o) => !o)}
              onSelect={handleTeamSelect}
              onClose={() => setTeamDropdownOpen(false)}
            />
            {!team && (
              <p className="mt-3 font-body text-[12px] font-light text-bone-muted">
                Only teams with a finalized template appear here. Start one in the{' '}
                <button
                  type="button"
                  onClick={() => navigate('/design/new')}
                  className="text-gold-3 underline-offset-2 hover:underline hover:text-gold-4"
                >
                  Design Workspace
                </button>
                .
              </p>
            )}
          </Section>

          {/* Template confirmation panel — shown once a team is selected */}
          <AnimatePresence>
            {team && step !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
              >
                <LockedTemplatePanel team={team} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 2 — upload */}
          <AnimatePresence>
            {team && step !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[], delay: 0.1 }}
              >
                <Section active={step === 'upload'} index={2} label="Roster upload · 2 files">
                  {uploadState !== 'done' ? (
                    <>
                      <div className="flex items-end justify-between gap-4">
                        <p className="font-body text-[13px] font-light text-bone-muted">
                          Both files are required.
                        </p>
                        <button
                          type="button"
                          onClick={() => pushToast('Excel template download · simulated')}
                          className="flex items-center gap-1.5 font-display text-[11px] font-medium uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4"
                        >
                          <Download size={13} strokeWidth={1.8} />
                          Excel template
                        </button>
                      </div>

                      {/* Name-match callout */}
                      <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-gold-3/30 bg-gold-3/5 px-4 py-3">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-3/20">
                          <Info size={11} strokeWidth={2.2} className="text-gold-3" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-[11px] font-semibold uppercase tracking-label-md text-gold-3">
                            Filenames must match
                          </p>
                          <p className="mt-1 font-body text-[12px] font-light leading-relaxed text-bone-muted">
                            Each Excel row's{' '}
                            <span className="font-mono text-[11px] text-bone">photo_filename</span>{' '}
                            must exist in the ZIP (e.g.{' '}
                            <span className="font-mono text-[11px] text-bone">kid_leigha_ghafari.jpg</span>).
                            Unmatched rows are flagged in the next step.
                          </p>
                        </div>
                      </div>

                      {/* Two upload slots */}
                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <UploadSlot
                          slotNumber={1}
                          title="Excel roster"
                          filenameHint="roster.xlsx"
                          sub="All player + parent fields · one row per player"
                          icon={<FileSpreadsheet size={28} strokeWidth={1.6} className="text-gold-3" />}
                          state={excelState}
                          onUpload={handleUploadExcel}
                        />
                        <UploadSlot
                          slotNumber={2}
                          title="Photo folder"
                          filenameHint="photos.zip"
                          sub="One image per player · filenames match the Excel"
                          icon={<FolderArchive size={28} strokeWidth={1.6} className="text-gold-3" />}
                          state={photosState}
                          onUpload={handleUploadPhotos}
                        />
                      </div>

                      <p className="mt-4 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
                        Excel columns: kid_first_name · kid_last_name · dob · jersey_number · photo_filename · parent_email · parent_name · shipping_address_line1 · city · state · zip
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-4 rounded-[12px] border border-gold-3/30 bg-gold-3/5 px-5 py-4">
                      <Check size={18} strokeWidth={2.2} className="text-gold-3" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[13px] font-medium uppercase tracking-label-md text-bone">
                          Parsed · photos matched
                        </p>
                        <p className="mt-1 font-body text-[12px] font-light text-bone-muted">
                          {readyCount} matched · {problemCount} flagged. Review below.
                        </p>
                      </div>
                    </div>
                  )}
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 3 — preview */}
          <AnimatePresence>
            {team && uploadState === 'done' && step !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
              >
                <Section active={step === 'preview'} index={3} label="Preview">
                  <p className="mb-3 font-body text-[12px] font-light text-bone-muted">
                    Dismiss any row you can't fix now. The rest still get onboarded.
                  </p>
                  <RosterPreviewTable
                    entries={visibleEntries}
                    onDismiss={handleDismiss}
                  />
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 4 — confirm */}
          <AnimatePresence>
            {team && uploadState === 'done' && readyCount > 0 && step !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
              >
                <Section active={step === 'confirm' || step === 'preview'} index={4} label="Confirm & onboard">
                  <ConfirmSummary
                    team={team}
                    readyCount={readyCount}
                    dismissedCount={MOCK_ROSTER.length - visibleEntries.length}
                    onSubmit={handleSubmit}
                  />
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'success' && team && (
            <SuccessPanel
              team={team}
              count={MOCK_ROSTER.filter((r) => !dismissedIds.includes(r.tempId) && r.status === 'ready').length}
              onViewQueue={() => navigate('/review')}
              onReset={resetFlow}
            />
          )}
        </div>
      </div>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function Section({
  index,
  label,
  active,
  children,
}: {
  index: number;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-[11px] font-semibold tracking-[0.02em] transition-colors ${
            active ? 'bg-gold-3 text-ink' : 'border border-gold-3/45 bg-ink text-gold-3'
          }`}
        >
          {index}
        </span>
        <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-gold-3">
          Step {index} · {label}
        </p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StepRail({ step }: { step: Step }) {
  const order: Step[] = ['team', 'upload', 'preview', 'confirm', 'success'];
  const activeIdx = order.indexOf(step);
  const labels: Record<Step, string> = {
    team: 'Team',
    upload: 'Upload',
    preview: 'Preview',
    confirm: 'Confirm',
    success: 'Done',
  };

  return (
    <div className="flex items-center gap-2">
      {order.slice(0, 4).map((s, idx) => {
        const done = idx < activeIdx || step === 'success';
        const current = idx === activeIdx && step !== 'success';
        return (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 font-display text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                current
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
                current ? 'text-bone' : 'text-bone-muted/60'
              }`}
            >
              {labels[s]}
            </span>
            {idx < 3 && <span className="mx-1 h-px w-4 bg-bone-muted/15" />}
          </div>
        );
      })}
    </div>
  );
}

function TeamSelector({
  team,
  open,
  onToggle,
  onSelect,
  onClose,
}: {
  team: Team | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-14 w-full items-center justify-between rounded-[10px] border bg-ink-2 px-5 transition-colors ${
          open ? 'border-gold-3/60' : 'border-bone-muted/15 hover:border-bone-muted/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {team ? (
            <>
              <TeamMonogram
                mark={team.monogram}
                primary={team.palette.primary}
                accent={team.palette.accent}
                size={30}
                variant="crest"
              />
              <div className="text-left">
                <p className="font-display text-[14px] font-semibold tracking-data-tight text-bone">
                  {team.name}
                </p>
                <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                  {team.club} · {team.sport} · {team.ageGroup}
                </p>
              </div>
            </>
          ) : (
            <span className="font-body text-[13px] font-light text-bone-muted">
              Select a team with a finalized template…
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={`text-bone-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: EASE_STANDARD as unknown as number[] }}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[10px] border border-bone-muted/15 bg-ink-2 shadow-card-depth"
          >
            {teams.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-3/60"
                >
                  <TeamMonogram
                    mark={t.monogram}
                    primary={t.palette.primary}
                    accent={t.palette.accent}
                    size={28}
                    variant="crest"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[13px] font-medium tracking-data-tight text-bone">
                      {t.name}
                    </p>
                    <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                      {t.club} · {t.sport} · {t.ageGroup}
                    </p>
                  </div>
                  {team?.id === t.id && (
                    <Check size={12} strokeWidth={2.4} className="text-gold-3" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* click-outside catcher */}
      {open && <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden />}
    </div>
  );
}

function UploadSlot({
  slotNumber,
  title,
  filenameHint,
  sub,
  icon,
  state,
  onUpload,
}: {
  slotNumber: number;
  title: string;
  filenameHint: string;
  sub: string;
  icon: React.ReactNode;
  state: 'idle' | 'uploading' | 'done';
  onUpload: () => void;
}) {
  if (state === 'done') {
    return (
      <div className="flex items-center gap-4 rounded-[14px] border border-gold-3/40 bg-gold-3/5 px-5 py-4">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold-3/50 bg-gold-3/10">
          <Check size={16} strokeWidth={2.4} className="text-gold-3" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-gold-3">
            {slotNumber} · {title}
          </p>
          <p className="mt-0.5 font-display text-[13px] font-semibold tracking-data-tight text-bone">
            {filenameHint}
          </p>
        </div>
        <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-gold-4">
          Uploaded
        </span>
      </div>
    );
  }

  const isUploading = state === 'uploading';
  return (
    <button
      type="button"
      onClick={onUpload}
      disabled={isUploading}
      className={`relative flex flex-col items-start gap-3 overflow-hidden rounded-[14px] border-2 border-dashed p-5 text-left transition-colors ${
        isUploading
          ? 'border-gold-3/80 bg-gold-3/5'
          : 'border-gold-3/40 bg-ink-2/60 hover:border-gold-3/80 hover:bg-gold-3/5'
      }`}
      style={{ minHeight: 160 }}
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold-3/50 bg-ink-2 font-display text-[11px] font-bold tracking-data-tight text-gold-3">
          {slotNumber}
        </span>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-display text-[14px] font-semibold tracking-data-tight text-bone">
          {title}
        </p>
        <p className="mt-1 font-mono text-[11px] text-gold-4">
          {filenameHint}
        </p>
        <p className="mt-2 font-body text-[12px] font-light leading-relaxed text-bone-muted">
          {sub}
        </p>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
          {isUploading ? 'Uploading…' : 'Drop or click'}
        </span>
        {isUploading && (
          <div className="flex items-center gap-1">
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
        )}
      </div>
    </button>
  );
}

function LockedTemplatePanel({ team }: { team: Team }) {
  const sampleAthlete = athletesByTeam(team.id)[0];
  return (
    <section>
      <div className="flex items-center gap-3">
        <Lock size={12} strokeWidth={2} className="text-gold-3" />
        <p className="font-display text-[11px] font-medium uppercase tracking-label-lg text-gold-3">
          Template
        </p>
      </div>

      <motion.div
        variants={fadeRise}
        initial="hidden"
        animate="visible"
        className="ink-card relative mt-4 overflow-hidden rounded-[16px] border border-gold-3/25 p-6"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 100% 0%, rgba(201, 162, 78, 0.12) 0%, transparent 55%)',
          }}
        />

        <div className="relative flex items-center gap-8">
          <div className="flex-shrink-0 rounded-[12px] border border-bone-muted/10 bg-ink-3/40 p-3">
            <ComposedCardPreview
              team={team}
              athlete={sampleAthlete}
              background={team.skinBackground}
              width={150}
              compact
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
              {team.name}
            </p>
            <h3 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-[0.01em] text-bone">
              This template applies to every player in the batch.
            </h3>
            <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
              Locked from the team's Design Workspace session.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function RosterPreviewTable({
  entries,
  onDismiss,
}: {
  entries: BulkEntry[];
  onDismiss: (tempId: string) => void;
}) {
  const columns: ColumnDef<BulkEntry>[] = [
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      sortValue: (r) => (r.status === 'problem' ? 0 : 1),
      render: (r) =>
        r.status === 'ready' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-3/40 bg-gold-3/10 px-2.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-4">
            <Check size={10} strokeWidth={2.6} />
            Ready
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-live-red/40 bg-live-red/10 px-2.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-label-md text-live-red">
            <AlertTriangle size={10} strokeWidth={2.2} />
            Issue
          </span>
        ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '1.2fr',
      sortValue: (r) => r.lastName,
      render: (r) => (
        <div>
          <p className="font-display text-[13px] font-medium tracking-data-tight text-bone">
            {r.firstName} {r.lastName}
          </p>
          {r.reason && (
            <p className="mt-0.5 font-body text-[11px] font-light text-live-red/80">
              {r.reason}
            </p>
          )}
        </div>
      ),
    },
    { key: 'jersey', header: '#', width: '64px', align: 'center', sortValue: (r) => r.jersey, render: (r) => <span className="font-display text-[13px] tracking-data-tight text-bone">{r.jersey}</span> },
    { key: 'dob', header: 'DOB', width: '128px', render: (r) => <span className="font-display text-[12px] tracking-data-loose text-bone-muted">{r.dob}</span> },
    { key: 'parent', header: 'Parent', width: '1fr', render: (r) => (
      <div>
        <p className="font-display text-[12px] tracking-data-tight text-bone">{r.parentName}</p>
        <p className="font-body text-[11px] font-light text-bone-muted">{r.parentEmail}</p>
      </div>
    ) },
    { key: 'shipping', header: 'Shipping', width: '1.2fr', render: (r) => <span className="truncate font-body text-[11px] font-light text-bone-muted">{r.shipping}</span> },
    {
      key: 'action',
      header: '',
      width: '100px',
      align: 'right',
      render: (r) =>
        r.status === 'problem' ? (
          <button
            type="button"
            onClick={() => onDismiss(r.tempId)}
            className="font-display text-[10px] font-semibold uppercase tracking-label-md text-bone-muted transition-colors hover:text-live-red"
          >
            Dismiss
          </button>
        ) : null,
    },
  ];

  return (
    <DataTable
      rows={entries}
      columns={columns}
      getRowKey={(r) => r.tempId}
      initialSort={{ key: 'status', direction: 'asc' }}
    />
  );
}

function ConfirmSummary({
  team,
  readyCount,
  dismissedCount,
  onSubmit,
}: {
  team: Team;
  readyCount: number;
  dismissedCount: number;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      variants={fadeRise}
      initial="hidden"
      animate="visible"
      className="ink-card overflow-hidden rounded-[14px] border border-gold-3/25 p-6"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 100% 0%, rgba(201, 162, 78, 0.15) 0%, transparent 55%)',
        }}
      />
      <div className="relative flex items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Ready to onboard · {team.name}
          </p>
          <div className="mt-3 flex items-stretch gap-3">
            <OnboardStat count={readyCount} label="Parent accounts" />
            <StatDivider />
            <OnboardStat count={readyCount} label="Athletes" />
            <StatDivider />
            <OnboardStat count={readyCount} label="Cards" />
          </div>
          {dismissedCount > 0 && (
            <p className="mt-3 font-body text-[12px] font-light text-bone-muted">
              {dismissedCount} dismissed · not included.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="specular-sweep relative flex h-11 flex-shrink-0 items-center gap-2 overflow-hidden rounded-[8px] bg-brushed-gold px-5 font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
        >
          <span className="relative z-[2]">Onboard batch · create cards</span>
          <ArrowRight size={13} strokeWidth={2.2} className="relative z-[2]" />
        </button>
      </div>
    </motion.div>
  );
}

function OnboardStat({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex min-w-[92px] flex-col">
      <span className="font-display text-[28px] font-bold leading-none tracking-data-tight text-bone">
        {count}
      </span>
      <span className="mt-1 font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
        {label}
      </span>
    </div>
  );
}

function StatDivider() {
  return <span className="w-px bg-bone-muted/15" aria-hidden />;
}

function SuccessPanel({
  team,
  count,
  onViewQueue,
  onReset,
}: {
  team: Team;
  count: number;
  onViewQueue: () => void;
  onReset: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
      className="ink-card relative overflow-hidden rounded-[14px] border border-gold-3/40 p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.2) 0%, transparent 70%)',
        }}
      />
      <div className="relative flex items-start gap-5">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gold-3/70 bg-gold-3/15">
          <Sparkles size={16} strokeWidth={2} className="text-gold-4" />
        </span>
        <div className="flex-1">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Batch onboarded
          </p>
          <h2 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[0.01em] text-bone">
            {count} parent accounts · {count} athletes · {count} cards for {team.name}
          </h2>
          <p className="mt-2 font-body text-[14px] font-light leading-relaxed text-bone-muted">
            Cards are queued for review. Find the batch at the top of the Review Queue.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onViewQueue}
              className="specular-sweep relative flex h-11 items-center gap-2 overflow-hidden rounded-[8px] bg-brushed-gold px-5 font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
            >
              <span className="relative z-[2]">View Review Queue</span>
              <ArrowUpRight size={13} strokeWidth={2.2} className="relative z-[2]" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex h-11 items-center rounded-[8px] border border-bone-muted/20 bg-ink-2 px-4 font-display text-[11px] font-semibold uppercase tracking-label-md text-bone transition-colors hover:border-bone-muted/40"
            >
              Upload another batch
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
