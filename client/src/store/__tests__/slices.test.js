import { describe, test, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';

describe('مُهِمَّتِي - اختبارات Zustand Store Slices', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAppStore.setState({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      tasks: [],
      members: [],
      messages: [],
      notifications: [],
      activeToasts: [],
      authLoading: false,
      authError: null,
      dataLoading: false,
      dataError: null,
      wsStatus: 'disconnected'
    });
  });

  test('شريحة المهام (Task Slice) - تحديث قائمة المهام وحذفها محلياً', () => {
    const store = useAppStore.getState();
    expect(store.tasks.length).toBe(0);

    // Populate mock tasks
    const mockTasks = [
      { id: 1, title: 'مهمة 1', status: 'todo' },
      { id: 2, title: 'مهمة 2', status: 'progress' }
    ];
    useAppStore.setState({ tasks: mockTasks });

    expect(useAppStore.getState().tasks.length).toBe(2);

    // Test status update logic (optimistic update)
    useAppStore.getState().updateTaskStatus(1, 'done');
    expect(useAppStore.getState().tasks.find(t => t.id === 1).status).toBe('done');
  });

  test('شريحة الدردشة (Chat Slice) - تخزين وقراءة الرسائل', () => {
    const store = useAppStore.getState();
    expect(store.messages.length).toBe(0);

    const mockMessages = [
      { id: 1, text: 'مرحباً', senderId: 2 },
      { id: 2, text: 'أهلاً بك', senderId: 1 }
    ];
    useAppStore.setState({ messages: mockMessages });

    expect(useAppStore.getState().messages.length).toBe(2);
    expect(useAppStore.getState().messages[0].text).toBe('مرحباً');
  });

  test('شريحة المصادقة (Auth Slice) - تسجيل الخروج وتنظيف التوكن', async () => {
    // Set authenticated state
    useAppStore.setState({
      token: 'mock-jwt-token-xyz',
      currentUser: { id: 1, name: 'جاسم', role: 'UI/UX' },
      isAuthenticated: true
    });

    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(useAppStore.getState().token).toBe('mock-jwt-token-xyz');

    // Trigger logout
    await useAppStore.getState().logout();

    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(useAppStore.getState().token).toBe(null);
    expect(useAppStore.getState().currentUser).toBe(null);
  });
});
