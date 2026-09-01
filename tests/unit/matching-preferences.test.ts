import { describe, expect, it } from 'vitest';

import { BLOCKED_SCORE_CAP } from '../../features/matching/matching.constants';
import {
  DEMO_CLIENT_PROFILE,
  DEMO_CORPORATE_ACCOUNT,
  DEMO_FLEXIBLE_CLIENT_PROFILE,
  FREELANCER_WORK_PREFERENCES,
  MOCK_FREELANCERS,
  PREBUILT_DEMO_JOBS,
} from '../../features/matching/matching.mock-data';
import { pref } from '../../features/matching/matching.preferences';
import { matchJobToFreelancers } from '../../features/matching/matching.provider';
import { calculateMatchScore } from '../../features/matching/matching.scoring';
import { createInitialDemoState, createJob, loadDemoScenario, rankedForJob } from '../../features/matching/matching.service';
import type { FreelancerProfile, Job } from '../../features/matching/matching.types';

const jitterOff = { jitter: false } as const;

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

describe('preference matching', () => {
  it('blocks a MUST HAVE + FIXED language miss instead of awarding a high score', () => {
    const mechanic = job('demo-job-mechanic');
    const thaiOnly = { ...freelancer('fl-mike'), languages: ['Thai'] };
    const result = calculateMatchScore(mechanic, thaiOnly, jitterOff);
    expect(result.blocked).toBe(true);
    expect(result.blockReasons.some((reason) => /language/i.test(reason))).toBe(true);
    expect(result.score).toBeLessThanOrEqual(BLOCKED_SCORE_CAP);
  });

  it('keeps a flexible budget mismatch visible without hiding the freelancer', () => {
    const ranked = matchJobToFreelancers(job('demo-job-driver-flexible'), MOCK_FREELANCERS, {
      ...jitterOff,
      clientProfile: DEMO_FLEXIBLE_CLIENT_PROFILE,
    });
    const kittisak = ranked.find((item) => item.freelancer.id === 'fl-kittisak');
    expect(kittisak).toBeTruthy();
    expect(kittisak?.result.blocked).toBe(false);
    expect(kittisak?.result.conflicts.some((item) => item.field === 'budget')).toBe(true);
    expect(kittisak?.result.score).toBeGreaterThan(50);
    expect(kittisak?.result.breakdown.jobFit).toBeGreaterThan(70);
  });

  it('lets a job-specific MUST HAVE override a company PREFERRED language', () => {
    const base = job('demo-job-corporate-registration');
    const frenchNiran = { ...freelancer('fl-niran'), languages: ['French'] };
    const company = DEMO_CORPORATE_ACCOUNT.profiles.find((item) => item.id === 'hp-automotive');
    if (!company) throw new Error('missing automotive profile');
    const companyPreferred = {
      ...company,
      items: company.items.map((item) =>
        item.field === 'languages' ? { ...item, importance: 'preferred' as const, flexibility: 'flexible' as const } : item,
      ),
    };
    const preferredOnly = calculateMatchScore(
      { ...base, languages: [], preferences: [] },
      frenchNiran,
      { ...jitterOff, corporateProfile: companyPreferred },
    );
    const overridden = calculateMatchScore(
      { ...base, languages: [], preferences: [] },
      frenchNiran,
      {
        ...jitterOff,
        corporateProfile: companyPreferred,
        jobPreferences: [pref('job-en', 'languages', ['English'], 'must_have', 'fixed', 'job', 'English')],
      },
    );
    expect(preferredOnly.blocked).toBe(false);
    expect(overridden.blocked).toBe(true);
    expect(overridden.score).toBeLessThan(preferredOnly.score);
  });

  it('lowers freelancer preference fit when the job is outside their preferred locations', () => {
    const phuketJob = job('demo-job-construction');
    const inArea = calculateMatchScore(job('demo-job-mechanic'), freelancer('fl-mike'), {
      ...jitterOff,
      freelancerProfile: FREELANCER_WORK_PREFERENCES['fl-mike'],
    });
    const outOfArea = calculateMatchScore(phuketJob, freelancer('fl-mike'), {
      ...jitterOff,
      freelancerProfile: FREELANCER_WORK_PREFERENCES['fl-mike'],
    });
    expect(inArea.breakdown.freelancerPreference).toBeGreaterThan(outOfArea.breakdown.freelancerPreference);
  });

  it('explains two-sided compatibility in the match summary', () => {
    const result = calculateMatchScore(job('demo-job-mechanic'), freelancer('fl-mike'), {
      ...jitterOff,
      clientProfile: DEMO_CLIENT_PROFILE,
      freelancerProfile: FREELANCER_WORK_PREFERENCES['fl-mike'],
    });
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.summary.toLowerCase()).toContain('mike');
    expect(result.reasons.length).toBeGreaterThan(2);
    expect(result.breakdown.jobFit).toBeGreaterThan(80);
    expect(result.breakdown.clientPreference).toBeGreaterThan(80);
  });

  it('ranks Niran first on the corporate vehicle-registration scenario', () => {
    const ranked = matchJobToFreelancers(job('demo-job-corporate-registration'), MOCK_FREELANCERS, {
      ...jitterOff,
      corporateProfile: DEMO_CORPORATE_ACCOUNT.profiles[0],
      accountKind: 'corporate',
    });
    expect(ranked[0]?.freelancer.id).toBe('fl-niran');
    expect(ranked[0]?.result.blocked).toBe(false);
    expect(ranked[0]?.result.score).toBeGreaterThanOrEqual(80);
  });

  it('loads demo scenarios through the matching service', () => {
    const individual = loadDemoScenario(createInitialDemoState(), 'scenario-individual');
    const ranked = rankedForJob(individual, 'demo-job-mechanic');
    expect(ranked[0]?.freelancer.id).toBe('fl-mike');

    const corporate = loadDemoScenario(createInitialDemoState(), 'scenario-corporate');
    expect(corporate.role).toBe('corporate');
    expect(rankedForJob(corporate, 'demo-job-corporate-registration')[0]?.freelancer.id).toBe('fl-niran');
  });

  it('still ranks Mike first when a mechanic job is created without extra profiles', () => {
    let state = createInitialDemoState();
    state = createJob(state, job('demo-job-mechanic'));
    expect(rankedForJob(state, 'demo-job-mechanic')[0]?.freelancer.name).toBe('Mike');
  });
});
