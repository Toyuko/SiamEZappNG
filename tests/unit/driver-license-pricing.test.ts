import { describe, expect, it } from 'vitest';

import {
  computeDriverLicenseQuote,
  createEmptyDriverLicenseAnswers,
  getMinimumAppointmentDateString,
  isValidDriverLicenseAppointmentDate,
  normalizeDriverLicenseAnswers,
} from '../../features/bookings/driver-license/pricing';

describe('driver-license pricing (website parity)', () => {
  it('prices conversion + car at 4,500 with 25% deposit', () => {
    const answers = {
      ...createEmptyDriverLicenseAnswers(),
      category: 'conversion' as const,
      hasForeignLicense: 'yes' as const,
      residentialCertificate: 'self' as const,
      fitToDrive: 'yes' as const,
      vehicleType: 'car' as const,
    };
    const quote = computeDriverLicenseQuote(answers);
    expect(quote?.totalThb).toBe(4_500);
    expect(quote?.depositThb).toBe(1_125);
    expect(quote?.remainingThb).toBe(3_375);
  });

  it('adds residential + translation addons', () => {
    const answers = {
      ...createEmptyDriverLicenseAnswers(),
      category: 'apply_new' as const,
      hasForeignLicense: 'no' as const,
      residentialCertificate: 'need_help' as const,
      fitToDrive: 'yes' as const,
      vehicleType: 'bike' as const,
      addonTranslationLetter: true,
    };
    const quote = computeDriverLicenseQuote(answers);
    // bike new 10,000 + residential 2,500 + translation 1,500
    expect(quote?.basePriceThb).toBe(10_000);
    expect(quote?.addonsTotalThb).toBe(4_000);
    expect(quote?.totalThb).toBe(14_000);
    expect(quote?.depositThb).toBe(3_500);
  });

  it('normalizes foreign license yes → conversion', () => {
    const normalized = normalizeDriverLicenseAnswers({
      ...createEmptyDriverLicenseAnswers(),
      category: 'apply_new',
      hasForeignLicense: 'yes',
    });
    expect(normalized.category).toBe('conversion');
  });

  it('rejects weekend appointment dates', () => {
    const min = getMinimumAppointmentDateString();
    expect(isValidDriverLicenseAppointmentDate(min)).toBe(true);
    // Find a Saturday after min and ensure invalid
    const d = new Date(`${min}T12:00:00`);
    while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    expect(isValidDriverLicenseAppointmentDate(`${y}-${m}-${day}`)).toBe(false);
  });
});
