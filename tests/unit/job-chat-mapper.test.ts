import { describe, expect, it } from 'vitest';

import { pusherPayloadToDto } from '../../lib/chat/pusher-payload';
import { jobChatChannel } from '../../types/chat';

describe('job chat helpers', () => {
  it('builds the private job chat channel name', () => {
    expect(jobChatChannel('job-42')).toBe('private-job-job-42');
  });

  it('parses nested Pusher payloads', () => {
    const dto = pusherPayloadToDto(
      {
        message: {
          id: 'm2',
          senderId: 'user-b',
          content: 'Hello',
          createdAt: '2026-05-25T10:01:00.000Z',
        },
      },
      'job-42',
    );

    expect(dto?.id).toBe('m2');
    expect(dto?.jobId).toBe('job-42');
    expect(dto?.text).toBe('Hello');
  });
});
