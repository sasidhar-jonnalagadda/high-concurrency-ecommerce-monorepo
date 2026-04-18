'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userApi } from '@/lib/api';
import { AuthState } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await userApi.login(email, password);
          set({ user: res.user, isLoading: false });
          return res;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await userApi.register(name, email, password);
          set({ user: res.user, isLoading: false });
          return res;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await userApi.logout();
        set({ user: null, error: null });
      },

      initialize: async () => {
        const { user, isLoading } = useAuthStore.getState();
        if (!user && !isLoading) {
          await useAuthStore.getState().fetchProfile();
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const user = await userApi.getProfile();
          set({ user, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
