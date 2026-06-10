import { io } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store/authStore';

let socket = null;

export const initializeSocket = () => {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  if (!socket) {
    const url = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5005';
    socket = io(url, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
