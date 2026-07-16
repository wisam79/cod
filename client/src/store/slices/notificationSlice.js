import { clearNotifications as fbClearNotifications } from '../apiClient';

export const createNotificationSlice = (set, get) => ({
  notifications: [],
  activeToasts: [],
  isOffline: !navigator.onLine,

  setOffline: (offline) => set({ isOffline: offline }),

  addToast: (text, type = 'info') => {
    const id = Date.now() + Math.random();
    set((state) => {
      if (state.activeToasts.some(t => t.text === text)) {
        return state;
      }
      return { activeToasts: [...state.activeToasts, { id, text, type }] };
    });

    setTimeout(() => {
      set((state) => ({
        activeToasts: state.activeToasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },

  removeToast: (id) => set((state) => ({
    activeToasts: state.activeToasts.filter((t) => t.id !== id)
  })),

  clearNotifications: async () => {
    const { isOffline, currentUser } = get();
    if (isOffline) {
      get().addToast('لا يمكنك مسح الإشعارات أثناء انقطاع الاتصال.', 'error');
      return;
    }
    
    const originalNotifications = [...get().notifications];
    set({ notifications: [] });

    try {
      await fbClearNotifications(currentUser?.id || '');
    } catch (err) {
      set({ notifications: originalNotifications });
      get().addToast(`تعذر مسح الإشعارات: ${err.message}`, 'error');
    }
  }
});
