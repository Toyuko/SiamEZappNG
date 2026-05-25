import { api, type ApiEnvelope, unwrapApiData } from '../lib/api';
import { appConfig } from '../lib/config';
import type {
  JobChatHistoryResponse,
  JobChatMessageDto,
  JobChatMeta,
  JobChatParticipant,
  JobChatRealtimeConfig,
  PostJobChatMessagePayload,
  PostJobChatMessageResponse,
  UploadChatAttachmentPayload,
  UploadChatAttachmentResponse,
  WebChatParticipant,
} from '../types/chat';
import { JOB_CHAT_PUSHER_EVENT, jobChatChannel } from '../types/chat';

export type {
  JobChatHistoryResponse,
  JobChatMessageDto,
  JobChatMeta,
  JobChatParticipant,
  JobChatRealtimeConfig,
  PostJobChatMessagePayload,
  PostJobChatMessageResponse,
  UploadChatAttachmentPayload,
  UploadChatAttachmentResponse,
  WebChatParticipant,
} from '../types/chat';

export { JOB_CHAT_PUSHER_EVENT, jobChatChannel } from '../types/chat';

type WebSerializedMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

type WebChatHistoryPayload = {
  messages: WebSerializedMessage[];
  participant: WebChatParticipant;
};

function senderNameForMessage(message: WebSerializedMessage, participant: WebChatParticipant): string | null {
  if (message.senderId === participant.clientId) {
    return participant.clientName;
  }
  if (message.senderId === participant.freelancerId) {
    return participant.freelancerName;
  }
  return null;
}

export function mapWebMessage(message: WebSerializedMessage, participant: WebChatParticipant): JobChatMessageDto {
  return {
    id: message.id,
    jobId: participant.jobId,
    text: message.content,
    senderId: message.senderId,
    senderName: senderNameForMessage(message, participant),
    attachmentUrl: message.attachmentUrl,
    attachmentName: null,
    createdAt: message.createdAt,
  };
}

function mapWebHistory(payload: WebChatHistoryPayload, currentUserId: string): JobChatHistoryResponse {
  const { participant, messages } = payload;
  const isClient = participant.clientId === currentUserId;
  const counterpart: JobChatParticipant = isClient
    ? {
        id: participant.freelancerId,
        name: participant.freelancerName,
        role: 'freelancer',
      }
    : {
        id: participant.clientId,
        name: participant.clientName,
        role: 'client',
      };

  const apiBase = appConfig.apiUrl.replace(/\/+$/, '');

  return {
    messages: messages.map((message) => mapWebMessage(message, participant)),
    meta: {
      jobId: participant.jobId,
      jobTitle: participant.jobTitle,
      serviceName: null,
      counterpart,
    },
    participant,
    realtime: {
      channel: jobChatChannel(participant.jobId),
      authEndpoint: `${apiBase}/api/chat/pusher-auth`,
      event: JOB_CHAT_PUSHER_EVENT,
      pusherKey: process.env.EXPO_PUBLIC_PUSHER_KEY?.trim() ?? '',
      pusherCluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER?.trim() ?? '',
    },
  };
}

/** Message history for a job (GET /api/chat/[jobId]). */
export async function fetchJobChatHistory(jobId: string, currentUserId: string) {
  const response = await api.get<WebChatHistoryPayload | ApiEnvelope<WebChatHistoryPayload>>(
    `/api/chat/${encodeURIComponent(jobId)}`,
  );
  const data = unwrapApiData<WebChatHistoryPayload>(response);
  return mapWebHistory(data, currentUserId);
}

/** Send a chat message (POST /api/chat/[jobId]). */
export async function postJobChatMessage(
  jobId: string,
  payload: PostJobChatMessagePayload,
  participant: WebChatParticipant,
) {
  const response = await api.post<
    { message: WebSerializedMessage } | ApiEnvelope<{ message: WebSerializedMessage }>
  >(`/api/chat/${encodeURIComponent(jobId)}`, {
    content: payload.content,
    attachmentUrl: payload.attachmentUrl ?? null,
  });

  const data = unwrapApiData<{ message: WebSerializedMessage }>(response);
  return { message: mapWebMessage(data.message, participant) } satisfies PostJobChatMessageResponse;
}

/** Multipart upload for chat images / PDFs (POST /api/chat/upload). */
export async function uploadChatAttachment(jobId: string, file: UploadChatAttachmentPayload) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);
  form.append('jobId', jobId);

  const response = await api.post<
    UploadChatAttachmentResponse | ApiEnvelope<UploadChatAttachmentResponse>
  >('/api/chat/upload', form);

  const unwrapped = unwrapApiData<UploadChatAttachmentResponse>(response);
  if (unwrapped && typeof unwrapped === 'object' && 'url' in unwrapped) {
    return unwrapped;
  }

  if (response && typeof response === 'object' && 'url' in response) {
    return response as UploadChatAttachmentResponse;
  }

  throw new Error('Upload failed');
}
