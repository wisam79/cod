import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../useAppStore';

describe('useAppStore Zustand Store', () => {
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
      isLoading: false,
      error: null,
      wsStatus: 'disconnected'
    });
    vi.restoreAllMocks();
  });

  it('should initialize with default states', () => {
    const state = useAppStore.getState();
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.tasks).toEqual([]);
    expect(state.activeToasts).toEqual([]);
  });

  it('should handle setOffline state', () => {
    const store = useAppStore.getState();
    
    store.setOffline(true);
    expect(useAppStore.getState().isOffline).toBe(true);

    store.setOffline(false);
    expect(useAppStore.getState().isOffline).toBe(false);
  });

  it('should add and remove toasts', () => {
    const store = useAppStore.getState();
    
    // Add toast
    store.addToast('تمت المهمة بنجاح');
    let state = useAppStore.getState();
    expect(state.activeToasts.length).toBe(1);
    expect(state.activeToasts[0].text).toBe('تمت المهمة بنجاح');

    const toastId = state.activeToasts[0].id;

    // Remove toast
    store.removeToast(toastId);
    state = useAppStore.getState();
    expect(state.activeToasts.length).toBe(0);
  });

  it('should logout and clear authentication credentials', async () => {
    // Manually set some authenticated state
    useAppStore.setState({
      token: 'mock-token-xyz',
      currentUser: { id: 1, name: 'سارة' },
      isAuthenticated: true,
      tasks: [{ id: 101, title: 'مهمة 1' }]
    });

    const store = useAppStore.getState();
    await store.logout();

    const state = useAppStore.getState();
    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.tasks).toEqual([]);
  });
});
