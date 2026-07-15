import { addMessage as fbSendMessage } from '../apiClient';

export const createChatSlice = (set, get) => ({
  messages: [],

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
