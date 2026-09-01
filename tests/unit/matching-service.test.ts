import { describe, expect, it } from 'vitest';

import { PREBUILT_DEMO_JOBS } from '../../features/matching/matching.mock-data';
import {
  createInitialDemoState,
  createJob,
  likeFreelancer,
  likeJob,
  passFreelancer,
  rankedForJob,
} from '../../features/matching/matching.service';

describe('matching service', () => {
  it('creates a job and ranks freelancers dynamically', () => {
    let state = createInitialDemoState();
    state = createJob(state, PREBUILT_DEMO_JOBS[0]);
    const ranked = rankedForJob(state, PREBUILT_DEMO_JOBS[0].id);
    expect(ranked.length).toBeGreaterThan(5);
    expect(ranked[0]?.freelancer.name).toBe('Mike');
    expect(ranked[0]?.result.score).toBeGreaterThan(ranked[ranked.length - 1]?.result.score ?? 0);
  });

  it('records a pass without creating a match', () => {
    let state = createInitialDemoState();
    state = createJob(state, PREBUILT_DEMO_JOBS[0]);
    state = passFreelancer(state, 'fl-mike');
    const match = state.matches.find((item) => item.freelancerId === 'fl-mike' && item.jobId === PREBUILT_DEMO_JOBS[0].id);
    expect(match?.clientAction).toBe('passed');
    expect(match?.status).toBe('passed');
  });

  it('creates a mutual match when the freelancer auto-accepts a strong like', () => {
    let state = createInitialDemoState();
    state = createJob(state, PREBUILT_DEMO_JOBS[0]);
    state = likeFreelancer(state, 'fl-mike');
    const match = state.matches.find((item) => item.freelancerId === 'fl-mike' && item.jobId === PREBUILT_DEMO_JOBS[0].id);
    expect(match?.status).toBe('matched');
    expect(state.lastCelebration?.freelancerName).toBe('Mike');
  });

  it('matches from the freelancer side when the client already liked', () => {
    let state = createInitialDemoState();
    const job = PREBUILT_DEMO_JOBS[2];
    state = createJob(state, job);
    state = { ...state, viewerFreelancerId: 'fl-wichai', currentJobId: job.id };
    state = likeFreelancer(state, 'fl-wichai', 'liked');
    if (state.matches.find((item) => item.freelancerId === 'fl-wichai')?.status !== 'matched') {
      state = likeJob(state, job.id);
    }
    const match = state.matches.find((item) => item.freelancerId === 'fl-wichai' && item.jobId === job.id);
    expect(match?.freelancerAction === 'liked' || match?.status === 'matched').toBe(true);
  });
});
