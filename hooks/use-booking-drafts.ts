import { useCallback, useEffect, useState } from 'react';

import { listBookingDrafts, type BookingDraftSummary } from '../features/bookings/booking-drafts';

export function useBookingDrafts(enabled: boolean) {
  const [drafts, setDrafts] = useState<BookingDraftSummary[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setDrafts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const next = await listBookingDrafts();
      setDrafts(next);
    } catch {
      setDrafts([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { drafts, isLoading, refetch };
}
