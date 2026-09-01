/**
 * SiamEZ Smart Match — domain types.
 * Ranking never uses protected characteristics (age, gender, appearance, etc.).
 */

export type ServiceCategoryId =
  | 'vehicle_registration'
  | 'motorbike_mechanic'
  | 'thai_license'
  | 'driver'
  | 'construction'
  | 'visa'
  | 'legal'
  | 'interpreter'
  | 'fitness'
  | 'boxing'
  | 'translator'
  | 'electrician'
  | 'plumber'
  | 'graphic_designer'
  | 'web_developer'
  | 'marketing'
  | 'cleaner';

export type AvailabilityStatus = 'available_now' | 'today' | 'this_week' | 'busy' | 'unavailable';

export type JobUrgency = 'asap' | 'today' | 'this_week' | 'specific_date' | 'flexible';

export type LocationMode = 'onsite' | 'remote' | 'hybrid';

export type ExperienceLevel = 'any' | '1+' | '3+' | '5+' | 'expert';

export type MatchActionKind = 'pending' | 'liked' | 'passed' | 'super_liked';

export type MatchStatus = 'pending' | 'liked' | 'passed' | 'matched' | 'expired';

export type DemoRole = 'client' | 'freelancer';

export type ScoreBreakdown = {
  skills: number;
  location: number;
  experience: number;
  availability: number;
  budget: number;
  rating: number;
  language: number;
};

export type MatchScoreResult = {
  score: number;
  confidence: number;
  reasons: string[];
  breakdown: ScoreBreakdown;
  summary: string;
};

export type FreelancerReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
};

export type FreelancerProfile = {
  id: string;
  userId: string;
  name: string;
  profilePhoto: string | null;
  verified: boolean;
  category: ServiceCategoryId;
  skills: string[];
  location: string;
  province: string;
  yearsExperience: number;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  monthlyRate: number;
  availability: AvailabilityStatus;
  languages: string[];
  certifications: string[];
  responseRate: number;
  bio: string;
  preferredJobTypes: string[];
  remoteOk: boolean;
  reviews: FreelancerReview[];
  portfolio: PortfolioItem[];
  responseTime: string;
  /** Demo: auto-accept client likes at or above this score. */
  autoAcceptThreshold: number;
};

export type Job = {
  id: string;
  clientId: string;
  clientName: string;
  category: ServiceCategoryId;
  title: string;
  description: string;
  location: string;
  province: string;
  locationMode: LocationMode;
  budgetMin: number | null;
  budgetMax: number | null;
  urgency: JobUrgency;
  specificDate: string | null;
  requiredSkills: string[];
  experienceRequired: ExperienceLevel;
  languages: string[];
  remoteOk: boolean;
  status: 'open' | 'matched' | 'closed';
  createdAt: string;
  sourceText?: string;
};

export type MatchRecord = {
  id: string;
  jobId: string;
  freelancerId: string;
  score: number;
  confidence: number;
  reasons: string[];
  scoreBreakdown: ScoreBreakdown;
  summary: string;
  clientAction: MatchActionKind;
  freelancerAction: MatchActionKind;
  status: MatchStatus;
  createdAt: string;
  matchedAt: string | null;
};

export type RankedMatch = {
  freelancer: FreelancerProfile;
  job: Job;
  result: MatchScoreResult;
  match: MatchRecord;
};

export type ParsedJob = {
  category: ServiceCategoryId | null;
  location: string | null;
  province: string | null;
  vehicle: string | null;
  urgency: JobUrgency | null;
  specificDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  languages: string[];
  experienceRequired: ExperienceLevel | null;
  locationMode: LocationMode;
  title: string | null;
  description: string;
  confidence: number;
  notes: string[];
};

export type JobDraft = {
  category: ServiceCategoryId | null;
  location: string;
  province: string;
  locationMode: LocationMode;
  urgency: JobUrgency;
  specificDate: string;
  budgetMin: string;
  budgetMax: string;
  experienceRequired: ExperienceLevel;
  description: string;
  requiredSkills: string[];
  languages: string[];
  remoteOk: boolean;
  sourceText: string;
};

export type MatchFilters = {
  location: string;
  category: ServiceCategoryId | 'all';
  minExperience: ExperienceLevel;
  availability: AvailabilityStatus | 'any';
  maxBudget: number | null;
  minRating: number | null;
  language: string;
  verifiedOnly: boolean;
  locationMode: LocationMode | 'any';
};

export type ChatMessage = {
  id: string;
  matchId: string;
  sender: 'client' | 'freelancer' | 'system';
  text: string;
  createdAt: string;
};

export type DemoBooking = {
  id: string;
  matchId: string;
  jobId: string;
  freelancerId: string;
  status: 'requested' | 'confirmed';
  createdAt: string;
};

export type CelebrationPayload = {
  matchId: string;
  freelancerName: string;
  freelancerPhoto: string | null;
  category: ServiceCategoryId;
  score: number;
  jobTitle: string;
};

export type ScoringOptions = {
  /** Deterministic ±1.5 jitter so similar jobs do not always rank identically. */
  jitter?: boolean;
};

export type MatchExplanation = {
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  summary: string;
};

export interface MatchingProvider {
  parseJob(description: string): ParsedJob;
  matchJob(job: Job, freelancers: FreelancerProfile[], options?: ScoringOptions): RankedMatch[];
  matchFreelancer(freelancer: FreelancerProfile, jobs: Job[], options?: ScoringOptions): RankedMatch[];
  explainMatch(job: Job, freelancer: FreelancerProfile, options?: ScoringOptions): MatchExplanation;
  calculateScore(job: Job, freelancer: FreelancerProfile, options?: ScoringOptions): MatchScoreResult;
}
