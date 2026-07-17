import { onTasksChange, onMessagesChange, onNotificationsChange, disconnectWS, onWsStatusChange } from '../apiClient';

export const createWSSlice = (set, get) => ({
  wsStatus: 'disconnected',
  unsubscribers: [],
  wsStatusUnsub: null,
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

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('مُهِمَّة - إشعار جديد', {
          body: newNotification.text,
          icon: '/app-icon.png'
        });
      }
      get().addToast(newNotification.text);
    });

    const unsubWsStatus = onWsStatusChange((status) => {
      if (get().sessionToken !== session) return;
      set({ wsStatus: status });
    });

    set({
      unsubscribers: [unsub1, unsub2, unsub3],
      wsStatusUnsub: unsubWsStatus,
    });
  },

  cleanupRealtimeListeners: () => {
    const { unsubscribers, wsStatusUnsub } = get();
    unsubscribers.forEach(unsub => {
      try { unsub(); } catch { /* ignore */ }
    });
    if (wsStatusUnsub) {
      try { wsStatusUnsub(); } catch { /* ignore */ }
    }
    disconnectWS();
    set({ unsubscribers: [], wsStatusUnsub: null, wsStatus: 'disconnected', sessionToken: null });
  },

  initWebSocket: () => {
    get().initRealtimeListeners();
  }
});
