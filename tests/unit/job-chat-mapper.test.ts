import { describe, expect, it } from 'vitest';

import { resolveAttachmentName } from '../../lib/chat/attachment-meta';
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

  it('maps desktop image messages with filename-only content', () => {
    const attachmentUrl = 'https://blob.example/job-chat/job-42/123-ben_r.png';
    const attachmentName = resolveAttachmentName(attachmentUrl, null, 'ben r.png');

    expect(attachmentUrl).toContain('job-chat');
    expect(attachmentName).toBe('ben r.png');
  });

  it('parses Pusher image payloads from the web serializer', () => {
    const dto = pusherPayloadToDto(
      {
        id: 'm3',
        senderId: 'client-1',
        content: 'ben r.png',
        attachmentUrl: 'https://blob.example/job-chat/job-42/upload',
        createdAt: '2026-05-27T16:40:00.000Z',
      },
      'job-42',
    );

    expect(dto?.attachmentName).toBe('ben r.png');
    expect(dto?.attachmentUrl).toContain('job-chat');
  });
});
