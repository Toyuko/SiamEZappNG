/**
 * Job-scoped chat — mirrors SiamEZ web `/api/chat` and Pusher `private-job-{id}-chat`.
 */

export const JOB_CHAT_PUSHER_EVENT = 'new-message' as const;

/** Channel pattern: `private-job-{jobId}-chat` */
export function jobChatChannel(jobId: string): string {
  return `private-job-${jobId}-chat`;
}

export type JobChatRealtimeConfig = {
  channel: string;
  authEndpoint: string;
  event: typeof JOB_CHAT_PUSHER_EVENT;
  pusherKey: string;
  pusherCluster: string;
};

export type JobChatParticipant = {
  id: string;
  name: string | null;
  role: 'client' | 'freelancer';
};

export type JobChatMessageDto = {
  id: string;
  jobId: string;
  text: string;
  senderId: string;
  senderName: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
};

export type JobChatMeta = {
  jobId: string;
  jobTitle?: string | null;
  serviceName?: string | null;
  counterpart: JobChatParticipant;
};

export type JobChatHistoryResponse = {
  messages: JobChatMessageDto[];
  meta?: JobChatMeta;
  realtime?: JobChatRealtimeConfig | null;
};

export type PostJobChatMessagePayload = {
  jobId: string;
  text: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
};

export type PostJobChatMessageResponse = {
  message: JobChatMessageDto;
};

export type UploadChatAttachmentPayload = {
  uri: string;
  name: string;
  mimeType?: string;
};

export type UploadChatAttachmentResponse = {
  url: string;
  key: string;
  name?: string;
};

export const CHAT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
