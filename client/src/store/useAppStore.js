import { create } from 'zustand';
import { createAuthSlice } from './slices/authSlice';
import { createTaskSlice } from './slices/taskSlice';
import { createChatSlice } from './slices/chatSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { createWSSlice } from './slices/wsSlice';

export const useAppStore = create((set, get) => ({
  ...createAuthSlice(set, get),
  ...createTaskSlice(set, get),
  ...createChatSlice(set, get),
  ...createNotificationSlice(set, get),
  ...createWSSlice(set, get),
}));
