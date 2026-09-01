import { describe, expect, it } from 'vitest';

import { MOCK_FREELANCERS, PREBUILT_DEMO_JOBS } from '../../features/matching/matching.mock-data';
import {
  calculateMatchScore,
  scoreAvailability,
  scoreBudget,
  scoreExperience,
  scoreLanguage,
  scoreLocation,
  scoreSkills,
  sortByScore,
} from '../../features/matching/matching.scoring';
import { matchJobToFreelancers } from '../../features/matching/matching.provider';
import type { FreelancerProfile, Job } from '../../features/matching/matching.types';

const options = { jitter: false } as const;

function freelancer(id: string): FreelancerProfile {
  const found = MOCK_FREELANCERS.find((item) => item.id === id);
  if (!found) throw new Error(id);
  return found;
}

function job(id: string): Job {
  const found = PREBUILT_DEMO_JOBS.find((item) => item.id === id);
  if (!found) throw new Error(id);
  return found;
}

const blankJob: Job = {
  id: 'blank',
  clientId: 'c',
  clientName: 'Client',
  category: 'motorbike_mechanic',
  title: 'Blank',
  description: '',
  location: '',
  province: '',
  locationMode: 'onsite',
  budgetMin: null,
  budgetMax: null,
  urgency: 'flexible',
  specificDate: null,
  requiredSkills: [],
  experienceRequired: 'any',
  languages: [],
  remoteOk: false,
  status: 'open',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('matching scoring', () => {
  it('scores skill match highest for the same category and overlapping skills', () => {
    const mike = freelancer('fl-mike');
    const wichai = freelancer('fl-wichai');
    const mechanic = job('demo-job-mechanic');
    expect(scoreSkills(mechanic, mike)).toBeGreaterThan(90);
    expect(scoreSkills(mechanic, wichai)).toBeLessThan(40);
  });

  it('scores location 100 for the same city and low for a different province', () => {
    const mechanic = job('demo-job-mechanic');
    expect(scoreLocation(mechanic, freelancer('fl-mike'))).toBe(100);
    expect(scoreLocation(mechanic, freelancer('fl-wichai'))).toBeLessThan(30);
  });

  it('scores experience against the required level', () => {
    const mechanic = job('demo-job-mechanic');
    expect(scoreExperience(mechanic, freelancer('fl-mike'))).toBeGreaterThan(80);
    const junior = { ...freelancer('fl-mali'), yearsExperience: 0, category: 'motorbike_mechanic' as const };
    expect(scoreExperience(mechanic, junior)).toBeLessThan(20);
  });

  it('scores availability for ASAP vs unavailable', () => {
    const mechanic = job('demo-job-mechanic');
    expect(scoreAvailability(mechanic, freelancer('fl-mike'))).toBe(100);
    expect(scoreAvailability(mechanic, { ...freelancer('fl-mike'), availability: 'unavailable' })).toBe(0);
  });

  it('scores budget inside, over, and missing ranges', () => {
    const mechanic = job('demo-job-mechanic');
    expect(scoreBudget(mechanic, freelancer('fl-mike'))).toBe(100);
    expect(scoreBudget(mechanic, { ...freelancer('fl-mike'), monthlyRate: 80_000, hourlyRate: 2000 })).toBeLessThan(20);
    expect(scoreBudget({ ...mechanic, budgetMin: null, budgetMax: null }, freelancer('fl-mike'))).toBe(70);
    expect(scoreBudget({ ...mechanic, budgetMin: 5_000, budgetMax: 200_000 }, freelancer('fl-mike'))).toBe(100);
  });

  it('scores language overlap and missing requirements', () => {
    const mechanic = job('demo-job-mechanic');
    expect(scoreLanguage(mechanic, freelancer('fl-mike'))).toBe(100);
    expect(scoreLanguage(mechanic, { ...freelancer('fl-mike'), languages: ['French'] })).toBe(0);
    expect(scoreLanguage({ ...mechanic, languages: [] }, freelancer('fl-mike'))).toBe(80);
  });

  it('produces an overall score from the published weights', () => {
    const result = calculateMatchScore(job('demo-job-mechanic'), freelancer('fl-mike'), options);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.breakdown.skills).toBeGreaterThan(80);
  });

  it('sorts matches by score descending', () => {
    const ranked = matchJobToFreelancers(job('demo-job-mechanic'), MOCK_FREELANCERS, options);
    const sorted = sortByScore(ranked);
    expect(sorted[0]?.freelancer.id).toBe('fl-mike');
    expect(sorted[0]?.result.score).toBeGreaterThan(sorted[sorted.length - 1]?.result.score ?? 0);
  });

  it('ranks a Vespa Bangkok job completely differently from a Chiang Mai interpreter job', () => {
    const bikes = matchJobToFreelancers(job('demo-job-mechanic'), MOCK_FREELANCERS, options);
    const talk = matchJobToFreelancers(job('demo-job-interpreter-cnx'), MOCK_FREELANCERS, options);
    expect(bikes[0]?.freelancer.id).toBe('fl-mike');
    expect(talk[0]?.freelancer.id).toBe('fl-nattapong');
    expect(bikes[0]?.freelancer.id).not.toBe(talk[0]?.freelancer.id);
  });

  it('keeps construction workers low on a mechanic job', () => {
    const ranked = matchJobToFreelancers(job('demo-job-mechanic'), MOCK_FREELANCERS, options);
    const construction = ranked.find((item) => item.freelancer.id === 'fl-wichai');
    expect(construction?.result.score).toBeLessThan(60);
  });

  it('handles missing location, no skills, zero experience, and empty freelancer lists', () => {
    const result = calculateMatchScore(blankJob, { ...freelancer('fl-mike'), yearsExperience: 0, skills: [] }, options);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(matchJobToFreelancers(blankJob, [], options)).toEqual([]);
  });
});
