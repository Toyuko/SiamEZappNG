/** Matches Prisma `JobStatus` on SiamEZ web. */
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'approved';

export type FreelancerVerificationStatus = 'pending' | 'verified' | 'rejected';

export type JobPostedBy = {
  id: string;
  name: string | null;
  email: string;
};

export type FreelancerJob = {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: JobStatus;
  completionSubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  postedBy: JobPostedBy;
  freelancer?: { id: string; name: string | null; email: string } | null;
};

export type FreelancerProfileSummary = {
  verificationStatus: FreelancerVerificationStatus;
  averageRating: number;
  skills: string[];
  bio: string | null;
};

export type FreelancerRevenue = {
  totalEarned: number;
  pendingClearance: number;
  currency: string;
};

export type FreelancerDashboard = {
  profile: FreelancerProfileSummary | null;
  revenue: FreelancerRevenue;
  openJobs: FreelancerJob[];
  activeJobs: FreelancerJob[];
};

export type MarkJobCompleteResponse = {
  ok: boolean;
  completionSubmittedAt: string;
};
