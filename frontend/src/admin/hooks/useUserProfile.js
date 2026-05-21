import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '../services/apiClient';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export function useUserProfile(userId) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['admin_user_profile', userId],
    queryFn: async () => {
      const response = await adminApiClient.get(`/admin/users/${userId}`);
      return response.data;
    },
    enabled: !!userId
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note) => {
      const response = await adminApiClient.post(`/admin/users/${userId}/notes`, { note });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_user_profile', userId]);
    }
  });

  // Connect socket for live chat & ticket updates
  useEffect(() => {
    if (!userId) return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on('dashboard:user_update', (data) => {
      if (data.userId === userId) {
        queryClient.invalidateQueries(['admin_user_profile', userId]);
      }
    });

    socket.on('client:receive_message', (data) => {
      // Typically the client handles this, but if admin receives it while on the page
      queryClient.invalidateQueries(['admin_user_profile', userId]);
    });

    socket.on('admin:receive_message', (data) => {
      if (data.clientId === userId) {
        queryClient.invalidateQueries(['admin_user_profile', userId]);
      }
    });

    return () => socket.disconnect();
  }, [userId, queryClient]);

  return {
    profileQuery,
    addNoteMutation,
    isLoading: profileQuery.isLoading
  };
}
