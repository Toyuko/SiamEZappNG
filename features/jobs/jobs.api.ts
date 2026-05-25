import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import { toJobBoardFeedItem } from '../../lib/jobs/job-board-mapper';
import type { JobBoardFeedItem, OpenJobsResponse } from '../../types/job-board';
import { shouldFallbackToFreelancerMock } from '../freelancer/freelancer-dev';
import { getFreelancerMockDashboard } from '../freelancer/freelancer-mock-runtime';

/**
 * Loads open jobs for the freelancer job board.
 * Backend route: `GET /api/freelancer/jobs` (same contract as SiamEZwebNG).
 */
export async function getOpenJobs(): Promise<JobBoardFeedItem[]> {
  try {
    const response = await api.get<OpenJobsResponse | ApiEnvelope<OpenJobsResponse>>(
      '/api/freelancer/jobs',
    );
    const data = unwrapApiData<OpenJobsResponse>(response);
    return data.jobs;
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    return getFreelancerMockDashboard().openJobs.map(toJobBoardFeedItem);
  }
}
