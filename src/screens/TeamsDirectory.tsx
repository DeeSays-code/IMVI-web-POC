import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Plus, ArrowUpRight, Sparkles, Upload, Edit3, X, UserCircle2, BadgeDollarSign,
} from 'lucide-react';
import {
  athletesByTeam,
  organizationForTeam,
  teams,
  type Sponsor,
  type Team,
} from '../mock/data';
import { Drawer } from '../components/Drawer';
import { Modal } from '../components/Modal';
import { FilterPills, type FilterOption } from '../components/FilterPills';
import { TeamMonogram } from '../components/icons/TeamMonogram';
import { ComposedCardPreview } from '../components/ComposedCardPreview';
import { Toast } from '../components/Toast';
import { EASE_CINEMATIC, fadeRise, staggerContainer } from '../motion/variants';
import { useAppState } from '../state/AppState';

type TeamFilter = 'all' | 'soccer' | 'baseball' | 'football' | 'recent';

export function TeamsDirectory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TeamFilter>('all');
  const [search, setSearch] = useState('');
  const [drawerTeamId, setDrawerTeamId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = teams;
    if (filter === 'recent') {
      rows = rows.filter((t) => t.recentlyAdded);
    } else if (filter !== 'all') {
      rows = rows.filter((t) => t.sport.toLowerCase() === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.club.toLowerCase().includes(q) ||
          t.organization.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [filter, search]);

  const filterOptions: ReadonlyArray<FilterOption<TeamFilter>> = [
    { value: 'all',      label: 'All',      count: teams.length },
    { value: 'soccer',   label: 'Soccer',   count: teams.filter((t) => t.sport === 'Soccer').length },
    { value: 'baseball', label: 'Baseball', count: teams.filter((t) => t.sport === 'Baseball').length },
    { value: 'football', label: 'Football', count: teams.filter((t) => t.sport === 'Football').length },
    { value: 'recent',   label: 'Recently added', count: teams.filter((t) => t.recentlyAdded).length },
  ];

  const drawerTeam = drawerTeamId ? teams.find((t) => t.id === drawerTeamId) : null;

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div
        className="pointer-events-none fixed bottom-0 left-sidebar right-0 h-[40vh]"
        style={{
          background:
            'radial-gradient(ellipse at 60% 100%, rgba(201, 162, 78, 0.14) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-content px-8 pb-24 pt-12">
        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] }}
          className="flex items-end justify-between gap-8"
        >
          <div>
            <p className="font-display text-[10px] font-medium uppercase tracking-label-xl text-gold-3">
              Operations · Session 2
            </p>
            <h1 className="mt-3 font-display text-[40px] font-bold leading-tight tracking-[0.01em] text-bone">
              Teams Directory
            </h1>
            <p className="mt-3 font-body text-[14px] font-light text-bone-muted">
              {teams.length} teams active · every team has a completed skin and is ready to onboard
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/design/new')}
            className="specular-sweep relative flex h-11 items-center gap-2 overflow-hidden rounded-[8px] bg-brushed-gold px-5 font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
          >
            <Plus size={14} strokeWidth={2.2} className="relative z-[2]" />
            <span className="relative z-[2]">Design new team</span>
          </button>
        </motion.header>

        {/* filter bar */}
        <div className="mt-9 flex items-center gap-4">
          <div className="flex h-10 w-[280px] items-center gap-2 rounded-[10px] border border-bone-muted/10 bg-ink-2 px-3">
            <Search size={14} strokeWidth={1.6} className="text-bone-muted/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams, clubs, orgs"
              className="flex-1 bg-transparent font-body text-[13px] font-light text-bone placeholder:text-bone-muted/50 focus:outline-none"
            />
          </div>
          <FilterPills options={filterOptions} selected={filter} onSelect={setFilter} />
        </div>

        {/* grid */}
        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          animate="visible"
          className="mt-8 grid grid-cols-3 gap-5"
        >
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} onClick={() => setDrawerTeamId(team.id)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center rounded-[14px] border border-bone-muted/10 bg-ink-2 px-8 py-20 text-center">
              <p className="font-display text-[14px] font-medium uppercase tracking-label-md text-bone">
                No teams match
              </p>
              <p className="mt-2 font-body text-[13px] font-light text-bone-muted">
                Clear the filter or try a different search term.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <Drawer
        open={drawerTeam !== null}
        onClose={() => setDrawerTeamId(null)}
        title={drawerTeam?.name}
        eyebrow={drawerTeam ? `${drawerTeam.organization} · ${drawerTeam.club}` : undefined}
        width={460}
      >
        {drawerTeam && <TeamDrawerBody team={drawerTeam} />}
      </Drawer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function TeamCard({ team, onClick }: { team: Team; onClick: () => void }) {
  const { sponsors: allSponsors } = useAppState();
  const athletes = athletesByTeam(team.id);
  const sponsors = allSponsors.filter((s) => s.assignedTeamIds.includes(team.id));
  return (
    <motion.button
      variants={fadeRise}
      type="button"
      onClick={onClick}
      className="ink-card group relative flex flex-col overflow-hidden rounded-[16px] border border-bone-muted/10 p-5 text-left transition-all duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-gold-3/35"
    >
      {team.recentlyAdded && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-gold-3/40 bg-gold-3/10 px-2 py-0.5 font-display text-[9px] font-semibold uppercase tracking-label-md text-gold-4">
          <Sparkles size={9} strokeWidth={2.2} />
          New
        </span>
      )}

      <div className="flex items-start gap-4">
        {team.logoImage ? (
          <div
            className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-bone-muted/10"
            style={{ background: team.palette.dark }}
          >
            <img src={team.logoImage} alt={`${team.name} logo`} className="h-[50px] w-[50px] object-contain" />
          </div>
        ) : (
          <TeamMonogram
            mark={team.monogram}
            primary={team.palette.primary}
            accent={team.palette.accent}
            size={60}
            variant="crest"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[18px] font-bold leading-tight tracking-[0.01em] text-bone">
            {team.name}
          </h3>
          <p className="mt-0.5 font-display text-[10px] font-medium uppercase tracking-label-md text-gold-3">
            {team.organization}
          </p>
          <p className="mt-1 font-body text-[12px] font-light text-bone-muted">
            {team.sport} · {team.ageGroup} · {team.club}
          </p>
        </div>
      </div>

      {/* divider */}
      <div className="my-4 h-px bg-bone-muted/8" />

      {/* stats row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
            Athletes
          </p>
          <p className="mt-1 font-display text-[20px] font-bold leading-none tracking-data-tight text-bone">
            {athletes.length}
          </p>
        </div>
        <div>
          <p className="font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
            Sponsors
          </p>
          <p className="mt-1 font-display text-[20px] font-bold leading-none tracking-data-tight text-bone">
            {sponsors.length}
          </p>
        </div>
        <div>
          <p className="font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
            Last updated
          </p>
          <p className="mt-1 font-display text-[14px] font-semibold leading-none tracking-data-tight text-bone">
            {team.createdAt}
          </p>
        </div>
      </div>

      {/* arrow */}
      <div className="mt-4 flex items-center justify-end">
        <span className="flex items-center gap-1 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted transition-colors group-hover:text-gold-3">
          Open details
          <ArrowUpRight size={12} strokeWidth={2} />
        </span>
      </div>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function TeamDrawerBody({ team }: { team: Team }) {
  const navigate = useNavigate();
  const {
    sponsors: allSponsors,
    users: allUsers,
    assignSponsorToTeam,
    unassignSponsorFromTeam,
  } = useAppState();
  const roster = athletesByTeam(team.id);
  const sponsors = useMemo(
    () => allSponsors.filter((s) => s.assignedTeamIds.includes(team.id)),
    [allSponsors, team.id],
  );
  const availableSponsors = useMemo(
    () => allSponsors.filter((s) => !s.assignedTeamIds.includes(team.id)),
    [allSponsors, team.id],
  );
  const clubAdmins = useMemo(
    () => allUsers.filter((u) => u.role === 'club_admin' && u.teamIds.includes(team.id)),
    [allUsers, team.id],
  );
  const org = organizationForTeam(team.id);
  const sisterTeams = org ? org.teamIds.filter((id) => id !== team.id) : [];

  const [assignOpen, setAssignOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const pushToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* skin preview */}
      <div className="flex justify-center rounded-[12px] border border-bone-muted/8 bg-ink-3/40 px-4 py-6">
        <ComposedCardPreview
          team={team}
          athlete={roster[0]}
          background={team.skinBackground}
          width={180}
        />
      </div>

      {/* key facts */}
      <div className="grid grid-cols-2 gap-3">
        <Fact label="Sport · Age" value={`${team.sport} · ${team.ageGroup}`} />
        <Fact label="Club" value={team.club} />
        <Fact label="Organization" value={team.organization} />
        <Fact label="Created" value={team.createdAt} />
        <Fact label="Athletes" value={String(roster.length)} />
        <Fact label="Sponsors" value={String(sponsors.length)} />
      </div>

      {/* sponsors — v1.7 assignable */}
      <div>
        <div className="flex items-center justify-between">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
            Sponsors · {sponsors.length}
          </p>
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            disabled={availableSponsors.length === 0}
            className="flex items-center gap-1 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4 disabled:cursor-not-allowed disabled:text-bone-muted/40"
          >
            <Plus size={10} strokeWidth={2.4} />
            Assign sponsor
          </button>
        </div>
        {sponsors.length === 0 ? (
          <p className="mt-2 font-body text-[12px] font-light text-bone-muted">
            No sponsors yet · click "Assign" to add one.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {sponsors.map((s) => (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-2.5 pr-1 font-display text-[10px] font-semibold uppercase tracking-label-md ${
                  s.status === 'expiring_soon'
                    ? 'border-gold-4/50 bg-gold-4/10 text-gold-4'
                    : 'border-bone-muted/15 bg-ink-3/60 text-bone'
                }`}
              >
                {s.name}
                {s.status === 'expiring_soon' && <span className="text-[9px] text-gold-4/80">· expiring</span>}
                <button
                  type="button"
                  onClick={() => {
                    unassignSponsorFromTeam(s.id, team.id);
                    pushToast(`${s.name} unassigned from ${team.name}`);
                  }}
                  aria-label={`Unassign ${s.name}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-bone-muted/70 transition-colors hover:bg-ink hover:text-bone"
                >
                  <X size={10} strokeWidth={2.2} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* club admins — v1.7 */}
      <div>
        <div className="flex items-center justify-between">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
            Club admins · {clubAdmins.length}
          </p>
          <button
            type="button"
            onClick={() => pushToast('Invite admin · simulated')}
            className="flex items-center gap-1 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-3 transition-colors hover:text-gold-4"
          >
            <Plus size={10} strokeWidth={2.4} />
            Add admin
          </button>
        </div>
        {clubAdmins.length === 0 ? (
          <p className="mt-2 font-body text-[12px] font-light text-bone-muted">
            No club admins assigned to this team yet.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {clubAdmins.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-[8px] border border-bone-muted/8 bg-ink-3/40 px-3 py-2"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-bone-muted/10 bg-ink-3">
                  <UserCircle2 size={14} strokeWidth={1.6} className="text-bone-muted" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[12px] font-medium tracking-data-tight text-bone">
                    {u.name}
                  </p>
                  <p className="truncate font-body text-[11px] font-light text-bone-muted">
                    {u.email}
                  </p>
                </div>
                <span className="font-display text-[9px] font-medium uppercase tracking-label-md text-bone-muted/60">
                  {u.lastActiveAgo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        eyebrow="Assign sponsor"
        title={team.name}
        width={520}
      >
        <AssignSponsorBody
          available={availableSponsors}
          onAssign={(sponsor) => {
            assignSponsorToTeam(sponsor.id, team.id);
            pushToast(`${sponsor.name} assigned to ${team.name}`);
            setAssignOpen(false);
          }}
        />
      </Modal>

      <Toast visible={toast.visible} message={toast.message} />


      {/* sister teams under same org */}
      {sisterTeams.length > 0 && (
        <div>
          <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
            Sibling teams in {team.organization}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sisterTeams.map((sisId) => {
              const sister = teams.find((t) => t.id === sisId);
              if (!sister) return null;
              return (
                <button
                  key={sisId}
                  type="button"
                  onClick={() => navigate(`/teams`)}
                  className="flex items-center gap-1.5 rounded-full border border-bone-muted/15 bg-ink-3/60 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-label-md text-bone-muted transition-colors hover:border-gold-3/40 hover:text-gold-3"
                >
                  {sister.name}
                  <ArrowUpRight size={10} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* roster */}
      <div>
        <div className="flex items-center justify-between">
          <p className="font-display text-[10px] font-medium uppercase tracking-label-lg text-bone-muted">
            Roster · {roster.length} athletes
          </p>
          <span className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/60">
            click to open
          </span>
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {roster.slice(0, 8).map((ath) => (
            <li key={ath.id}>
              <button
                type="button"
                onClick={() => navigate(`/player/${ath.id}`)}
                className="group flex w-full items-center gap-3 rounded-[8px] border border-transparent px-2 py-2 text-left transition-colors hover:border-bone-muted/10 hover:bg-ink-3/40"
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-bone-muted/10 font-display text-[10px] font-bold tracking-[0.04em] text-bone"
                  style={{ background: team.palette.dark }}
                >
                  {ath.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[13px] font-medium tracking-data-tight text-bone">
                    {ath.firstName} {ath.lastName}
                  </p>
                  <p className="font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                    #{ath.jerseyNumber} · card {ath.cardStatus.replace('_', ' ')} · {ath.paid ? 'paid' : 'unpaid'}
                  </p>
                </div>
                <ArrowUpRight size={12} strokeWidth={1.8} className="text-bone-muted/30 transition-colors group-hover:text-bone-muted" />
              </button>
            </li>
          ))}
          {roster.length > 8 && (
            <li>
              <span className="flex items-center justify-center py-2 font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted/70">
                + {roster.length - 8} more · scroll list in future Roster screen
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* actions */}
      <div className="flex flex-col gap-2 pt-4">
        <button
          type="button"
          onClick={() => navigate(`/design/${team.id}`)}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-gold-3/40 bg-ink-2 font-display text-[11px] font-semibold uppercase tracking-label-md text-gold-3 transition-colors hover:border-gold-3/70 hover:text-gold-4"
        >
          <Edit3 size={13} strokeWidth={1.8} />
          Edit skin
        </button>
        <button
          type="button"
          onClick={() => navigate(`/bulk?team=${team.id}`)}
          className="specular-sweep relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-[8px] bg-brushed-gold font-display text-[12px] font-semibold uppercase tracking-label-md text-ink transition-transform duration-300 ease-cinematic hover:-translate-y-[1px]"
        >
          <Upload size={13} strokeWidth={2.2} className="relative z-[2]" />
          <span className="relative z-[2]">Bulk upload to this team</span>
        </button>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-bone-muted/8 bg-ink-3/40 px-3 py-2">
      <p className="font-display text-[9px] font-medium uppercase tracking-label-lg text-bone-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-[13px] font-medium tracking-data-tight text-bone">
        {value}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function AssignSponsorBody({
  available,
  onAssign,
}: {
  available: Sponsor[];
  onAssign: (sponsor: Sponsor) => void;
}) {
  if (available.length === 0) {
    return (
      <p className="font-body text-[13px] font-light text-bone-muted">
        All sponsors are already assigned to this team.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-[13px] font-light text-bone-muted">
        Select a sponsor to assign. You can unassign later from the team drawer.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {available.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-[10px] border border-bone-muted/10 bg-ink-3/40 px-4 py-3"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold-3/30 bg-gold-3/5">
              <BadgeDollarSign size={14} strokeWidth={1.8} className="text-gold-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[13px] font-semibold tracking-data-tight text-bone">
                {s.name}
              </p>
              <p className="truncate font-display text-[10px] font-medium uppercase tracking-label-md text-bone-muted">
                {s.contractStart} → {s.contractEnd} · {s.assignedTeamIds.length} other team{s.assignedTeamIds.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAssign(s)}
              className="flex h-9 items-center gap-1 rounded-[8px] border border-gold-3/40 bg-ink-2 px-3 font-display text-[10px] font-semibold uppercase tracking-label-md text-gold-3 transition-colors hover:border-gold-3/70 hover:text-gold-4"
            >
              Assign
              <ArrowUpRight size={11} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
