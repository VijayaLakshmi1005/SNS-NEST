import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '../services/apiClient';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Determine token
    const authStorageStr = localStorage.getItem('auth-storage');
    let token = null;
    if (authStorageStr) {
      try {
        const authData = JSON.parse(authStorageStr);
        token = authData?.state?.token;
      } catch(e) {}
    }

    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Dashboard Socket Connected:', socket.id);
    });

    socket.on('dashboard:update', () => {
      // Invalidate all dashboard queries to refetch instantly
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    });

    socket.on('dashboard:new_activity', (activity) => {
      queryClient.setQueryData(['adminDashboard', 'activities'], (oldData) => {
        if (!oldData) return [activity];
        return [activity, ...oldData].slice(0, 10);
      });
      // Also update overview metrics if relevant
      queryClient.invalidateQueries({ queryKey: ['adminDashboard', 'overview'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const overviewQuery = useQuery({
    queryKey: ['adminDashboard', 'overview'],
    queryFn: () => adminApiClient.get('/admin/dashboard/overview').then(res => res.data)
  });

  const revenueQuery = useQuery({
    queryKey: ['adminDashboard', 'revenue'],
    queryFn: () => adminApiClient.get('/admin/dashboard/revenue').then(res => res.data)
  });

  const leadsQuery = useQuery({
    queryKey: ['adminDashboard', 'leads'],
    queryFn: () => adminApiClient.get('/admin/dashboard/leads').then(res => res.data)
  });

  const projectsQuery = useQuery({
    queryKey: ['adminDashboard', 'projects'],
    queryFn: () => adminApiClient.get('/admin/dashboard/projects').then(res => res.data)
  });

  const designersQuery = useQuery({
    queryKey: ['adminDashboard', 'designers'],
    queryFn: () => adminApiClient.get('/admin/dashboard/designers').then(res => res.data)
  });

  const activitiesQuery = useQuery({
    queryKey: ['adminDashboard', 'activities'],
    queryFn: () => adminApiClient.get('/admin/dashboard/activities').then(res => res.data)
  });

  return {
    overviewQuery,
    revenueQuery,
    leadsQuery,
    projectsQuery,
    designersQuery,
    activitiesQuery,
    isLoading: overviewQuery.isLoading || revenueQuery.isLoading || activitiesQuery.isLoading
  };
};
