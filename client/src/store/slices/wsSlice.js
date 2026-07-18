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

    const unsub1 = onTasksChange(async (data) => {
      if (get().sessionToken !== session) return;
      if (!data || !data.type) {
        await get().fetchInitialData();
        return;
      }
      const { type, payload } = data;
      if (type === 'task_created') {
        set((state) => {
          if (state.tasks.some(t => t.id === payload.id)) return state;
          return { tasks: [payload, ...state.tasks] };
        });
      } else if (type === 'task_updated') {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === payload.id ? payload : t)
        }));
      } else if (type === 'task_deleted') {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== payload.id)
        }));
      } else if (type === 'comment_created') {
        const { taskId, comment } = payload;
        set((state) => ({
          tasks: state.tasks.map(t => {
            if (t.id === taskId) {
              const comments = t.comments || [];
              if (comments.some(c => c.id === comment.id)) return t;
              return { ...t, comments: [...comments, comment] };
            }
            return t;
          })
        }));
      } else if (type === 'comment_deleted') {
        const { taskId, commentId } = payload;
        set((state) => ({
          tasks: state.tasks.map(t => {
            if (t.id === taskId) {
              const comments = t.comments || [];
              return { ...t, comments: comments.filter(c => c.id !== commentId) };
            }
            return t;
          })
        }));
      } else {
        await get().fetchInitialData();
      }
    });

    const unsub2 = onMessagesChange((payload) => {
      if (get().sessionToken !== session) return;
      const newMessage = payload.data ?? payload;
      set((state) => {
        if (state.messages.some(m => m.id === newMessage.id)) return state;
        return { messages: [newMessage, ...state.messages] };
      });
    });

    const unsub3 = onNotificationsChange((data) => {
      if (get().sessionToken !== session) return;
      if (data && data.type === 'notifications_cleared') {
        set({ notifications: [] });
        return;
      }
      const newNotification = (data && data.payload) ? data.payload : data;
      if (!newNotification || !newNotification.id) return;
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
