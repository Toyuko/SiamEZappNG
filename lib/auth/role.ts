import type { UserRole } from '../../store/auth-store';

/** Map SiamEZ web/API roles to mobile portal role. */
export function mapApiRoleToUserRole(role?: string | null): UserRole | null {
  if (role === 'freelancer') {
    return 'freelancer';
  }
  if (role === 'customer' || role === 'client') {
    return 'client';
  }
  return null;
}

export function mapUserRoleToAccountType(role: UserRole): 'customer' | 'freelancer' {
  return role === 'freelancer' ? 'freelancer' : 'customer';
}
