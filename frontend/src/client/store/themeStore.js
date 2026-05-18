import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  isNight: false,
  toggleTheme: () => set((state) => ({ isNight: !state.isNight })),
  setNightMode: (value) => set({ isNight: value }),
}))
