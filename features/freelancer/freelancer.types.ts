import type { JobStatus, TrackingStatus } from '../../types/tracking';

export type { JobStatus, TrackingStatus };

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
  trackingStatus?: TrackingStatus | null;
  trackingNotes?: string | null;
  isCurrentlyInTransit?: boolean;
  completionSubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  service?: { id: string; slug: string; name: string } | null;
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
