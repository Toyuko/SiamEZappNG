import type { IMessage } from 'react-native-gifted-chat';

import { isPdfAttachment, isTrackingAttachmentImage } from '../uploads/tracking-image';
import type { JobChatMessageDto } from '../../types/chat';

export function toGiftedChatMessage(dto: JobChatMessageDto, currentUserId: string): IMessage {
  const isImage =
    dto.attachmentUrl != null && isTrackingAttachmentImage(dto.attachmentUrl, dto.attachmentName);
  const isPdf =
    dto.attachmentUrl != null && isPdfAttachment(dto.attachmentUrl, dto.attachmentName);

  let text = dto.text?.trim() ?? '';
  if (!text && dto.attachmentUrl) {
    if (isPdf) {
      text = dto.attachmentName?.trim() || 'PDF attachment';
    } else if (!isImage) {
      text = dto.attachmentName?.trim() || 'Attachment';
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
    ...(isImage && dto.attachmentUrl ? { image: dto.attachmentUrl } : {}),
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
