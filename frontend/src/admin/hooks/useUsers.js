import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '../services/apiClient';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export function useUsers(filters = { page: 1, limit: 10 }) {
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const usersQuery = useQuery({
    queryKey: ['admin_users', filters],
    queryFn: async () => {
      const response = await adminApiClient.get(`/admin/users?${queryParams.toString()}`);
      return response.data;
    },
    keepPreviousData: true
  });

  const blockMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const response = await adminApiClient.patch(`/admin/users/${userId}/block`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_users']);
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('dashboard:user_update', () => {
      queryClient.invalidateQueries(['admin_users']);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  return {
    usersQuery,
    blockMutation,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError
  };
}
