import apiClient from '@/shared/lib/axios';

export const profileApi = {
  updateProfile: async (profileData) => {
    const { data } = await apiClient.patch('/auth/profile', profileData);
    return data;
  },
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
  changePassword: async (passwordData) => {
    const { data } = await apiClient.patch('/auth/change-password', passwordData);
    return data;
  },
  deleteAccount: async () => {
    const { data } = await apiClient.delete('/auth/account');
    return data;
  }
};
