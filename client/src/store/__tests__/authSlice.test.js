import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn().mockResolvedValue(undefined),
  onAuthChange: vi.fn().mockReturnValue(vi.fn()),
  fetchMembers: vi.fn().mockResolvedValue([]),
  fetchTasks: vi.fn().mockResolvedValue([]),
  disconnectWS: vi.fn(),
  onTasksChange: vi.fn().mockReturnValue(vi.fn()),
  onMessagesChange: vi.fn().mockReturnValue(vi.fn()),
  onNotificationsChange: vi.fn().mockReturnValue(vi.fn()),
  onWsStatusChange: vi.fn().mockReturnValue(vi.fn()),
}));

describe('authSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null,
      tasks: [],
      members: [],
      messages: [],
      notifications: [],
      activeToasts: [],
      adminMembers: [],
      adminSettings: { allowUserRegistration: true, maintenanceMode: false, maxTasksPerUser: 10 },
      unsubscribers: [],
      wsStatus: 'disconnected',
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('login sets authenticated state on success', async () => {
    const api = await import('../apiClient');
    api.loginUser.mockResolvedValueOnce({
      token: 'jwt-token-123',
      member: { id: 1, name: 'أحمد', email: 'a@test.com', role: 'developer', avatar: '' }
    });

    await useAppStore.getState().login('a@test.com', 'pass');
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('jwt-token-123');
    expect(state.currentUser.name).toBe('أحمد');
    expect(state.authLoading).toBe(false);
  });

  it('login stores token in localStorage', async () => {
    const api = await import('../apiClient');
    api.loginUser.mockResolvedValueOnce({
      token: 'jwt-token',
      member: { id: 1, name: 'Test', email: 't@test.com', role: 'dev', avatar: '' }
    });

    await useAppStore.getState().login('t@test.com', 'pass');
    expect(localStorage.getItem('auth_token')).toBe('jwt-token');
  });

  it('login stores offline user in localStorage', async () => {
    const api = await import('../apiClient');
    api.loginUser.mockResolvedValueOnce({
      token: 'jwt-token',
      member: { id: 1, name: 'Test', email: 't@test.com', role: 'dev', avatar: '' }
    });

    await useAppStore.getState().login('t@test.com', 'pass');
    const offlineUser = JSON.parse(localStorage.getItem('offline_user'));
    expect(offlineUser.id).toBe(1);
    expect(offlineUser.name).toBe('Test');
  });

  it('login sets error on failure', async () => {
    const api = await import('../apiClient');
    api.loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    try {
      await useAppStore.getState().login('bad@test.com', 'wrong');
    } catch {}
    const state = useAppStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.authError).toBe('Invalid credentials');
    expect(state.authLoading).toBe(false);
  });

  it('login shows success toast', async () => {
    const api = await import('../apiClient');
    api.loginUser.mockResolvedValueOnce({
      token: 't',
      member: { id: 1, name: 'سارة', email: 's@test.com', role: 'dev', avatar: '' }
    });

    await useAppStore.getState().login('s@test.com', 'pass');
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('سارة') && t.type === 'success')).toBe(true);
  });

  it('logout clears all state', async () => {
    useAppStore.setState({
      token: 'token-xyz',
      currentUser: { id: 1, name: 'User' },
      isAuthenticated: true,
      tasks: [{ id: 1 }],
      messages: [{ id: 1 }],
      notifications: [{ id: 1 }],
    });

    await useAppStore.getState().logout();
    const state = useAppStore.getState();

    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.tasks).toEqual([]);
    expect(state.messages).toEqual([]);
    expect(state.notifications).toEqual([]);
  });

  it('logout clears localStorage', async () => {
    localStorage.setItem('auth_token', 'to-delete');
    localStorage.setItem('offline_user', '{}');

    await useAppStore.getState().logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('offline_user')).toBeNull();
    expect(localStorage.getItem('cached_tasks')).toBeNull();
    expect(localStorage.getItem('cached_members')).toBeNull();
  });

  it('logout shows success toast', async () => {
    await useAppStore.getState().logout();
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('تسجيل الخروج') && t.type === 'success')).toBe(true);
  });
});
