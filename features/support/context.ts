import type {
  ChatwootCustomAttributes,
  SupportChatContext,
  SupportServiceKey,
  SupportSource,
} from './types';

const SLUG_TO_SERVICE: Record<string, SupportServiceKey> = {
  'driver-license': 'license',
  'drivers-license': 'license',
  'driver-licence': 'license',
  'vehicle-registration': 'vehicle_registration',
  'marriage-registration': 'marriage',
  marriage: 'marriage',
};

/**
 * Map catalog slugs / free-text service types to canonical Chatwoot service keys.
 */
export function mapToSupportServiceKey(
  value: string | null | undefined,
): SupportServiceKey {
  if (!value?.trim()) {
    return 'general';
  }
  const raw = value.trim().toLowerCase();
  if (raw in SLUG_TO_SERVICE) {
    return SLUG_TO_SERVICE[raw]!;
  }
  if (raw.includes('license') || raw.includes('licence') || raw.includes('driving')) {
    return 'license';
  }
  if (raw.includes('vehicle') || raw.includes('registration') || raw.includes('motorbike')) {
    return 'vehicle_registration';
  }
  if (raw.includes('marriage') || raw.includes('wedding')) {
    return 'marriage';
  }
  return 'general';
}

export function buildChatwootCustomAttributes(input: {
  context: SupportChatContext;
  language: string;
  customerType: string;
  customerId?: string | null;
  role?: string | null;
}): ChatwootCustomAttributes {
  const attrs: ChatwootCustomAttributes = {
    source_app: 'siamez_mobile',
    entry_point: input.context.source,
    preferred_language: input.language,
    customer_type: input.customerType,
  };

  if (input.customerId?.trim()) {
    attrs.siamez_customer_id = input.customerId.trim();
  }
  if (input.role?.trim()) {
    attrs.siamez_role = input.role.trim();
  }

  const service = input.context.service ?? 'general';
  attrs.current_service = service;

  if (input.context.bookingId?.trim()) {
    attrs.active_booking_id = input.context.bookingId.trim();
  }
  if (input.context.jobId?.trim()) {
    attrs.active_job_id = input.context.jobId.trim();
  }
  if (input.context.caseTitle?.trim()) {
    attrs.case_title = input.context.caseTitle.trim();
  }

  return attrs;
}

export function supportContextFromServiceSlug(
  slug: string,
  source: SupportSource = 'service',
): SupportChatContext {
  return {
    source,
    service: mapToSupportServiceKey(slug),
  };
}
