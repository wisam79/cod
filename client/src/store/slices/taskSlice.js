import { fetchTasks, addTask as fbAddTask, updateTask as fbUpdateTask, deleteTask as fbDeleteTask, addComment as fbAddComment, fetchMembers } from '../apiClient';

export const createTaskSlice = (set, get) => ({
  tasks: [],
  members: [],
  isLoading: false,
  error: null,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [tasks, members] = await Promise.all([
        fetchTasks().catch(() => []),
        fetchMembers().catch(() => []),
      ]);

      set({ tasks, members, isLoading: false });
      localStorage.setItem('cached_tasks', JSON.stringify(tasks));
      localStorage.setItem('cached_members', JSON.stringify(members));
    } catch (err) {
      const cachedTasks = localStorage.getItem('cached_tasks');
      const cachedMembers = localStorage.getItem('cached_members');
      if (cachedTasks || cachedMembers) {
        let parsedTasks = [];
        let parsedMembers = [];
        try { parsedTasks = cachedTasks ? JSON.parse(cachedTasks) : []; } catch (_) {}
        try { parsedMembers = cachedMembers ? JSON.parse(cachedMembers) : []; } catch (_) {}

        set({
          tasks: parsedTasks,
          members: parsedMembers,
          isLoading: false,
          error: 'تعذر الاتصال بالخادم. تم تحميل البيانات المخزنة مؤقتاً.'
        });
      } else {
        set({ isLoading: false, error: err.message });
      }
    }
  },

  addTask: async (taskData) => {
    const { isOffline, currentUser, tasks: originalTasks } = get();
    if (isOffline) {
      get().addToast('لا يمكنك إضافة مهام جديدة أثناء انقطاع الاتصال.', 'error');
      return;
    }
    try {
      const newTask = await fbAddTask({
        ...taskData,
        creatorId: currentUser?.id || '',
      });
      set((state) => {
        if (state.tasks.some(t => t.id === newTask.id)) return state;
        return { tasks: [newTask, ...state.tasks] };
      });
    } catch (err) {
      set({ tasks: originalTasks });
      get().addToast(`تعذر إضافة المهمة: ${err.message}`, 'error');
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    const { isOffline, tasks } = get();
    const originalTasks = [...tasks];
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    }));

    if (isOffline) {
      localStorage.setItem('cached_tasks', JSON.stringify(get().tasks));
      get().addToast('تم تحديث الحالة محلياً (Offline). ستتم المزامنة عند الاتصال.');
      return;
    }

    try {
      await fbUpdateTask(taskId, { status: newStatus });
    } catch (err) {
      set({ tasks: originalTasks });
      get().addToast(`تعذر تحديث حالة المهمة: ${err.message}`, 'error');
    }
  },

  addCommentToTask: async (taskId, text) => {
    const { isOffline, currentUser } = get();
    if (isOffline) {
      get().addToast('لا يمكنك إضافة تعليقات أثناء انقطاع الاتصال.', 'error');
      return;
    }
    try {
      await fbAddComment(taskId, text, currentUser?.id || '');
    } catch (err) {
      get().addToast(`تعذر إضافة التعليق: ${err.message}`, 'error');
    }
  },

  deleteTask: async (taskId) => {
    const { isOffline, tasks } = get();
    if (isOffline) {
      get().addToast('لا يمكنك حذف المهام أثناء انقطاع الاتصال.', 'error');
      return;
    }
    const originalTasks = [...tasks];
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    }));
    try {
      await fbDeleteTask(taskId);
    } catch (err) {
      set({ tasks: originalTasks });
      get().addToast(`تعذر حذف المهمة: ${err.message}`, 'error');
    }
  }
});
