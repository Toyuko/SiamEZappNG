const EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
};

/** Last path segment from a local `file://` or `content://` URI, or fallback. */
export function filenameFromUri(uri: string, fallback = 'upload.jpg'): string {
  const withoutQuery = uri.split('?')[0] ?? uri;
  const segment = withoutQuery.split('/').pop();
  if (segment?.includes('.')) {
    return decodeURIComponent(segment);
  }
  return fallback;
}

/** Guess MIME type from filename extension (React Native multipart uploads). */
export function mimeTypeFromFilename(filename: string, fallback = 'image/jpeg'): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && ext in EXTENSION_MIME_TYPES) {
    return EXTENSION_MIME_TYPES[ext];
  }
  return fallback;
}

/** `{ uri, name, type }` object required by React Native `FormData.append('file', …)`. */
export function reactNativeFormDataFile(
  uri: string,
  name?: string,
  mimeType?: string,
): { uri: string; name: string; type: string } {
  const resolvedName = name?.trim() || filenameFromUri(uri);
  const resolvedType = mimeType?.trim() || mimeTypeFromFilename(resolvedName);
  return { uri, name: resolvedName, type: resolvedType };
}
