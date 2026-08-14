const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic']);
const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf'];

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export type DocumentUploadCandidate = {
  name?: string;
  mimeType?: string;
  size?: number | null;
};

export function isAllowedDocumentUpload(candidate: DocumentUploadCandidate) {
  const name = candidate.name?.trim() ?? '';
  const mime = candidate.mimeType?.trim().toLowerCase() ?? '';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  const typeOk =
    (ext && ALLOWED_EXTENSIONS.has(ext)) ||
    ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));

  if (!typeOk) {
    return { ok: false as const, reason: 'type' as const };
  }
  if (typeof candidate.size === 'number' && candidate.size > MAX_DOCUMENT_BYTES) {
    return { ok: false as const, reason: 'size' as const };
  }
  return { ok: true as const };
}
