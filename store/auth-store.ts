import { create } from 'zustand';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isBootstrapping: boolean;
  setSession: (params: { accessToken: string; user: AuthUser }) => void;
  clearSession: () => void;
  setBootstrapping: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isBootstrapping: true,
  setSession: ({ accessToken, user }) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
}));

export type { AuthUser };
