import { loginUser, logoutUser, onAuthChange } from '../apiClient';

export const createAuthSlice = (set, get) => ({
  token: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginUser(email, password);
      localStorage.setItem('auth_token', user.token);
      const userData = { id: user.member.id, name: user.member.name, email: user.member.email, role: user.member.role, avatar: user.member.avatar };
      localStorage.setItem('offline_user', JSON.stringify(userData));
      set({
        token: user.token,
        currentUser: userData,
        isAuthenticated: true,
        isLoading: false
      });
      get().addToast(`مرحباً بك مجدداً، ${user.member.name}!`, 'success');
      await get().fetchInitialData();
      get().initRealtimeListeners();
      if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => Notification.requestPermission(), 2000);
      }
    } catch (err) {
      set({ isLoading: false, error: err.message || 'خطأ في تسجيل الدخول' });
      throw err;
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    get().cleanupRealtimeListeners();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('offline_user');
    localStorage.removeItem('cached_tasks');
    localStorage.removeItem('cached_members');
    set({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      isOffline: !navigator.onLine,
      tasks: [],
      messages: [],
      notifications: [],
      members: [],
      adminMembers: [],
      adminSettings: { allowUserRegistration: true, maintenanceMode: false, maxTasksPerUser: 10 },
      wsStatus: 'disconnected'
    });
    get().addToast('تم تسجيل الخروج بنجاح.', 'success');
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      let settled = false;
      const unsubscribe = onAuthChange(async (user) => {
        if (settled) return;
        settled = true;
        unsubscribe();
        if (!user) {
          localStorage.removeItem('auth_token');
          set({ token: null, currentUser: null, isAuthenticated: false, isLoading: false });
          return;
        }
        try {
          const token = await user.getIdToken();
          const userData = { id: user.uid, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
          localStorage.setItem('offline_user', JSON.stringify(userData));
          set({
            token,
            currentUser: userData,
            isAuthenticated: true,
            isLoading: false
          });
          await get().fetchInitialData();
          get().initRealtimeListeners();
        } catch (err) {
          console.error('Failed to restore session:', err);
          let offlineUser = null;
          try { offlineUser = JSON.parse(localStorage.getItem('offline_user')); } catch (_) {}
          if (offlineUser) {
            set({
              token: null,
              currentUser: offlineUser,
              isAuthenticated: true,
              isLoading: false
            });
            await get().fetchInitialData();
            get().initRealtimeListeners();
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('offline_user');
            set({ token: null, currentUser: null, isAuthenticated: false, isLoading: false });
          }
        }
      });
      await new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          if (!settled) {
            settled = true;
            unsubscribe();
            let offlineUser = null;
            try { offlineUser = JSON.parse(localStorage.getItem('offline_user')); } catch (_) {}
            if (offlineUser) {
              set({
                token: null,
                currentUser: offlineUser,
                isAuthenticated: true,
                isLoading: false
              });
              get().fetchInitialData().catch(() => {});
              get().initRealtimeListeners();
            } else {
              set({ isLoading: false, isAuthenticated: false });
            }
            resolve();
          }
        }, 6000);
        
        const checkSettled = setInterval(() => {
          if (settled) {
            clearInterval(checkSettled);
            clearTimeout(timeoutId);
            resolve();
          }
        }, 100);
      });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  }
});
