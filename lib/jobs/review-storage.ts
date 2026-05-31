const REVIEW_SUBMITTED_PREFIX = '@siamez/job-review/submitted/';
const REVIEW_DISMISSED_PREFIX = '@siamez/job-review/dismissed/';

export function reviewSubmittedKey(jobId: string) {
  return `${REVIEW_SUBMITTED_PREFIX}${jobId}`;
}

export function reviewDismissedKey(jobId: string) {
  return `${REVIEW_DISMISSED_PREFIX}${jobId}`;
}
