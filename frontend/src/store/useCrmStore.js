import { create } from 'zustand';

export const useCrmStore = create((set) => ({
  selectedClientId: null,
  isDrawerOpen: false,
  isChatOpen: false,
  
  // Analytics
  analytics: null,
  setAnalytics: (analytics) => set({ analytics }),
  
  // Filters & Sort
  filters: {
    search: '',
    status: '',
    designerId: '',
    sort: '-createdAt'
  },
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),

  // UI Actions
  openClientDrawer: (clientId) => set({ selectedClientId: clientId, isDrawerOpen: true }),
  closeClientDrawer: () => set({ selectedClientId: null, isDrawerOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  
  // Live Updates
  updateClientInList: (clientId, updates) => set((state) => {
    // Handling live updates would depend on if we keep clients in this store or use React Query.
    // Assuming React Query is used for caching, we'd invalidate queries instead.
    return state;
  })
}));
