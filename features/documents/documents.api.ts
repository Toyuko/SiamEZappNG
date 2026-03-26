import type { ClientDocument } from './documents.types';
import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export async function getMyDocuments() {
  const response = await api.get<ClientDocument[] | ApiEnvelope<ClientDocument[]>>('/api/documents');
  return unwrapApiData<ClientDocument[]>(response);
}

export type UploadDocumentPayload = {
  uri: string;
  name: string;
  mimeType?: string;
};

export async function uploadDocument(payload: UploadDocumentPayload) {
  const form = new FormData();
  form.append('file', {
    uri: payload.uri,
    name: payload.name,
    type: payload.mimeType ?? 'application/octet-stream',
  } as any);

  const response = await api.post<ClientDocument | ApiEnvelope<ClientDocument>>('/api/documents/upload', form);
  return unwrapApiData<ClientDocument>(response);
}
