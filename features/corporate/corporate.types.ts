export type CorporateJobStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'FILLED';

export type CorporateApplicantStatus = 'PENDING' | 'HIRED' | 'DECLINED';

export type CorporateApplicant = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  skills: string[];
  status: CorporateApplicantStatus;
  appliedAt: string;
};

export type CorporateJobPosting = {
  id: string;
  title: string;
  description: string;
  status: CorporateJobStatus;
  budget: number;
  currency: string;
  skills: string[];
  deadline: string;
  location?: string | null;
  applicants: CorporateApplicant[];
  createdAt: string;
};

export type CorporateDashboardMetrics = {
  activeJobs: number;
  appClicks: number;
  adImpressions: number;
  hiredFreelancers: number;
};

export type CorporateAdCampaign = {
  id: string;
  targetUrl: string;
  totalBudget: number;
  dailyLimit: number;
  spent: number;
  remaining: number;
  bannerUrl?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
};

export type CorporateCompanyProfile = {
  id: string;
  slug: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  verified: boolean;
  website?: string | null;
};

export type CorporateDashboardData = {
  metrics: CorporateDashboardMetrics;
  recentJobs: CorporateJobPosting[];
  activeCampaign?: CorporateAdCampaign | null;
  company: CorporateCompanyProfile;
};

export type SubmitJobOpeningInput = {
  title: string;
  description: string;
  budget: number;
  currency?: string;
  skills: string[];
  deadline: string;
  location?: string;
};

export type ApplicantDecisionInput = {
  jobId: string;
  applicantId: string;
  decision: 'HIRE' | 'DECLINE';
};

export type PublicCompanyProfile = CorporateCompanyProfile & {
  openJobs: CorporateJobPosting[];
};
