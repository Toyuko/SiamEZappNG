/**
 * Job board feed types — mirrors SiamEZwebNG `lib/jobs/job-board-payload.ts`
 * and the `new-job-posted` Pusher payload on `public-job-board`.
 */

export const PUBLIC_JOB_BOARD_CHANNEL = 'public-job-board' as const;
export const PRIVATE_SPECIAL_JOBS_CHANNEL = 'private-special-jobs' as const;
export const JOB_BOARD_NEW_JOB_EVENT = 'new-job-posted' as const;

/** Serialized job card for the freelancer job board feed (web + mobile). */
export type JobBoardFeedItem = {
  id: string;
  title: string;
  description: string;
  amount: number;
  payoutAmount: number | null;
  currency: string;
  isSpecialMemberOnly: boolean;
  category: string | null;
  service: { id: string; name: string; slug: string } | null;
  createdAt: string;
};

export type OpenJobsResponse = {
  jobs: JobBoardFeedItem[];
};
