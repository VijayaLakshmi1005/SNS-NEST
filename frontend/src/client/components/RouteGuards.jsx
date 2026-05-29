import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// Guard for Client Routes
export const ClientRoute = () => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role !== 'client') {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

// Guard for Admin Routes
export const AdminRoute = () => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role !== 'admin') {
    if (role === 'client') return <Navigate to="/client/dashboard" replace />;
  }

  return <Outlet />;
};

// Guard to prevent logged-in users from seeing the login/register pages
export const PublicRoute = () => {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated) {
    if (role === 'client') return <Navigate to="/client/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
