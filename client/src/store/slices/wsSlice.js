import { onTasksChange, onMessagesChange, onNotificationsChange } from '../firebaseService';

export const createWSSlice = (set, get) => ({
  wsStatus: 'disconnected',
  unsubscribers: [],

  initRealtimeListeners: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    get().cleanupRealtimeListeners();
    set({ wsStatus: 'connecting' });

    const unsub1 = onTasksChange(async (event) => {
      // For tasks, it's safer to refetch the whole list to maintain order and relations
      await get().fetchInitialData();
    });

    const unsub2 = onMessagesChange((newMessage) => {
      set((state) => ({ messages: [newMessage, ...state.messages] }));
    });

    const unsub3 = onNotificationsChange(currentUser.id, (newNotification) => {
      const prevNotifs = get().notifications;
      if (prevNotifs.some(p => p.id === newNotification.id)) return;
      
      set((state) => ({ notifications: [newNotification, ...state.notifications] }));

      if (Notification.permission === 'granted') {
        new Notification('مُهِمَّة - إشعار جديد', {
          body: newNotification.text,
          icon: '/app-icon.png'
        });
      }
      get().addToast(newNotification.text);
    });

    set({
      unsubscribers: [unsub1, unsub2, unsub3],
      wsStatus: 'connected'
    });
  },

  cleanupRealtimeListeners: () => {
    const { unsubscribers } = get();
    unsubscribers.forEach(unsub => {
      try { unsub(); } catch { /* ignore */ }
    });
    set({ unsubscribers: [], wsStatus: 'disconnected' });
  },

  initWebSocket: () => {
    get().initRealtimeListeners();
  }
});
