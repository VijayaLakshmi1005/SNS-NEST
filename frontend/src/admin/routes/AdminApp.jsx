import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

// Mock components until we build them
const Dashboard = React.lazy(() => import('../pages/admin/Dashboard'));
const CRMWorkspace = React.lazy(() => import('../pages/admin/crm/CRMWorkspace'));
const UserProfile = React.lazy(() => import('../pages/admin/UserProfile'));
const ProjectManagement = React.lazy(() => import('../pages/admin/ProjectManagement'));
const ProjectWorkspace = React.lazy(() => import('../pages/admin/ProjectWorkspace'));
const LeadManagement = React.lazy(() => import('../pages/admin/LeadManagement'));
const LeadProfile = React.lazy(() => import('../pages/admin/LeadProfile'));
const CatalogManagement = React.lazy(() => import('../pages/admin/CatalogManagement'));
const ProductDetail = React.lazy(() => import('../pages/admin/ProductDetail'));
const CmsDashboard = React.lazy(() => import('../pages/admin/CmsDashboard'));
const AppointmentOverview = React.lazy(() => import('../pages/admin/AppointmentOverview'));
const FinanceDashboard = React.lazy(() => import('../pages/admin/FinanceDashboard'));
const AnalyticsDashboard = React.lazy(() => import('../pages/admin/AnalyticsDashboard'));
const SupportOverview = React.lazy(() => import('../pages/admin/SupportOverview'));
const ActivityFeed = React.lazy(() => import('../pages/admin/ActivityFeed'));
const UserManagement = React.lazy(() => import('../pages/admin/UserManagement'));
const Inquiries = React.lazy(() => import('../pages/admin/Inquiries'));

export default function AdminApp() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#f5f5f0]">Loading...</div>}>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<CRMWorkspace />} />
          <Route path="users/:id" element={<UserProfile />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="projects/:id" element={<ProjectWorkspace />} />
          <Route path="leads" element={<LeadManagement />} />
          <Route path="leads/:id" element={<LeadProfile />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="products" element={<CatalogManagement />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cms" element={<CmsDashboard />} />
          <Route path="appointments" element={<AppointmentOverview />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="support" element={<SupportOverview />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="notifications" element={<ActivityFeed />} />
          <Route path="*" element={<div className="p-8 text-center text-[#8b8175]">Module under construction</div>} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}
