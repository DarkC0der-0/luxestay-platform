import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { HostLayout } from '../layouts/HostLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';

// Features
import { HomePage } from '@/features/home/pages';
import { PropertyListingPage, PropertyDetailsPage } from '@/features/properties/pages';
import { LoginPage, RegisterPage } from '@/features/auth/pages';
import { ProfilePage } from '@/features/profile/pages';
import { GuestTripsPage } from '@/features/trips/pages';
import { HostDashboardPage } from '@/features/hosting/pages';
import { ChatPage } from '@/features/messages/pages';
import { AboutPage } from '@/features/about/pages';
import { ContactPage } from '@/features/contact/pages';

// Admin Features
import {
  AdminDashboardPage,
  AdminPropertiesPage,
  AdminUsersPage,
  AdminSupportPage,
  AdminFinancePage,
  AdminBookingsPage,
  AdminSettingsPage,
} from '@/features/admin/pages';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/properties" element={<PropertyListingPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/trips" element={<ProtectedRoute><GuestTripsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="properties" element={<AdminPropertiesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="support" element={<AdminSupportPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
      </Route>

      <Route element={<HostLayout />}>
        <Route path="/hosting" element={<ProtectedRoute allowedRoles={['host', 'admin']}><HostDashboardPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
