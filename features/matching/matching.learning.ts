import { pref } from './matching.preferences';
import type { ClientPreferenceProfile, FreelancerProfile, LearnedHint } from './matching.types';

function alreadyHas(profile: ClientPreferenceProfile, field: LearnedHint['suggested']['field']): boolean {
  return profile.items.some((item) => item.field === field) || profile.learnedHints.some((hint) => hint.suggested.field === field);
}

/**
 * Simulated preference learning. Never silently mutates hiring criteria —
 * only appends unconfirmed hints the user can accept.
 */
export function learnFromLikes(profile: ClientPreferenceProfile, liked: FreelancerProfile[]): ClientPreferenceProfile {
  if (liked.length < 2) return profile;
  const hints: LearnedHint[] = [...profile.learnedHints];

  const englishShare = liked.filter((item) => item.languages.some((lang) => lang.toLowerCase() === 'english')).length / liked.length;
  const bangkokShare = liked.filter((item) => item.location.toLowerCase() === 'bangkok').length / liked.length;
  const ratingShare = liked.filter((item) => item.rating >= 4.8).length / liked.length;
  const seniorShare = liked.filter((item) => item.yearsExperience >= 5).length / liked.length;

  if (englishShare >= 0.7 && bangkokShare >= 0.7 && ratingShare >= 0.7 && seniorShare >= 0.7 && !alreadyHas(profile, 'languages')) {
    hints.push({
      id: 'learned-en-bkk-senior',
      text: 'We noticed you often prefer highly experienced English-speaking freelancers in Bangkok.',
      evidence: `${liked.length} recent likes shared English, Bangkok, 4.8+ rating, and 5+ years.`,
      confirmed: false,
      suggested: pref('learned-en', 'languages', ['English'], 'preferred', 'flexible', 'learned', 'English speaking'),
    });
  } else if (englishShare >= 0.8 && !alreadyHas(profile, 'languages')) {
    hints.push({
      id: 'learned-english',
      text: 'We noticed you often prefer English-speaking professionals.',
      evidence: `${Math.round(englishShare * 100)}% of recent likes speak English.`,
      confirmed: false,
      suggested: pref('learned-en', 'languages', ['English'], 'preferred', 'flexible', 'learned', 'English speaking'),
    });
  }

  const unique = hints.filter((hint, index) => hints.findIndex((item) => item.id === hint.id) === index);
  if (unique.length === profile.learnedHints.length) return profile;
  return { ...profile, learnedHints: unique };
}

export function confirmLearnedHint(profile: ClientPreferenceProfile, hintId: string): ClientPreferenceProfile {
  const hint = profile.learnedHints.find((item) => item.id === hintId);
  if (!hint) return profile;
  const items = profile.items.some((item) => item.field === hint.suggested.field)
    ? profile.items.map((item) => (item.field === hint.suggested.field ? { ...hint.suggested, id: item.id } : item))
    : [...profile.items, hint.suggested];
  return {
    ...profile,
    items,
    learnedHints: profile.learnedHints.map((item) => (item.id === hintId ? { ...item, confirmed: true } : item)),
  };
}
