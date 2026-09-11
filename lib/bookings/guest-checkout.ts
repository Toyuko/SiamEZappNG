import { appConfig } from '../config';

export type GuestCheckoutParams = {
  caseId: string;
  /** Required for guest checkout; optional when the website session already owns the case. */
  guestCheckoutToken?: string | null;
};

/**
 * Website checkout URL — must match SiamEZwebNG:
 * `/checkout/{caseId}?token={guestCheckoutToken}` (locale redirect handled by the site).
 *
 * Do NOT put the token in the path; that 404s because the route param is a case id.
 */
export function buildGuestCheckoutUrl(params: GuestCheckoutParams): string {
  const caseId = params.caseId.trim();
  if (!caseId) {
    throw new Error('Missing case id');
  }

  const base = appConfig.webBaseUrl.replace(/\/+$/, '');
  const url = new URL(`${base}/checkout/${encodeURIComponent(caseId)}`);
  const token = params.guestCheckoutToken?.trim();
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
}

/**
 * Whether the booking response is enough to open guest checkout in an external browser.
 *
 * Fixed-price (invoiced) bookings only — quote-based cases often receive a token from the API
 * but have no invoice yet, so the website checkout page returns "Invoice not found".
 */
export function canOpenGuestCheckout(params: {
  caseId?: string | null;
  guestCheckoutToken?: string | null;
  isFixed?: boolean | null;
  payAtOffice?: boolean | null;
}): boolean {
  if (params.payAtOffice === true) return false;
  if (params.isFixed !== true) return false;
  return Boolean(params.caseId?.trim() && params.guestCheckoutToken?.trim());
}
