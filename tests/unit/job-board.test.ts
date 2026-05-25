import { describe, expect, it } from 'vitest';

import { toJobBoardFeedItem, feedPayoutAmount } from '../../lib/jobs/job-board-mapper';
import {
  JOB_BOARD_NEW_JOB_EVENT,
  PUBLIC_JOB_BOARD_CHANNEL,
} from '../../types/job-board';

describe('job board types', () => {
  it('uses the same Pusher channel and event as the web app', () => {
    expect(PUBLIC_JOB_BOARD_CHANNEL).toBe('public-job-board');
    expect(JOB_BOARD_NEW_JOB_EVENT).toBe('new-job-posted');
  });
});

describe('toJobBoardFeedItem', () => {
  it('maps freelancer dashboard jobs to the shared feed shape', () => {
    const item = toJobBoardFeedItem({
      id: 'job-1',
      title: 'Visa support',
      description: 'Help with extension',
      amount: 100_00,
      currency: 'THB',
      status: 'open',
      completionSubmittedAt: null,
      createdAt: '2026-05-25T00:00:00.000Z',
      updatedAt: '2026-05-25T00:00:00.000Z',
      postedBy: { id: 'c1', name: 'Client', email: 'c@example.com' },
      service: { id: 's1', slug: 'visa', name: 'Visa services' },
    });

    expect(item.category).toBe('Visa services');
    expect(item.service?.slug).toBe('visa');
    expect(feedPayoutAmount({ ...item, payoutAmount: 90_00 })).toBe(90_00);
    expect(feedPayoutAmount(item)).toBe(100_00);
  });
});
