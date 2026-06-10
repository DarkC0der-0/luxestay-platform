import apiClient from '@/shared/lib/axios';

export const getConversations = async () => {
  const { data } = await apiClient.get('/messages');
  return data;
};

export const getMessagesByBooking = async (bookingId) => {
  const { data } = await apiClient.get(`/messages/${bookingId}`);
  return data;
};

export const sendMessage = async ({ bookingId, content }) => {
  const { data } = await apiClient.post('/messages', {
    bookingId,
    content
  });
  return data;
};
