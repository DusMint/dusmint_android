import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, dusmintApi } from '@dusmint/api-client';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  preferredLanguage: 'en' | 'hi' | 'mr';
  isAuthenticated: boolean;
  isLoading: boolean;
  isVegOnly: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (token: string, user: UserProfile) => void;
  setToken: (token: string) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleVegOnly: () => void;
  setVegOnly: (val: boolean) => void;
  setHydrated: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      preferredLanguage: 'en',
      isAuthenticated: false,
      isLoading: false,
      isVegOnly: false,
      isHydrated: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),

      toggleVegOnly: () => {
        set((state) => {
          const next = !state.isVegOnly;
          return {
            isVegOnly: next,
            user: state.user ? { ...state.user, isVegOnly: next } : null,
          };
        });
      },

      setVegOnly: (val) => {
        set((state) => ({
          isVegOnly: val,
          user: state.user ? { ...state.user, isVegOnly: val } : null,
        }));
      },

      setAuth: (token, user) => {
        dusmintApi.setAuthToken(token, user?.id);
        set({
          token,
          user,
          isAuthenticated: true,
          preferredLanguage: user?.preferredLanguage || 'en',
        });
      },

      setToken: (token) => {
        dusmintApi.setAuthToken(token);
        set({
          token,
          isAuthenticated: true,
        });
      },

      setLanguage: (lang) => {
        set({ preferredLanguage: lang });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      logout: () => {
        dusmintApi.setAuthToken(null, '');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'dusmint-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          dusmintApi.setAuthToken(state.token, state.user?.id);
        }
        useAuthStore.setState({ isHydrated: true });
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        preferredLanguage: state.preferredLanguage,
        isAuthenticated: state.isAuthenticated,
        isVegOnly: state.isVegOnly,
      }),
    }
  )
);
