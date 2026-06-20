import type { ServiceBadgeId, ServiceCategoryId } from './services.types';

/**
 * Per-slug metadata for raw catalog entries in services.data.ts.
 * Launcher grid copy lives in launcher-catalog.ts — keep Thai titles in sync here.
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
  'marriage-registration': {
    category: 'immigration-legal',
    titleTh: 'จดทะเบียนสมรส',
    descriptionTh:
      'ดูแลครบทุกขั้นตอนสำหรับการจดทะเบียนสมรสในไทย เอกสาร และข้อกำหนดทางกฎหมาย',
    badges: ['popular', 'fixedPrice'],
    featured: false,
    active: true,
  },
  'translation-services': {
    category: 'translation-documents',
    titleTh: 'บริการแปลเอกสาร',
    descriptionTh: 'แปลเอกสารรับรองสำหรับเอกสารราชการ กฎหมาย และการยื่นต่อหน่วยงาน',
    badges: ['popular', 'nationwide'],
    featured: true,
    active: true,
  },
  'driver-license': {
    category: 'driving-vehicle',
    titleTh: 'ใบขับขี่',
    descriptionTh:
      'ใบขับขี่ไทยตามกฎ DLT 2026: แปลงใบต่างชาติ ต่ออายุ สมัครใหม่ รถ/มอไซค์ IDP FastTrack',
    badges: ['popular', 'sameDay'],
    featured: true,
    active: true,
  },
  'police-clearance': {
    category: 'immigration-legal',
    titleTh: 'ใบรับรองความประพฤติ',
    descriptionTh: 'ช่วยขอใบรับรองความประพฤติและตรวจประวัติสำหรับวีซ่า',
    badges: ['popular', 'nationwide'],
    featured: true,
    active: true,
  },
  'visa-services': {
    category: 'immigration-legal',
    titleTh: 'บริการวีซ่า',
    descriptionTh: 'คำแนะนำมืออาชีพด้านการยื่นวีซ่า ต่ออายุ และเรื่องตรวจคนเข้าเมือง',
    badges: ['popular', 'nationwide'],
    featured: true,
    active: true,
  },
  'construction-handyman': {
    category: 'home-property',
    titleTh: 'ก่อสร้างและช่างซ่อม',
    descriptionTh: 'งานซ่อมแซม ปรับปรุง และก่อสร้างสำหรับที่อยู่อาศัยและอาคารพาณิชย์',
    badges: ['homeService'],
    featured: false,
    active: true,
  },
  'vehicle-registration': {
    category: 'driving-vehicle',
    titleTh: 'ทะเบียนรถ',
    descriptionTh: 'จดทะเบียนรถและมอเตอร์ไซค์ในกรุงเทพฯ — ป้าย กทม. บางรายการเสร็จใน 1 วัน',
    badges: ['popular', 'sameDay'],
    featured: true,
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
  'private-driver-service': {
    category: 'transport-private-driver',
    titleTh: 'บริการคนขับส่วนตัว',
    descriptionTh: 'คนขับส่วนตัวมืออาชีพสำหรับใช้ประจำ ธุรกิจ หรืองานพิเศษ',
    badges: ['nationwide'],
    featured: false,
    active: true,
  },
  'event-planning-venue-services': {
    category: 'events-lifestyle',
    titleTh: 'จัดงานและเช่าสถานที่',
    descriptionTh: 'บริการวางแผนงานและสถานที่ ร่วมกับ The Red Door Bkk',
    badges: ['popular'],
    featured: false,
    active: true,
  },
};
