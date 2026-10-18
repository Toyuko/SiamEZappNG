import { describe, expect, it } from 'vitest';

import {
  buildChatwootCustomAttributes,
  mapToSupportServiceKey,
  supportContextFromServiceSlug,
} from '../../features/support/context';

describe('Chatwoot conversation context', () => {
  it('maps service slugs to canonical keys', () => {
    expect(mapToSupportServiceKey('driver-license')).toBe('license');
    expect(mapToSupportServiceKey('vehicle-registration')).toBe('vehicle_registration');
    expect(mapToSupportServiceKey('marriage-registration')).toBe('marriage');
    expect(mapToSupportServiceKey('visa-services')).toBe('general');
  });

  it('infers service from free-text case serviceType', () => {
    expect(mapToSupportServiceKey('Thai Driver License Renewal')).toBe('license');
    expect(mapToSupportServiceKey('Vehicle Registration Bangkok')).toBe('vehicle_registration');
    expect(mapToSupportServiceKey('Marriage paperwork')).toBe('marriage');
  });

  it('builds custom attributes with only present fields', () => {
    const attrs = buildChatwootCustomAttributes({
      context: {
        source: 'booking',
        service: 'license',
        bookingId: 'SL-2847',
        jobId: 'JOB-2938',
        caseTitle: 'License renewal',
      },
      language: 'en',
      customerType: 'client',
      customerId: 'user-42',
      role: 'client',
    });

    expect(attrs).toMatchObject({
      source_app: 'siamez_mobile',
      entry_point: 'booking',
      preferred_language: 'en',
      customer_type: 'client',
      siamez_customer_id: 'user-42',
      siamez_role: 'client',
      current_service: 'license',
      active_booking_id: 'SL-2847',
      active_job_id: 'JOB-2938',
      case_title: 'License renewal',
    });
  });

  it('omits booking/job when not provided', () => {
    const attrs = buildChatwootCustomAttributes({
      context: { source: 'contact', service: 'general' },
      language: 'th',
      customerType: 'guest',
    });
    expect(attrs.active_booking_id).toBeUndefined();
    expect(attrs.active_job_id).toBeUndefined();
    expect(attrs.siamez_customer_id).toBeUndefined();
    expect(attrs.current_service).toBe('general');
    expect(attrs.preferred_language).toBe('th');
  });

  it('builds service page context from slug', () => {
    expect(supportContextFromServiceSlug('vehicle-registration')).toEqual({
      source: 'service',
      service: 'vehicle_registration',
    });
  });
});
