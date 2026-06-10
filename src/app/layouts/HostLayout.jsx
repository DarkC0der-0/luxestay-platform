import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';

export function HostLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

