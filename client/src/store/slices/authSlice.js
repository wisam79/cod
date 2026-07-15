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
      get().addToast(`مرحباً بك مجدداً، ${user.member.name}!`);
      await get().fetchInitialData();
      get().initRealtimeListeners();
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
    set({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      tasks: [],
      messages: [],
      notifications: [],
      members: [],
      wsStatus: 'disconnected'
    });
    get().addToast('تم تسجيل الخروج بنجاح.');
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => {
        const unsubscribe = onAuthChange(async (user) => {
          unsubscribe();
          if (!user) {
            localStorage.removeItem('auth_token');
            set({ token: null, currentUser: null, isAuthenticated: false, isLoading: false });
            resolve();
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
          resolve();
        });
      });
    } catch {
      set({ isLoading: false });
    }
  }
});
