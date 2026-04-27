import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import * as api from '@/lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.login(email, password);
          localStorage.setItem('nofoal_token', res.token);
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.signup(name, email, password);
          localStorage.setItem('nofoal_token', res.token);
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('nofoal_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await api.getMe();
          set({ user: res.user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('nofoal_token');
        }
      },
    }),
    {
      name: 'nofoal-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
