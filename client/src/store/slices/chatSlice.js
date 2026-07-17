import { fetchMessages as fbFetchMessages, addMessage as fbSendMessage } from '../apiClient';

export const createChatSlice = (set, get) => ({
  messages: [],

  fetchMessages: async (page = 1, limit = 50) => {
    try {
      const msgs = await fbFetchMessages(page, limit);
      set((state) => {
        if (page === 1) {
          return { messages: msgs };
        }
        // Append older messages for pagination
        const existingIds = new Set(state.messages.map(m => m.id));
        const newMsgs = msgs.filter(m => !existingIds.has(m.id));
        return { messages: [...state.messages, ...newMsgs] };
      });
    } catch (err) {
      get().addToast(`تعذر تحميل الرسائل: ${err.message}`, 'error');
    }
  },

  sendMessage: async (text) => {
    const { isOffline, currentUser } = get();
    if (isOffline) {
      get().addToast('لا يمكنك إرسال رسائل أثناء انقطاع الاتصال.', 'error');
      return;
    }
    try {
      await fbSendMessage(text);
    } catch (err) {
      get().addToast(`تعذر إرسال الرسالة: ${err.message}`, 'error');
    }
  }
});
