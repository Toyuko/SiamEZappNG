import { describe, expect, it } from 'vitest';

import {
  looksLikeAttachmentFilename,
  resolveAttachmentName,
} from '../../lib/chat/attachment-meta';

describe('chat attachment meta', () => {
  it('detects filename-only captions from web uploads', () => {
    expect(looksLikeAttachmentFilename('ben r.png')).toBe(true);
    expect(looksLikeAttachmentFilename('progress update images')).toBe(false);
  });

  it('derives attachment name from content when the API omits attachmentName', () => {
    expect(
      resolveAttachmentName('https://blob.example/job-chat/job-1/file', null, 'ben r.png'),
    ).toBe('ben r.png');
  });
});
