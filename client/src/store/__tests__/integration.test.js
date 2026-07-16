import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn().mockResolvedValue(undefined),
  onAuthChange: vi.fn().mockReturnValue(vi.fn()),
  fetchMembers: vi.fn().mockResolvedValue([]),
  fetchTasks: vi.fn().mockResolvedValue([]),
  fetchMessages: vi.fn().mockResolvedValue([]),
  addMessage: vi.fn().mockResolvedValue({}),
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  addComment: vi.fn(),
  clearNotifications: vi.fn().mockResolvedValue(undefined),
  disconnectWS: vi.fn(),
  onTasksChange: vi.fn().mockReturnValue(vi.fn()),
  onMessagesChange: vi.fn().mockReturnValue(vi.fn()),
  onNotificationsChange: vi.fn().mockReturnValue(vi.fn()),
}));

describe('Integration: Store + API interactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tasks: [],
      members: [],
      messages: [],
      notifications: [],
      activeToasts: [],
      isOffline: false,
      wsStatus: 'disconnected',
      unsubscribers: [],
      sessionToken: null,
      adminMembers: [],
      adminSettings: { allowUserRegistration: true, maintenanceMode: false, maxTasksPerUser: 10 },
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Full login flow', () => {
    it('login stores credentials, fetches data, and initializes realtime', async () => {
      const api = await import('../apiClient');
      api.loginUser.mockResolvedValueOnce({
        token: 'jwt-123',
        member: { id: 1, name: 'أحمد', email: 'a@t.com', role: 'dev', avatar: '' }
      });
      api.fetchTasks.mockResolvedValueOnce([{ id: 1, title: 'Task' }]);
      api.fetchMembers.mockResolvedValueOnce([{ id: 1, name: 'أحمد' }]);

      await useAppStore.getState().login('a@t.com', 'pass');

      const state = useAppStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('jwt-123');
      expect(state.tasks.length).toBe(1);
      expect(state.members.length).toBe(1);
      expect(localStorage.getItem('auth_token')).toBe('jwt-123');
    });
  });

  describe('Logout cleanup', () => {
    it('logout clears everything including localStorage and unsubscribers', async () => {
      useAppStore.setState({
        token: 'tok',
        currentUser: { id: 1, name: 'Test' },
        isAuthenticated: true,
        tasks: [{ id: 1 }],
        messages: [{ id: 1 }],
        notifications: [{ id: 1 }],
        unsubscribers: [vi.fn(), vi.fn()],
        wsStatus: 'connected'
      });

      await useAppStore.getState().logout();

      const state = useAppStore.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.tasks).toEqual([]);
      expect(state.messages).toEqual([]);
      expect(state.notifications).toEqual([]);
      expect(state.unsubscribers).toEqual([]);
      expect(state.wsStatus).toBe('disconnected');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Offline task operations', () => {
    it('blocks addTask when offline', async () => {
      useAppStore.setState({ isOffline: true });
      await useAppStore.getState().addTask({ title: 'Offline' });
      expect(useAppStore.getState().tasks.length).toBe(0);
    });

    it('optimistic updateTaskStatus persists to localStorage when offline', async () => {
      useAppStore.setState({
        isOffline: true,
        tasks: [{ id: 1, status: 'todo' }]
      });
      await useAppStore.getState().updateTaskStatus(1, 'done');
      expect(useAppStore.getState().tasks[0].status).toBe('done');
      const cached = JSON.parse(localStorage.getItem('cached_tasks'));
      expect(cached[0].status).toBe('done');
    });

    it('blocks deleteTask when offline', async () => {
      useAppStore.setState({ isOffline: true, tasks: [{ id: 1 }] });
      await useAppStore.getState().deleteTask(1);
      expect(useAppStore.getState().tasks.length).toBe(1);
    });

    it('blocks sendMessage when offline', async () => {
      useAppStore.setState({ isOffline: true });
      await useAppStore.getState().sendMessage('offline msg');
      expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);
    });

    it('blocks addCommentToTask when offline', async () => {
      useAppStore.setState({ isOffline: true });
      await useAppStore.getState().addCommentToTask(1, 'comment');
      expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);
    });

    it('blocks clearNotifications when offline', async () => {
      useAppStore.setState({ isOffline: true, notifications: [{ id: 1 }] });
      await useAppStore.getState().clearNotifications();
      expect(useAppStore.getState().notifications.length).toBe(1);
    });
  });

  describe('Task rollback on error', () => {
    it('addTask rolls back on API failure', async () => {
      useAppStore.setState({ tasks: [{ id: 1, title: 'Original' }] });
      const api = await import('../apiClient');
      api.addTask.mockRejectedValueOnce(new Error('fail'));

      await useAppStore.getState().addTask({ title: 'New' });
      expect(useAppStore.getState().tasks).toEqual([{ id: 1, title: 'Original' }]);
    });

    it('updateTaskStatus rolls back on API failure', async () => {
      useAppStore.setState({ tasks: [{ id: 1, status: 'todo' }] });
      const api = await import('../apiClient');
      api.updateTask.mockRejectedValueOnce(new Error('fail'));

      await useAppStore.getState().updateTaskStatus(1, 'done');
      expect(useAppStore.getState().tasks[0].status).toBe('todo');
    });

    it('deleteTask rolls back on API failure', async () => {
      useAppStore.setState({ tasks: [{ id: 1, title: 'Not Deleted' }] });
      const api = await import('../apiClient');
      api.deleteTask.mockRejectedValueOnce(new Error('fail'));

      await useAppStore.getState().deleteTask(1);
      expect(useAppStore.getState().tasks.length).toBe(1);
    });
  });

  describe('Chat message merge (dedup)', () => {
    it('fetchMessages page > 1 deduplicates by id', async () => {
      useAppStore.setState({ messages: [{ id: 2, text: 'existing' }] });
      const api = await import('../apiClient');
      api.fetchMessages.mockResolvedValueOnce([
        { id: 1, text: 'older' },
        { id: 2, text: 'existing' }
      ]);

      await useAppStore.getState().fetchMessages(2);
      const msgs = useAppStore.getState().messages;
      expect(msgs.filter(m => m.id === 2).length).toBe(1);
      expect(msgs.length).toBe(2);
    });

    it('fetchMessages page 1 replaces messages', async () => {
      useAppStore.setState({ messages: [{ id: 1, text: 'old' }] });
      const api = await import('../apiClient');
      api.fetchMessages.mockResolvedValueOnce([{ id: 2, text: 'new' }]);

      await useAppStore.getState().fetchMessages(1);
      expect(useAppStore.getState().messages).toEqual([{ id: 2, text: 'new' }]);
    });
  });

  describe('Toast lifecycle', () => {
    it('addToast with type stores correct type', () => {
      useAppStore.getState().addToast('msg', 'error');
      expect(useAppStore.getState().activeToasts[0].type).toBe('error');
    });

    it('addToast defaults to info', () => {
      useAppStore.getState().addToast('msg');
      expect(useAppStore.getState().activeToasts[0].type).toBe('info');
    });

    it('toast auto-removes after 4s', () => {
      useAppStore.getState().addToast('temp');
      vi.advanceTimersByTime(4000);
      expect(useAppStore.getState().activeToasts.length).toBe(0);
    });

    it('toast deduplication by text', () => {
      useAppStore.getState().addToast('same');
      useAppStore.getState().addToast('same');
      expect(useAppStore.getState().activeToasts.length).toBe(1);
    });
  });

  describe('Offline state toggle', () => {
    it('setOffline toggles and affects task operations', async () => {
      useAppStore.getState().setOffline(true);
      expect(useAppStore.getState().isOffline).toBe(true);

      await useAppStore.getState().addTask({ title: 'test' });
      expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);

      useAppStore.getState().setOffline(false);
      expect(useAppStore.getState().isOffline).toBe(false);
    });
  });

  describe('Session-scoped realtime listeners', () => {
    it('initRealtimeListeners creates a new session', () => {
      useAppStore.setState({ currentUser: { id: 1, name: 'Test' } });
      useAppStore.getState().initRealtimeListeners();
      const token1 = useAppStore.getState().sessionToken;
      expect(token1).not.toBeNull();
      useAppStore.getState().cleanupRealtimeListeners();
      useAppStore.setState({ currentUser: { id: 1, name: 'Test' } });
      useAppStore.getState().initRealtimeListeners();
      const token2 = useAppStore.getState().sessionToken;
      expect(token2).not.toBeNull();
      expect(token1).not.toBe(token2);
    });

    it('cleanup stops all listeners', async () => {
      useAppStore.setState({ currentUser: { id: 1, name: 'Test' } });
      useAppStore.getState().initRealtimeListeners();
      useAppStore.getState().cleanupRealtimeListeners();
      const api = await import('../apiClient');
      expect(api.disconnectWS).toHaveBeenCalled();
    });
  });
});
