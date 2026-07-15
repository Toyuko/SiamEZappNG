import AsyncStorage from '@react-native-async-storage/async-storage';

export const BOOKING_DRAFT_PREFIX = '@booking-draft:';

export type BookingDraftSummary = {
  slug: string;
  updatedAt: number;
};

/** Returns unfinished booking drafts saved by the Book wizard. */
export async function listBookingDrafts(): Promise<BookingDraftSummary[]> {
  const keys = await AsyncStorage.getAllKeys();
  const draftKeys = keys.filter((key) => key.startsWith(BOOKING_DRAFT_PREFIX));
  if (draftKeys.length === 0) {
    return [];
  }

  const pairs = await AsyncStorage.multiGet(draftKeys);
  const drafts: BookingDraftSummary[] = [];

  for (const [key, value] of pairs) {
    if (!value) {
      continue;
    }
    const slug = key.slice(BOOKING_DRAFT_PREFIX.length);
    if (!slug) {
      continue;
    }
    try {
      const parsed = JSON.parse(value) as { step?: number };
      if (parsed && typeof parsed === 'object') {
        drafts.push({ slug, updatedAt: Date.now() });
      }
    } catch {
      drafts.push({ slug, updatedAt: 0 });
    }
  }

  return drafts;
}
