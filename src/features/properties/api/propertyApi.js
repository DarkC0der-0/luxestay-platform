import apiClient from '@/shared/lib/axios';

export const getProperties = async () => {
  const { data } = await apiClient.get('/properties');
  return data; // Assuming backend returns { data: [...] } or just the array.
};

export const getPropertyById = async (id) => {
  const { data } = await apiClient.get(`/properties/${id}`);
  return data;
};

export const getHostProperties = async () => {
  const { data } = await apiClient.get('/properties/host/my-properties');
  return data;
};

export const createProperty = async (formData) => {
  const { data } = await apiClient.post('/properties', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const deleteProperty = async (id) => {
  const { data } = await apiClient.delete(`/properties/${id}`);
  return data;
};
