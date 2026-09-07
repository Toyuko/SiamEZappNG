import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

/** Matches the website booking contract (`POST /api/bookings`). */
export type CreateBookingPayload = {
  /** Canonical service slug or DB id. Server resolves it (getOrEnsureServiceBySlug). */
  serviceId: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  /** Service-specific requirement answers (same key the website sends). */
  formData?: Record<string, unknown>;
  documentIds?: string[];
  postToMarketplace?: boolean;
};

export type CreateBookingResponse = {
  caseId?: string;
  caseNumber?: string;
  /** Fixed-price services are payable immediately on the website checkout page. */
  isFixed?: boolean;
  /** Some services settle at the office instead of online checkout. */
  payAtOffice?: boolean;
  /** Guest-only token for `/checkout/{caseId}?token=…` (not a path segment). */
  guestCheckoutToken?: string;
};

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post<CreateBookingResponse | ApiEnvelope<CreateBookingResponse>>(
    '/api/bookings',
    payload,
  );
  return unwrapApiData<CreateBookingResponse>(response);
}
