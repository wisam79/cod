import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  fetchTasks: vi.fn().mockResolvedValue([]),
  fetchMembers: vi.fn().mockResolvedValue([]),
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  addComment: vi.fn(),
  onWsStatusChange: vi.fn().mockReturnValue(vi.fn()),
}));

describe('taskSlice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({
      tasks: [],
      members: [],
      isOffline: false,
      currentUser: { id: 1, name: 'Test User' },
      activeToasts: [],
      dataLoading: false,
      dataError: null,
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetchInitialData loads tasks and members', async () => {
    const api = await import('../apiClient');
    api.fetchTasks.mockResolvedValueOnce([{ id: 1, title: 'Task 1' }]);
    api.fetchMembers.mockResolvedValueOnce([{ id: 1, name: 'Member 1' }]);

    await useAppStore.getState().fetchInitialData();
    const state = useAppStore.getState();

    expect(state.tasks.length).toBe(1);
    expect(state.tasks[0].title).toBe('Task 1');
    expect(state.members.length).toBe(1);
    expect(state.dataLoading).toBe(false);
  });

  it('fetchInitialData caches to localStorage', async () => {
    const api = await import('../apiClient');
    api.fetchTasks.mockResolvedValueOnce([{ id: 1, title: 'Task 1' }]);
    api.fetchMembers.mockResolvedValueOnce([]);

    await useAppStore.getState().fetchInitialData();

    expect(localStorage.getItem('cached_tasks')).toContain('Task 1');
    expect(localStorage.getItem('cached_members')).toBeDefined();
  });

  it('fetchInitialData returns cached data on network failure', async () => {
    localStorage.setItem('cached_tasks', JSON.stringify([{ id: 99, title: 'Cached' }]));
    localStorage.setItem('cached_members', JSON.stringify([{ id: 1, name: 'Cached Member' }]));

    const api = await import('../apiClient');
    api.fetchTasks.mockRejectedValueOnce(new Error('Network error'));
    api.fetchMembers.mockRejectedValueOnce(new Error('Network error'));

    await useAppStore.getState().fetchInitialData();
    const state = useAppStore.getState();

    expect(state.tasks).toEqual([{ id: 99, title: 'Cached' }]);
    expect(state.members).toEqual([{ id: 1, name: 'Cached Member' }]);
    expect(state.dataLoading).toBe(false);
  });

  it('fetchInitialData returns empty arrays on network failure when no cache exists', async () => {
    const api = await import('../apiClient');
    api.fetchTasks.mockRejectedValueOnce(new Error('Network error'));
    api.fetchMembers.mockRejectedValueOnce(new Error('Network error'));

    await useAppStore.getState().fetchInitialData();
    const state = useAppStore.getState();

    expect(state.tasks).toEqual([]);
    expect(state.members).toEqual([]);
    expect(state.dataLoading).toBe(false);
  });

  it('addTask adds task when online', async () => {
    const api = await import('../apiClient');
    api.addTask.mockResolvedValueOnce({ id: 2, title: 'New Task' });

    await useAppStore.getState().addTask({ title: 'New Task' });
    expect(useAppStore.getState().tasks.some(t => t.id === 2)).toBe(true);
  });

  it('addTask prevents adding when offline', async () => {
    useAppStore.setState({ isOffline: true });
    await useAppStore.getState().addTask({ title: 'Offline Task' });
    expect(useAppStore.getState().tasks.length).toBe(0);
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);
  });

  it('addTask deduplicates by id', async () => {
    useAppStore.setState({ tasks: [{ id: 1, title: 'Existing' }] });
    const api = await import('../apiClient');
    api.addTask.mockResolvedValueOnce({ id: 1, title: 'Duplicate' });

    await useAppStore.getState().addTask({ title: 'Duplicate' });
    expect(useAppStore.getState().tasks.filter(t => t.id === 1).length).toBe(1);
  });

  it('addTask rolls back on API error', async () => {
    useAppStore.setState({ tasks: [{ id: 1, title: 'Original' }] });
    const api = await import('../apiClient');
    api.addTask.mockRejectedValueOnce(new Error('Server error'));

    await useAppStore.getState().addTask({ title: 'Failed' });
    expect(useAppStore.getState().tasks.length).toBe(1);
    expect(useAppStore.getState().tasks[0].title).toBe('Original');
  });

  it('updateTaskStatus performs optimistic update when online', async () => {
    useAppStore.setState({ tasks: [{ id: 1, title: 'Task', status: 'todo' }] });
    const api = await import('../apiClient');
    api.updateTask.mockResolvedValueOnce({});

    await useAppStore.getState().updateTaskStatus(1, 'done');
    expect(useAppStore.getState().tasks[0].status).toBe('done');
  });

  it('updateTaskStatus saves to localStorage when offline', async () => {
    useAppStore.setState({
      isOffline: true,
      tasks: [{ id: 1, title: 'Task', status: 'todo' }]
    });

    await useAppStore.getState().updateTaskStatus(1, 'done');
    expect(useAppStore.getState().tasks[0].status).toBe('done');
    expect(localStorage.getItem('cached_tasks')).toContain('done');
  });

  it('updateTaskStatus rolls back on API error', async () => {
    useAppStore.setState({ tasks: [{ id: 1, title: 'Task', status: 'todo' }] });
    const api = await import('../apiClient');
    api.updateTask.mockRejectedValueOnce(new Error('Update failed'));

    await useAppStore.getState().updateTaskStatus(1, 'done');
    expect(useAppStore.getState().tasks[0].status).toBe('todo');
  });

  it('addCommentToTask prevents when offline', async () => {
    useAppStore.setState({ isOffline: true });
    await useAppStore.getState().addCommentToTask(1, 'comment');
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);
  });

  it('addCommentToTask calls API when online', async () => {
    const api = await import('../apiClient');
    api.addComment.mockResolvedValueOnce({});
    await useAppStore.getState().addCommentToTask(1, 'great work');
    expect(api.addComment).toHaveBeenCalledWith(1, 'great work');
  });

  it('deleteTask removes task optimistically', async () => {
    useAppStore.setState({ tasks: [{ id: 1, title: 'To Delete' }, { id: 2, title: 'Keep' }] });
    const api = await import('../apiClient');
    api.deleteTask.mockResolvedValueOnce({});

    await useAppStore.getState().deleteTask(1);
    expect(useAppStore.getState().tasks.length).toBe(1);
    expect(useAppStore.getState().tasks[0].id).toBe(2);
  });

  it('deleteTask prevents when offline', async () => {
    useAppStore.setState({ isOffline: true });
    await useAppStore.getState().deleteTask(1);
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('انقطاع'))).toBe(true);
  });

  it('deleteTask rolls back on API error', async () => {
    useAppStore.setState({ tasks: [{ id: 1, title: 'Not Deleted' }] });
    const api = await import('../apiClient');
    api.deleteTask.mockRejectedValueOnce(new Error('Delete failed'));

    await useAppStore.getState().deleteTask(1);
    expect(useAppStore.getState().tasks.length).toBe(1);
  });
});
