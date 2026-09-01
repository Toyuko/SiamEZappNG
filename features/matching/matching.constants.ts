import type {
  AvailabilityStatus,
  ExperienceLevel,
  JobUrgency,
  PreferenceItem,
  ServiceCategoryId,
} from './matching.types';

/** Published two-sided match formula (spec §10). */
export const MATCH_SCORE_WEIGHTS = {
  jobFit: 0.4,
  clientPreference: 0.2,
  freelancerPreference: 0.15,
  location: 0.1,
  availability: 0.05,
  price: 0.05,
  reputation: 0.05,
} as const;

/** Legacy dimension mix used inside job-fit / reputation. */
export const SCORE_WEIGHTS = {
  skills: 0.35,
  location: 0.2,
  experience: 0.15,
  availability: 0.1,
  budget: 0.1,
  rating: 0.05,
  language: 0.05,
} as const;

export const IMPORTANCE_WEIGHT: Record<'must_have' | 'preferred' | 'nice_to_have' | 'not_important', number> = {
  must_have: 1,
  preferred: 0.65,
  nice_to_have: 0.32,
  not_important: 0,
};

export const BLOCKED_SCORE_CAP = 52;

export const STRONG_MATCH_MIN = 60;

export const CATEGORY_LABELS: Record<ServiceCategoryId, string> = {
  vehicle_registration: 'Vehicle Registration Staff',
  motorbike_mechanic: 'Motorbike Mechanic',
  thai_license: 'Thai License Staff',
  driver: 'Driver',
  construction: 'Construction Staff',
  visa: 'Visa Staff',
  legal: 'Legal Staff',
  interpreter: 'Interpreter',
  fitness: 'Fitness Instructor',
  boxing: 'Boxing Coach',
  translator: 'Translator',
  electrician: 'Electrician',
  plumber: 'Plumber',
  graphic_designer: 'Graphic Designer',
  web_developer: 'Web Developer',
  marketing: 'Marketing',
  cleaner: 'Cleaner',
};

export const CATEGORY_ORDER: ServiceCategoryId[] = [
  'vehicle_registration',
  'motorbike_mechanic',
  'thai_license',
  'driver',
  'construction',
  'visa',
  'legal',
  'interpreter',
  'fitness',
  'boxing',
  'translator',
  'electrician',
  'plumber',
  'graphic_designer',
  'web_developer',
  'marketing',
  'cleaner',
];

export const RELATED_CATEGORIES: Partial<Record<ServiceCategoryId, ServiceCategoryId[]>> = {
  interpreter: ['translator'],
  translator: ['interpreter'],
  electrician: ['construction', 'plumber'],
  plumber: ['construction', 'electrician'],
  construction: ['electrician', 'plumber'],
  motorbike_mechanic: [],
  visa: ['legal', 'translator'],
  legal: ['visa'],
};

export const EXPERIENCE_YEARS: Record<ExperienceLevel, number> = {
  any: 0,
  '1+': 1,
  '3+': 3,
  '5+': 5,
  expert: 8,
};

export const URGENCY_LABELS: Record<JobUrgency, string> = {
  asap: 'ASAP',
  today: 'Today',
  this_week: 'This week',
  specific_date: 'Specific date',
  flexible: 'Flexible',
};

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available_now: 'Available now',
  today: 'Available today',
  this_week: 'Available this week',
  busy: 'Limited availability',
  unavailable: 'Unavailable',
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  any: 'Any experience',
  '1+': '1+ years',
  '3+': '3+ years',
  '5+': '5+ years',
  expert: 'Expert (8+ years)',
};

export const IMPORTANCE_LABELS = {
  must_have: 'Must have',
  preferred: 'Preferred',
  nice_to_have: 'Nice to have',
  not_important: 'Not important',
} as const;

export const FLEXIBILITY_LABELS = {
  fixed: 'Not flexible',
  flexible: 'Flexible',
} as const;

export const PIPELINE_STAGES = ['discovered', 'shortlisted', 'contacted', 'interview', 'offer', 'hired'] as const;

export const PIPELINE_LABELS: Record<(typeof PIPELINE_STAGES)[number] | 'rejected', string> = {
  discovered: 'Discovered',
  shortlisted: 'Shortlisted',
  contacted: 'Contacted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export const EMPLOYMENT_LABELS = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  one_off: 'One-off jobs',
} as const;

export const CITY_ALIASES: Record<string, { city: string; province: string }> = {
  bangkok: { city: 'Bangkok', province: 'Bangkok' },
  'krung thep': { city: 'Bangkok', province: 'Bangkok' },
  krungthep: { city: 'Bangkok', province: 'Bangkok' },
  'chiang mai': { city: 'Chiang Mai', province: 'Chiang Mai' },
  chiangmai: { city: 'Chiang Mai', province: 'Chiang Mai' },
  phuket: { city: 'Phuket', province: 'Phuket' },
  pattaya: { city: 'Pattaya', province: 'Chonburi' },
  chonburi: { city: 'Chonburi', province: 'Chonburi' },
  'nonthaburi': { city: 'Nonthaburi', province: 'Nonthaburi' },
  'hat yai': { city: 'Hat Yai', province: 'Songkhla' },
};

export const DEFAULT_FILTERS = {
  location: '',
  category: 'all' as const,
  minExperience: 'any' as const,
  availability: 'any' as const,
  maxBudget: null,
  minRating: null,
  language: '',
  verifiedOnly: false,
  locationMode: 'any' as const,
};

export const DEMO_CLIENT = {
  id: 'demo-client',
  name: 'Alex Chen',
};

export const EMPTY_JOB_DRAFT = {
  category: null,
  location: 'Bangkok',
  province: 'Bangkok',
  locationMode: 'onsite' as const,
  urgency: 'asap' as const,
  specificDate: '',
  budgetMin: '',
  budgetMax: '',
  experienceRequired: 'any' as const,
  description: '',
  requiredSkills: [] as string[],
  languages: ['English', 'Thai'],
  remoteOk: false,
  sourceText: '',
  preferences: [] as PreferenceItem[],
  hiringProfileId: null as string | null,
};
