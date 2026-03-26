import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type SubmitPaymentPayload = Record<string, unknown>;
export type SubmitPaymentResponse = Record<string, unknown>;

export async function submitPayment(payload: SubmitPaymentPayload) {
  const response = await api.post<SubmitPaymentResponse | ApiEnvelope<SubmitPaymentResponse>>('/api/payments', payload);
  return unwrapApiData<SubmitPaymentResponse>(response);
}

