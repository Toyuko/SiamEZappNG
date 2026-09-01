import { CATEGORY_LABELS, CITY_ALIASES } from './matching.constants';
import type { ExperienceLevel, JobUrgency, LocationMode, ParsedJob, ServiceCategoryId } from './matching.types';
import { normalizeToken } from './matching.scoring';

const CATEGORY_KEYWORDS: { category: ServiceCategoryId; keywords: string[] }[] = [
  { category: 'motorbike_mechanic', keywords: ['vespa', 'motorbike', 'motorcycle', 'bike mechanic', 'scooter', 'yamaha', 'honda wave', 'gts'] },
  { category: 'vehicle_registration', keywords: ['vehicle registration', 'register my car', 'register a vehicle', 'blue book', 'tabien'] },
  { category: 'thai_license', keywords: ['thai license', 'driver license', 'driving licence', 'license staff'] },
  { category: 'driver', keywords: ['driver', 'chauffeur', 'full time driver', 'personal driver'] },
  { category: 'construction', keywords: ['construction', 'builder', 'site worker', 'foreman', 'renovation crew'] },
  { category: 'visa', keywords: ['visa', 'immigration', 'work permit', 'non-b', 'non b'] },
  { category: 'legal', keywords: ['lawyer', 'legal', 'attorney', 'contract review', 'notary'] },
  { category: 'interpreter', keywords: ['interpreter', 'interpreting', 'simultaneous', 'consecutive interpreting'] },
  { category: 'translator', keywords: ['translator', 'translation', 'translate'] },
  { category: 'fitness', keywords: ['fitness', 'personal trainer', 'gym', 'workout'] },
  { category: 'boxing', keywords: ['boxing', 'muay thai', 'boxer', 'pad work'] },
  { category: 'electrician', keywords: ['electrician', 'electrical', 'wiring', 'circuit'] },
  { category: 'plumber', keywords: ['plumber', 'plumbing', 'pipe leak', 'drain'] },
  { category: 'graphic_designer', keywords: ['graphic design', 'designer', 'logo', 'branding'] },
  { category: 'web_developer', keywords: ['web developer', 'website', 'frontend', 'fullstack', 'react'] },
  { category: 'marketing', keywords: ['marketing', 'social media manager', 'ads'] },
  { category: 'cleaner', keywords: ['cleaner', 'cleaning', 'housekeeper', 'maid'] },
];

const SKILL_KEYWORDS: { skill: string; keywords: string[] }[] = [
  { skill: 'Vespa', keywords: ['vespa', 'piaggio', 'gts'] },
  { skill: 'European motorcycles', keywords: ['european motorcycle', 'ducati', 'bmw motorrad', 'triumph'] },
  { skill: 'Motorcycle repair', keywords: ['motorcycle', 'motorbike', 'scooter repair', 'bike service'] },
  { skill: 'English', keywords: ['english'] },
  { skill: 'Thai', keywords: ['thai'] },
  { skill: 'Chinese', keywords: ['chinese', 'mandarin'] },
  { skill: 'Japanese bikes', keywords: ['yamaha', 'honda', 'kawasaki', 'suzuki'] },
];

const LANGUAGE_KEYWORDS: { language: string; keywords: string[] }[] = [
  { language: 'English', keywords: ['english', 'en/th', 'thai-english', 'english/thai'] },
  { language: 'Thai', keywords: ['thai', 'en/th', 'thai-english', 'english/thai'] },
  { language: 'Chinese', keywords: ['chinese', 'mandarin'] },
  { language: 'Japanese', keywords: ['japanese'] },
  { language: 'French', keywords: ['french'] },
];

function includesPhrase(text: string, phrase: string): boolean {
  return text.includes(normalizeToken(phrase));
}

function extractCategory(text: string): ServiceCategoryId | null {
  let best: { category: ServiceCategoryId; len: number } | null = null;
  for (const row of CATEGORY_KEYWORDS) {
    for (const keyword of row.keywords) {
      if (includesPhrase(text, keyword) && (!best || keyword.length > best.len)) {
        best = { category: row.category, len: keyword.length };
      }
    }
  }
  return best?.category ?? null;
}

function extractLocation(text: string): { city: string; province: string } | null {
  const keys = Object.keys(CITY_ALIASES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (text.includes(key)) return CITY_ALIASES[key];
  }
  return null;
}

function extractBudget(text: string): { min: number | null; max: number | null } {
  const range = text.match(/฿?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:-|to|–)\s*฿?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/);
  if (range) {
    return { min: Number(range[1].replace(/,/g, '')), max: Number(range[2].replace(/,/g, '')) };
  }
  const around = text.match(/(?:around|about|budget(?: of)?|pay(?: around)?|can pay)\s*฿?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/);
  if (around) {
    const value = Number(around[1].replace(/,/g, ''));
    return { min: Math.round(value * 0.8), max: value };
  }
  const single = text.match(/฿\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/);
  if (single) {
    const value = Number(single[1].replace(/,/g, ''));
    return { min: Math.round(value * 0.8), max: value };
  }
  return { min: null, max: null };
}

function extractUrgency(text: string): { urgency: JobUrgency; specificDate: string | null } {
  if (/\basap\b|immediately|right away|urgent/.test(text)) return { urgency: 'asap', specificDate: null };
  if (/\btomorrow\b/.test(text)) return { urgency: 'today', specificDate: 'Tomorrow' };
  if (/\btoday\b/.test(text)) return { urgency: 'today', specificDate: null };
  if (/\bthis week\b/.test(text)) return { urgency: 'this_week', specificDate: null };
  if (/\bfull[- ]?time\b|flexible/.test(text)) return { urgency: 'flexible', specificDate: null };
  return { urgency: 'asap', specificDate: null };
}

function extractExperience(text: string): ExperienceLevel | null {
  if (/\bexpert\b|senior/.test(text)) return 'expert';
  if (/\b5\+?\s*years?\b|five years/.test(text)) return '5+';
  if (/\b3\+?\s*years?\b|three years/.test(text)) return '3+';
  if (/\b1\+?\s*years?\b|one year/.test(text)) return '1+';
  return null;
}

function extractLocationMode(text: string): LocationMode {
  if (/\bremote\b|work from home/.test(text)) return 'remote';
  if (/\bhybrid\b/.test(text)) return 'hybrid';
  return 'onsite';
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = normalizeToken(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

/**
 * Local keyword/entity extraction. Swap this implementation for an LLM later
 * via MatchingProvider.parseJob without changing UI.
 */
export function parseJobDescription(text: string): ParsedJob {
  const raw = text.trim();
  const hay = normalizeToken(raw);
  const notes: string[] = [];

  const category = extractCategory(hay);
  const place = extractLocation(hay);
  const budget = extractBudget(raw.toLowerCase().replace(/baht/g, '฿'));
  const timing = extractUrgency(hay);
  const experienceRequired = extractExperience(hay);
  const locationMode = extractLocationMode(hay);

  const skills = unique(
    SKILL_KEYWORDS.filter((row) => row.keywords.some((keyword) => hay.includes(normalizeToken(keyword)))).map((row) => row.skill),
  );
  const languages = unique(
    LANGUAGE_KEYWORDS.filter((row) => row.keywords.some((keyword) => hay.includes(normalizeToken(keyword)))).map(
      (row) => row.language,
    ),
  );

  let vehicle: string | null = null;
  const vespa = raw.match(/vespa[^\s,.]*/i);
  if (vespa) vehicle = vespa[0];

  if (category) notes.push(`Category: ${CATEGORY_LABELS[category]}`);
  else notes.push('Could not detect a service category — please pick one.');
  if (place) notes.push(`Location: ${place.city}`);
  if (budget.max) notes.push(`Budget around ฿${budget.max.toLocaleString('en-US')}`);
  if (vehicle) notes.push(`Vehicle: ${vehicle}`);

  const signals = [category, place, budget.max, skills.length > 0].filter(Boolean).length;
  const confidence = Math.min(0.95, 0.35 + signals * 0.15);

  const title = category
    ? `${CATEGORY_LABELS[category]} needed${place ? ` in ${place.city}` : ''}`
    : raw.slice(0, 72) || 'New service request';

  if (!languages.length) {
    languages.push('English', 'Thai');
  }

  return {
    category,
    location: place?.city ?? null,
    province: place?.province ?? null,
    vehicle,
    urgency: timing.urgency,
    specificDate: timing.specificDate,
    budgetMin: budget.min,
    budgetMax: budget.max,
    skills,
    languages,
    experienceRequired,
    locationMode,
    title,
    description: raw,
    confidence,
    notes,
  };
}
