import { EXPERIENCE_YEARS } from './matching.constants';
import { normalizeToken } from './matching.scoring';
import type { MatchFilters, RankedMatch } from './matching.types';

export function applyMatchFilters(items: RankedMatch[], filters: MatchFilters): RankedMatch[] {
  return items.filter(({ freelancer }) => {
    if (filters.category !== 'all' && freelancer.category !== filters.category) return false;

    if (filters.location.trim()) {
      const needle = normalizeToken(filters.location);
      const hay = `${normalizeToken(freelancer.location)} ${normalizeToken(freelancer.province)}`;
      if (!hay.includes(needle)) return false;
    }

    if (filters.minExperience !== 'any') {
      if (freelancer.yearsExperience < EXPERIENCE_YEARS[filters.minExperience]) return false;
    }

    if (filters.availability !== 'any' && freelancer.availability !== filters.availability) return false;

    if (filters.maxBudget != null && freelancer.monthlyRate > filters.maxBudget) return false;

    if (filters.minRating != null && freelancer.rating < filters.minRating) return false;

    if (filters.language.trim()) {
      const lang = normalizeToken(filters.language);
      const speaks = freelancer.languages.some((item) => normalizeToken(item).includes(lang));
      if (!speaks) return false;
    }

    if (filters.verifiedOnly && !freelancer.verified) return false;

    if (filters.locationMode === 'remote' && !freelancer.remoteOk) return false;
    if (filters.locationMode === 'onsite' && freelancer.remoteOk && filters.locationMode === 'onsite') {
      // On-site jobs still allow remote-capable people; they can travel.
    }

    return true;
  });
}

export function expansionHints(topScore: number | null): string[] {
  if (topScore != null && topScore >= 60) return [];
  return ['Expand your location', 'Increase your budget', 'Relax experience requirements'];
}
