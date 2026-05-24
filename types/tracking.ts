/**
 * Shared Track & Trace types — mirrors SiamEZ web Prisma `Job` + `JobTrackingHistory`
 * and the live GPS API contracts (`/api/client/jobs/[id]/location`,
 * `/api/freelancer/jobs/[id]/location`, `/api/client/jobs/[id]/tracking`).
 *
 * Source of truth: SiamEZwebNG/prisma/schema.prisma
 */

/** Prisma `TrackingStatus` enum */
export type TrackingStatus =
  | 'DOCUMENTS_PENDING'
  | 'APPOINTMENT_SET'
  | 'DLT_EXAM_PREP'
  | 'LICENSE_ISSUED'
  | 'POR_ROR_BOR_PAID'
  | 'DLT_INSPECTION'
  | 'PLATES_ISSUED'
  | 'DELIVERED';

/** Prisma `JobStatus` enum (marketplace lifecycle) */
export type JobStatus =
  | 'open'
  | 'in_progress'
  | 'completed_awaiting_review'
  | 'completed'
  | 'approved';

/** Prisma `JobTrackingHistory` model — full field set */
export type JobTrackingHistory = {
  id: string;
  jobId: string;
  status: TrackingStatus;
  note: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
};

/** Location-related subset of Prisma `Job` used by map + live transit */
export type JobLocationFields = {
  id: string;
  trackingStatus: TrackingStatus | null;
  isCurrentlyInTransit: boolean;
};

/** Timeline history row (GET /api/client/jobs/[id]/tracking) */
export type TrackingHistoryEntry = {
  id: string;
  status: TrackingStatus;
  note: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
};

export type TrackingStep = {
  key: TrackingStatus;
  th: string;
  en: string;
};

/** Pusher event name consumed by web `TrackingMapInner.tsx` */
export const LIVE_LOCATION_PUSHER_EVENT = 'location-update' as const;

/** Channel pattern: `private-job-location-{jobId}` */
export function jobLocationChannel(jobId: string): string {
  return `private-job-location-${jobId}`;
}

/**
 * Payload broadcast on `location-update` — must stay in sync with web
 * `broadcastJobLocationUpdate()` and `TrackingMapInner` subscribers.
 */
export type LiveLocationBroadcastPayload = {
  latitude: number;
  longitude: number;
  timestamp: string;
  jobId: string;
};

/** POST /api/freelancer/jobs/[id]/location request body */
export type PostJobLocationRequest = {
  latitude: number;
  longitude: number;
  timestamp?: string;
  inTransit?: boolean;
};

/** PUT /api/freelancer/jobs/[id]/location — ends live transit */
export type EndLiveTransitRequest = {
  latitude?: number;
  longitude?: number;
  timestamp?: string;
};

export type PostJobLocationResponse = {
  ok: boolean;
  isCurrentlyInTransit: boolean;
};

export type EndLiveTransitResponse = {
  ok: boolean;
  isCurrentlyInTransit: false;
};

/** Map history point from GET /api/client/jobs/[id]/location */
export type JobLocationHistoryEntry = {
  id: string;
  status: string;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
};

export type JobLocationRealtimeConfig = {
  channel: string;
  authEndpoint: string;
  event: typeof LIVE_LOCATION_PUSHER_EVENT;
  pusherKey: string;
  pusherCluster: string;
};

/** GET /api/client/jobs/[id]/location response `data` */
export type JobLocationPayload = {
  jobId: string;
  trackingStatus: TrackingStatus | null;
  isCurrentlyInTransit: boolean;
  trackingHistory: JobLocationHistoryEntry[];
  realtime: JobLocationRealtimeConfig | null;
};

export type ClientJobTrackingPayload = {
  job: {
    id: string;
    title: string;
    status: JobStatus;
    trackingStatus: TrackingStatus | null;
    isCurrentlyInTransit?: boolean;
    completionSubmittedAt: string | null;
    enableAutoApproval: boolean;
    updatedAt: string;
    service: { id: string; slug: string; name: string } | null;
    freelancer: { displayName: string } | null;
  };
  trackingHistory: TrackingHistoryEntry[];
  steps: TrackingStep[] | null;
  isTrackable: boolean;
};

export type FreelancerJobTrackingView = {
  job: {
    id: string;
    title: string;
    description: string;
    status: JobStatus;
    trackingStatus: TrackingStatus | null;
    trackingNotes: string | null;
    isCurrentlyInTransit?: boolean;
    completionSubmittedAt: string | null;
    updatedAt: string;
    service: { id: string; slug: string; name: string } | null;
  };
  steps: TrackingStep[] | null;
  isTrackable: boolean;
};

export type UpdateTrackingPayload = {
  status: TrackingStatus;
  notes?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateTrackingResponse = {
  ok: boolean;
  trackingStatus: TrackingStatus;
  completionSubmittedAt: string | null;
};

export type UploadTrackingAttachmentPayload = {
  uri: string;
  name: string;
  mimeType?: string;
};

export type UploadTrackingAttachmentResponse = {
  url: string;
  key: string;
  name?: string;
};

export type ApproveJobResponse = {
  ok: boolean;
  approvedAt: string;
};

export const TRACKING_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
