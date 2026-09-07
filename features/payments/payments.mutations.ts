import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type SubmitPaymentPayload = Record<string, unknown>;
export type SubmitPaymentResponse = Record<string, unknown>;

/**
 * Payment mutation against POST /api/payments.
 *
 * Not wired to any customer UI. Do not treat a successful HTTP response from this
 * helper as “customer paid” — authoritative payment state lives on the website
 * checkout / invoice system (PromptPay, bank transfer, Wise; Stripe later).
 */
export async function submitPayment(payload: SubmitPaymentPayload) {
  const response = await api.post<SubmitPaymentResponse | ApiEnvelope<SubmitPaymentResponse>>('/api/payments', payload);
  return unwrapApiData<SubmitPaymentResponse>(response);
}

