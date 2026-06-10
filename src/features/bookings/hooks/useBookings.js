import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking, getGuestBookings, getHostReservations, getPropertyAvailability } from '../api/bookingApi';
import toast from 'react-hot-toast';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast.success('Booking confirmed!');
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['property-availability'] });
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error('Those dates are already booked.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    }
  });
};

export const useGuestBookings = () => {
  return useQuery({
    queryKey: ['guest-bookings'],
    queryFn: getGuestBookings,
  });
};

export const useHostReservations = () => {
  return useQuery({
    queryKey: ['host-reservations'],
    queryFn: getHostReservations,
  });
};

export const usePropertyAvailability = (propertyId) => {
  return useQuery({
    queryKey: ['property-availability', propertyId],
    queryFn: () => getPropertyAvailability(propertyId),
    enabled: !!propertyId,
  });
};
