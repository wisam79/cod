import { onTasksChange, onMessagesChange, onNotificationsChange } from '../apiClient';

export const createWSSlice = (set, get) => ({
  wsStatus: 'disconnected',
  unsubscribers: [],
  sessionToken: null,

  initRealtimeListeners: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    get().cleanupRealtimeListeners();
    const session = Math.random().toString(36).slice(2);
    set({ wsStatus: 'connecting', sessionToken: session });

    const unsub1 = onTasksChange(async () => {
      if (get().sessionToken !== session) return;
      await get().fetchInitialData();
    });

    const unsub2 = onMessagesChange((payload) => {
      if (get().sessionToken !== session) return;
      const newMessage = payload.data ?? payload;
      set((state) => {
        if (state.messages.some(m => m.id === newMessage.id)) return state;
        return { messages: [newMessage, ...state.messages] };
      });
    });

    const unsub3 = onNotificationsChange((newNotification) => {
      if (get().sessionToken !== session) return;
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
    set({ unsubscribers: [], wsStatus: 'disconnected', sessionToken: null });
  },

  initWebSocket: () => {
    get().initRealtimeListeners();
  }
});
