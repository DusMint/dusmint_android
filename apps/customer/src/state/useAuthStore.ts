import { create } from 'zustand';
import { UserProfile, dusmintApi } from '@dusmint/api-client';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  preferredLanguage: 'en' | 'hi' | 'mr';
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, user: UserProfile) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  preferredLanguage: 'en',
  isAuthenticated: false,
  isLoading: false,

  setAuth: (token, user) => {
    dusmintApi.setAuthToken(token);
    set({
      token,
      user,
      isAuthenticated: true,
      preferredLanguage: user.preferredLanguage || 'en',
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
    dusmintApi.setAuthToken(null);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
