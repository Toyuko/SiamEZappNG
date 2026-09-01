/**
 * Preference merge, MUST HAVE gates, and two-sided preference scoring.
 * Hierarchy: job requirement → job-specific preference → company profile → client profile.
 */
import { BLOCKED_SCORE_CAP, CITY_ALIASES, EXPERIENCE_YEARS, IMPORTANCE_WEIGHT } from './matching.constants';
import type {
  ClientPreferenceProfile,
  CorporateHiringProfile,
  FreelancerPreferenceProfile,
  FreelancerProfile,
  Job,
  MatchConflict,
  PreferenceField,
  PreferenceItem,
  ScoringOptions,
} from './matching.types';

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function roundScore(value: number): number {
  return Math.round(clampScore(value));
}

export function pref(
  id: string,
  field: PreferenceField,
  value: PreferenceItem['value'],
  importance: PreferenceItem['importance'],
  flexibility: PreferenceItem['flexibility'],
  source: PreferenceItem['source'],
  label: string,
): PreferenceItem {
  return { id, field, value, importance, flexibility, source, label };
}

function asList(value: PreferenceItem['value']): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'boolean') return [];
  if (value == null) return [];
  return [String(value)];
}

function asNumber(value: PreferenceItem['value']): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function tokensOverlap(required: string[], available: string[]): number {
  if (required.length === 0) return 1;
  const hay = available.map(normalizeToken);
  let hits = 0;
  for (const raw of required) {
    const skill = normalizeToken(raw);
    if (!skill) continue;
    if (hay.some((item) => item === skill || item.includes(skill) || skill.includes(item))) hits += 1;
  }
  return hits / required.length;
}

export function preferencesFromJob(job: Job): PreferenceItem[] {
  return [
    pref('job-category', 'category', job.category, 'must_have', 'fixed', 'job', 'Service category'),
    ...(job.requiredSkills.length
      ? [pref('job-skills', 'skills', job.requiredSkills, 'must_have', 'fixed', 'job', 'Required skills')]
      : []),
    pref('job-location', 'location', job.location, 'must_have', job.remoteOk ? 'flexible' : 'fixed', 'job', 'Location'),
    pref('job-experience', 'experience', job.experienceRequired, job.experienceRequired === 'any' ? 'nice_to_have' : 'must_have', 'flexible', 'job', 'Experience'),
    ...(job.languages.length
      ? [pref('job-languages', 'languages', job.languages, 'must_have', 'fixed', 'job', 'Languages')]
      : []),
    ...(job.budgetMax != null
      ? [pref('job-budget', 'budget', job.budgetMax, 'preferred', 'flexible', 'job', 'Budget')]
      : []),
  ];
}

/**
 * Later sources win. Job requirements stay as the baseline; job-specific prefs override
 * company prefs, which override the individual client profile.
 */
export function resolvePreferences(options: ScoringOptions, job: Job): PreferenceItem[] {
  const byField = new Map<PreferenceField, PreferenceItem>();
  const layers: PreferenceItem[][] = [
    options.clientProfile?.items ?? [],
    options.corporateProfile?.items ?? [],
    job.preferences ?? [],
    options.jobPreferences ?? [],
    preferencesFromJob(job),
  ];
  for (const layer of layers) {
    for (const item of layer) {
      if (item.importance === 'not_important') continue;
      byField.set(item.field, item);
    }
  }
  return [...byField.values()];
}

export function evaluatePreference(
  item: PreferenceItem,
  job: Job,
  freelancer: FreelancerProfile,
): { score: number; met: boolean; detail: string } {
  const availableSkills = [...freelancer.skills, ...freelancer.preferredJobTypes, freelancer.bio];
  switch (item.field) {
    case 'category': {
      const wanted = asList(item.value).map(normalizeToken);
      const have = normalizeToken(freelancer.category);
      const met = wanted.length === 0 || wanted.includes(have);
      return { score: met ? 100 : 12, met, detail: met ? 'Service matches' : 'Different service category' };
    }
    case 'skills': {
      const overlap = tokensOverlap(asList(item.value), availableSkills);
      return {
        score: roundScore(overlap * 100),
        met: overlap >= 0.5,
        detail: overlap >= 0.99 ? 'All preferred skills' : overlap >= 0.5 ? 'Partial skill match' : 'Missing required skills',
      };
    }
    case 'location': {
      const wanted = normalizeToken(String(asList(item.value)[0] ?? job.location));
      const alias = CITY_ALIASES[wanted];
      const city = normalizeToken(alias?.city ?? wanted);
      const have = normalizeToken(freelancer.location);
      const province = normalizeToken(freelancer.province);
      const met = have === city || province === city;
      return { score: met ? 100 : job.remoteOk && freelancer.remoteOk ? 64 : 18, met, detail: met ? `Available in ${freelancer.location}` : 'Location mismatch' };
    }
    case 'experience': {
      const years =
        typeof item.value === 'number'
          ? item.value
          : (EXPERIENCE_YEARS[String(item.value) as keyof typeof EXPERIENCE_YEARS] ?? Number(item.value) ?? 0);
      const met = freelancer.yearsExperience >= years;
      const score = years <= 0 ? 80 : met ? roundScore(82 + Math.min(freelancer.yearsExperience - years, 4) * 4.5) : roundScore((freelancer.yearsExperience / Math.max(years, 1)) * 68);
      return { score, met, detail: `${freelancer.yearsExperience} years vs ${years}+ required` };
    }
    case 'languages': {
      const overlap = tokensOverlap(asList(item.value), freelancer.languages);
      return { score: roundScore(overlap * 100), met: overlap >= 0.99, detail: overlap >= 0.99 ? `Speaks ${freelancer.languages.join(', ')}` : 'Does not meet required language' };
    }
    case 'rating': {
      const min = asNumber(item.value) ?? 0;
      const met = freelancer.rating + 1e-6 >= min;
      return { score: met ? roundScore((freelancer.rating / 5) * 100) : roundScore((freelancer.rating / Math.max(min, 0.1)) * 70), met, detail: `${freelancer.rating.toFixed(1)} rating` };
    }
    case 'verified': {
      const required = item.value === true || item.value === 'true';
      const met = !required || freelancer.verified;
      return { score: met ? 100 : 0, met, detail: freelancer.verified ? 'Verified professional' : 'Not verified' };
    }
    case 'completed_jobs': {
      const min = asNumber(item.value) ?? 0;
      const met = freelancer.completedJobs >= min;
      return { score: met ? 100 : roundScore((freelancer.completedJobs / Math.max(min, 1)) * 80), met, detail: `${freelancer.completedJobs} completed jobs` };
    }
    case 'response_time': {
      const minutes = Number(String(freelancer.responseTime).replace(/[^\d]/g, '')) || 120;
      const max = asNumber(item.value) ?? 120;
      const met = minutes <= max;
      return { score: met ? 100 : 40, met, detail: freelancer.responseTime };
    }
    case 'availability': {
      const rank = { available_now: 4, today: 3, this_week: 2, busy: 1, unavailable: 0 }[freelancer.availability];
      const met = rank >= 2;
      return { score: rank === 0 ? 0 : rank >= 3 ? 100 : 62, met, detail: met ? 'Available when required' : 'Availability is tight' };
    }
    case 'budget': {
      const cap = asNumber(item.value) ?? job.budgetMax;
      const monthly = freelancer.monthlyRate > 0 ? freelancer.monthlyRate : freelancer.hourlyRate * 160;
      if (cap == null) return { score: 70, met: true, detail: 'No budget cap' };
      if (monthly <= cap) return { score: 100, met: true, detail: 'Within preferred budget' };
      const ratio = (monthly - cap) / Math.max(cap, 1);
      return { score: ratio <= 0.1 ? 62 : ratio <= 0.25 ? 36 : 14, met: false, detail: 'Budget mismatch' };
    }
    case 'certifications': {
      const overlap = tokensOverlap(asList(item.value), freelancer.certifications);
      const optionalEmpty = asList(item.value).length === 0;
      return { score: optionalEmpty ? 80 : roundScore(overlap * 100), met: optionalEmpty || overlap > 0, detail: overlap > 0 ? 'Has relevant certifications' : 'Missing preferred certifications' };
    }
    case 'corporate_experience': {
      const wanted = item.value === true || item.value === 'true';
      const have = Boolean(freelancer.corporateExperience);
      const met = !wanted || have;
      return { score: met ? 100 : 28, met, detail: have ? 'Corporate experience' : 'No listed corporate experience' };
    }
    case 'travel':
    case 'employment_type':
    case 'client_type':
    case 'industry':
      return { score: 80, met: true, detail: 'Compatible' };
    default:
      return { score: 70, met: true, detail: 'Not scored' };
  }
}

export function scoreClientPreferences(
  items: PreferenceItem[],
  job: Job,
  freelancer: FreelancerProfile,
): { score: number; blocked: boolean; blockReasons: string[]; conflicts: MatchConflict[]; hits: string[]; misses: string[] } {
  const scored = items.filter((item) => item.importance !== 'not_important');
  if (scored.length === 0) {
    return { score: 80, blocked: false, blockReasons: [], conflicts: [], hits: [], misses: [] };
  }

  let weighted = 0;
  let weightSum = 0;
  const blockReasons: string[] = [];
  const conflicts: MatchConflict[] = [];
  const hits: string[] = [];
  const misses: string[] = [];

  for (const item of scored) {
    const result = evaluatePreference(item, job, freelancer);
    const weight = IMPORTANCE_WEIGHT[item.importance];
    const adjusted =
      result.met || item.flexibility === 'flexible'
        ? result.score
        : item.importance === 'must_have'
          ? 0
          : result.score * 0.45;
    weighted += adjusted * weight;
    weightSum += weight;

    if (result.met) hits.push(item.label);
    else {
      misses.push(item.label);
      if (item.importance === 'must_have' || item.importance === 'preferred') {
        conflicts.push({ field: item.field, label: item.label, detail: result.detail });
      }
      if (item.importance === 'must_have' && item.flexibility === 'fixed' && !result.met) {
        blockReasons.push(result.detail);
      }
    }
  }

  return {
    score: roundScore(weightSum > 0 ? weighted / weightSum : 80),
    blocked: blockReasons.length > 0,
    blockReasons,
    conflicts,
    hits,
    misses,
  };
}

export function scoreFreelancerPreferences(
  profile: FreelancerPreferenceProfile | null | undefined,
  job: Job,
  freelancer: FreelancerProfile,
): number {
  if (!profile) {
    const place = CITY_ALIASES[normalizeToken(job.location)] ?? { city: job.location, province: job.province };
    const sameCity = place && normalizeToken(freelancer.location) === normalizeToken(place.city);
    if (job.category === freelancer.category && sameCity) return 92;
    if (job.category === freelancer.category) return 74;
    return 48;
  }

  let parts: number[] = [];
  if (profile.services.length) {
    parts.push(profile.services.includes(job.category) ? 100 : 20);
  }
  if (profile.preferredLocations.length) {
    const jobPlace = normalizeToken(job.location);
    const hit = profile.preferredLocations.some((loc) => normalizeToken(loc) === jobPlace);
    parts.push(hit || job.remoteOk ? 100 : 22);
  }
  if (profile.minMonthlyRate != null && job.budgetMax != null) {
    parts.push(job.budgetMax >= profile.minMonthlyRate ? 100 : job.budgetMax >= profile.minMonthlyRate * 0.85 ? 55 : 18);
  }
  if (profile.languages.length && job.languages.length) {
    parts.push(roundScore(tokensOverlap(job.languages, profile.languages) * 100));
  }
  if (profile.preferredClients === 'corporate' && !job.clientName.toLowerCase().includes('co') && !job.clientName.toLowerCase().includes('ltd')) {
    parts.push(60);
  } else if (profile.preferredClients) {
    parts.push(92);
  }
  if (!parts.length) return 80;
  return roundScore(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function applyGate(score: number, blocked: boolean): number {
  if (!blocked) return clampScore(score);
  return Math.min(roundScore(score), BLOCKED_SCORE_CAP);
}

export function emptyClientProfile(): ClientPreferenceProfile {
  return {
    id: 'client-pref-default',
    kind: 'individual',
    name: 'My freelancer preferences',
    serviceCategories: [],
    items: [],
    learnedHints: [],
  };
}

export function emptyFreelancerProfile(freelancerId: string): FreelancerPreferenceProfile {
  return {
    freelancerId,
    services: [],
    preferredLocations: [],
    minDailyRate: null,
    minMonthlyRate: null,
    employmentTypes: ['contract', 'one_off'],
    availability: 'available_now',
    preferredClients: 'both',
    preferredIndustries: [],
    languages: [],
    travelKm: 30,
  };
}

export function defaultClientPreferenceItems(location = 'Bangkok'): PreferenceItem[] {
  return [
    pref('pref-skills', 'skills', [] as string[], 'must_have', 'fixed', 'user', 'Skills'),
    pref('pref-location', 'location', location, 'must_have', 'fixed', 'user', 'Location'),
    pref('pref-experience', 'experience', '3+', 'preferred', 'flexible', 'user', 'Experience'),
    pref('pref-languages', 'languages', ['English'], 'preferred', 'flexible', 'user', 'Languages'),
    pref('pref-rating', 'rating', 4.5, 'nice_to_have', 'flexible', 'user', 'Rating'),
    pref('pref-availability', 'availability', 'available_now', 'preferred', 'flexible', 'user', 'Availability'),
    pref('pref-verified', 'verified', true, 'nice_to_have', 'flexible', 'user', 'Verified status'),
  ];
}
