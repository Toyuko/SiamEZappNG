import type { FreelancerDashboard, FreelancerJob } from './freelancer.types';
import { mockFreelancerDashboard } from './freelancer.mock';

function cloneDashboard(source: FreelancerDashboard): FreelancerDashboard {
  return JSON.parse(JSON.stringify(source)) as FreelancerDashboard;
}

let runtimeDashboard = cloneDashboard(mockFreelancerDashboard);

export function resetFreelancerMockRuntime() {
  runtimeDashboard = cloneDashboard(mockFreelancerDashboard);
}

export function getFreelancerMockDashboard() {
  return runtimeDashboard;
}

export function getFreelancerMockJobById(id: string) {
  const all = [...runtimeDashboard.openJobs, ...runtimeDashboard.activeJobs];
  return all.find((job) => job.id === id);
}

export function mockAcceptFreelancerJob(jobId: string) {
  const index = runtimeDashboard.openJobs.findIndex((job) => job.id === jobId);
  if (index < 0) {
    return false;
  }
  const [job] = runtimeDashboard.openJobs.splice(index, 1);
  const accepted: FreelancerJob = {
    ...job,
    status: 'in_progress',
    freelancer: job.freelancer ?? {
      id: 'mock-freelancer',
      name: 'Demo Freelancer',
      email: 'freelancer@example.com',
    },
    updatedAt: new Date().toISOString(),
  };
  runtimeDashboard.activeJobs.unshift(accepted);
  return true;
}

export function mockCompleteFreelancerJob(jobId: string) {
  const job = runtimeDashboard.activeJobs.find((item) => item.id === jobId);
  if (!job || job.status !== 'in_progress') {
    return null;
  }
  const completionSubmittedAt = new Date().toISOString();
  job.status = 'completed';
  job.completionSubmittedAt = completionSubmittedAt;
  job.updatedAt = completionSubmittedAt;
  return { ok: true as const, completionSubmittedAt };
}
