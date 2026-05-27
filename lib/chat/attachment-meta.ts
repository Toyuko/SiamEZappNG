/** Filename-only captions from web chat uploads (content = original file name). */
const FILENAME_ONLY = /^[^/\\]+\.(jpe?g|png|webp|gif|pdf)$/i;

export function looksLikeAttachmentFilename(text: string): boolean {
  return FILENAME_ONLY.test(text.trim());
}

export function isAttachmentPlaceholderContent(text: string): boolean {
  return text.trim() === '(attachment)';
}

/** Prefer explicit name, else use content when it is a bare filename and an attachment exists. */
export function resolveAttachmentName(
  attachmentUrl: string | null,
  attachmentName: string | null | undefined,
  content: string | null | undefined,
): string | null {
  const explicit = attachmentName?.trim();
  if (explicit) {
    return explicit;
  }

  const text = content?.trim() ?? '';
  if (attachmentUrl && looksLikeAttachmentFilename(text)) {
    return text;
  }

  return null;
}

export function normalizeAttachmentUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
