import { create } from 'zustand';
import { UserProfile, dusmintApi } from '@dusmint/api-client';

const DEFAULT_JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NmE2NGU1NS1lMDM2LTRkNmItOTg3NS1hOGE3MjE0YmE2ZDMiLCJwaG9uZSI6Iis5MTk4NzY1NDMyMTAiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3OTM3Mjc2NzZ9.TM90OsxnalTqH-bW_0tyVayh6fQjpZvsFlnIyQEUL4s';

dusmintApi.setAuthToken(DEFAULT_JWT_TOKEN);

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  preferredLanguage: 'en' | 'hi' | 'mr';
  isAuthenticated: boolean;
  isLoading: boolean;
  isVegOnly: boolean;

  // Actions
  setAuth: (token: string, user: UserProfile) => void;
  setToken: (token: string) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleVegOnly: () => void;
  setVegOnly: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: DEFAULT_JWT_TOKEN,
  user: {
    id: '76a64e55-e036-4d6b-9875-a8a7214ba6d3',
    phone: '+919876543210',
    fullName: 'Dusmint Customer',
    preferredLanguage: 'en',
    trustTier: 1,
    isVegOnly: false,
    createdAt: '2026-10-30T11:18:20.357343+00:00',
  },
  preferredLanguage: 'en',
  isAuthenticated: true,
  isLoading: false,
  isVegOnly: false,

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
    dusmintApi.setAuthToken(token);
    set({
      token,
      user,
      isAuthenticated: true,
      preferredLanguage: user.preferredLanguage || 'en',
    });
  },

  setToken: (token) => {
    dusmintApi.setAuthToken(token);
    set({
      token,
      isAuthenticated: true,
      user: {
        id: '76a64e55-e036-4d6b-9875-a8a7214ba6d3',
        phone: '+919876543210',
        fullName: 'Dusmint Customer',
        preferredLanguage: 'en',
        trustTier: 1,
        isVegOnly: false,
        createdAt: new Date().toISOString(),
      },
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
