import type { ServiceItem } from '../services/services.data';
import type { SelectOption } from '../../components/ui/SelectField';

export type BookingReqFieldId =
  | 'documentType'
  | 'targetLanguage'
  | 'visaType'
  | 'visaStatus'
  | 'nationality'
  | 'maritalStatus'
  | 'licenseType'
  | 'licenseStatus'
  | 'clearancePurpose'
  | 'destination';

export type BookingFieldDef = {
  id: BookingReqFieldId;
  labelKey: string;
  optionKeys: readonly string[];
};

const GENERIC_DOC_KEYS = [
  'book.opt.doc.passport',
  'book.opt.doc.birth',
  'book.opt.doc.marriage',
  'book.opt.doc.legal',
  'book.opt.doc.academic',
  'book.opt.doc.other',
] as const;

const LANG_KEYS = [
  'book.opt.lang.en',
  'book.opt.lang.th',
  'book.opt.lang.zh',
  'book.opt.lang.ja',
  'book.opt.lang.ko',
  'book.opt.lang.fr',
  'book.opt.lang.de',
  'book.opt.lang.es',
  'book.opt.lang.other',
] as const;

const VISA_TYPE_KEYS = [
  'book.opt.visa.tourist',
  'book.opt.visa.nonb',
  'book.opt.visa.ed',
  'book.opt.visa.marriage',
  'book.opt.visa.retirement',
  'book.opt.visa.dependent',
  'book.opt.visa.elite',
  'book.opt.visa.extension',
  'book.opt.visa.other',
] as const;

const VISA_STATUS_KEYS = [
  'book.opt.visaStat.first',
  'book.opt.visaStat.extend',
  'book.opt.visaStat.overstay',
  'book.opt.visaStat.stamp',
  'book.opt.visaStat.other',
] as const;

const NATIONALITY_KEYS = [
  'book.opt.nat.th',
  'book.opt.nat.us',
  'book.opt.nat.uk',
  'book.opt.nat.eu',
  'book.opt.nat.au',
  'book.opt.nat.cn',
  'book.opt.nat.jp',
  'book.opt.nat.other',
] as const;

const MARITAL_KEYS = [
  'book.opt.marital.single',
  'book.opt.marital.married',
  'book.opt.marital.divorced',
  'book.opt.marital.widowed',
  'book.opt.marital.other',
] as const;

const LICENSE_TYPE_KEYS = [
  'book.opt.lic.car',
  'book.opt.lic.moto',
  'book.opt.lic.idp',
  'book.opt.lic.renew',
  'book.opt.lic.other',
] as const;

const LICENSE_STATUS_KEYS = [
  'book.opt.licStat.valid',
  'book.opt.licStat.expired',
  'book.opt.licStat.lost',
  'book.opt.licStat.convert',
  'book.opt.licStat.other',
] as const;

const CLEARANCE_PURPOSE_KEYS = [
  'book.opt.clear.visa',
  'book.opt.clear.work',
  'book.opt.clear.immigration',
  'book.opt.clear.personal',
  'book.opt.clear.other',
] as const;

const DESTINATION_KEYS = [
  'book.opt.dest.th',
  'book.opt.dest.us',
  'book.opt.dest.uk',
  'book.opt.dest.eu',
  'book.opt.dest.au',
  'book.opt.dest.jp',
  'book.opt.dest.other',
] as const;

const FIELDS_BY_SLUG: Record<string, BookingFieldDef[]> = {
  'translation-services': [
    { id: 'documentType', labelKey: 'book.documentType', optionKeys: GENERIC_DOC_KEYS },
    { id: 'targetLanguage', labelKey: 'book.targetLanguage', optionKeys: LANG_KEYS },
  ],
  'visa-services': [
    { id: 'visaType', labelKey: 'book.visaType', optionKeys: VISA_TYPE_KEYS },
    { id: 'visaStatus', labelKey: 'book.visaStatus', optionKeys: VISA_STATUS_KEYS },
  ],
  'marriage-registration': [
    { id: 'nationality', labelKey: 'book.nationality', optionKeys: NATIONALITY_KEYS },
    { id: 'maritalStatus', labelKey: 'book.maritalStatus', optionKeys: MARITAL_KEYS },
  ],
  'driver-license': [
    { id: 'licenseType', labelKey: 'book.licenseType', optionKeys: LICENSE_TYPE_KEYS },
    { id: 'licenseStatus', labelKey: 'book.licenseStatus', optionKeys: LICENSE_STATUS_KEYS },
  ],
  'police-clearance': [
    { id: 'clearancePurpose', labelKey: 'book.clearancePurpose', optionKeys: CLEARANCE_PURPOSE_KEYS },
    { id: 'destination', labelKey: 'book.destinationCountry', optionKeys: DESTINATION_KEYS },
  ],
};

const FALLBACK_FIELDS: BookingFieldDef[] = [
  { id: 'documentType', labelKey: 'book.documentType', optionKeys: GENERIC_DOC_KEYS },
];

export function getBookingFieldsForSlug(slug: string): BookingFieldDef[] {
  return FIELDS_BY_SLUG[slug] ?? FALLBACK_FIELDS;
}

export function toSelectOptions(keys: readonly string[], t: (key: string) => string): SelectOption[] {
  return keys.map((key) => ({
    value: t(key),
    label: t(key),
  }));
}

/** Human-readable starting price line for the booking header */
export function getServiceStartingPriceLine(service: ServiceItem, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (service.cardPriceBaht != null && service.cardPriceBaht.length > 0) {
    return t('services.priceFromBaht', { amount: service.cardPriceBaht });
  }
  return t('book.pricingQuote');
}
