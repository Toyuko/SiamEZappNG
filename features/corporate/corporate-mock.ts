import type {
  ApplicantDecisionInput,
  CorporateAdCampaign,
  CorporateDashboardData,
  CorporateJobPosting,
  PublicCompanyProfile,
  SubmitJobOpeningInput,
} from './corporate.types';

const now = Date.now();

let mockJobs: CorporateJobPosting[] = [
  {
    id: 'corp-job-1',
    title: 'Company registration documents',
    description: 'Prepare and file company registration paperwork with Amphur support.',
    status: 'OPEN',
    budget: 8500,
    currency: 'THB',
    skills: ['Legal', 'Thai paperwork', 'Translation'],
    deadline: new Date(now + 1000 * 60 * 60 * 24 * 14).toISOString(),
    location: 'Bangkok',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
    applicants: [
      {
        id: 'app-1',
        name: 'Anya Srisuk',
        avatarUrl: null,
        skills: ['Legal', 'Translation'],
        status: 'PENDING',
        appliedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      },
      {
        id: 'app-2',
        name: 'Marcus Chen',
        avatarUrl: null,
        skills: ['Thai paperwork', 'Admin'],
        status: 'PENDING',
        appliedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
  },
  {
    id: 'corp-job-2',
    title: 'Office fit-out coordination',
    description: 'Coordinate vendors for a small Sukhumvit office renovation.',
    status: 'IN_PROGRESS',
    budget: 22000,
    currency: 'THB',
    skills: ['Project management', 'Construction'],
    deadline: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString(),
    location: 'Bangkok',
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 10).toISOString(),
    applicants: [
      {
        id: 'app-3',
        name: 'Priya Patel',
        avatarUrl: null,
        skills: ['Project management', 'Construction'],
        status: 'HIRED',
        appliedAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
      },
    ],
  },
];

let mockCampaign: CorporateAdCampaign = {
  id: 'corp-ad-1',
  targetUrl: 'https://siam-ez.com',
  totalBudget: 15000,
  dailyLimit: 1500,
  spent: 4200,
  remaining: 10800,
  bannerUrl: null,
  status: 'ACTIVE',
};

const mockCompany = {
  id: 'corp-1',
  slug: 'kristie-ltd',
  name: 'Kristie Ltd.',
  description:
    'Kristie Ltd. delivers premium lifestyle concierge, corporate event planning, and expat support services across Thailand.',
  industry: 'Lifestyle & Concierge',
  location: 'Bangkok, Thailand',
  logoUrl: null,
  bannerUrl: null,
  verified: true,
  website: 'https://siam-ez.com',
};

function recomputeMetrics(): CorporateDashboardData['metrics'] {
  const activeJobs = mockJobs.filter((job) => job.status === 'OPEN' || job.status === 'IN_PROGRESS').length;
  const hiredFreelancers = mockJobs.reduce(
    (count, job) => count + job.applicants.filter((a) => a.status === 'HIRED').length,
    0,
  );
  return {
    activeJobs,
    appClicks: 1284,
    adImpressions: mockCampaign.spent > 0 ? 18640 : 0,
    hiredFreelancers,
  };
}

export function getCorporateMockDashboard(): CorporateDashboardData {
  return {
    metrics: recomputeMetrics(),
    recentJobs: mockJobs,
    activeCampaign: mockCampaign,
    company: mockCompany,
  };
}

export function getCorporateMockJobs(): CorporateJobPosting[] {
  return mockJobs;
}

export function mockSubmitJobOpening(input: SubmitJobOpeningInput): CorporateJobPosting {
  const job: CorporateJobPosting = {
    id: `corp-job-${Date.now()}`,
    title: input.title,
    description: input.description,
    status: 'OPEN',
    budget: input.budget,
    currency: input.currency ?? 'THB',
    skills: input.skills,
    deadline: input.deadline,
    location: input.location ?? null,
    createdAt: new Date().toISOString(),
    applicants: [],
  };
  mockJobs = [job, ...mockJobs];
  return job;
}

export function mockApplicantDecision(input: ApplicantDecisionInput): CorporateJobPosting {
  const job = mockJobs.find((item) => item.id === input.jobId);
  if (!job) {
    throw new Error('Job not found.');
  }
  job.applicants = job.applicants.map((applicant) => {
    if (applicant.id !== input.applicantId) {
      return applicant;
    }
    return {
      ...applicant,
      status: input.decision === 'HIRE' ? 'HIRED' : 'DECLINED',
    };
  });
  if (input.decision === 'HIRE') {
    job.status = 'IN_PROGRESS';
  }
  return job;
}

export function mockUploadAdCampaign(input: {
  targetUrl: string;
  totalBudget: number;
  dailyLimit: number;
  bannerUri?: string | null;
}): CorporateAdCampaign {
  mockCampaign = {
    id: `corp-ad-${Date.now()}`,
    targetUrl: input.targetUrl,
    totalBudget: input.totalBudget,
    dailyLimit: input.dailyLimit,
    spent: 0,
    remaining: input.totalBudget,
    bannerUrl: input.bannerUri ?? null,
    status: 'ACTIVE',
  };
  return mockCampaign;
}

export function getCorporateMockPublicProfile(companyIdOrSlug: string): PublicCompanyProfile | null {
  const match =
    mockCompany.id === companyIdOrSlug ||
    mockCompany.slug === companyIdOrSlug ||
    companyIdOrSlug === 'demo';
  if (!match) {
    return null;
  }
  return {
    ...mockCompany,
    openJobs: mockJobs.filter((job) => job.status === 'OPEN'),
  };
}
