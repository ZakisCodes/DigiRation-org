'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, FamilyMember } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User) => void;
  setSelectedMember: (member: FamilyMember | null) => void;
  setToken: (token: string) => void;
  setSessionId: (sessionId: string | null) => void;
  login: (user: User, member: FamilyMember | null, token: string) => void;
  logout: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      selectedMember: null,
      token: null,
      sessionId: null,

      // Actions
      setUser: (user: User) => {
        set({ user });
      },

      setSelectedMember: (member: FamilyMember | null) => {
        set({ selectedMember: member });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      setSessionId: (sessionId: string | null) => {
        set({ sessionId });
      },

      login: (user: User, member: FamilyMember | null, token: string) => {
        set({
          isAuthenticated: true,
          user,
          selectedMember: member,
          token,
          sessionId: null, // Clear session ID after successful login
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          selectedMember: null,
          token: null,
          sessionId: null,
        });
      },

      clearSession: () => {
        set({
          sessionId: null,
        });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        selectedMember: state.selectedMember,
        token: state.token,
        // Don't persist sessionId as it's temporary
      }),
    }
  )
);