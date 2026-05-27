import type { IMessage } from 'react-native-gifted-chat';

import {
  isAttachmentPlaceholderContent,
  looksLikeAttachmentFilename,
  resolveAttachmentName,
} from './attachment-meta';
import { isPdfAttachment, isTrackingAttachmentImage } from '../uploads/tracking-image';
import type { JobChatMessageDto } from '../../types/chat';

export function toGiftedChatMessage(dto: JobChatMessageDto, currentUserId: string): IMessage {
  const attachmentUrl = dto.attachmentUrl?.trim() || null;
  const attachmentName = resolveAttachmentName(attachmentUrl, dto.attachmentName, dto.text);

  const isImage = attachmentUrl != null && isTrackingAttachmentImage(attachmentUrl, attachmentName);
  const isPdf = attachmentUrl != null && isPdfAttachment(attachmentUrl, attachmentName);

  let text = dto.text?.trim() ?? '';
  if (isAttachmentPlaceholderContent(text)) {
    text = '';
  }
  if (isImage && attachmentName && text === attachmentName) {
    text = '';
  }
  if (isImage && looksLikeAttachmentFilename(text)) {
    text = '';
  }

  if (!text && attachmentUrl) {
    if (isPdf) {
      text = attachmentName?.trim() || 'PDF attachment';
    } else if (!isImage) {
      text = attachmentName?.trim() || 'Attachment';
    }
  }

  return {
    _id: dto.id,
    text,
    createdAt: new Date(dto.createdAt),
    user: {
      _id: dto.senderId,
      name: dto.senderName ?? undefined,
    },
    ...(isImage && attachmentUrl ? { image: attachmentUrl } : {}),
  };
}

export function toGiftedChatMessages(messages: JobChatMessageDto[], currentUserId: string): IMessage[] {
  return messages
    .map((message) => toGiftedChatMessage(message, currentUserId))
    .sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : Number(a.createdAt);
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : Number(b.createdAt);
      return bTime - aTime;
    });
}
