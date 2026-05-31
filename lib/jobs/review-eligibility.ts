import type { JobStatus, TrackingStatus } from '../../types/tracking';

/** Client can leave a review once the job is approved or tracking reaches delivered. */
export function isReviewEligible(status: JobStatus, trackingStatus: TrackingStatus | null): boolean {
  return status === 'approved' || trackingStatus === 'DELIVERED';
}
