import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type CreateBookingPayload = Record<string, unknown>;
export type CreateBookingResponse = Record<string, unknown>;

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post<CreateBookingResponse | ApiEnvelope<CreateBookingResponse>>('/api/bookings', payload);
  return unwrapApiData<CreateBookingResponse>(response);
}

