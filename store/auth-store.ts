import { create } from 'zustand';

export type UserRole = 'client' | 'freelancer';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
  /** From SiamEZ web API: `customer` | `freelancer` */
  role?: string;
};

type GuestProfile = {
  name: string;
  email: string;
  phone: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  userRole: UserRole | null;
  isGuest: boolean;
  guestProfile: GuestProfile | null;
  isBootstrapping: boolean;
  setSession: (params: { accessToken: string; user: AuthUser; userRole?: UserRole | null }) => void;
  setUserRole: (role: UserRole) => void;
  enterGuestMode: (profile?: GuestProfile) => void;
  updateGuestProfile: (profile: GuestProfile) => void;
  clearSession: () => void;
  setBootstrapping: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  userRole: null,
  isGuest: false,
  guestProfile: null,
  isBootstrapping: true,
  setSession: ({ accessToken, user, userRole }) =>
    set({
      accessToken,
      user,
      userRole: userRole ?? null,
      isGuest: false,
      guestProfile: null,
    }),
  setUserRole: (role) => set({ userRole: role }),
  enterGuestMode: (profile) => set({ accessToken: null, user: null, userRole: null, isGuest: true, guestProfile: profile ?? null }),
  updateGuestProfile: (profile) => set({ guestProfile: profile, isGuest: true }),
  clearSession: () => set({ accessToken: null, user: null, userRole: null, isGuest: false, guestProfile: null }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
}));

export type { AuthUser, GuestProfile };
