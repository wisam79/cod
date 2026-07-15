import { fetchMessages as fbFetchMessages, addMessage as fbSendMessage } from '../apiClient';

export const createChatSlice = (set, get) => ({
  messages: [],

  fetchMessages: async (page = 1, limit = 50) => {
    try {
      const msgs = await fbFetchMessages(page, limit);
      set({ messages: msgs });
    } catch (err) {
      get().addToast(`تعذر تحميل الرسائل: ${err.message}`);
    }
  },

  sendMessage: async (text) => {
    const { isOffline, currentUser } = get();
    if (isOffline) {
      get().addToast('لا يمكنك إرسال رسائل أثناء انقطاع الاتصال.');
      return;
    }
    try {
      await fbSendMessage(text, currentUser?.id || '');
    } catch (err) {
      get().addToast(`تعذر إرسال الرسالة: ${err.message}`);
    }
  }
});
