import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  clearNotifications: vi.fn().mockResolvedValue(undefined),
}));

describe('notificationSlice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({
      notifications: [],
      activeToasts: [],
      isOffline: false,
      currentUser: { id: 1, name: 'Test' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('addToast adds a toast with default info type', () => {
    useAppStore.getState().addToast('رسالة اختبار');
    const state = useAppStore.getState();
    expect(state.activeToasts.length).toBe(1);
    expect(state.activeToasts[0].text).toBe('رسالة اختبار');
    expect(state.activeToasts[0].type).toBe('info');
  });

  it('addToast adds a toast with specified type', () => {
    useAppStore.getState().addToast('نجاح', 'success');
    const state = useAppStore.getState();
    expect(state.activeToasts[0].type).toBe('success');
  });

  it('addToast auto-dismisses after 4 seconds', () => {
    useAppStore.getState().addToast('مؤقت');
    expect(useAppStore.getState().activeToasts.length).toBe(1);

    vi.advanceTimersByTime(4000);
    expect(useAppStore.getState().activeToasts.length).toBe(0);
  });

  it('addToast deduplicates by text', () => {
    useAppStore.getState().addToast('نفس الرسالة');
    useAppStore.getState().addToast('نفس الرسالة');
    expect(useAppStore.getState().activeToasts.length).toBe(1);
  });

  it('addToast allows different text toasts', () => {
    useAppStore.getState().addToast('رسالة أولى');
    useAppStore.getState().addToast('رسالة ثانية');
    expect(useAppStore.getState().activeToasts.length).toBe(2);
  });

  it('removeToast removes a toast by id', () => {
    useAppStore.getState().addToast('محذوفة');
    const id = useAppStore.getState().activeToasts[0].id;
    useAppStore.getState().removeToast(id);
    expect(useAppStore.getState().activeToasts.length).toBe(0);
  });

  it('setOffline toggles isOffline state', () => {
    useAppStore.getState().setOffline(true);
    expect(useAppStore.getState().isOffline).toBe(true);
    useAppStore.getState().setOffline(false);
    expect(useAppStore.getState().isOffline).toBe(false);
  });

  it('clearNotifications clears notifications when online', async () => {
    useAppStore.setState({ notifications: [{ id: 1, text: 'notif' }] });
    await useAppStore.getState().clearNotifications();
    expect(useAppStore.getState().notifications.length).toBe(0);
  });

  it('clearNotifications shows error when offline', async () => {
    useAppStore.setState({ isOffline: true });
    await useAppStore.getState().clearNotifications();
    expect(useAppStore.getState().activeToasts.length).toBe(1);
    expect(useAppStore.getState().activeToasts[0].text).toContain('انقطاع');
  });

  it('clearNotifications rolls back on API error', async () => {
    const { clearNotifications } = await import('../apiClient');
    clearNotifications.mockRejectedValueOnce(new Error('Network error'));

    useAppStore.setState({ notifications: [{ id: 1, text: 'test' }] });
    await useAppStore.getState().clearNotifications();

    expect(useAppStore.getState().notifications.length).toBe(1);
    expect(useAppStore.getState().activeToasts[0].text).toContain('Network error');
  });
});
