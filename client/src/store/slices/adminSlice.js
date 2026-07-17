import {
  fetchAdminMembers,
  createAdminMember,
  updateAdminMember,
  deleteAdminMember,
  fetchAdminSettings,
  updateAdminSettings
} from '../apiClient';

export const createAdminSlice = (set, get) => ({
  adminMembers: [],
  adminSettings: {
    allowUserRegistration: true,
    maintenanceMode: false,
    maxTasksPerUser: 10
  },

  loadAdminMembers: async () => {
    try {
      const members = await fetchAdminMembers();
      set({ adminMembers: members });
    } catch (err) {
      get().addToast(`تعذر تحميل الأعضاء: ${err.message}`, 'error');
    }
  },

  addMember: async (memberData) => {
    try {
      const result = await createAdminMember(memberData);
      set((state) => ({
        adminMembers: [...state.adminMembers, result.member]
      }));
      get().addToast('تم إضافة العضو بنجاح.', 'success');
      await get().loadAdminMembers();
      await get().fetchInitialData();
    } catch (err) {
      get().addToast(`تعذر إضافة العضو: ${err.message}`, 'error');
      throw err;
    }
  },

  updateMemberDetails: async (id, memberData) => {
    try {
      const result = await updateAdminMember(id, memberData);
      set((state) => ({
        adminMembers: state.adminMembers.map((m) =>
          m.id === id ? { ...m, ...result.member } : m
        )
      }));
      get().addToast('تم تحديث بيانات العضو بنجاح.', 'success');
      // Refetch members list to ensure sync
      await get().loadAdminMembers();
      await get().fetchInitialData(); // update members list in regular slice too
    } catch (err) {
      get().addToast(`تعذر تحديث العضو: ${err.message}`, 'error');
      throw err;
    }
  },

  deleteMember: async (id) => {
    try {
      await deleteAdminMember(id);
      set((state) => ({
        adminMembers: state.adminMembers.filter((m) => m.id !== id)
      }));
      get().addToast('تم حذف العضو وتحديث مهامه بنجاح.', 'success');
      await get().fetchInitialData();
    } catch (err) {
      get().addToast(`تعذر حذف العضو: ${err.message}`, 'error');
      throw err;
    }
  },

  loadAdminSettings: async () => {
    try {
      const settings = await fetchAdminSettings();
      set({ adminSettings: settings });
    } catch (err) {
      get().addToast(`تعذر تحميل إعدادات النظام: ${err.message}`, 'error');
    }
  },

  saveAdminSettings: async (settingsData) => {
    try {
      const result = await updateAdminSettings(settingsData);
      set({
        adminSettings: {
          allowUserRegistration: result.settings.allowUserRegistration === 'true' || result.settings.allowUserRegistration === true,
          maintenanceMode: result.settings.maintenanceMode === 'true' || result.settings.maintenanceMode === true,
          maxTasksPerUser: parseInt(result.settings.maxTasksPerUser, 10)
        }
      });
      get().addToast('تم حفظ الإعدادات بنجاح.', 'success');
    } catch (err) {
      get().addToast(`تعذر حفظ الإعدادات: ${err.message}`, 'error');
      throw err;
    }
  }
});
