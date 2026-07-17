import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  fetchMessages: vi.fn().mockResolvedValue([]),
  addMessage: vi.fn(),
  onWsStatusChange: vi.fn().mockReturnValue(vi.fn()),
}));

describe('chatSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      messages: [],
      isOffline: false,
      currentUser: { id: 1, name: 'Test User' },
      activeToasts: [],
    });
    vi.restoreAllMocks();
  });

  it('fetchMessages loads messages on page 1 (replaces)', async () => {
    const api = await import('../apiClient');
    api.fetchMessages.mockResolvedValueOnce([
      { id: 1, text: 'مرحباً' },
      { id: 2, text: 'أهلاً' }
    ]);

    await useAppStore.getState().fetchMessages(1);
    expect(useAppStore.getState().messages.length).toBe(2);
    expect(useAppStore.getState().messages[0].text).toBe('مرحباً');
  });

  it('fetchMessages appends older messages with dedup on page > 1', async () => {
    useAppStore.setState({ messages: [{ id: 2, text: 'أهلاً' }] });

    const api = await import('../apiClient');
    api.fetchMessages.mockResolvedValueOnce([
      { id: 1, text: 'قديمة' },
      { id: 2, text: 'أهلاً' }  // duplicate
    ]);

    await useAppStore.getState().fetchMessages(2);
    const messages = useAppStore.getState().messages;
    expect(messages.length).toBe(2);
    expect(messages.some(m => m.id === 2)).toBe(true);
    expect(messages.some(m => m.id === 1)).toBe(true);
  });

  it('fetchMessages shows error toast on failure', async () => {
    const api = await import('../apiClient');
    api.fetchMessages.mockRejectedValueOnce(new Error('Network error'));

    await useAppStore.getState().fetchMessages();
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Network error'))).toBe(true);
  });

  it('sendMessage sends when online', async () => {
    const api = await import('../apiClient');
    api.addMessage.mockResolvedValueOnce({});
    await useAppStore.getState().sendMessage('مرحباً بالجميع');
    expect(api.addMessage).toHaveBeenCalledWith('مرحباً بالجميع');
  });

  it('sendMessage blocks when offline', async () => {
    useAppStore.setState({ isOffline: true });
    await useAppStore.getState().sendMessage('رسالة');
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);
  });

  it('sendMessage shows error toast on failure', async () => {
    const api = await import('../apiClient');
    api.addMessage.mockRejectedValueOnce(new Error('Send failed'));

    await useAppStore.getState().sendMessage('fail');
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Send failed'))).toBe(true);
  });
});
