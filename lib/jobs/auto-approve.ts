import type { JobStatus } from '../../features/freelancer/freelancer.types';

import { JOB_AUTO_APPROVE_MS } from './constants';

const AWAITING_REVIEW_STATUSES: JobStatus[] = ['completed_awaiting_review', 'completed'];

export function getAutoApprovalDeadline(completionSubmittedAt: string | Date): Date {
  const submitted =
    completionSubmittedAt instanceof Date
      ? completionSubmittedAt
      : new Date(completionSubmittedAt);
  return new Date(submitted.getTime() + JOB_AUTO_APPROVE_MS);
}

export function getAutoApprovalRemainingMs(completionSubmittedAt: string | Date): number {
  return Math.max(0, getAutoApprovalDeadline(completionSubmittedAt).getTime() - Date.now());
}

export function isAwaitingReviewStatus(status: JobStatus | string): boolean {
  return (AWAITING_REVIEW_STATUSES as string[]).includes(status);
}

export function jobProgressPercent(status: JobStatus): number {
  switch (status) {
    case 'open':
      return 10;
    case 'in_progress':
      return 50;
    case 'completed':
      return 90;
    case 'approved':
      return 100;
    default:
      return 0;
  }
}
