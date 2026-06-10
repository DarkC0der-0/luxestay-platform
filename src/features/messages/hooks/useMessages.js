import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessagesByBooking, sendMessage } from '../api/messageApi';
import toast from 'react-hot-toast';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });
};

export const useMessagesByBooking = (bookingId) => {
  return useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => getMessagesByBooking(bookingId),
    enabled: !!bookingId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['guest-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['host-reservations'] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
    }
  });
};
