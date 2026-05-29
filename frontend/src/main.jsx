import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './client/Router'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import axios from 'axios'

// Global Axios Request Interceptor to attach the token from auth-storage
axios.interceptors.request.use(
  (config) => {
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      if (authStorageStr) {
        const authData = JSON.parse(authStorageStr);
        if (authData?.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      }
    } catch (e) {
      console.error('Error parsing auth storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Axios Interceptor to catch 401 Unauthorized errors and force logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth store if backend rejects the token/cookie
      import('./store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false, // Prevent infinite retries on 401s
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
