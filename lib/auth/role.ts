import type { UserRole } from '../../store/auth-store';

/** Map SiamEZ web/API roles to mobile portal role. */
export function mapApiRoleToUserRole(role?: string | null): UserRole | null {
  if (!role) {
    return null;
  }
  const normalized = role.trim().toLowerCase();
  if (normalized === 'freelancer') {
    return 'freelancer';
  }
  if (normalized === 'corporate' || normalized === 'company') {
    return 'corporate';
  }
  if (normalized === 'customer' || normalized === 'client') {
    return 'client';
  }
  return null;
}

export function mapUserRoleToAccountType(role: UserRole): 'customer' | 'freelancer' | 'corporate' {
  if (role === 'freelancer') {
    return 'freelancer';
  }
  if (role === 'corporate') {
    return 'corporate';
  }
  return 'customer';
}

export function isCorporateRole(userRole?: UserRole | null, apiRole?: string | null): boolean {
  return userRole === 'corporate' || mapApiRoleToUserRole(apiRole) === 'corporate';
}
