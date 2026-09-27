import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';

export const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Role-based protection: only admin allowed
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
