import {
  fetchAdminMembers,
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
      get().addToast(`تعذر تحميل الأعضاء: ${err.message}`);
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
      get().addToast('تم تحديث بيانات العضو بنجاح.');
      // Refetch members list to ensure sync
      await get().loadAdminMembers();
      await get().fetchInitialData(); // update members list in regular slice too
    } catch (err) {
      get().addToast(`تعذر تحديث العضو: ${err.message}`);
      throw err;
    }
  },

  deleteMember: async (id) => {
    try {
      await deleteAdminMember(id);
      set((state) => ({
        adminMembers: state.adminMembers.filter((m) => m.id !== id)
      }));
      get().addToast('تم حذف العضو وتحديث مهامه بنجاح.');
      await get().fetchInitialData();
    } catch (err) {
      get().addToast(`تعذر حذف العضو: ${err.message}`);
      throw err;
    }
  },

  loadAdminSettings: async () => {
    try {
      const settings = await fetchAdminSettings();
      set({ adminSettings: settings });
    } catch (err) {
      get().addToast(`تعذر تحميل إعدادات النظام: ${err.message}`);
    }
  },

  saveAdminSettings: async (settingsData) => {
    try {
      const result = await updateAdminSettings(settingsData);
      set({
        adminSettings: {
          allowUserRegistration: result.settings.allowUserRegistration === 'true',
          maintenanceMode: result.settings.maintenanceMode === 'true',
          maxTasksPerUser: parseInt(result.settings.maxTasksPerUser, 10)
        }
      });
      get().addToast('تم حفظ الإعدادات بنجاح.');
    } catch (err) {
      get().addToast(`تعذر حفظ الإعدادات: ${err.message}`);
      throw err;
    }
  }
});
