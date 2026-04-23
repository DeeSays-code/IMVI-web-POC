import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clapperboard,
  CreditCard,
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles,
  MoreVertical,
  Mail,
  UserX,
  Trash2,
  RotateCcw,
  Download,
  Plus,
  Lock,
  Unlock,
  ChevronDown,
  UserCircle2,
} from 'lucide-react';
import {
  activityFeed,
  athleteById,
  athletes,
  athletesByTeam,
  organizationForTeam,
  teamById,
  teams,
  type Athlete,
  type CardStatus,
  type MediaStatus,
  type Sponsor,
  type Team,
  type User,
  type Video,
  type CardSlotTag,
} from '../mock/data';
import { ComposedCardPreview } from '../components/ComposedCardPreview';
import { TeamMonogram } from '../components/icons/TeamMonogram';
import { Drawer } from '../components/Drawer';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { EASE_CINEMATIC, fadeRise, staggerContainer } from '../motion/variants';
import { useAppState } from '../state/AppState';

const CARD_STATUS_COPY: Record<CardStatus, { label: string; tone: 'muted' | 'gold' | 'red' | 'green' }> = {
  not_ready:  { label: 'Not ready',    tone: 'muted' },
  in_queue:   { label: 'In queue',     tone: 'gold' },
  approved:   { label: 'Approved',     tone: 'gold' },
  shipped:    { label: 'Shipped',      tone: 'red' },
  delivered:  { label: 'Delivered',    tone: 'green' },
};

const MEDIA_STATUS_COPY: Record<MediaStatus, { label: string; tone: 'muted' | 'gold' | 'green' }> = {
  none:      { label: 'No media',    tone: 'muted' },
  uploaded:  { label: 'Uploaded',    tone: 'gold' },
  assigned:  { label: 'Assigned',    tone: 'gold' },
  complete:  { label: 'Complete',    tone: 'green' },
};

export function PlayerDetail() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const {
    videos: allVideos,
    sponsors: allSponsors,
    users: allUsers,
    updateVideo,
    pushVideo,
    updateUser,
    removeUser,
  } = useAppState();

  const athlete = athleteId ? athleteById(athleteId) : undefined;
  const team = athlete ? teamById(athlete.teamId) : undefined;
  const org = team ? organizationForTeam(team.id) : undefined;

  const videos = useMemo(
    () => (athlete ? allVideos.filter((v) => v.athleteId === athlete.id) : []),
    [athlete, allVideos],
  );
  const sponsors = useMemo(
    () => (team ? allSponsors.filter((s) => s.assignedTeamIds.includes(team.id)) : []),
    [team, allSponsors],
  );
  const parents = useMemo(
    () => (athlete ? allUsers.filter((u) => u.athleteId === athlete.id) : []),
    [athlete, allUsers],
  );

  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<{ userId: string } | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const pushToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  const openVideo = openVideoId ? allVideos.find((v) => v.id === openVideoId) ?? null : null;
  const editingUser = editUser ? allUsers.find((u) => u.id === editUser.userId) ?? null : null;

  const handleUploadNewVideo = () => {
    if (!athlete) return;
    const id = `vid_new_${Date.now()}`;
    pushVideo({
      id,
      athleteId: athlete.id,
      title: 'New upload · pending assignment',
      durationSec: 45,
      uploadedAgo: 'just now',
      privacy: 'private',
      cardSlot: null,
    });
    pushToast('Video uploaded · pending slot assignment');
  };

  const timeline = useMemo(() => {
    if (!athlete) return [];
    const nameKey = `${athlete.firstName} ${athlete.lastName}`;
    return activityFeed.filter(
      (a) => a.detail.includes(nameKey) || a.detail.includes(team?.name ?? 'zzz'),
    );
  }, [athlete, team]);

  if (!athlete || !team) {
    return (
      <div className="relative min-h-[calc(100vh-64px)]">
        <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
          <button
            type="button"
            onClick={() => navigate('/teams')}
            className="group flex items-center gap-2 font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted transition-colors hover:text-gold-3"
          >
            <ArrowLeft size={14} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Teams
          </button>
          <div className="mt-10 flex flex-col items-center justify-center rounded-[14px] border border-bone-muted/10 bg-ink-2 px-8 py-20 text-center">
            <p className="font-display text-[14px] font-medium uppercase tracking-label-md text-bone">
              Player not found
            </p>
            <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
              This athlete isn't in the roster. They may have been ephemeral (Bulk-pushed) and reset on reload.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div
        className="pointer-events-none fixed bottom-0 left-sidebar right-0 h-[35vh]"
        style={{
          background:
            'radial-gradient(ellipse at 60% 100%, rgba(201, 162, 78, 0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
        {/* Breadcrumb */}
        <Breadcrumb org={org?.name ?? team.organization} team={team} athlete={athlete} />

        {/* Hero */}
        <Hero team={team} athlete={athlete} videoCount={videos.length} sponsorCount={sponsors.length} />

        {/* Relationship map */}
        <RelationshipMap
          team={team}
          athlete={athlete}
          videoCount={videos.length}
          sponsorCount={sponsors.length}
          onGoCard={() => navigate('/review')}
          onGoVideos={() => navigate('/teams')}
          onGoSponsors={() => navigate('/teams')}
        />

        {/* Sponsor chips */}
        <SponsorsRow sponsors={sponsors} team={team} />

        {/* Parent accounts — v1.7 inline user management */}
        <ParentAccountsCard
          parents={parents}
          athlete={athlete}
          onEdit={(userId) => setEditUser({ userId })}
          onReregister={(user) => {
            updateUser(user.id, { status: 'pending_reregister' });
            pushToast(`Re-registration link sent to ${user.email}`);
          }}
          onDisable={(user) => {
            const nextStatus = user.status === 'disabled' ? 'active' : 'disabled';
            updateUser(user.id, { status: nextStatus });
            pushToast(nextStatus === 'disabled' ? `${user.name} disabled` : `${user.name} re-enabled`);
          }}
          onRemove={(user) => {
            removeUser(user.id);
            pushToast(`${user.name} removed`);
          }}
        />

        {/* Videos strip — v1.7 interactive */}
        <VideosStrip
          videos={videos}
          onTileClick={(video) => setOpenVideoId(video.id)}
          onUpload={handleUploadNewVideo}
        />

        {/* Activity timeline */}
        <Timeline athlete={athlete} timeline={timeline} team={team} />
      </div>

      {/* Video detail drawer */}
      <Drawer
        open={openVideo !== null}
        onClose={() => setOpenVideoId(null)}
        eyebrow="Video"
        title={openVideo?.title}
        width={440}
      >
        {openVideo && (
          <VideoDetailBody
            video={openVideo}
            currentAthleteId={athlete.id}
            onSlotChange={(slot) => {
              updateVideo(openVideo.id, { cardSlot: slot });
              pushToast(
                slot === null
                  ? 'Slot cleared'
                  : `Slot set to ${slot}`,
              );
            }}
            onPrivacyToggle={() => {
              const nextPrivacy = openVideo.privacy === 'public' ? 'private' : 'public';
              updateVideo(openVideo.id, { privacy: nextPrivacy });
              pushToast(`Privacy · ${nextPrivacy}`);
            }}
            onReassign={(newAthleteId) => {
              updateVideo(openVideo.id, { athleteId: newAthleteId });
              const target = athletes.find((a) => a.id === newAthleteId);
              pushToast(
                target
                  ? `Reassigned to ${target.firstName} ${target.lastName}`
                  : 'Unassigned',
              );
              setOpenVideoId(null);
            }}
            onDownload={() => pushToast('Download started · simulated')}
            onDelete={() => {
              updateVideo(openVideo.id, { athleteId: null, cardSlot: null });
              pushToast('Video unlinked from this player');
              setOpenVideoId(null);
            }}
          />
        )}
      </Drawer>

      {/* Edit parent email modal */}
      <Modal
        open={editingUser !== null}
        onClose={() => setEditUser(null)}
        eyebrow="Edit parent"
        title={editingUser?.name}
        width={480}
      >
        {editingUser && (
          <EditEmailForm
            user={editingUser}
            onSave={(email) => {
              updateUser(editingUser.id, { email });
              pushToast(`Email updated for ${editingUser.name}`);
              setEditUser(null);
            }}
            onCancel={() => setEditUser(null)}
          />
        )}
      </Modal>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function Breadcrumb({ org, team, athlete }: { org: string; team: Team; athlete: Athlete }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] }}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        onClick={() => navigate('/teams')}
        className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70 transition-colors hover:text-gold-3"
      >
        {org}
      </button>
      <ChevronRight size={12} strokeWidth={1.6} className="text-bone-muted/30" />
      <button
        type="button"
        onClick={() => navigate('/teams')}
        className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70 transition-colors hover:text-gold-3"
      >
        {team.club}
      </button>
      <ChevronRight size={12} strokeWidth={1.6} className="text-bone-muted/30" />
      <button
        type="button"
        onClick={() => navigate('/teams')}
        className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone-muted/70 transition-colors hover:text-gold-3"
      >
        {team.name}
      </button>
      <ChevronRight size={12} strokeWidth={1.6} className="text-bone-muted/30" />
      <span className="font-display text-[11px] font-medium uppercase tracking-label-md text-bone">
        {athlete.firstName} {athlete.lastName}
      </span>
    </motion.div>
  );
}

function Hero({
  team,
  athlete,
  videoCount,
  sponsorCount,
}: {
  team: Team;
  athlete: Athlete;
  videoCount: number;
  sponsorCount: number;
}) {
  const cardStatus = CARD_STATUS_COPY[athlete.cardStatus];
  const mediaStatus = MEDIA_STATUS_COPY[athlete.mediaStatus];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.1 }}
      className="mt-8 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8"
    >
      <div className="ink-card relative overflow-hidden rounded-[18px] border border-bone-muted/10 p-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 0% 0%, rgba(201, 162, 78, 0.1) 0%, transparent 55%)',
          }}
        />
        <div className="relative flex items-start gap-5">
          <TeamMonogram
            mark={athlete.initials}
            primary={team.palette.primary}
            accent={team.palette.accent}
            size={72}
            variant="crest"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
              {team.name} · #{athlete.jerseyNumber}
            </p>
            <h1 className="mt-2 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
              {athlete.firstName} {athlete.lastName}
            </h1>
            <p className="mt-2 font-body text-[14px] font-light text-bone-muted">
              {team.sport} · {team.ageGroup} · {team.club}
            </p>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          <PaidBadge paid={athlete.paid} />
          <StatusBadge label={`Card · ${cardStatus.label}`} tone={cardStatus.tone} icon={<CreditCard size={11} strokeWidth={2} />} />
          <StatusBadge label={`Media · ${mediaStatus.label}`} tone={mediaStatus.tone} icon={<Clapperboard size={11} strokeWidth={2} />} />
        </div>

        <div className="relative mt-7 grid grid-cols-3 gap-4">
          <StatCell label="Videos linked" value={String(videoCount)} sub={videoCount > 0 ? 'assigned to this athlete' : 'none yet'} />
          <StatCell label="Team sponsors" value={String(sponsorCount)} sub="active contracts" />
          <StatCell label="Team roster" value={String(athletesByTeam(team.id).length)} sub="athletes on team" />
        </div>
      </div>

      <div className="ink-card relative flex items-center justify-center overflow-hidden rounded-[18px] border border-bone-muted/10 p-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.18) 0%, transparent 65%)',
          }}
        />
        <ComposedCardPreview
          team={team}
          athlete={athlete}
          background={team.skinBackground}
          width={240}
        />
      </div>
    </motion.section>
  );
}

function PaidBadge({ paid }: { paid: boolean }) {
  if (paid) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-3/35 bg-gold-3/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-4">
        <CheckCircle2 size={11} strokeWidth={2.2} />
        Paid · up-to-date
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-live-red/40 bg-live-red/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-label-md text-live-red">
      <AlertTriangle size={11} strokeWidth={2.2} />
      Unpaid
    </span>
  );
}

function StatusBadge({
  label,
  tone,
  icon,
}: {
  label: string;
  tone: 'muted' | 'gold' | 'red' | 'green';
  icon?: React.ReactNode;
}) {
  const toneBorder: Record<typeof tone, string> = {
    muted: 'border-bone-muted/20 bg-ink-3/60 text-bone-muted',
    gold: 'border-gold-3/35 bg-gold-3/10 text-gold-4',
    red: 'border-live-red/40 bg-live-red/10 text-live-red',
    green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-label-md ${toneBorder[tone]}`}>
      {icon}
      {label}
    </span>
  );
}

function StatCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[10px] border border-bone-muted/8 bg-ink-3/40 px-4 py-3">
      <p className="font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-[26px] font-bold leading-none tracking-data-tight text-bone">
        {value}
      </p>
      <p className="mt-1 font-body text-[11px] font-light text-bone-muted">{sub}</p>
    </div>
  );
}

function RelationshipMap({
  team,
  athlete,
  videoCount,
  sponsorCount,
  onGoCard,
  onGoVideos,
  onGoSponsors,
}: {
  team: Team;
  athlete: Athlete;
  videoCount: number;
  sponsorCount: number;
  onGoCard: () => void;
  onGoVideos: () => void;
  onGoSponsors: () => void;
}) {
  const cardStatus = CARD_STATUS_COPY[athlete.cardStatus];
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.2 }}
      className="ink-card relative mt-5 overflow-hidden rounded-[18px] border border-bone-muted/10 p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Data-model view · relationships
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            This player connects to one card, {videoCount} videos, and {sponsorCount} team sponsors.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[140px_80px_minmax(0,1fr)] items-center gap-4">
        {/* Source node */}
        <div className="relative flex flex-col items-center rounded-[14px] border border-gold-3/40 bg-gold-3/5 p-4">
          <span className="font-display text-[9px] font-medium uppercase tracking-label-lg text-gold-3">
            Player
          </span>
          <p className="mt-1.5 text-center font-display text-[13px] font-bold tracking-data-tight text-bone">
            {athlete.firstName} {athlete.lastName}
          </p>
          <p className="mt-0.5 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
            #{athlete.jerseyNumber}
          </p>
        </div>

        {/* connectors */}
        <div className="relative h-40">
          <svg viewBox="0 0 80 160" preserveAspectRatio="none" className="h-full w-full">
            <path d="M 0 80 C 40 80, 40 20, 80 20" stroke="rgba(201,162,78,0.45)" strokeWidth="1.5" fill="none" />
            <path d="M 0 80 L 80 80" stroke="rgba(201,162,78,0.45)" strokeWidth="1.5" fill="none" />
            <path d="M 0 80 C 40 80, 40 140, 80 140" stroke="rgba(201,162,78,0.45)" strokeWidth="1.5" fill="none" />
            <circle cx="0" cy="80" r="3" fill="#C9A24E" />
            <circle cx="80" cy="20" r="3" fill="#C9A24E" />
            <circle cx="80" cy="80" r="3" fill="#C9A24E" />
            <circle cx="80" cy="140" r="3" fill="#C9A24E" />
          </svg>
        </div>

        {/* target nodes */}
        <div className="flex flex-col gap-3">
          <RelationNode
            icon={<CreditCard size={14} strokeWidth={1.8} className="text-gold-3" />}
            label="Card"
            body={`${team.monogram} template · ${cardStatus.label}`}
            onClick={onGoCard}
          />
          <RelationNode
            icon={<Clapperboard size={14} strokeWidth={1.8} className="text-gold-3" />}
            label="Videos"
            body={`${videoCount} linked · open Media Library`}
            onClick={onGoVideos}
          />
          <RelationNode
            icon={<Award size={14} strokeWidth={1.8} className="text-gold-3" />}
            label="Sponsors"
            body={`${sponsorCount} team-level contracts`}
            onClick={onGoSponsors}
          />
        </div>
      </div>
    </motion.section>
  );
}

function RelationNode({
  icon,
  label,
  body,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-[10px] border border-bone-muted/10 bg-ink-3/40 px-4 py-3 text-left transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:border-gold-3/40"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold-3/30 bg-gold-3/5">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-gold-3">
          {label}
        </p>
        <p className="mt-0.5 truncate font-display text-[12px] font-medium tracking-data-tight text-bone">
          {body}
        </p>
      </div>
      <ArrowUpRight size={12} strokeWidth={1.8} className="text-bone-muted/40 transition-colors group-hover:text-bone-muted" />
    </button>
  );
}

function SponsorsRow({ sponsors, team }: { sponsors: Sponsor[]; team: Team }) {
  if (sponsors.length === 0) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[], delay: 0.3 }}
      className="ink-card mt-5 overflow-hidden rounded-[14px] border border-bone-muted/10 px-6 py-5"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
          Team Sponsors · {team.name}
        </p>
        <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
          {sponsors.length} active
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {sponsors.map((s) => (
          <span
            key={s.id}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-label-md ${
              s.status === 'expiring_soon'
                ? 'border-gold-4/50 bg-gold-4/10 text-gold-4'
                : 'border-bone-muted/15 bg-ink-3/60 text-bone'
            }`}
          >
            {s.name}
            {s.status === 'expiring_soon' && <span className="text-[9px] text-gold-4/80">· expiring</span>}
          </span>
        ))}
      </div>
    </motion.section>
  );
}

function VideosStrip({
  videos,
  onTileClick,
  onUpload,
}: {
  videos: Video[];
  onTileClick: (video: Video) => void;
  onUpload: () => void;
}) {
  return (
    <motion.section
      variants={staggerContainer(0.06, 0.35)}
      initial="hidden"
      animate="visible"
      className="mt-5"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Videos · {videos.length} linked
          </p>
          <p className="mt-1 font-body text-[12px] font-light text-bone-muted">
            Click a tile to manage slot, privacy, or reassign.
          </p>
        </div>
        <button
          type="button"
          onClick={onUpload}
          className="flex h-9 items-center gap-2 rounded-[8px] border border-gold-3/40 bg-ink-2 px-3 font-display text-[11px] font-semibold uppercase tracking-label-md text-gold-3 transition-colors hover:border-gold-3/70 hover:text-gold-4"
        >
          <Plus size={12} strokeWidth={2.2} />
          Upload new
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="mt-4 flex items-center justify-center rounded-[12px] border border-bone-muted/10 bg-ink-2 px-6 py-12">
          <p className="font-body text-[13px] font-light text-bone-muted">
            No videos linked yet · click "Upload new" to start.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 pr-4">
          {videos.map((v) => (
            <VideoTile key={v.id} video={v} onClick={() => onTileClick(v)} />
          ))}
        </div>
      )}
    </motion.section>
  );
}

function VideoTile({ video, onClick }: { video: Video; onClick: () => void }) {
  const mins = Math.floor(video.durationSec / 60);
  const secs = (video.durationSec % 60).toString().padStart(2, '0');
  return (
    <motion.button
      variants={fadeRise}
      type="button"
      onClick={onClick}
      className="group relative flex w-[220px] flex-shrink-0 flex-col overflow-hidden rounded-[12px] border border-bone-muted/10 bg-ink-2 transition-all duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-gold-3/40"
    >
      <div
        className="relative h-[132px] w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(140deg, rgba(201,162,78,0.12) 0%, rgba(92,70,32,0.3) 50%, rgba(10,10,10,1) 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: 'radial-gradient(rgba(201, 162, 78, 0.08) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            mixBlendMode: 'overlay',
          }}
        />
        {/* duration */}
        <span className="absolute right-2 top-2 rounded-[4px] bg-ink/80 px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-data-tight text-bone">
          {mins}:{secs}
        </span>
        {/* slot tag */}
        {video.cardSlot && (
          <span
            className={`absolute left-2 top-2 rounded-[4px] px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-label-md ${
              video.cardSlot === 'front'
                ? 'bg-gold-3/20 text-gold-4'
                : 'bg-bone-muted/20 text-bone-muted'
            }`}
          >
            {video.cardSlot}
          </span>
        )}
        {/* privacy */}
        {video.privacy === 'private' && (
          <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-label-md text-bone-muted">
            Private
          </span>
        )}
      </div>
      <div className="px-3 py-3">
        <p className="truncate font-display text-[12px] font-medium tracking-data-tight text-bone">
          {video.title}
        </p>
        <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
          {video.uploadedAgo}
        </p>
      </div>
    </motion.button>
  );
}

function Timeline({
  athlete,
  timeline,
  team,
}: {
  athlete: Athlete;
  timeline: typeof activityFeed;
  team: Team;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[], delay: 0.45 }}
      className="ink-card mt-5 overflow-hidden rounded-[18px] border border-bone-muted/10 p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Activity timeline
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Events for {athlete.firstName} {athlete.lastName} and {team.name}
          </p>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="mt-5 flex items-center justify-center rounded-[10px] border border-bone-muted/8 bg-ink-3/40 px-5 py-8">
          <p className="font-body text-[13px] font-light text-bone-muted">
            No recent events · activity will show up as cards move through the pipeline.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col">
          {timeline.map((item, i) => (
            <li key={item.id}>
              <div className="flex items-center gap-3 rounded-[8px] px-2 py-2.5">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-bone-muted/10 bg-ink-3/60">
                  <Sparkles size={12} strokeWidth={1.8} className="text-gold-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[12px] font-medium tracking-data-tight text-bone">
                    {item.subject}
                  </p>
                  <p className="mt-0.5 truncate font-body text-[11px] font-light text-bone-muted">
                    {item.detail}
                  </p>
                </div>
                <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/60">
                  {item.timestamp}
                </span>
              </div>
              {i < timeline.length - 1 && <div className="ml-5 h-px bg-bone-muted/5" />}
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Parent Accounts card — v1.7 inline user management
 * ────────────────────────────────────────────────────────────────────── */

function ParentAccountsCard({
  parents,
  athlete,
  onEdit,
  onReregister,
  onDisable,
  onRemove,
}: {
  parents: User[];
  athlete: Athlete;
  onEdit: (userId: string) => void;
  onReregister: (user: User) => void;
  onDisable: (user: User) => void;
  onRemove: (user: User) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_CINEMATIC as unknown as number[], delay: 0.22 }}
      className="ink-card mt-5 overflow-hidden rounded-[18px] border border-bone-muted/10 p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
            Parent accounts · {parents.length}
          </p>
          <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
            Edit email, re-register, disable, or remove the accounts linked to {athlete.firstName}.
          </p>
        </div>
      </div>

      {parents.length === 0 ? (
        <div className="mt-5 flex items-center justify-center rounded-[10px] border border-bone-muted/8 bg-ink-3/40 px-5 py-8">
          <p className="font-body text-[13px] font-light text-bone-muted">
            No parent accounts linked yet.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {parents.map((p) => (
            <ParentRow
              key={p.id}
              user={p}
              onEdit={() => onEdit(p.id)}
              onReregister={() => onReregister(p)}
              onDisable={() => onDisable(p)}
              onRemove={() => onRemove(p)}
            />
          ))}
        </ul>
      )}
    </motion.section>
  );
}

function ParentRow({
  user,
  onEdit,
  onReregister,
  onDisable,
  onRemove,
}: {
  user: User;
  onEdit: () => void;
  onReregister: () => void;
  onDisable: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  const statusTone =
    user.status === 'active'
      ? 'text-gold-4 border-gold-3/40 bg-gold-3/10'
      : user.status === 'disabled'
        ? 'text-live-red border-live-red/40 bg-live-red/10'
        : 'text-bone-muted border-bone-muted/20 bg-bone-muted/5';

  return (
    <li className="relative flex items-center gap-4 rounded-[10px] border border-bone-muted/8 bg-ink-3/40 px-4 py-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-bone-muted/10 bg-ink-3">
        <UserCircle2 size={18} strokeWidth={1.6} className="text-bone-muted" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[14px] font-semibold tracking-data-tight text-bone">
          {user.name}
        </p>
        <p className="mt-0.5 truncate font-body text-[12px] font-light text-bone-muted">
          {user.email}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-display text-[9px] font-semibold uppercase tracking-label-md ${statusTone}`}
        >
          {user.status === 'pending_reregister' ? 'Pending' : user.status}
        </span>
        <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
          {user.paid ? 'Paid' : 'Unpaid'}
        </span>
        <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/50">
          {user.lastActiveAgo}
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open actions"
          className="flex h-8 w-8 items-center justify-center rounded-full text-bone-muted transition-colors hover:bg-ink-3 hover:text-bone"
        >
          <MoreVertical size={14} strokeWidth={1.8} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={close} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute right-4 top-full z-20 mt-1 w-52 overflow-hidden rounded-[10px] border border-bone-muted/15 bg-ink-2 shadow-card-depth"
            >
              <MenuItem
                icon={<Mail size={12} strokeWidth={1.8} />}
                label="Edit email"
                onClick={() => {
                  close();
                  onEdit();
                }}
              />
              <MenuItem
                icon={<RotateCcw size={12} strokeWidth={1.8} />}
                label="Re-register"
                onClick={() => {
                  close();
                  onReregister();
                }}
              />
              <MenuItem
                icon={<UserX size={12} strokeWidth={1.8} />}
                label={user.status === 'disabled' ? 'Re-enable' : 'Disable'}
                onClick={() => {
                  close();
                  onDisable();
                }}
              />
              <div className="h-px bg-bone-muted/8" />
              <MenuItem
                icon={<Trash2 size={12} strokeWidth={1.8} />}
                label="Remove"
                tone="red"
                onClick={() => {
                  close();
                  onRemove();
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </li>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'red';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-ink-3/70 ${
        tone === 'red' ? 'text-live-red hover:text-live-red' : 'text-bone hover:text-bone'
      }`}
    >
      <span className={tone === 'red' ? 'text-live-red' : 'text-bone-muted'}>{icon}</span>
      <span className="font-display text-[12px] font-medium tracking-data-tight">{label}</span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Video detail drawer body — v1.7 inline video management
 * ────────────────────────────────────────────────────────────────────── */

function VideoDetailBody({
  video,
  currentAthleteId,
  onSlotChange,
  onPrivacyToggle,
  onReassign,
  onDownload,
  onDelete,
}: {
  video: Video;
  currentAthleteId: string;
  onSlotChange: (slot: CardSlotTag) => void;
  onPrivacyToggle: () => void;
  onReassign: (newAthleteId: string) => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const [reassignOpen, setReassignOpen] = useState(false);
  const currentAthlete = athletes.find((a) => a.id === currentAthleteId);
  const team = currentAthlete ? teams.find((t) => t.id === currentAthlete.teamId) : undefined;

  const mins = Math.floor(video.durationSec / 60);
  const secs = (video.durationSec % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col gap-6">
      {/* thumbnail */}
      <div
        className="relative aspect-video w-full overflow-hidden rounded-[12px] border border-bone-muted/10"
        style={{
          background:
            'linear-gradient(140deg, rgba(201,162,78,0.18) 0%, rgba(92,70,32,0.3) 50%, rgba(10,10,10,1) 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: 'radial-gradient(rgba(201, 162, 78, 0.08) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            mixBlendMode: 'overlay',
          }}
        />
        <span className="absolute right-3 top-3 rounded-[4px] bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold tracking-data-tight text-bone">
          {mins}:{secs}
        </span>
      </div>

      {/* slot toggle */}
      <div>
        <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
          Card slot
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([null, 'front', 'back'] as CardSlotTag[]).map((slot) => {
            const active = video.cardSlot === slot;
            const label = slot === null ? 'None' : slot === 'front' ? 'Front' : 'Back';
            return (
              <button
                key={String(slot)}
                type="button"
                onClick={() => onSlotChange(slot)}
                className={`flex h-10 items-center justify-center rounded-[8px] border font-display text-[11px] font-semibold uppercase tracking-label-md transition-colors ${
                  active
                    ? 'border-gold-3/60 bg-gold-3/15 text-gold-4'
                    : 'border-bone-muted/15 bg-ink-3/40 text-bone-muted hover:border-bone-muted/30 hover:text-bone'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* privacy */}
      <div>
        <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
          Privacy
        </p>
        <button
          type="button"
          onClick={onPrivacyToggle}
          className={`mt-2 flex h-10 w-full items-center justify-between rounded-[8px] border px-3 font-display text-[11px] font-semibold uppercase tracking-label-md transition-colors ${
            video.privacy === 'public'
              ? 'border-gold-3/50 bg-gold-3/10 text-gold-4'
              : 'border-bone-muted/20 bg-ink-3/40 text-bone-muted'
          }`}
        >
          <span className="flex items-center gap-2">
            {video.privacy === 'public' ? (
              <Unlock size={13} strokeWidth={1.8} />
            ) : (
              <Lock size={13} strokeWidth={1.8} />
            )}
            {video.privacy}
          </span>
          <span className="text-[10px] text-bone-muted/70">click to toggle</span>
        </button>
      </div>

      {/* reassign */}
      <div>
        <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
          Assigned to
        </p>
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setReassignOpen((o) => !o)}
            className={`flex h-11 w-full items-center justify-between rounded-[8px] border bg-ink-2 px-3 transition-colors ${
              reassignOpen ? 'border-gold-3/60' : 'border-bone-muted/15 hover:border-bone-muted/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-display text-[13px] font-medium tracking-data-tight text-bone">
                {currentAthlete ? `${currentAthlete.firstName} ${currentAthlete.lastName}` : 'Unassigned'}
              </span>
              {team && (
                <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                  · {team.name}
                </span>
              )}
            </div>
            <ChevronDown size={12} strokeWidth={1.8} className={`text-bone-muted transition-transform ${reassignOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {reassignOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setReassignOpen(false)} aria-hidden />
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-[10px] border border-bone-muted/15 bg-ink-2 shadow-card-depth"
                >
                  {athletes.map((a) => {
                    const athleteTeam = teams.find((t) => t.id === a.teamId);
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setReassignOpen(false);
                            onReassign(a.id);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-ink-3/70"
                        >
                          <div>
                            <p className="font-display text-[13px] font-medium tracking-data-tight text-bone">
                              {a.firstName} {a.lastName}
                            </p>
                            <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                              #{a.jerseyNumber} · {athleteTeam?.name ?? 'Team'}
                            </p>
                          </div>
                          {a.id === currentAthleteId && (
                            <CheckCircle2 size={12} strokeWidth={2.2} className="text-gold-3" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* actions */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={onDownload}
          className="specular-sweep relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-[8px] font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
          style={{
            background:
              'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
          }}
        >
          <Download size={13} strokeWidth={2.2} className="relative z-[2]" />
          <span className="relative z-[2]">Download</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-live-red/40 bg-ink-2 font-display text-[11px] font-semibold uppercase tracking-label-md text-live-red transition-colors hover:border-live-red/70 hover:bg-live-red/5"
        >
          <Trash2 size={13} strokeWidth={1.8} />
          Unlink from this player
        </button>
      </div>

      <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/60">
        Uploaded {video.uploadedAgo} · {video.id}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Edit email modal body
 * ────────────────────────────────────────────────────────────────────── */

function EditEmailForm({
  user,
  onSave,
  onCancel,
}: {
  user: User;
  onSave: (email: string) => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState(user.email);
  const valid = /.+@.+\..+/.test(email);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(email.trim());
      }}
      className="flex flex-col gap-4"
    >
      <label className="block">
        <span className="mb-2 block font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
          Parent email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block h-11 w-full rounded-[8px] border border-bone-muted/20 bg-ink-2 px-3 font-body text-[14px] font-normal text-bone focus:border-gold-3/50 focus:outline-none"
          autoFocus
        />
      </label>
      <p className="font-body text-[11px] font-light text-bone-muted">
        Changes are session-only for POC · no email is actually sent.
      </p>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-[8px] border border-bone-muted/20 bg-ink-2 px-4 font-display text-[11px] font-semibold uppercase tracking-label-md text-bone transition-colors hover:border-bone-muted/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid || email.trim() === user.email}
          className="specular-sweep relative flex h-10 items-center overflow-hidden rounded-[8px] px-5 font-display text-[11px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background:
              'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
          }}
        >
          <span className="relative z-[2]">Save</span>
        </button>
      </div>
    </form>
  );
}
