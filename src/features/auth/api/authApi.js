import apiClient from '@/shared/lib/axios';

export const login = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await apiClient.post('/auth/signup', userData);
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};
