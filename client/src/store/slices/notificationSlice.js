import { clearNotifications as fbClearNotifications } from '../apiClient';

export const createNotificationSlice = (set, get) => ({
  notifications: [],
  activeToasts: [],
  isOffline: !navigator.onLine,

  setOffline: (offline) => set({ isOffline: offline }),

  addToast: (text) => {
    const id = Date.now() + Math.random();
    let isDuplicate = false;
    set((state) => {
      if (state.activeToasts.some(t => t.text === text)) {
        isDuplicate = true;
        return state;
      }
      return { activeToasts: [...state.activeToasts, { id, text }] };
    });
    
    if (isDuplicate) return;

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
      get().addToast('لا يمكنك مسح الإشعارات أثناء انقطاع الاتصال.');
      return;
    }
    
    const originalNotifications = [...get().notifications];
    set({ notifications: [] });

    try {
      await fbClearNotifications(currentUser?.id || '');
    } catch (err) {
      set({ notifications: originalNotifications });
      get().addToast(`تعذر مسح الإشعارات: ${err.message}`);
    }
  }
});
