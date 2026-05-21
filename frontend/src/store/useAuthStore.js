import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      login: (userData, accessToken) => {
        set({
          user: userData,
          role: userData.role,
          token: accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);
