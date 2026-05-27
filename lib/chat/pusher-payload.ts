import { normalizeAttachmentUrl, resolveAttachmentName } from './attachment-meta';
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

  const text = String(nested.content ?? nested.text ?? nested.body ?? '');
  const attachmentUrl = normalizeAttachmentUrl(
    nested.attachmentUrl ?? nested.attachment_url ?? nested.image,
  );
  const attachmentName = resolveAttachmentName(
    attachmentUrl,
    typeof nested.attachmentName === 'string'
      ? nested.attachmentName
      : typeof nested.attachment_name === 'string'
        ? nested.attachment_name
        : null,
    text,
  );

  return {
    id,
    jobId: String(nested.jobId ?? jobId),
    text,
    senderId,
    senderName:
      typeof nested.senderName === 'string'
        ? nested.senderName
        : typeof nested.sender?.name === 'string'
          ? nested.sender.name
          : null,
    attachmentUrl,
    attachmentName,
    createdAt: String(nested.createdAt ?? new Date().toISOString()),
  };
}
