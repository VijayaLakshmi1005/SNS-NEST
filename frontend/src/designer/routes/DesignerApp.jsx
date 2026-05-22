import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DesignerLayout from '../layout/DesignerLayout';

// Placeholder Pages
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-3xl font-playfair font-bold text-[#8b8175] opacity-50">{title}</h1>
  </div>
);

export default function DesignerApp() {
  return (
    <Routes>
      <Route element={<DesignerLayout />}>
        <Route path="dashboard" element={<Placeholder title="Designer Dashboard" />} />
        <Route path="projects" element={<Placeholder title="Assigned Projects" />} />
        <Route path="uploads" element={<Placeholder title="Upload Designs" />} />
        <Route path="meetings" element={<Placeholder title="Meetings" />} />
        <Route path="messages" element={<Placeholder title="Messages" />} />
        <Route path="*" element={<Placeholder title="Module Not Found" />} />
      </Route>
    </Routes>
  );
}
