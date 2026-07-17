import { loginUser, logoutUser, onAuthChange, updateProfile, changePassword } from '../apiClient';

export const createAuthSlice = (set, get) => ({
  token: null,
  currentUser: null,
  isAuthenticated: false,
  authLoading: false,
  authError: null,

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const user = await loginUser(email, password);
      localStorage.setItem('auth_token', user.token);
      const userData = { id: user.member.id, name: user.member.name, email: user.member.email, role: user.member.role, avatar: user.member.avatar };
      localStorage.setItem('offline_user', JSON.stringify(userData));
      set({
        token: user.token,
        currentUser: userData,
        isAuthenticated: true,
        authLoading: false
      });
      get().addToast(`مرحباً بك مجدداً، ${user.member.name}!`, 'success');
      await get().fetchInitialData();
      get().initRealtimeListeners();
      if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => Notification.requestPermission(), 2000);
      }
    } catch (err) {
      set({ authLoading: false, authError: err.message || 'خطأ في تسجيل الدخول' });
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
    set({ authLoading: true, authError: null });
    try {
      let settled = false;
      const unsubscribe = onAuthChange(async (user, meta) => {
        if (settled) return;
        settled = true;
        unsubscribe();
        if (!user) {
          if (meta && meta.keepToken) {
            let offlineUser = null;
            try { offlineUser = JSON.parse(localStorage.getItem('offline_user')); } catch (_) {}
            if (offlineUser) {
              set({
                token: localStorage.getItem('auth_token'),
                currentUser: offlineUser,
                isAuthenticated: true,
                authLoading: false
              });
              get().fetchInitialData().catch(() => {});
              return;
            }
          }
          localStorage.removeItem('auth_token');
          localStorage.removeItem('offline_user');
          set({ token: null, currentUser: null, isAuthenticated: false, authLoading: false });
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
            authLoading: false
          });
          await get().fetchInitialData();
          get().initRealtimeListeners();
        } catch (err) {
          if (import.meta.env.DEV) console.error('Failed to restore session:', err);
          let offlineUser = null;
          try { offlineUser = JSON.parse(localStorage.getItem('offline_user')); } catch (_) {}
          if (offlineUser) {
            set({
              token: null,
              currentUser: offlineUser,
              isAuthenticated: false,
              authLoading: false
            });
            get().fetchInitialData().catch(() => {});
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('offline_user');
            set({ token: null, currentUser: null, isAuthenticated: false, authLoading: false });
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
                isAuthenticated: false,
                authLoading: false
              });
              get().fetchInitialData().catch(() => {});
            } else {
              set({ authLoading: false, isAuthenticated: false });
            }
          }
          resolve();
        }, 6000);

        const originalResolve = resolve;
        const checkSettled = setInterval(() => {
          if (settled) {
            clearInterval(checkSettled);
            clearTimeout(timeoutId);
            originalResolve();
          }
        }, 500);
      });
    } catch {
      set({ authLoading: false, isAuthenticated: false });
    }
  },

  updateCurrentUserProfile: async (profileData) => {
    try {
      const response = await updateProfile(profileData);
      const userData = { 
        id: response.member.id, 
        name: response.member.name, 
        email: response.member.email, 
        role: response.member.role, 
        avatar: response.member.avatar 
      };
      localStorage.setItem('offline_user', JSON.stringify(userData));
      set({ currentUser: userData });
      get().addToast('تم تحديث الملف الشخصي بنجاح.', 'success');
      return response.member;
    } catch (err) {
      get().addToast(err.message || 'فشل تحديث الملف الشخصي', 'error');
      throw err;
    }
  },

  changeCurrentUserPassword: async (passwordData) => {
    try {
      const response = await changePassword(passwordData);
      get().addToast('تم تغيير كلمة المرور بنجاح.', 'success');
      return response;
    } catch (err) {
      get().addToast(err.message || 'فشل تغيير كلمة المرور', 'error');
      throw err;
    }
  }
});
