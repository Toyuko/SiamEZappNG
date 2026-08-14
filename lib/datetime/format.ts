export function formatDisplayDate(iso: string, locale: 'en' | 'th' = 'en') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', { timeZone: 'Asia/Bangkok' });
}
