import { ApiError, api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

import { getMockJobById, mockFreelancerDashboard } from './freelancer.mock';
import type {
  FreelancerDashboard,
  FreelancerJob,
  MarkJobCompleteResponse,
} from './freelancer.types';

function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export async function getFreelancerDashboard() {
  try {
    const response = await api.get<FreelancerDashboard | ApiEnvelope<FreelancerDashboard>>(
      '/api/freelancer/dashboard',
    );
    return unwrapApiData<FreelancerDashboard>(response);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    return mockFreelancerDashboard;
  }
}

export async function getFreelancerJobById(id: string) {
  try {
    const response = await api.get<FreelancerJob | ApiEnvelope<FreelancerJob>>(
      `/api/freelancer/jobs/${encodeURIComponent(id)}`,
    );
    return unwrapApiData<FreelancerJob>(response);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    const mock = getMockJobById(id);
    if (!mock) {
      throw new ApiError('Job not found.', 404, null);
    }
    return mock;
  }
}

export async function acceptFreelancerJob(jobId: string) {
  try {
    const response = await api.post<{ ok: boolean } | ApiEnvelope<{ ok: boolean }>>(
      `/api/freelancer/jobs/${encodeURIComponent(jobId)}/accept`,
    );
    return unwrapApiData<{ ok: boolean }>(response);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    return { ok: true };
  }
}

export async function markFreelancerJobComplete(jobId: string) {
  try {
    const response = await api.post<MarkJobCompleteResponse | ApiEnvelope<MarkJobCompleteResponse>>(
      `/api/freelancer/jobs/${encodeURIComponent(jobId)}/complete`,
    );
    return unwrapApiData<MarkJobCompleteResponse>(response);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    return {
      ok: true,
      completionSubmittedAt: new Date().toISOString(),
    };
  }
}
