/** Mirror of SiamEZwebNG driver-license pricing — keep in sync with website SSoT. */

export const DRIVER_LICENSE_PRICES = {
  newLicense: { car: 15_000, bike: 10_000, both: 20_000 },
  conversion: { car: 4_500, bike: 4_500, both: 4_500 },
  idp: 4_500,
  renewal: { car: 4_500, bike: 4_500, both: 4_500 },
  addons: {
    residentialCertificate: 2_500,
    translationLetter: 1_500,
  },
} as const;

export const DRIVER_LICENSE_DEPOSIT_PERCENT = 25;

export type LicenseServiceCategory = 'conversion' | 'renewal' | 'apply_new' | 'idp';
export type LicenseVehicleType = 'bike' | 'car' | 'both';
export type ResidentialCertificatePlan = 'self' | 'need_help';
export type DepositPaymentMethod = 'online' | 'office_cash';
export type PaymentChoice = 'initial' | 'full';

export type DriverLicenseAnswers = {
  category: LicenseServiceCategory | '';
  hasForeignLicense: 'yes' | 'no' | '';
  residentialCertificate: ResidentialCertificatePlan | '';
  fitToDrive: 'yes' | 'no' | '';
  vehicleType: LicenseVehicleType | '';
  nationality: string;
  addonTranslationLetter: boolean;
  appointmentDate: string;
  depositPaymentMethod: DepositPaymentMethod;
  name: string;
  email: string;
  phone: string;
  notes: string;
  paymentChoice: PaymentChoice;
};

export type DriverLicenseQuote = {
  category: LicenseServiceCategory;
  vehicleType: LicenseVehicleType | null;
  basePriceThb: number;
  addonsTotalThb: number;
  totalThb: number;
  depositThb: number;
  depositPercent: number;
  remainingThb: number;
  currency: 'THB';
  lineItems: Array<{ id: string; label: string; amountThb: number }>;
};

export function createEmptyDriverLicenseAnswers(
  seed?: Partial<Pick<DriverLicenseAnswers, 'name' | 'email' | 'phone'>>
): DriverLicenseAnswers {
  return {
    category: '',
    hasForeignLicense: '',
    residentialCertificate: '',
    fitToDrive: '',
    vehicleType: '',
    nationality: '',
    addonTranslationLetter: false,
    appointmentDate: '',
    depositPaymentMethod: 'online',
    name: seed?.name ?? '',
    email: seed?.email ?? '',
    phone: seed?.phone ?? '',
    notes: '',
    paymentChoice: 'initial',
  };
}

export function isYesAnswer(value: unknown): boolean {
  return value === true || value === 'yes' || value === 'true';
}

export function normalizeDriverLicenseAnswers(
  answers: DriverLicenseAnswers
): DriverLicenseAnswers {
  const next = { ...answers };
  if (next.category !== 'renewal' && next.category !== 'idp') {
    if (isYesAnswer(next.hasForeignLicense)) next.category = 'conversion';
    else if (next.hasForeignLicense === 'no') next.category = 'apply_new';
  }
  return next;
}

export function computeBasePriceThb(
  category: LicenseServiceCategory,
  vehicle: LicenseVehicleType | null
): number {
  if (category === 'idp') return DRIVER_LICENSE_PRICES.idp;
  if (!vehicle) return 0;
  switch (category) {
    case 'conversion':
      return DRIVER_LICENSE_PRICES.conversion[vehicle];
    case 'apply_new':
      return DRIVER_LICENSE_PRICES.newLicense[vehicle];
    case 'renewal':
      return DRIVER_LICENSE_PRICES.renewal[vehicle];
    default:
      return 0;
  }
}

export function computeDepositThb(totalThb: number): number {
  return Math.round((Math.max(0, totalThb) * DRIVER_LICENSE_DEPOSIT_PERCENT) / 100);
}

export function computeDriverLicenseQuote(answers: DriverLicenseAnswers): DriverLicenseQuote | null {
  const normalized = normalizeDriverLicenseAnswers(answers);
  if (!normalized.category) return null;
  if (normalized.category !== 'idp' && !normalized.vehicleType) return null;
  if (normalized.category !== 'idp') {
    if (!normalized.hasForeignLicense || !normalized.residentialCertificate) return null;
  }
  if (!normalized.fitToDrive) return null;

  const category = normalized.category;
  const vehicleType = category === 'idp' ? null : (normalized.vehicleType as LicenseVehicleType);
  const basePriceThb = computeBasePriceThb(category, vehicleType);
  const translationLetter = Boolean(normalized.addonTranslationLetter);
  const addressCertificate = normalized.residentialCertificate === 'need_help';
  let addonsTotalThb = 0;
  const lineItems: DriverLicenseQuote['lineItems'] = [];

  const categoryLabels: Record<LicenseServiceCategory, string> = {
    apply_new: 'New Thai license',
    conversion: 'License conversion',
    renewal: 'License renewal',
    idp: 'International Driving Permit',
  };
  const vehicleLabels: Record<LicenseVehicleType, string> = {
    car: 'car',
    bike: 'motorcycle',
    both: 'car & motorcycle',
  };

  const serviceLabel =
    category === 'idp'
      ? categoryLabels.idp
      : `${categoryLabels[category]} (${vehicleLabels[vehicleType!]})`;

  lineItems.push({ id: 'service', label: serviceLabel, amountThb: basePriceThb });

  if (addressCertificate) {
    addonsTotalThb += DRIVER_LICENSE_PRICES.addons.residentialCertificate;
    lineItems.push({
      id: 'residential',
      label: 'Residential certificate help',
      amountThb: DRIVER_LICENSE_PRICES.addons.residentialCertificate,
    });
  }
  if (translationLetter) {
    addonsTotalThb += DRIVER_LICENSE_PRICES.addons.translationLetter;
    lineItems.push({
      id: 'translation',
      label: 'Translation letter',
      amountThb: DRIVER_LICENSE_PRICES.addons.translationLetter,
    });
  }

  const totalThb = basePriceThb + addonsTotalThb;
  const depositThb = computeDepositThb(totalThb);

  return {
    category,
    vehicleType,
    basePriceThb,
    addonsTotalThb,
    totalThb,
    depositThb,
    depositPercent: DRIVER_LICENSE_DEPOSIT_PERCENT,
    remainingThb: totalThb - depositThb,
    currency: 'THB',
    lineItems,
  };
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** First selectable weekday on or after (today + 3 calendar days). */
export function getMinimumAppointmentDateString(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3);
  while (isWeekend(d)) d.setDate(d.getDate() + 1);
  return toYmd(d);
}

export function parseLocalDate(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const d = new Date(y, mo, da);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null;
  return d;
}

export function isValidDriverLicenseAppointmentDate(value: string): boolean {
  const d = parseLocalDate(value);
  if (!d) return false;
  if (isWeekend(d)) return false;
  const min = parseLocalDate(getMinimumAppointmentDateString());
  if (!min) return false;
  return d.getTime() >= min.getTime();
}

/** Next N weekday appointment options for mobile-friendly chips. */
export function getUpcomingWeekdayOptions(count = 12): Array<{ value: string; label: string }> {
  const start = parseLocalDate(getMinimumAppointmentDateString());
  if (!start) return [];
  const options: Array<{ value: string; label: string }> = [];
  const cursor = new Date(start);
  while (options.length < count) {
    if (!isWeekend(cursor)) {
      const value = toYmd(cursor);
      options.push({
        value,
        label: cursor.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
}

export function formatThb(amount: number): string {
  return `THB ${amount.toLocaleString('en-US')}`;
}

export function buildDriverLicenseFormData(
  answers: DriverLicenseAnswers,
  quote: DriverLicenseQuote
): Record<string, unknown> {
  const normalized = normalizeDriverLicenseAnswers(answers);
  return {
    name: answers.name.trim(),
    email: answers.email.trim(),
    phone: answers.phone.trim(),
    notes: answers.notes.trim() || undefined,
    depositPaymentMethod: answers.depositPaymentMethod,
    driverLicense: {
      category: quote.category,
      vehicleType: quote.vehicleType,
      hasForeignLicense: isYesAnswer(normalized.hasForeignLicense),
      residentialCertificate:
        normalized.residentialCertificate === 'self' || normalized.residentialCertificate === 'need_help'
          ? normalized.residentialCertificate
          : null,
      fitToDrive: isYesAnswer(normalized.fitToDrive),
      addons: {
        translationLetter: Boolean(answers.addonTranslationLetter),
        addressCertificate: normalized.residentialCertificate === 'need_help',
      },
      appointmentDate: answers.appointmentDate,
      depositPaymentMethod: answers.depositPaymentMethod,
      basePriceThb: quote.basePriceThb,
      addonsTotalThb: quote.addonsTotalThb,
      totalThb: quote.totalThb,
      depositThb: quote.depositThb,
      depositPercent: quote.depositPercent,
      remainingThb: quote.remainingThb,
      currency: 'THB',
      paymentChoice: answers.paymentChoice,
      source: 'mobile-app',
    },
  };
}
