import type { ClientDocument } from './documents.types';
import { api } from '../../lib/api';

export async function getMyDocuments() {
  return api.get<ClientDocument[]>('/api/documents');
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

  return api.post<ClientDocument>('/api/documents/upload', form);
}
