import apiClient from '@/shared/lib/axios';

export const createBooking = async (bookingData) => {
  const { data } = await apiClient.post('/bookings', bookingData);
  return data;
};

export const getGuestBookings = async () => {
  const { data } = await apiClient.get('/bookings/my-bookings');
  return data;
};

export const getHostReservations = async () => {
  const { data } = await apiClient.get('/bookings/host/reservations');
  return data;
};

export const getPropertyAvailability = async (propertyId) => {
  const { data } = await apiClient.get(`/properties/${propertyId}/availability`);
  return data;
};
