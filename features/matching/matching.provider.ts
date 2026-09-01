import { STRONG_MATCH_MIN } from './matching.constants';
import { parseJobDescription } from './matching.parser';
import { calculateMatchScore, sortByScore } from './matching.scoring';
import type {
  FreelancerProfile,
  Job,
  MatchExplanation,
  MatchRecord,
  MatchingProvider,
  RankedMatch,
  ScoringOptions,
} from './matching.types';

function matchIdFor(jobId: string, freelancerId: string): string {
  return `match:${jobId}:${freelancerId}`;
}

export function buildMatchRecord(job: Job, freelancer: FreelancerProfile, options?: ScoringOptions): MatchRecord {
  const result = calculateMatchScore(job, freelancer, options);
  return {
    id: matchIdFor(job.id, freelancer.id),
    jobId: job.id,
    freelancerId: freelancer.id,
    score: result.score,
    confidence: result.confidence,
    reasons: result.reasons,
    scoreBreakdown: result.breakdown,
    summary: result.summary,
    clientAction: 'pending',
    freelancerAction: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString(),
    matchedAt: null,
  };
}

export function matchJobToFreelancers(
  job: Job,
  freelancers: FreelancerProfile[],
  options?: ScoringOptions,
): RankedMatch[] {
  const ranked = freelancers.map((freelancer) => {
    const result = calculateMatchScore(job, freelancer, options);
    return {
      freelancer,
      job,
      result,
      match: buildMatchRecord(job, freelancer, options),
    };
  });
  return sortByScore(ranked);
}

export function matchFreelancerToJobs(
  freelancer: FreelancerProfile,
  jobs: Job[],
  options?: ScoringOptions,
): RankedMatch[] {
  const openJobs = jobs.filter((job) => job.status === 'open');
  const ranked = openJobs.map((job) => {
    const result = calculateMatchScore(job, freelancer, options);
    return {
      freelancer,
      job,
      result,
      match: buildMatchRecord(job, freelancer, options),
    };
  });
  return sortByScore(ranked);
}

export const simulatedMatchingProvider: MatchingProvider = {
  parseJob: parseJobDescription,
  matchJob: matchJobToFreelancers,
  matchFreelancer: matchFreelancerToJobs,
  calculateScore: calculateMatchScore,
  explainMatch(job, freelancer, options) {
    const result = calculateMatchScore(job, freelancer, options);
    return {
      score: result.score,
      breakdown: result.breakdown,
      reasons: result.reasons,
      summary: result.summary,
    } satisfies MatchExplanation;
  },
};

let activeProvider: MatchingProvider = simulatedMatchingProvider;

export function getMatchingProvider(): MatchingProvider {
  return activeProvider;
}

/** Swap in OpenAIMatchingProvider later without rewriting UI. */
export function setMatchingProvider(provider: MatchingProvider): void {
  activeProvider = provider;
}

export function isStrongMatch(score: number): boolean {
  return score >= STRONG_MATCH_MIN;
}
