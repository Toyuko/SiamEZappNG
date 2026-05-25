/**
 * Job-scoped chat — mirrors SiamEZ web `/api/chat/[jobId]` and Pusher `private-job-{jobId}`.
 */

export const JOB_CHAT_PUSHER_EVENT = 'new-message' as const;

/** Unified private job channel (chat + tracking), same as web `jobChannel()`. */
export function jobChatChannel(jobId: string): string {
  return `private-job-${jobId}`;
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

/** Web `getJobMessages` participant payload. */
export type WebChatParticipant = {
  jobId: string;
  jobTitle: string;
  clientId: string;
  freelancerId: string;
  clientName: string | null;
  freelancerName: string | null;
};

export type JobChatMessageDto = {
  id: string;
  jobId: string;
  /** Message body (`content` on web API). */
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
  /** Raw web participant — used when posting new messages. */
  participant?: WebChatParticipant;
  realtime?: JobChatRealtimeConfig | null;
};

export type PostJobChatMessagePayload = {
  content: string;
  attachmentUrl?: string | null;
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
  name?: string;
  mimeType?: string | null;
};

export const CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
