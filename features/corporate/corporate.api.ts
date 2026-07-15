import { ApiError, api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

import { shouldFallbackToCorporateMock } from './corporate-dev';
import {
  getCorporateMockDashboard,
  getCorporateMockJobs,
  getCorporateMockPublicProfile,
  mockApplicantDecision,
  mockSubmitJobOpening,
  mockUploadAdCampaign,
} from './corporate-mock';
import type {
  ApplicantDecisionInput,
  CorporateAdCampaign,
  CorporateDashboardData,
  CorporateJobPosting,
  PublicCompanyProfile,
  SubmitJobOpeningInput,
} from './corporate.types';

export async function fetchCorporateDashboardData() {
  try {
    const response = await api.get<CorporateDashboardData | ApiEnvelope<CorporateDashboardData>>(
      '/api/corporate/dashboard',
    );
    return unwrapApiData<CorporateDashboardData>(response);
  } catch (error) {
    if (!shouldFallbackToCorporateMock(error)) {
      throw error;
    }
    return getCorporateMockDashboard();
  }
}

export async function fetchCorporateJobs() {
  try {
    const response = await api.get<CorporateJobPosting[] | ApiEnvelope<CorporateJobPosting[]>>(
      '/api/corporate/jobs',
    );
    return unwrapApiData<CorporateJobPosting[]>(response);
  } catch (error) {
    if (!shouldFallbackToCorporateMock(error)) {
      throw error;
    }
    return getCorporateMockJobs();
  }
}

export async function submitJobOpening(data: SubmitJobOpeningInput) {
  try {
    const response = await api.post<CorporateJobPosting | ApiEnvelope<CorporateJobPosting>>(
      '/api/corporate/jobs',
      data,
    );
    return unwrapApiData<CorporateJobPosting>(response);
  } catch (error) {
    if (!shouldFallbackToCorporateMock(error)) {
      throw error;
    }
    return mockSubmitJobOpening(data);
  }
}

export async function decideCorporateApplicant(input: ApplicantDecisionInput) {
  try {
    const response = await api.post<CorporateJobPosting | ApiEnvelope<CorporateJobPosting>>(
      `/api/corporate/jobs/${encodeURIComponent(input.jobId)}/applicants/${encodeURIComponent(input.applicantId)}`,
      { decision: input.decision },
    );
    return unwrapApiData<CorporateJobPosting>(response);
  } catch (error) {
    if (!shouldFallbackToCorporateMock(error)) {
      throw error;
    }
    return mockApplicantDecision(input);
  }
}

export type UploadAdCampaignInput = {
  targetUrl: string;
  totalBudget: number;
  dailyLimit: number;
  bannerUri?: string | null;
  bannerName?: string;
  bannerMimeType?: string;
};

export async function uploadAdCampaignWithImage(input: UploadAdCampaignInput) {
  try {
    const form = new FormData();
    form.append('targetUrl', input.targetUrl);
    form.append('totalBudget', String(input.totalBudget));
    form.append('dailyLimit', String(input.dailyLimit));
    if (input.bannerUri) {
      form.append('banner', {
        uri: input.bannerUri,
        name: input.bannerName ?? 'banner.jpg',
        type: input.bannerMimeType ?? 'image/jpeg',
      } as unknown as Blob);
    }
    const response = await api.post<CorporateAdCampaign | ApiEnvelope<CorporateAdCampaign>>(
      '/api/corporate/ads',
      form,
    );
    return unwrapApiData<CorporateAdCampaign>(response);
  } catch (error) {
    if (!shouldFallbackToCorporateMock(error)) {
      throw error;
    }
    return mockUploadAdCampaign(input);
  }
}

export async function fetchPublicCompanyProfile(companyIdOrSlug: string) {
  try {
    const response = await api.get<PublicCompanyProfile | ApiEnvelope<PublicCompanyProfile>>(
      `/api/companies/${encodeURIComponent(companyIdOrSlug)}`,
    );
    return unwrapApiData<PublicCompanyProfile>(response);
  } catch (error) {
    if (!shouldFallbackToCorporateMock(error)) {
      throw error;
    }
    const mock = getCorporateMockPublicProfile(companyIdOrSlug);
    if (!mock) {
      throw new ApiError('Company not found.', 404, null);
    }
    return mock;
  }
}
