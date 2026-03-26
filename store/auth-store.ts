import { create } from 'zustand';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type GuestProfile = {
  name: string;
  email: string;
  phone: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isGuest: boolean;
  guestProfile: GuestProfile | null;
  isBootstrapping: boolean;
  setSession: (params: { accessToken: string; user: AuthUser }) => void;
  enterGuestMode: (profile?: GuestProfile) => void;
  updateGuestProfile: (profile: GuestProfile) => void;
  clearSession: () => void;
  setBootstrapping: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isGuest: false,
  guestProfile: null,
  isBootstrapping: true,
  setSession: ({ accessToken, user }) => set({ accessToken, user, isGuest: false, guestProfile: null }),
  enterGuestMode: (profile) => set({ accessToken: null, user: null, isGuest: true, guestProfile: profile ?? null }),
  updateGuestProfile: (profile) => set({ guestProfile: profile, isGuest: true }),
  clearSession: () => set({ accessToken: null, user: null, isGuest: false, guestProfile: null }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
}));

export type { AuthUser, GuestProfile };
