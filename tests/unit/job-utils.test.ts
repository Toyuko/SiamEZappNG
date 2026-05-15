import { describe, expect, it } from 'vitest';

import { jobProgressPercent } from '../../lib/jobs/auto-approve';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { mapApiRoleToUserRole } from '../../lib/auth/role';

describe('freelancer job utils', () => {
  it('maps web API roles to mobile portal roles', () => {
    expect(mapApiRoleToUserRole('freelancer')).toBe('freelancer');
    expect(mapApiRoleToUserRole('customer')).toBe('client');
    expect(mapApiRoleToUserRole('admin')).toBeNull();
  });

  it('uses web progress percentages', () => {
    expect(jobProgressPercent('open')).toBe(10);
    expect(jobProgressPercent('in_progress')).toBe(50);
    expect(jobProgressPercent('completed')).toBe(90);
    expect(jobProgressPercent('approved')).toBe(100);
  });

  it('formats satang amounts like web', () => {
    expect(formatJobAmount(450_000, 'THB')).toContain('4,500');
  });
});
