import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setCredentials: (user, token) => set({ user, token, isAuthenticated: !!token }),
      setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
      updateUser: (userData) => set((state) => ({ 
        user: state.user ? { ...state.user, ...userData } : userData 
      })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
