import Fuse from 'fuse.js';

import { serviceCatalog, type ServiceItem } from './services.data';

export type SearchableService = ServiceItem & {
  /** Derived tokens for fuzzy matching (slug parts, benefits, aliases) */
  keywords: string;
};

const SEARCH_ALIASES: Record<string, string[]> = {
  'marriage-registration': ['wedding', 'marry', 'spouse', 'amphur', 'district office'],
  'translation-services': ['translate', 'certified', 'document', 'thai english'],
  'basic-translation-fixed-price': ['fixed price', 'per page', 'simple translation'],
  'driver-license': ['driving', 'dlt', 'motorcycle', 'car license', 'idp'],
  'visa-services': ['immigration', 'extension', 'retirement', 'tourist visa', 'work permit'],
  'police-clearance': ['background check', 'criminal record', 'certificate'],
  'vehicle-registration': ['car registration', 'motorbike', 'dlt', 'tax renewal'],
  'car-motorbike-finding-selling': ['buy car', 'sell car', 'motorbike', 'vehicle search'],
  'construction-handyman': ['repair', 'renovation', 'contractor', 'plumber', 'electrician'],
  'private-driver-service': ['chauffeur', 'driver hire', 'personal driver'],
  'transportation-services': ['airport transfer', 'taxi', 'van', 'shuttle'],
  'event-planning-venue-services': ['event', 'venue', 'party', 'corporate', 'celebration', 'red door'],
};

function buildKeywords(item: ServiceItem): string {
  const slugTokens = item.slug.replace(/-/g, ' ');
  const benefitTokens = item.benefits.join(' ');
  const aliasTokens = (SEARCH_ALIASES[item.slug] ?? []).join(' ');
  return [slugTokens, benefitTokens, aliasTokens].filter(Boolean).join(' ');
}

export const searchableServices: SearchableService[] = serviceCatalog.map((item) => ({
  ...item,
  keywords: buildKeywords(item),
}));

const fuseIndex = new Fuse(searchableServices, {
  keys: [
    { name: 'title', weight: 0.2 },
    { name: 'titleEn', weight: 0.2 },
    { name: 'titleTh', weight: 0.2 },
    { name: 'shortTitleEn', weight: 0.15 },
    { name: 'shortTitleTh', weight: 0.15 },
    { name: 'shortDescription', weight: 0.12 },
    { name: 'descriptionEn', weight: 0.1 },
    { name: 'descriptionTh', weight: 0.1 },
    { name: 'fullDescription', weight: 0.08 },
    { name: 'category', weight: 0.05 },
    { name: 'keywords', weight: 0.15 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
});

export type FuzzySearchHit = {
  item: SearchableService;
  /** Fuse score — 0 is a perfect match, 1 is no match */
  score: number;
};

/** Score at or below this value is treated as a high-confidence voice intent */
export const VOICE_DIRECT_MATCH_SCORE = 0.15;

/** Minimum gap between top two scores to treat the top match as unambiguous */
export const VOICE_DIRECT_MATCH_GAP = 0.1;

export function fuzzySearchServicesWithScores(query: string, limit = 8): FuzzySearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return searchableServices.map((item) => ({ item, score: 0 }));
  }
  return fuseIndex.search(trimmed, { limit }).map((result) => ({
    item: result.item,
    score: result.score ?? 1,
  }));
}

export function fuzzySearchServices(query: string): SearchableService[] {
  return fuzzySearchServicesWithScores(query).map((hit) => hit.item);
}

export type VoiceIntentDirect = {
  type: 'direct';
  service: SearchableService;
  score: number;
  transcript: string;
};

export type VoiceIntentAmbiguous = {
  type: 'ambiguous';
  transcript: string;
  results: FuzzySearchHit[];
};

export type VoiceIntentEmpty = {
  type: 'empty';
  transcript: string;
};

export type VoiceIntent = VoiceIntentDirect | VoiceIntentAmbiguous | VoiceIntentEmpty;

function isHighConfidenceDirectMatch(top: FuzzySearchHit, second: FuzzySearchHit | undefined): boolean {
  if (top.score <= 0.06) {
    return true;
  }
  if (top.score > VOICE_DIRECT_MATCH_SCORE) {
    return false;
  }
  if (!second) {
    return top.score <= 0.1;
  }
  return second.score - top.score >= VOICE_DIRECT_MATCH_GAP;
}

/** Classify a voice transcript for intent-based navigation vs in-sheet results */
export function resolveVoiceIntent(transcript: string): VoiceIntent {
  const trimmed = transcript.trim();
  if (trimmed.length === 0) {
    return { type: 'empty', transcript: trimmed };
  }

  const hits = fuzzySearchServicesWithScores(trimmed, 5);
  if (hits.length === 0) {
    return { type: 'empty', transcript: trimmed };
  }

  const [top, second] = hits;
  if (isHighConfidenceDirectMatch(top, second)) {
    return { type: 'direct', service: top.item, score: top.score, transcript: trimmed };
  }

  return { type: 'ambiguous', transcript: trimmed, results: hits };
}
