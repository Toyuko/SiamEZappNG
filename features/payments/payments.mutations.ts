import { api } from '../../lib/api';

export type SubmitPaymentPayload = Record<string, unknown>;
export type SubmitPaymentResponse = Record<string, unknown>;

export async function submitPayment(payload: SubmitPaymentPayload) {
  return api.post<SubmitPaymentResponse>('/api/payments', payload);
}

