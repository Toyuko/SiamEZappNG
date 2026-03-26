import { useMutation } from '@tanstack/react-query';

import { createBooking, type CreateBookingPayload } from '../features/bookings/bookings.api';

export function useCreateBooking() {
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
  });
}

