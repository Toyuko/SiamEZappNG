import type { ServiceBadgeId, ServiceCatalogIconName, ServiceCategoryId } from './services.types';

/**
 * Web-aligned service launcher catalog (https://siam-e-zweb-ng.vercel.app/en/services).
 *
 * HOW TO ADD A NEW SERVICE:
 * 1. Add an entry to `LAUNCHER_SERVICE_SEEDS` below (keep `sortOrder` sequential).
 * 2. Optionally add a full detail block in `rawServiceCatalog` (services.data.ts).
 * 3. Add `SERVICE_CATALOG_META` row and search aliases in `service-search.ts`.
 */
export type LauncherServiceSeed = {
  slug: string;
  sortOrder: number;
  category: ServiceCategoryId;
  icon: ServiceCatalogIconName;
  titleEn: string;
  titleTh: string;
  shortTitleEn: string;
  shortTitleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  priceFrom?: string;
  estimatedTime?: string;
  requirements?: string[];
  badges: ServiceBadgeId[];
  featured: boolean;
  active: boolean;
};

/** Exactly 12 services — matches current SiamEZ web services directory */
export const LAUNCHER_SERVICE_SEEDS: LauncherServiceSeed[] = [
  {
    slug: 'marriage-registration',
    sortOrder: 1,
    category: 'immigration-legal',
    icon: 'heart-outline',
    titleEn: 'Marriage Registration',
    titleTh: 'จดทะเบียนสมรส',
    shortTitleEn: 'Marriage',
    shortTitleTh: 'สมรส',
    descriptionEn:
      'Complete assistance with Thai marriage registration, documentation, and legal requirements.',
    descriptionTh: 'ดูแลครบทุกขั้นตอนสำหรับการจดทะเบียนสมรสในไทย เอกสาร และข้อกำหนดทางกฎหมาย',
    estimatedTime: '2–4 weeks',
    requirements: ['Passport', 'Birth certificate', 'Embassy docs', 'Thai partner ID'],
    badges: ['popular', 'fixedPrice'],
    featured: false,
    active: true,
  },
  {
    slug: 'translation-services',
    sortOrder: 2,
    category: 'translation-documents',
    icon: 'document-text-outline',
    titleEn: 'Translation Services',
    titleTh: 'บริการแปลเอกสาร',
    shortTitleEn: 'Translation',
    shortTitleTh: 'แปลเอกสาร',
    descriptionEn:
      'Certified translations for official documents, legal paperwork, and government submissions.',
    descriptionTh: 'แปลเอกสารรับรองสำหรับเอกสารราชการ กฎหมาย และการยื่นต่อหน่วยงาน',
    estimatedTime: '1–3 business days',
    requirements: ['Original documents (scan or physical)'],
    badges: ['popular', 'nationwide'],
    featured: true,
    active: true,
  },
  {
    slug: 'driver-license',
    sortOrder: 3,
    category: 'driving-vehicle',
    icon: 'car-outline',
    titleEn: "Driver's License",
    titleTh: 'ใบขับขี่',
    shortTitleEn: "Driver's License",
    shortTitleTh: 'ใบขับขี่',
    descriptionEn:
      "Thai driver's license under 2026 DLT rules: conversion, renewal, new car/bike, IDP, FastTrack, and bilingual coordinators in Bangkok.",
    descriptionTh:
      'ใบขับขี่ไทยตามกฎ DLT 2026: แปลงใบต่างชาติ ต่ออายุ สมัครใหม่ รถ/มอไซค์ IDP FastTrack พร้อมทีมสองภาษาในกรุงเทพฯ',
    priceFrom: '3,500',
    estimatedTime: '1–3 business days',
    requirements: ['Passport', 'Visa stamp', 'Medical certificate', 'Residence proof'],
    badges: ['popular', 'sameDay'],
    featured: true,
    active: true,
  },
  {
    slug: 'police-clearance',
    sortOrder: 4,
    category: 'immigration-legal',
    icon: 'shield-checkmark-outline',
    titleEn: 'Police Clearance',
    titleTh: 'ใบรับรองความประพฤติ',
    shortTitleEn: 'Police Clear.',
    shortTitleTh: 'ใบความดี',
    descriptionEn: 'Assistance with police clearance certificates and background checks for visas.',
    descriptionTh: 'ช่วยขอใบรับรองความประพฤติและตรวจประวัติสำหรับวีซ่า',
    estimatedTime: '3–7 business days',
    requirements: ['Passport', 'Visa page', 'Application form', 'Photos'],
    badges: ['popular', 'nationwide'],
    featured: true,
    active: true,
  },
  {
    slug: 'visa-services',
    sortOrder: 5,
    category: 'immigration-legal',
    icon: 'airplane-outline',
    titleEn: 'Visa Services',
    titleTh: 'บริการวีซ่า',
    shortTitleEn: 'Visa',
    shortTitleTh: 'วีซ่า',
    descriptionEn: 'Professional guidance on visa applications, extensions, and immigration matters.',
    descriptionTh: 'คำแนะนำมืออาชีพด้านการยื่นวีซ่า ต่ออายุ และเรื่องตรวจคนเข้าเมือง',
    estimatedTime: '3–10 business days',
    requirements: ['Passport', 'Photos', 'Financial proof', 'Supporting letters'],
    badges: ['popular', 'nationwide'],
    featured: true,
    active: true,
  },
  {
    slug: 'construction-handyman',
    sortOrder: 6,
    category: 'home-property',
    icon: 'construct-outline',
    titleEn: 'Construction & Handyman',
    titleTh: 'ก่อสร้างและช่างซ่อม',
    shortTitleEn: 'Handyman',
    shortTitleTh: 'ช่างซ่อม',
    descriptionEn:
      'Professional home repairs, renovations, and construction services for residential and commercial properties.',
    descriptionTh: 'งานซ่อมแซม ปรับปรุง และก่อสร้างสำหรับที่อยู่อาศัยและอาคารพาณิชย์',
    estimatedTime: 'Quote within 24 hours',
    requirements: ['Photos of the area', 'Access details', 'Preferred schedule'],
    badges: ['homeService'],
    featured: false,
    active: true,
  },
  {
    slug: 'car-motorbike-finding-selling',
    sortOrder: 7,
    category: 'driving-vehicle',
    icon: 'car-sport-outline',
    titleEn: 'Car & Motorbike Finding and Selling Service',
    titleTh: 'หา/ขายรถและมอเตอร์ไซค์',
    shortTitleEn: 'Car & Bike',
    shortTitleTh: 'หา/ขายรถ',
    descriptionEn:
      'Buy or sell cars and motorcycles in Thailand with full negotiation, paperwork, and registration support from start to finish.',
    descriptionTh:
      'ซื้อหรือขายรถยนต์และมอเตอร์ไซค์ในไทย พร้อมต่อรอง เอกสาร และจดทะเบียนครบจบ',
    estimatedTime: 'Varies by listing',
    requirements: ['Budget', 'Preferred make/model', 'Registration status'],
    badges: ['nationwide'],
    featured: false,
    active: true,
  },
  {
    slug: 'vehicle-registration',
    sortOrder: 8,
    category: 'driving-vehicle',
    icon: 'bicycle-outline',
    titleEn: 'Vehicle Registration',
    titleTh: 'ทะเบียนรถ',
    shortTitleEn: 'Vehicle Reg.',
    shortTitleTh: 'ทะเบียนรถ',
    descriptionEn:
      'Professional car and motorcycle registration in Bangkok — 1-day process for BKK plates; DLT paperwork and renewals handled for you.',
    descriptionTh:
      'จดทะเบียนรถและมอเตอร์ไซค์ในกรุงเทพฯ — ป้าย กทม. บางรายการเสร็จใน 1 วัน จัดการเอกสาร DLTให้',
    priceFrom: '2,000',
    estimatedTime: 'Same day (Bangkok BKK plates)',
    requirements: ['Vehicle book', 'ID/passport', 'Sale contract or transfer docs'],
    badges: ['popular', 'sameDay'],
    featured: true,
    active: true,
  },
  {
    slug: 'transportation-services',
    sortOrder: 9,
    category: 'transport-private-driver',
    icon: 'bus-outline',
    titleEn: 'Transportation Services',
    titleTh: 'บริการขนส่ง',
    shortTitleEn: 'Transport',
    shortTitleTh: 'ขนส่ง',
    descriptionEn:
      'Reliable airport transfers, city tours, and inter-city transportation with comfortable vehicles.',
    descriptionTh: 'รับส่งสนามบิน ทัวร์ในเมือง และเดินทางระหว่างจังหวัด รถสะดวกสบาย',
    estimatedTime: 'Same day booking',
    requirements: ['Pickup/drop-off locations', 'Date', 'Passenger count'],
    badges: ['sameDay', 'nationwide'],
    featured: false,
    active: true,
  },
  {
    slug: 'private-driver-service',
    sortOrder: 10,
    category: 'transport-private-driver',
    icon: 'person-circle-outline',
    titleEn: 'Private Driver Service',
    titleTh: 'บริการคนขับส่วนตัว',
    shortTitleEn: 'Pvt. Driver',
    shortTitleTh: 'คนขับ',
    descriptionEn:
      'Professional private drivers for daily use, business trips, or special occasions with flexible packages.',
    descriptionTh: 'คนขับส่วนตัวมืออาชีพสำหรับใช้ประจำ ธุรกิจ หรืองานพิเศษ แพ็กเกจยืดหยุ่น',
    estimatedTime: 'Flexible packages',
    requirements: ['Schedule', 'Pickup address', 'Vehicle preference'],
    badges: ['nationwide'],
    featured: false,
    active: true,
  },
  {
    slug: 'event-planning-venue-services',
    sortOrder: 11,
    category: 'events-lifestyle',
    icon: 'sparkles-outline',
    titleEn: 'Event Planning and Venue Services',
    titleTh: 'จัดงานและเช่าสถานที่',
    shortTitleEn: 'Events',
    shortTitleTh: 'อีเวนต์',
    descriptionEn: 'Event planning and venue services in partnership with The Red Door Bkk.',
    descriptionTh: 'บริการวางแผนงานและสถานที่ ร่วมกับ The Red Door Bkk',
    estimatedTime: '2–6 weeks planning',
    requirements: ['Event date', 'Guest count', 'Style preferences'],
    badges: ['popular'],
    featured: false,
    active: true,
  },
  {
    slug: 'basic-translation-fixed-price',
    sortOrder: 12,
    category: 'translation-documents',
    icon: 'ribbon-outline',
    titleEn: 'Basic Translation Fixed Price',
    titleTh: 'แปลเอกสารราคาคงที่',
    shortTitleEn: 'Basic Trans.',
    shortTitleTh: 'แปลราคาคงที่',
    descriptionEn: 'Simple document translation with fixed pricing per page. From THB 500.',
    descriptionTh: 'แปลเอกสารง่ายๆ ราคาคงที่ต่อหน้า เริ่มต้น 500 บาท',
    priceFrom: '500',
    estimatedTime: 'Same day',
    requirements: ['Clear scan or photo of each page'],
    badges: ['fixedPrice', 'sameDay'],
    featured: false,
    active: true,
  },
];

export const LAUNCHER_SHORT_TITLES = Object.fromEntries(
  LAUNCHER_SERVICE_SEEDS.map((seed) => [seed.slug, { en: seed.shortTitleEn, th: seed.shortTitleTh }]),
) as Record<string, { en: string; th: string }>;
