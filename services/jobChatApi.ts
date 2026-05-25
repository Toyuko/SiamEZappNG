import { api, type ApiEnvelope, unwrapApiData } from '../lib/api';
import type {
  JobChatHistoryResponse,
  JobChatMessageDto,
  PostJobChatMessagePayload,
  PostJobChatMessageResponse,
  UploadChatAttachmentPayload,
  UploadChatAttachmentResponse,
} from '../types/chat';

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
} from '../types/chat';

export { JOB_CHAT_PUSHER_EVENT, jobChatChannel } from '../types/chat';

/** Message history for a job (GET /api/chat?jobId=). */
export async function fetchJobChatHistory(jobId: string) {
  const response = await api.get<JobChatHistoryResponse | ApiEnvelope<JobChatHistoryResponse>>(
    `/api/chat?jobId=${encodeURIComponent(jobId)}`,
  );
  return unwrapApiData<JobChatHistoryResponse>(response);
}

/** Send a chat message (POST /api/chat). */
export async function postJobChatMessage(payload: PostJobChatMessagePayload) {
  const response = await api.post<
    PostJobChatMessageResponse | ApiEnvelope<PostJobChatMessageResponse> | JobChatMessageDto
  >('/api/chat', payload);
  const data = unwrapApiData<PostJobChatMessageResponse | JobChatMessageDto>(response);
  if (data && typeof data === 'object' && 'message' in data) {
    return data as PostJobChatMessageResponse;
  }
  return { message: data as JobChatMessageDto };
}

/** Multipart upload for chat images / PDFs (POST /api/upload). */
export async function uploadChatAttachment(jobId: string, file: UploadChatAttachmentPayload) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);
  form.append('jobId', jobId);
  form.append('purpose', 'chat');

  const response = await api.post<UploadChatAttachmentResponse | ApiEnvelope<UploadChatAttachmentResponse>>(
    '/api/upload',
    form,
  );

  const unwrapped = unwrapApiData<UploadChatAttachmentResponse>(response);
  if (unwrapped && typeof unwrapped === 'object' && 'url' in unwrapped) {
    return unwrapped;
  }

  if (response && typeof response === 'object' && 'url' in response) {
    return response as UploadChatAttachmentResponse;
  }

  throw new Error('Upload failed');
}
