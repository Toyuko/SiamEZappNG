import type { ServiceBadgeId, ServiceCategoryId } from './services.types';

/**
 * Per-slug catalog metadata (category, localization, badges, featured flag).
 *
 * HOW TO ADD A NEW SERVICE:
 * 1. Add a full entry to `rawServiceCatalog` in `services.data.ts` (copy an existing block).
 * 2. Add a row here with category, Thai copy, badges, and featured/active flags.
 * 3. Add search aliases in `service-search.ts` and booking fields in `booking-fields.ts` if needed.
 * 4. Add `contact.serviceOptions.{slug}` keys in en.json / th.json when the service appears on the contact form.
 */
export type ServiceCatalogMeta = {
  category: ServiceCategoryId;
  titleTh: string;
  descriptionTh: string;
  badges: ServiceBadgeId[];
  featured: boolean;
  active: boolean;
};

export const SERVICE_CATALOG_META: Record<string, ServiceCatalogMeta> = {
  'driver-license': {
    category: 'driving-vehicle',
    titleTh: 'ใบขับขี่',
    descriptionTh: 'นัดหมายด่วน แพ็กเกจกลุ่ม และเตรียมสอบ — ทีมสองภาษาดูแลให้ครบ',
    badges: ['popular', 'fixedPrice'],
    featured: true,
    active: true,
  },
  'vehicle-registration': {
    category: 'driving-vehicle',
    titleTh: 'ทะเบียนรถ',
    descriptionTh: 'จดทะเบียนรถและมอเตอร์ไซค์ในกรุงเทพฯ — บางรายการเสร็จภายในวันเดียว',
    badges: ['sameDay', 'fixedPrice'],
    featured: true,
    active: true,
  },
  'marriage-registration': {
    category: 'immigration-legal',
    titleTh: 'จดทะเบียนสมรส',
    descriptionTh: 'ดูแลเอกสารและขั้นตอนจดทะเบียนสมรสในไทยอย่างครบถ้วน',
    badges: ['popular', 'fixedPrice'],
    featured: false,
    active: true,
  },
  'visa-services': {
    category: 'immigration-legal',
    titleTh: 'บริการวีซ่า',
    descriptionTh: 'ยื่นวีซ่า ต่ออายุ และเปลี่ยนประเภท — ครบทุกประเภทในไทย',
    badges: ['sameDay'],
    featured: true,
    active: true,
  },
  'police-clearance': {
    category: 'immigration-legal',
    titleTh: 'ใบรับรองความประพฤติ',
    descriptionTh: 'ช่วยขอใบรับรองความประพฤติจากตำรวจสำหรับวีซ่าและใบอนุญาตทำงาน',
    badges: ['nationwide'],
    featured: true,
    active: true,
  },
  'translation-services': {
    category: 'translation-documents',
    titleTh: 'บริการแปลเอกสาร',
    descriptionTh: 'แปลเอกสารรับรองสำหรับยื่นราชการ กฎหมาย และธุรกิจ — รวดเร็วและแม่นยำ',
    badges: ['sameDay', 'popular'],
    featured: true,
    active: true,
  },
  'construction-handyman': {
    category: 'home-property',
    titleTh: 'ก่อสร้างและช่างซ่อม',
    descriptionTh: 'ซ่อมแซม ปรับปรุง และงานก่อสร้างสำหรับบ้านและอาคารพาณิชย์',
    badges: ['homeService'],
    featured: false,
    active: true,
  },
  'private-driver-service': {
    category: 'transport-private-driver',
    titleTh: 'บริการคนขับส่วนตัว',
    descriptionTh: 'คนขับมืออาชีพสำหรับเดินทางประจำ ธุรกิจ หรืองานพิเศษ',
    badges: ['nationwide'],
    featured: false,
    active: true,
  },
  'transportation-services': {
    category: 'transport-private-driver',
    titleTh: 'บริการขนส่ง',
    descriptionTh: 'รับส่งสนามบิน ทัวร์ในเมือง และเดินทางระหว่างจังหวัด',
    badges: ['sameDay', 'nationwide'],
    featured: false,
    active: true,
  },
  'event-planning-venue-services': {
    category: 'events-lifestyle',
    titleTh: 'จัดงานอีเวนต์และเช่าสถานที่',
    descriptionTh: 'วางแผนงานและจองสถานที่พรีเมียมในกรุงเทพฯ',
    badges: ['popular'],
    featured: false,
    active: true,
  },
};
