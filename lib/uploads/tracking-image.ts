import * as FileSystem from 'expo-file-system';

import { TRACKING_ATTACHMENT_MAX_BYTES } from '../../types/tracking';

export type PickedImage = {
  uri: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
};

export async function getLocalFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  if (!info.exists || !('size' in info)) {
    return 0;
  }
  return info.size ?? 0;
}

/**
 * Validates a picked image and returns metadata for multipart upload.
 * Call after expo-image-picker with a reduced `quality` to keep payloads under 5 MB.
 */
export async function prepareTrackingImage(uri: string, name: string, mimeType = 'image/jpeg'): Promise<PickedImage> {
  const sizeBytes = await getLocalFileSize(uri);
  if (sizeBytes > TRACKING_ATTACHMENT_MAX_BYTES) {
    throw new Error(`Image is too large (max ${Math.round(TRACKING_ATTACHMENT_MAX_BYTES / 1024 / 1024)} MB). Try again with a closer crop.`);
  }
  return { uri, name, mimeType, sizeBytes };
}

/** Recommended ImagePicker options — compress JPEG before upload. */
export const TRACKING_IMAGE_PICKER_OPTIONS = {
  mediaTypes: ['images'] as ('images' | 'videos' | 'livePhotos')[],
  quality: 0.65,
  allowsEditing: true,
  exif: false,
} as const;

export function isTrackingAttachmentImage(url: string, name?: string | null): boolean {
  const target = `${url} ${name ?? ''}`.toLowerCase();
  if (/\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(target) || target.includes('image/')) {
    return true;
  }
  // Chat uploads live under job-chat/ and are images or PDF only.
  if (target.includes('/job-chat/') && !isPdfAttachment(url, name)) {
    return true;
  }
  return false;
}

export function isPdfAttachment(url: string, name?: string | null): boolean {
  const target = `${url} ${name ?? ''}`.toLowerCase();
  return target.endsWith('.pdf') || target.includes('application/pdf');
}
