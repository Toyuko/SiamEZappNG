import { ApiError, api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

import { shouldFallbackToFreelancerMock } from './freelancer-dev';
import {
  getMockMyFreelancerProfile,
  getMockPublicFreelancerBySlug,
  getMockPublicFreelancers,
  mockUpdateMyFreelancerProfile,
} from './freelancer-profile.mock';
import type {
  FreelancerInquiryInput,
  FreelancerMeResponse,
  FreelancerOwnerProfile,
  FreelancerProfileUpdateInput,
  FreelancerPublicListFilters,
  FreelancerPublicListResult,
  FreelancerPublicProfile,
} from './freelancer-profile.types';

function buildListQuery(filters: FreelancerPublicListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.q?.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.skill?.trim()) {
    params.set('skill', filters.skill.trim());
  }
  if (filters.page != null) {
    params.set('page', String(filters.page));
  }
  if (filters.pageSize != null) {
    params.set('pageSize', String(filters.pageSize));
  }
  const qs = params.toString();
  return qs ? `/api/freelancers?${qs}` : '/api/freelancers';
}

export async function fetchMyFreelancerProfile() {
  try {
    const response = await api.get<FreelancerMeResponse | ApiEnvelope<FreelancerMeResponse>>(
      '/api/freelancer/me',
    );
    return unwrapApiData<FreelancerMeResponse>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    return getMockMyFreelancerProfile();
  }
}

export async function updateMyFreelancerProfile(data: FreelancerProfileUpdateInput) {
  try {
    const response = await api.put<
      { profile: FreelancerOwnerProfile } | ApiEnvelope<{ profile: FreelancerOwnerProfile }>
    >('/api/freelancer/me', data);
    return unwrapApiData<{ profile: FreelancerOwnerProfile }>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    return mockUpdateMyFreelancerProfile(data);
  }
}

export async function getPublicFreelancers(filters: FreelancerPublicListFilters = {}) {
  try {
    const response = await api.get<FreelancerPublicListResult | ApiEnvelope<FreelancerPublicListResult>>(
      buildListQuery(filters),
    );
    return unwrapApiData<FreelancerPublicListResult>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    return getMockPublicFreelancers(filters);
  }
}

export async function getPublicFreelancerBySlug(slug: string) {
  try {
    const response = await api.get<FreelancerPublicProfile | ApiEnvelope<FreelancerPublicProfile>>(
      `/api/freelancers/${encodeURIComponent(slug.trim().toLowerCase())}`,
    );
    return unwrapApiData<FreelancerPublicProfile>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    const mock = getMockPublicFreelancerBySlug(slug);
    if (!mock) {
      throw new ApiError('Not found', 404, null);
    }
    return mock;
  }
}

export async function sendFreelancerInquiry(input: FreelancerInquiryInput) {
  try {
    const response = await api.post<{ sent: boolean } | ApiEnvelope<{ sent: boolean }>>(
      '/api/freelancers/inquiry',
      input,
    );
    return unwrapApiData<{ sent: boolean }>(response);
  } catch (error) {
    if (!shouldFallbackToFreelancerMock(error)) {
      throw error;
    }
    return { sent: true };
  }
}
