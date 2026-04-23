import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  reviewQueue as seedReviewQueue,
  users as seedUsers,
  videos as seedVideos,
  sponsors as seedSponsors,
  type QueueGroup,
  type Sponsor,
  type User,
  type Video,
} from '../mock/data';

/**
 * Session-scoped state container. Resets on reload — no persistence.
 *
 * v1.4 · Phase 2B seeded reviewQueue so Bulk Onboarding could mutate it.
 * v1.7 · Phase 2C adds users / videos / sponsors so Player Detail and Team
 * drawer can edit parent accounts, toggle video slots / privacy / athlete,
 * and assign/unassign sponsors — all with real (session-only) state, not
 * toast-only simulation.
 */

export interface AppStateShape {
  reviewQueue: QueueGroup[];
  pushQueueGroup: (group: QueueGroup) => void;

  users: User[];
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;

  videos: Video[];
  updateVideo: (id: string, patch: Partial<Video>) => void;
  pushVideo: (video: Video) => void;

  sponsors: Sponsor[];
  assignSponsorToTeam: (sponsorId: string, teamId: string) => void;
  unassignSponsorFromTeam: (sponsorId: string, teamId: string) => void;
}

const AppStateCtx = createContext<AppStateShape | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [reviewQueue, setReviewQueue] = useState<QueueGroup[]>(seedReviewQueue);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [videos, setVideos] = useState<Video[]>(seedVideos);
  const [sponsors, setSponsors] = useState<Sponsor[]>(seedSponsors);

  const pushQueueGroup = useCallback((group: QueueGroup) => {
    setReviewQueue((groups) => [group, ...groups]);
  }, []);

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const removeUser = useCallback((id: string) => {
    setUsers((us) => us.filter((u) => u.id !== id));
  }, []);

  const updateVideo = useCallback((id: string, patch: Partial<Video>) => {
    setVideos((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const pushVideo = useCallback((video: Video) => {
    setVideos((vs) => [video, ...vs]);
  }, []);

  const assignSponsorToTeam = useCallback((sponsorId: string, teamId: string) => {
    setSponsors((ss) =>
      ss.map((s) =>
        s.id === sponsorId && !s.assignedTeamIds.includes(teamId)
          ? { ...s, assignedTeamIds: [...s.assignedTeamIds, teamId] }
          : s,
      ),
    );
  }, []);

  const unassignSponsorFromTeam = useCallback((sponsorId: string, teamId: string) => {
    setSponsors((ss) =>
      ss.map((s) =>
        s.id === sponsorId
          ? { ...s, assignedTeamIds: s.assignedTeamIds.filter((id) => id !== teamId) }
          : s,
      ),
    );
  }, []);

  const value = useMemo<AppStateShape>(
    () => ({
      reviewQueue,
      pushQueueGroup,
      users,
      updateUser,
      removeUser,
      videos,
      updateVideo,
      pushVideo,
      sponsors,
      assignSponsorToTeam,
      unassignSponsorFromTeam,
    }),
    [
      reviewQueue,
      pushQueueGroup,
      users,
      updateUser,
      removeUser,
      videos,
      updateVideo,
      pushVideo,
      sponsors,
      assignSponsorToTeam,
      unassignSponsorFromTeam,
    ],
  );

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): AppStateShape {
  const ctx = useContext(AppStateCtx);
  if (!ctx) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return ctx;
}
