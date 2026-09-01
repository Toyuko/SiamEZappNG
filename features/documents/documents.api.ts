import type { ClientDocument } from './documents.types';
import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import { reactNativeFormDataFile } from '../../lib/uploads/form-data-file';

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
  const file = reactNativeFormDataFile(payload.uri, payload.name, payload.mimeType);
  form.append('file', file as unknown as Blob);

  const response = await api.post<ClientDocument | ApiEnvelope<ClientDocument>>('/api/documents/upload', form);
  return unwrapApiData<ClientDocument>(response);
}

export function documentPreviewUrl(document: ClientDocument) {
  return document.url ?? document.downloadUrl ?? document.fileUrl ?? null;
}

export async function fetchDocumentPreviewUrl(id: string) {
  try {
    const response = await api.get<
      | { url?: string; downloadUrl?: string }
      | ApiEnvelope<{ url?: string; downloadUrl?: string }>
    >(`/api/documents/${encodeURIComponent(id)}/url`);
    const data = unwrapApiData(response);
    return data.url ?? data.downloadUrl ?? null;
  } catch {
    return null;
  }
}
