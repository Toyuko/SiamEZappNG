import type { JobChatMessageDto, WebChatParticipant } from '../../types/chat';

/** Fills sender display name from job participant when Pusher payload omits it. */
export function enrichChatMessage(
  message: JobChatMessageDto,
  participant: WebChatParticipant | null | undefined,
): JobChatMessageDto {
  if (!participant || message.senderName) {
    return message;
  }

  if (message.senderId === participant.clientId) {
    return { ...message, senderName: participant.clientName };
  }
  if (message.senderId === participant.freelancerId) {
    return { ...message, senderName: participant.freelancerName };
  }

  return message;
}
