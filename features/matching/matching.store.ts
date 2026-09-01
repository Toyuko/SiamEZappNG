import { useMemo } from 'react';
import { create } from 'zustand';

import {
  createBooking as createBookingFn,
  createInitialDemoState,
  createJob as createJobFn,
  dismissCelebration,
  jobFromDraft,
  likeFreelancer as likeFreelancerFn,
  likeJob as likeJobFn,
  type MatchingState,
  parseJobFromText,
  passFreelancer as passFreelancerFn,
  passJob as passJobFn,
  rankedForJob,
  rankedJobsForFreelancer,
  saveFreelancer as saveFreelancerFn,
  sendMessage as sendMessageFn,
  setFilters as setFiltersFn,
  setRole as setRoleFn,
  setViewerFreelancer as setViewerFreelancerFn,
  undoLast,
} from './matching.service';
import type { DemoRole, Job, JobDraft, MatchFilters, ParsedJob, RankedMatch } from './matching.types';

type MatchingStore = MatchingState & {
  createJobFromDraft: (draft: JobDraft) => Job;
  loadDemoJob: (jobId: string) => Job | null;
  parseNaturalLanguage: (text: string) => ParsedJob;
  likeCurrentFreelancer: (freelancerId: string) => void;
  superLikeFreelancer: (freelancerId: string) => void;
  passCurrentFreelancer: (freelancerId: string) => void;
  acceptJob: (jobId: string) => void;
  rejectJob: (jobId: string) => void;
  undo: () => void;
  saveProfile: (freelancerId: string) => void;
  updateFilters: (patch: Partial<MatchFilters>) => void;
  switchRole: (role: DemoRole) => void;
  switchFreelancerPersona: (freelancerId: string) => void;
  sendChat: (matchId: string, text: string) => void;
  bookMatch: (matchId: string) => void;
  clearCelebration: () => void;
  resetDemo: () => void;
  setCurrentJob: (jobId: string) => void;
};

export const useMatchingStore = create<MatchingStore>((set, get) => ({
  ...createInitialDemoState(),

  createJobFromDraft: (draft) => {
    const job = jobFromDraft(draft);
    set((state) => createJobFn(state, job));
    return job;
  },

  loadDemoJob: (jobId) => {
    const job = get().jobs.find((item) => item.id === jobId);
    if (!job) return null;
    set((state) => createJobFn(state, job));
    return job;
  },

  parseNaturalLanguage: (text) => parseJobFromText(text),

  likeCurrentFreelancer: (freelancerId) => set((state) => likeFreelancerFn(state, freelancerId, 'liked')),
  superLikeFreelancer: (freelancerId) => set((state) => likeFreelancerFn(state, freelancerId, 'super_liked')),
  passCurrentFreelancer: (freelancerId) => set((state) => passFreelancerFn(state, freelancerId)),
  acceptJob: (jobId) => set((state) => likeJobFn(state, jobId)),
  rejectJob: (jobId) => set((state) => passJobFn(state, jobId)),
  undo: () => set((state) => undoLast(state)),
  saveProfile: (freelancerId) => set((state) => saveFreelancerFn(state, freelancerId)),
  updateFilters: (patch) => set((state) => setFiltersFn(state, patch)),
  switchRole: (role) => set((state) => setRoleFn(state, role)),
  switchFreelancerPersona: (freelancerId) => set((state) => setViewerFreelancerFn(state, freelancerId)),
  sendChat: (matchId, text) =>
    set((state) => {
      const sender = state.role === 'freelancer' ? 'freelancer' : 'client';
      let next = sendMessageFn(state, matchId, sender, text);
      if (sender === 'client') {
        next = sendMessageFn(
          next,
          matchId,
          'freelancer',
          'Thanks for matching — I can take this job. When would you like to start?',
        );
      }
      return next;
    }),
  bookMatch: (matchId) => set((state) => createBookingFn(state, matchId)),
  clearCelebration: () => set((state) => dismissCelebration(state)),
  resetDemo: () => set(() => createInitialDemoState()),
  setCurrentJob: (jobId) => set({ currentJobId: jobId }),
}));

const EMPTY_RANKED: RankedMatch[] = [];

export function useClientDeck() {
  const currentJobId = useMatchingStore((state) => state.currentJobId);
  const matches = useMatchingStore((state) => state.matches);
  const filters = useMatchingStore((state) => state.filters);
  return useMemo(() => {
    if (!currentJobId) return EMPTY_RANKED;
    return rankedForJob(useMatchingStore.getState(), currentJobId, { strongOnly: false });
  }, [currentJobId, matches, filters]);
}

export function useStrongClientDeck() {
  const currentJobId = useMatchingStore((state) => state.currentJobId);
  const matches = useMatchingStore((state) => state.matches);
  const filters = useMatchingStore((state) => state.filters);
  return useMemo(() => {
    if (!currentJobId) return EMPTY_RANKED;
    return rankedForJob(useMatchingStore.getState(), currentJobId, { strongOnly: true });
  }, [currentJobId, matches, filters]);
}

export function useFreelancerDeck() {
  const viewerFreelancerId = useMatchingStore((state) => state.viewerFreelancerId);
  const matches = useMatchingStore((state) => state.matches);
  const jobs = useMatchingStore((state) => state.jobs);
  return useMemo(
    () => rankedJobsForFreelancer(useMatchingStore.getState()),
    [viewerFreelancerId, matches, jobs],
  );
}

export function useCurrentJob() {
  const currentJobId = useMatchingStore((state) => state.currentJobId);
  const jobs = useMatchingStore((state) => state.jobs);
  return useMemo(() => jobs.find((job) => job.id === currentJobId) ?? null, [jobs, currentJobId]);
}
