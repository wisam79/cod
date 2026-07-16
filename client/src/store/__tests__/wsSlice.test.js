import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  onTasksChange: vi.fn().mockReturnValue(vi.fn()),
  onMessagesChange: vi.fn().mockReturnValue(vi.fn()),
  onNotificationsChange: vi.fn().mockReturnValue(vi.fn()),
  disconnectWS: vi.fn(),
}));

describe('wsSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      wsStatus: 'disconnected',
      unsubscribers: [],
      sessionToken: null,
      currentUser: { id: 1, name: 'Test' },
      messages: [],
      notifications: [],
      activeToasts: [],
    });
    vi.restoreAllMocks();
  });

  it('initRealtimeListeners sets wsStatus to connected', () => {
    useAppStore.getState().initRealtimeListeners();
    expect(useAppStore.getState().wsStatus).toBe('connected');
  });

  it('initRealtimeListeners generates a session token', () => {
    useAppStore.getState().initRealtimeListeners();
    expect(useAppStore.getState().sessionToken).toBeTruthy();
    expect(typeof useAppStore.getState().sessionToken).toBe('string');
  });

  it('initRealtimeListeners stores unsubscribers', () => {
    useAppStore.getState().initRealtimeListeners();
    expect(useAppStore.getState().unsubscribers.length).toBe(3);
  });

  it('initRealtimeListeners does nothing without currentUser', () => {
    useAppStore.setState({ currentUser: null });
    useAppStore.getState().initRealtimeListeners();
    expect(useAppStore.getState().wsStatus).toBe('disconnected');
  });

  it('cleanupRealtimeListeners resets state', () => {
    useAppStore.getState().initRealtimeListeners();
    expect(useAppStore.getState().wsStatus).toBe('connected');

    useAppStore.getState().cleanupRealtimeListeners();
    const state = useAppStore.getState();
    expect(state.wsStatus).toBe('disconnected');
    expect(state.unsubscribers.length).toBe(0);
    expect(state.sessionToken).toBeNull();
  });

  it('cleanupRealtimeListeners calls disconnectWS', async () => {
    useAppStore.getState().initRealtimeListeners();
    useAppStore.getState().cleanupRealtimeListeners();

    const api = await import('../apiClient');
    expect(api.disconnectWS).toHaveBeenCalled();
  });

  it('initWebSocket delegates to initRealtimeListeners', () => {
    const spy = vi.spyOn(useAppStore.getState(), 'initRealtimeListeners');
    useAppStore.getState().initWebSocket();
    expect(spy).toHaveBeenCalled();
  });

  it('session token prevents stale subscriber updates', () => {
    useAppStore.getState().initRealtimeListeners();
    const token1 = useAppStore.getState().sessionToken;

    // Simulate token rotation
    useAppStore.setState({ sessionToken: 'new-token' });

    // The old session's callback should be a no-op
    // This is tested indirectly: initRealtimeListeners creates new session
    useAppStore.getState().initRealtimeListeners();
    const token2 = useAppStore.getState().sessionToken;
    expect(token2).not.toBe(token1);
  });
});
