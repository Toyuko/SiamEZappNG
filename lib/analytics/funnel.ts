/**
 * Lightweight conversion funnel events.
 * Privacy-conscious: no PII, documents, or payment details.
 * No third-party SDK — logs in __DEV__ and no-ops in production until wired.
 */

export type FunnelEvent =
  | 'app_opened'
  | 'home_viewed'
  | 'service_category_selected'
  | 'service_viewed'
  | 'booking_started'
  | 'booking_step_completed'
  | 'booking_abandoned'
  | 'booking_submitted'
  | 'booking_confirmed'
  | 'support_contacted';

type FunnelPayload = Record<string, string | number | boolean | undefined>;

export function trackFunnel(event: FunnelEvent, payload?: FunnelPayload): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.info('[funnel]', event, payload ?? {});
  }
}
