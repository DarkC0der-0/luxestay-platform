import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/shared/components/Admin/AdminSidebar';
import AdminHeader from '@/shared/components/Admin/AdminHeader';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="w-full max-w-7xl mx-auto p-4 md:p-6 2xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
