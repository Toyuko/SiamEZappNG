/** Format job amount stored in smallest currency unit (satang for THB). */
export function formatJobAmount(amount: number, currency = 'THB'): string {
  const value = amount / 100;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
