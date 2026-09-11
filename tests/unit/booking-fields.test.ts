import { describe, expect, it } from 'vitest';

import { getBookingFieldsForSlug } from '../../features/bookings/booking-fields';

describe('getBookingFieldsForSlug', () => {
  it('uses translation requirement fields for the fixed-price translation catalog slug', () => {
    const fields = getBookingFieldsForSlug('basic-translation-fixed-price');
    expect(fields.map((field) => field.id)).toEqual(['documentType', 'targetLanguage']);
  });

  it('falls back to document type for unknown services', () => {
    const fields = getBookingFieldsForSlug('unknown-service-slug');
    expect(fields.map((field) => field.id)).toEqual(['documentType']);
  });
});
