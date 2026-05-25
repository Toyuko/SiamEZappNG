import { api, type ApiEnvelope, unwrapApiData } from '../lib/api';
import { getFreelancerJobById } from '../features/freelancer/freelancer.api';
import { getTrackingStepsForServiceSlug } from '../lib/jobs/tracking-steps';
import { reactNativeFormDataFile } from '../lib/uploads/form-data-file';

import type {
  ApproveJobResponse,
  ClientJobTrackingPayload,
  FreelancerJobTrackingView,
  JobLocationPayload,
  JobStatus,
  JobTrackingPayload,
  TrackingStatus,
  UpdateTrackingPayload,
  UpdateTrackingResponse,
  UploadTrackingAttachmentPayload,
  UploadTrackingAttachmentResponse,
} from '../types/tracking';

export type {
  ApproveJobResponse,
  ClientJobTrackingPayload,
  FreelancerJobTrackingView,
  JobLocationPayload,
  JobStatus,
  JobTrackingHistory,
  LiveLocationBroadcastPayload,
  TrackingHistoryEntry,
  TrackingStatus,
  TrackingStep,
  UpdateTrackingPayload,
  UpdateTrackingResponse,
  UploadTrackingAttachmentPayload,
  UploadTrackingAttachmentResponse,
} from '../types/tracking';

export { LIVE_LOCATION_PUSHER_EVENT, TRACKING_ATTACHMENT_MAX_BYTES, jobLocationChannel } from '../types/tracking';

/** Client map + live GPS config (GET /api/client/jobs/[id]/location). */
export async function fetchClientJobLocation(jobId: string) {
  const response = await api.get<JobLocationPayload | ApiEnvelope<JobLocationPayload>>(
    `/api/client/jobs/${encodeURIComponent(jobId)}/location`,
  );
  return unwrapApiData<JobLocationPayload>(response);
}

/** Client read-only tracking timeline (GET /api/client/jobs/[id]/tracking). */
export async function fetchClientJobTracking(jobId: string) {
  const response = await api.get<ClientJobTrackingPayload | ApiEnvelope<ClientJobTrackingPayload>>(
    `/api/client/jobs/${encodeURIComponent(jobId)}/tracking`,
  );
  return unwrapApiData<ClientJobTrackingPayload>(response);
}

/**
 * Unified job tracking (GET /api/jobs/[id]/tracking).
 * Falls back to role-specific routes when the unified endpoint is unavailable.
 */
export async function fetchJobTracking(
  jobId: string,
  role: 'client' | 'freelancer',
): Promise<JobTrackingPayload> {
  try {
    const response = await api.get<JobTrackingPayload | ApiEnvelope<JobTrackingPayload>>(
      `/api/jobs/${encodeURIComponent(jobId)}/tracking`,
    );
    return unwrapApiData<JobTrackingPayload>(response);
  } catch {
    if (role === 'client') {
      return fetchClientJobTracking(jobId);
    }
    return fetchFreelancerJobTracking(jobId);
  }
}

/**
 * Freelancer tracking view — built from job detail + local step config
 * (web portal uses the same job payload for the freelancer timeline).
 */
export async function fetchFreelancerJobTracking(jobId: string): Promise<FreelancerJobTrackingView> {
  const job = await getFreelancerJobById(jobId);
  const serviceSlug = job.service?.slug ?? null;
  const steps = getTrackingStepsForServiceSlug(serviceSlug);

  return {
    job: {
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status as JobStatus,
      trackingStatus: (job.trackingStatus as TrackingStatus | null) ?? null,
      trackingNotes: job.trackingNotes ?? null,
      isCurrentlyInTransit: job.isCurrentlyInTransit ?? false,
      completionSubmittedAt: job.completionSubmittedAt,
      updatedAt: job.updatedAt,
      service: job.service ?? null,
    },
    trackingHistory: [],
    steps,
    isTrackable: steps != null,
  };
}

/**
 * Update tracking progress for a freelancer job.
 * Backend route: POST /api/freelancer/jobs/[id]/tracking
 */
export async function updateJobTracking(jobId: string, payload: UpdateTrackingPayload) {
  const response = await api.post<UpdateTrackingResponse | ApiEnvelope<UpdateTrackingResponse>>(
    `/api/freelancer/jobs/${encodeURIComponent(jobId)}/tracking`,
    payload,
  );
  return unwrapApiData<UpdateTrackingResponse>(response);
}

/** Multipart upload for DLT receipts / vehicle photos (POST /api/upload). */
export async function uploadTrackingAttachment(jobId: string, file: UploadTrackingAttachmentPayload) {
  const form = new FormData();
  const part = reactNativeFormDataFile(file.uri, file.name, file.mimeType);
  form.append('file', part as any);
  form.append('jobId', jobId);
  form.append('purpose', 'tracking');

  const response = await api.post<UploadTrackingAttachmentResponse | ApiEnvelope<UploadTrackingAttachmentResponse>>(
    '/api/upload',
    form,
  );

  const unwrapped = unwrapApiData<UploadTrackingAttachmentResponse>(response);

  if (unwrapped && typeof unwrapped === 'object' && 'url' in unwrapped && typeof unwrapped.url === 'string') {
    return unwrapped;
  }

  if (response && typeof response === 'object' && 'url' in response && typeof (response as UploadTrackingAttachmentResponse).url === 'string') {
    return response as UploadTrackingAttachmentResponse;
  }

  const errorMessage =
    response && typeof response === 'object' && 'error' in response
      ? String((response as { error?: string }).error ?? 'Upload failed')
      : 'Upload failed';

  throw new Error(errorMessage);
}

/** Client manual approval — releases escrow (POST /api/client/jobs/[id]/approve). */
export async function approveClientJob(jobId: string) {
  const response = await api.post<ApproveJobResponse | ApiEnvelope<ApproveJobResponse>>(
    `/api/client/jobs/${encodeURIComponent(jobId)}/approve`,
  );
  return unwrapApiData<ApproveJobResponse>(response);
}
