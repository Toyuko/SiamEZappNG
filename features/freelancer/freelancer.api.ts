import { ApiError, api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

import { shouldFallbackToFreelancerMock } from './freelancer-dev';
import {
  getFreelancerMockDashboard,
  getFreelancerMockJobById,
  mockAcceptFreelancerJob,
  mockCompleteFreelancerJob,
} from './freelancer-mock-runtime';
import type {
  FreelancerDashboard,
  FreelancerJob,
  MarkJobCompleteResponse,
} from './freelancer.types';

export async function getFreelancerDashboard() {
  try {
    const response = await api.get<FreelancerDashboard | ApiEnvelope<FreelancerDashboard>>(
      '/api/freelancer/dashboard',
    );
    return unwrapApiData<FreelancerDashboard>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    return getFreelancerMockDashboard();
  }
}

export async function getFreelancerJobById(id: string) {
  try {
    const response = await api.get<FreelancerJob | ApiEnvelope<FreelancerJob>>(
      `/api/freelancer/jobs/${encodeURIComponent(id)}`,
    );
    return unwrapApiData<FreelancerJob>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    const mock = getFreelancerMockJobById(id);
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
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    if (!mockAcceptFreelancerJob(jobId)) {
      throw new ApiError('Job is no longer available.', 400, null);
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
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    const result = mockCompleteFreelancerJob(jobId);
    if (!result) {
      throw new ApiError('Only active jobs can be marked complete.', 400, null);
    }
    return result;
  }
}
