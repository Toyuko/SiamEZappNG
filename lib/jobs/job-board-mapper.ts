import type { FreelancerJob } from '../../features/freelancer/freelancer.types';
import type { JobBoardFeedItem } from '../../types/job-board';

/** Maps dashboard/API job rows to the shared job-board feed shape. */
export function toJobBoardFeedItem(job: FreelancerJob): JobBoardFeedItem {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    amount: job.amount,
    payoutAmount: null,
    currency: job.currency,
    isSpecialMemberOnly: false,
    category: job.service?.name ?? null,
    service: job.service
      ? { id: job.service.id, slug: job.service.slug, name: job.service.name }
      : null,
    createdAt: job.createdAt,
  };
}

export function feedPayoutAmount(job: JobBoardFeedItem): number {
  return job.payoutAmount ?? job.amount;
}
