import { api } from '../../lib/api';

export type CreateBookingPayload = Record<string, unknown>;
export type CreateBookingResponse = Record<string, unknown>;

export async function createBooking(payload: CreateBookingPayload) {
  return api.post<CreateBookingResponse>('/api/bookings', payload);
}

