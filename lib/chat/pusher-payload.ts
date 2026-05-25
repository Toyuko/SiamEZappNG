import type { JobChatMessageDto } from '../../types/chat';

export function pusherPayloadToDto(payload: unknown, jobId: string): JobChatMessageDto | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  const nested = raw.message && typeof raw.message === 'object' ? (raw.message as Record<string, unknown>) : raw;

  const id = String(nested.id ?? nested._id ?? '');
  const senderId = String(nested.senderId ?? nested.userId ?? nested.sender?.id ?? '');
  if (!id || !senderId) {
    return null;
  }

  return {
    id,
    jobId: String(nested.jobId ?? jobId),
    text: String(nested.text ?? nested.body ?? ''),
    senderId,
    senderName:
      typeof nested.senderName === 'string'
        ? nested.senderName
        : typeof nested.sender?.name === 'string'
          ? nested.sender.name
          : null,
    attachmentUrl:
      typeof nested.attachmentUrl === 'string'
        ? nested.attachmentUrl
        : typeof nested.image === 'string'
          ? nested.image
          : null,
    attachmentName: typeof nested.attachmentName === 'string' ? nested.attachmentName : null,
    createdAt: String(nested.createdAt ?? new Date().toISOString()),
  };
}
