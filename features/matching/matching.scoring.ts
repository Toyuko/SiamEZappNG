import { CATEGORY_LABELS, CITY_ALIASES, EXPERIENCE_YEARS, RELATED_CATEGORIES, SCORE_WEIGHTS } from './matching.constants';
import type {
  AvailabilityStatus,
  ExperienceLevel,
  FreelancerProfile,
  Job,
  JobUrgency,
  LocationMode,
  MatchScoreResult,
  ScoreBreakdown,
  ScoringOptions,
  ServiceCategoryId,
} from './matching.types';

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function roundScore(value: number): number {
  return Math.round(clampScore(value));
}

export function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenList(values: string[]): string[] {
  return values.map(normalizeToken).filter(Boolean);
}

function tokensOverlap(required: string[], available: string[]): number {
  if (required.length === 0) return 0;
  const hay = available.join(' | ');
  let hits = 0;
  for (const skill of required) {
    if (!skill) continue;
    if (available.some((item) => item === skill || item.includes(skill) || skill.includes(item))) {
      hits += 1;
      continue;
    }
    if (hay.includes(skill)) hits += 1;
  }
  return hits / required.length;
}

export function resolvePlace(raw: string | null | undefined): { city: string; province: string } | null {
  if (!raw?.trim()) return null;
  const key = normalizeToken(raw);
  return CITY_ALIASES[key] ?? { city: raw.trim(), province: raw.trim() };
}

export function scoreSkills(job: Job, freelancer: FreelancerProfile): number {
  const categoryMatch = job.category === freelancer.category;
  const related = RELATED_CATEGORIES[job.category]?.includes(freelancer.category) ?? false;
  const required = tokenList(job.requiredSkills);
  const available = tokenList([
    ...freelancer.skills,
    ...freelancer.preferredJobTypes,
    CATEGORY_LABELS[freelancer.category],
    freelancer.bio,
  ]);

  const overlap = required.length === 0 ? (categoryMatch ? 1 : related ? 0.35 : 0.08) : tokensOverlap(required, available);

  if (categoryMatch) {
    return roundScore(68 + overlap * 32);
  }
  if (related) {
    return roundScore(28 + overlap * 40);
  }
  return roundScore(overlap * 48);
}

export function scoreLocation(job: Job, freelancer: FreelancerProfile): number {
  if (job.locationMode === 'remote' || (job.remoteOk && freelancer.remoteOk)) {
    if (freelancer.remoteOk) {
      const jobPlace = resolvePlace(job.location);
      const sameCity = jobPlace && normalizeToken(freelancer.location) === normalizeToken(jobPlace.city);
      return sameCity ? 100 : 88;
    }
  }

  const jobPlace = resolvePlace(job.location) ?? resolvePlace(job.province);
  if (!jobPlace) {
    return 50;
  }

  const flCity = normalizeToken(freelancer.location);
  const flProvince = normalizeToken(freelancer.province);
  const jobCity = normalizeToken(jobPlace.city);
  const jobProvince = normalizeToken(jobPlace.province || job.province || jobPlace.city);

  if (flCity === jobCity) return 100;
  if (flProvince === jobProvince && jobProvince) return 72;
  if (flCity === jobProvince || flProvince === jobCity) return 72;
  if (job.remoteOk && freelancer.remoteOk) return 64;
  return 18;
}

export function scoreExperience(job: Job, freelancer: FreelancerProfile): number {
  const required = EXPERIENCE_YEARS[job.experienceRequired];
  const years = Math.max(0, freelancer.yearsExperience);

  if (required <= 0) {
    if (years <= 0) return 55;
    return roundScore(70 + Math.min(years, 12) * 2.2);
  }

  if (years <= 0) return 8;
  if (years >= required + 4) return 100;
  if (years >= required) return roundScore(82 + ((years - required) / 4) * 18);
  return roundScore((years / required) * 68);
}

const AVAILABILITY_RANK: Record<AvailabilityStatus, number> = {
  available_now: 4,
  today: 3,
  this_week: 2,
  busy: 1,
  unavailable: 0,
};

const URGENCY_NEED: Record<JobUrgency, number> = {
  asap: 4,
  today: 3,
  this_week: 2,
  specific_date: 2,
  flexible: 1,
};

export function scoreAvailability(job: Job, freelancer: FreelancerProfile): number {
  const have = AVAILABILITY_RANK[freelancer.availability];
  const need = URGENCY_NEED[job.urgency];
  if (have === 0) return 0;
  if (need <= 1) return have === 0 ? 0 : roundScore(55 + have * 11);
  if (have >= need) return 100;
  const gap = need - have;
  if (gap === 1) return 62;
  if (gap === 2) return 34;
  return 12;
}

export function scoreBudget(job: Job, freelancer: FreelancerProfile): number {
  const max = job.budgetMax;
  const min = job.budgetMin;
  if (max == null && min == null) return 70;

  const monthly = freelancer.monthlyRate > 0 ? freelancer.monthlyRate : freelancer.hourlyRate * 160;
  const targetMax = max ?? (min != null ? Math.round(min * 1.25) : null);
  const targetMin = min ?? (max != null ? Math.round(max * 0.6) : null);

  if (targetMax == null) return 70;
  if (monthly <= targetMax && (targetMin == null || monthly >= targetMin * 0.5)) {
    if (targetMin != null && monthly < targetMin) return 86;
    return 100;
  }

  const over = monthly - targetMax;
  const ratio = over / Math.max(targetMax, 1);
  if (ratio <= 0.1) return 62;
  if (ratio <= 0.25) return 36;
  if (ratio <= 0.5) return 14;
  return 0;
}

export function scoreRating(freelancer: FreelancerProfile): number {
  const ratingPart = (Math.max(0, Math.min(5, freelancer.rating)) / 5) * 82;
  const volumePart = (Math.min(freelancer.completedJobs, 80) / 80) * 12;
  const verifiedPart = freelancer.verified ? 6 : 0;
  return roundScore(ratingPart + volumePart + verifiedPart);
}

export function scoreLanguage(job: Job, freelancer: FreelancerProfile): number {
  const required = tokenList(job.languages);
  if (required.length === 0) return 80;
  const available = tokenList(freelancer.languages);
  const overlap = tokensOverlap(required, available);
  return roundScore(overlap * 100);
}

function stableJitter(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const n = Math.abs(hash % 31);
  return n / 10 - 1.5;
}

export function buildReasons(job: Job, freelancer: FreelancerProfile, breakdown: ScoreBreakdown): string[] {
  const reasons: string[] = [];
  if (breakdown.skills >= 85) {
    reasons.push(
      job.category === freelancer.category
        ? `Excellent skill match for ${CATEGORY_LABELS[job.category]}`
        : 'Strong overlapping skills',
    );
  } else if (breakdown.skills >= 60) {
    reasons.push('Relevant skills for this request');
  }

  if (breakdown.location >= 90) {
    reasons.push(`Available in ${freelancer.location}`);
  } else if (breakdown.location >= 70) {
    reasons.push(`Serves ${freelancer.province}`);
  } else if (job.remoteOk && freelancer.remoteOk) {
    reasons.push('Can work remotely');
  }

  if (breakdown.experience >= 80) {
    reasons.push(`${freelancer.yearsExperience}+ years experience`);
  }

  if (breakdown.availability >= 90) {
    reasons.push(freelancer.availability === 'available_now' ? 'Available immediately' : 'Available when you need them');
  }

  if (breakdown.budget >= 80) {
    reasons.push('Within requested budget');
  } else if (breakdown.budget >= 50) {
    reasons.push('Close to your budget range');
  }

  if (breakdown.rating >= 85) {
    reasons.push(`${freelancer.rating.toFixed(1)} rating across ${freelancer.completedJobs} jobs`);
  }

  if (breakdown.language >= 80 && job.languages.length > 0) {
    reasons.push(`Speaks ${freelancer.languages.slice(0, 3).join(', ')}`);
  }

  if (freelancer.verified) {
    reasons.push('Verified SiamEZ professional');
  }

  return reasons.slice(0, 5);
}

export function buildSummary(freelancer: FreelancerProfile, job: Job, result: Pick<MatchScoreResult, 'score' | 'reasons'>): string {
  const highlights = result.reasons.slice(0, 3).join(', ').replace(/^\w/, (c) => c) || 'a relevant skill set';
  return `${freelancer.name} is ${result.score}% compatible because ${highlights.toLowerCase()}.`;
}

export function calculateMatchScore(
  job: Job,
  freelancer: FreelancerProfile,
  options: ScoringOptions = {},
): MatchScoreResult {
  const breakdown: ScoreBreakdown = {
    skills: scoreSkills(job, freelancer),
    location: scoreLocation(job, freelancer),
    experience: scoreExperience(job, freelancer),
    availability: scoreAvailability(job, freelancer),
    budget: scoreBudget(job, freelancer),
    rating: scoreRating(freelancer),
    language: scoreLanguage(job, freelancer),
  };

  const weighted =
    breakdown.skills * SCORE_WEIGHTS.skills +
    breakdown.location * SCORE_WEIGHTS.location +
    breakdown.experience * SCORE_WEIGHTS.experience +
    breakdown.availability * SCORE_WEIGHTS.availability +
    breakdown.budget * SCORE_WEIGHTS.budget +
    breakdown.rating * SCORE_WEIGHTS.rating +
    breakdown.language * SCORE_WEIGHTS.language;

  const jitter = options.jitter === false ? 0 : stableJitter(`${freelancer.id}:${job.category}:${job.location}:${job.description}`);
  const score = roundScore(weighted + jitter);
  const reasons = buildReasons(job, freelancer, breakdown);
  const confidence = clampScore(score / 100);

  return {
    score,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
    breakdown,
    summary: buildSummary(freelancer, job, { score, reasons }),
  };
}

export function sortByScore<T extends { result: MatchScoreResult; freelancer: { id: string } }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (b.result.score !== a.result.score) return b.result.score - a.result.score;
    return a.freelancer.id.localeCompare(b.freelancer.id);
  });
}

export function experienceMeets(level: ExperienceLevel, years: number): boolean {
  return years >= EXPERIENCE_YEARS[level];
}

export function formatBaht(amount: number): string {
  return `฿${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatRate(freelancer: FreelancerProfile): string {
  if (freelancer.monthlyRate > 0) {
    return `${formatBaht(freelancer.monthlyRate)} / month`;
  }
  return `${formatBaht(freelancer.hourlyRate)} / hour`;
}

export function categoryLabel(id: ServiceCategoryId): string {
  return CATEGORY_LABELS[id];
}

export function locationModeFits(jobMode: LocationMode | 'any', freelancer: FreelancerProfile, jobRemoteOk: boolean): boolean {
  if (jobMode === 'any') return true;
  if (jobMode === 'remote') return freelancer.remoteOk;
  if (jobMode === 'hybrid') return true;
  return !jobRemoteOk || true;
}
