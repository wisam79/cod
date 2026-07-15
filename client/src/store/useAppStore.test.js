import { describe, test, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';

describe('مُهِمَّتِي - اختبارات حالة الواجهة الأمامية (Zustand Store Tests)', () => {
  
  beforeEach(() => {
    // Reset Zustand store state if necessary before each test
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
      error: null
    });
  });

  test('تحديث حالة الاتصال بالشبكة (Offline / Online State)', () => {
    const store = useAppStore.getState();
    expect(store.isOffline).toBeFalsy(); // Default state

    store.setOffline(true);
    expect(useAppStore.getState().isOffline).toBe(true);

    store.setOffline(false);
    expect(useAppStore.getState().isOffline).toBe(false);
  });

  test('إضافة وإزالة التنبيهات المؤقتة (Toast notifications)', () => {
    const store = useAppStore.getState();
    expect(store.activeToasts.length).toBe(0);

    store.addToast('مهمة جديدة تمت إضافتها!');
    const toasts = useAppStore.getState().activeToasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].text).toBe('مهمة جديدة تمت إضافتها!');

    const toastId = toasts[0].id;
    store.removeToast(toastId);
    expect(useAppStore.getState().activeToasts.length).toBe(0);
  });
});
