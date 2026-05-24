import type { TrackingStatus, TrackingStep } from '../../services/tracking.types';

export type { TrackingStep };

/** Driver's License — mirrors SiamEZ web `job-tracking-steps.ts`. */
export const DRIVER_LICENSE_TRACKING_STEPS: TrackingStep[] = [
  { key: 'DOCUMENTS_PENDING', th: 'รอเอกสาร', en: 'Documents Pending' },
  { key: 'APPOINTMENT_SET', th: 'นัดหมายแล้ว', en: 'Appointment Set' },
  { key: 'DLT_EXAM_PREP', th: 'เตรียมสอบ / ดำเนินการที่กรมขนส่ง', en: 'DLT Exam & Processing' },
  { key: 'LICENSE_ISSUED', th: 'ออกใบขับขี่แล้ว', en: 'License Issued' },
  { key: 'DELIVERED', th: 'จัดส่งแล้ว / เสร็จสิ้น', en: 'Delivered' },
];

/** Vehicle Registration — Bangkok registration workflow steps. */
export const VEHICLE_REGISTRATION_TRACKING_STEPS: TrackingStep[] = [
  { key: 'DOCUMENTS_PENDING', th: 'รอเอกสาร', en: 'Documents Pending' },
  { key: 'POR_ROR_BOR_PAID', th: 'ชำระ ป.ร./ร./บ. แล้ว', en: 'Por Ror Bor Paid' },
  { key: 'DLT_INSPECTION', th: 'ตรวจสภาพที่กรมขนส่ง', en: 'DLT Inspection' },
  { key: 'PLATES_ISSUED', th: 'ออกป้ายทะเบียนแล้ว', en: 'Plates Issued' },
  { key: 'DELIVERED', th: 'จัดส่งแล้ว / เสร็จสิ้น', en: 'Delivered' },
];

const TRACKABLE_SLUGS = ['driver-license', 'vehicle-registration'] as const;
type TrackableSlug = (typeof TRACKABLE_SLUGS)[number];

const TRACKING_STEPS_BY_SLUG: Record<TrackableSlug, TrackingStep[]> = {
  'driver-license': DRIVER_LICENSE_TRACKING_STEPS,
  'vehicle-registration': VEHICLE_REGISTRATION_TRACKING_STEPS,
};

export function isTrackableServiceSlug(slug: string | null | undefined): slug is TrackableSlug {
  return slug != null && (TRACKABLE_SLUGS as readonly string[]).includes(slug);
}

export function getTrackingStepsForServiceSlug(slug: string | null | undefined): TrackingStep[] | null {
  if (!isTrackableServiceSlug(slug)) {
    return null;
  }
  return TRACKING_STEPS_BY_SLUG[slug] ?? null;
}

export function getTrackingStepIndex(steps: TrackingStep[], status: TrackingStatus | null | undefined): number {
  if (!status) {
    return -1;
  }
  return steps.findIndex((step) => step.key === status);
}

export function trackingProgressPercent(steps: TrackingStep[], status: TrackingStatus | null | undefined): number {
  const index = getTrackingStepIndex(steps, status);
  if (index < 0 || steps.length <= 1) {
    return 0;
  }
  return Math.round((index / (steps.length - 1)) * 100);
}
