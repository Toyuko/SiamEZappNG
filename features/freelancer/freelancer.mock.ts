import type { FreelancerDashboard } from './freelancer.types';

const now = Date.now();

export const mockFreelancerDashboard: FreelancerDashboard = {
  profile: {
    verificationStatus: 'verified',
    averageRating: 4.8,
    skills: ['Translation', 'Visa support'],
    bio: null,
  },
  revenue: {
    totalEarned: 450_000,
    pendingClearance: 280_000,
    currency: 'THB',
  },
  openJobs: [
    {
      id: 'job-open-1',
      title: 'Company registration documents',
      description: 'Prepare and file registration paperwork for a Bangkok SME.',
      amount: 850_000,
      currency: 'THB',
      status: 'open',
      completionSubmittedAt: null,
      createdAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 86400000).toISOString(),
      postedBy: { id: 'c1', name: 'SiamEZ Corp', email: 'ops@example.com' },
      freelancer: null,
    },
  ],
  activeJobs: [
    {
      id: 'job-102',
      title: 'Document translation (Thai → English)',
      description: 'Certified translation for visa application.',
      amount: 280_000,
      currency: 'THB',
      status: 'completed',
      completionSubmittedAt: new Date(now - 25 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 86400000 * 3).toISOString(),
      updatedAt: new Date(now - 25 * 60 * 1000).toISOString(),
      postedBy: { id: 'c2', name: 'James D.', email: 'james@example.com' },
      freelancer: { id: 'f1', name: 'Freelancer', email: 'freelancer@example.com' },
    },
    {
      id: 'job-101',
      title: 'Marriage registration support',
      description: 'Assist with marriage registration at district office.',
      amount: 450_000,
      currency: 'THB',
      status: 'in_progress',
      completionSubmittedAt: null,
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
      postedBy: { id: 'c3', name: 'Sarah M.', email: 'sarah@example.com' },
      freelancer: { id: 'f1', name: 'Freelancer', email: 'freelancer@example.com' },
    },
  ],
};

export function getMockJobById(id: string) {
  const all = [...mockFreelancerDashboard.openJobs, ...mockFreelancerDashboard.activeJobs];
  return all.find((job) => job.id === id);
}
