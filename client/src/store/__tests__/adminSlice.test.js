import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../useAppStore';

vi.mock('../apiClient', () => ({
  fetchAdminMembers: vi.fn(),
  updateAdminMember: vi.fn(),
  deleteAdminMember: vi.fn(),
  fetchAdminSettings: vi.fn(),
  updateAdminSettings: vi.fn(),
  fetchMembers: vi.fn().mockResolvedValue([]),
  fetchTasks: vi.fn().mockResolvedValue([]),
  onWsStatusChange: vi.fn().mockReturnValue(vi.fn()),
}));

describe('adminSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      adminMembers: [],
      adminSettings: { allowUserRegistration: true, maintenanceMode: false, maxTasksPerUser: 10 },
      activeToasts: [],
    });
    vi.restoreAllMocks();
  });

  it('loadAdminMembers loads members', async () => {
    const api = await import('../apiClient');
    api.fetchAdminMembers.mockResolvedValueOnce([
      { id: 1, name: 'Admin User' },
      { id: 2, name: 'Regular User' }
    ]);

    await useAppStore.getState().loadAdminMembers();
    expect(useAppStore.getState().adminMembers.length).toBe(2);
  });

  it('loadAdminMembers shows error on failure', async () => {
    const api = await import('../apiClient');
    api.fetchAdminMembers.mockRejectedValueOnce(new Error('Fetch failed'));

    await useAppStore.getState().loadAdminMembers();
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Fetch failed'))).toBe(true);
  });

  it('updateMemberDetails updates member and shows success', async () => {
    useAppStore.setState({ adminMembers: [{ id: 1, name: 'Old Name' }] });
    const api = await import('../apiClient');
    api.updateAdminMember.mockResolvedValueOnce({ member: { name: 'New Name' } });
    api.fetchAdminMembers.mockResolvedValueOnce([{ id: 1, name: 'New Name' }]);
    api.fetchTasks.mockResolvedValueOnce([]);
    api.fetchMembers.mockResolvedValueOnce([]);

    await useAppStore.getState().updateMemberDetails(1, { name: 'New Name' });
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('بنجاح') && t.type === 'success')).toBe(true);
  });

  it('updateMemberDetails shows error on failure', async () => {
    const api = await import('../apiClient');
    api.updateAdminMember.mockRejectedValueOnce(new Error('Update failed'));

    try {
      await useAppStore.getState().updateMemberDetails(1, { name: 'X' });
    } catch {}
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Update failed'))).toBe(true);
  });

  it('deleteMember removes member and shows success', async () => {
    useAppStore.setState({ adminMembers: [{ id: 1, name: 'To Delete' }, { id: 2, name: 'Keep' }] });
    const api = await import('../apiClient');
    api.deleteAdminMember.mockResolvedValueOnce({});
    api.fetchTasks.mockResolvedValueOnce([]);
    api.fetchMembers.mockResolvedValueOnce([]);

    await useAppStore.getState().deleteMember(1);
    expect(useAppStore.getState().adminMembers.some(m => m.id === 1)).toBe(false);
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('بنجاح') && t.type === 'success')).toBe(true);
  });

  it('deleteMember shows error on failure', async () => {
    const api = await import('../apiClient');
    api.deleteAdminMember.mockRejectedValueOnce(new Error('Delete failed'));

    try {
      await useAppStore.getState().deleteMember(1);
    } catch {}
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Delete failed'))).toBe(true);
  });

  it('loadAdminSettings loads settings', async () => {
    const api = await import('../apiClient');
    api.fetchAdminSettings.mockResolvedValueOnce({
      allowUserRegistration: false,
      maintenanceMode: true,
      maxTasksPerUser: 5
    });

    await useAppStore.getState().loadAdminSettings();
    expect(useAppStore.getState().adminSettings.allowUserRegistration).toBe(false);
    expect(useAppStore.getState().adminSettings.maintenanceMode).toBe(true);
    expect(useAppStore.getState().adminSettings.maxTasksPerUser).toBe(5);
  });

  it('loadAdminSettings shows error on failure', async () => {
    const api = await import('../apiClient');
    api.fetchAdminSettings.mockRejectedValueOnce(new Error('Settings failed'));

    await useAppStore.getState().loadAdminSettings();
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Settings failed'))).toBe(true);
  });

  it('saveAdminSettings parses string booleans and shows success', async () => {
    const api = await import('../apiClient');
    api.updateAdminSettings.mockResolvedValueOnce({
      settings: {
        allowUserRegistration: 'false',
        maintenanceMode: 'true',
        maxTasksPerUser: '20'
      }
    });

    await useAppStore.getState().saveAdminSettings({});
    const s = useAppStore.getState().adminSettings;
    expect(s.allowUserRegistration).toBe(false);
    expect(s.maintenanceMode).toBe(true);
    expect(s.maxTasksPerUser).toBe(20);
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('بنجاح') && t.type === 'success')).toBe(true);
  });

  it('saveAdminSettings shows error on failure', async () => {
    const api = await import('../apiClient');
    api.updateAdminSettings.mockRejectedValueOnce(new Error('Save failed'));

    try {
      await useAppStore.getState().saveAdminSettings({});
    } catch {}
    expect(useAppStore.getState().activeToasts.some(t => t.text.includes('Save failed'))).toBe(true);
  });
});
