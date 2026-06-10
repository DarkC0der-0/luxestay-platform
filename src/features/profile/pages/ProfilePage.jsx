import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { profileApi } from '../api/profileApi';
import toast from 'react-hot-toast';
import { Section } from '../components/ProfileLayoutHelpers';
import HeroProfileCard from '../components/HeroProfileCard';
import PersonalInfoForm from '../components/PersonalInfoForm';
import SecurityForm from '../components/SecurityForm';
import QuickLinks from '../components/QuickLinks';
import DangerZone from '../components/DangerZone';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Loading states
  const [loading, setLoading]               = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Profile form (initialised from auth store, kept in sync)
  const [formData, setFormData] = useState({
    name:       user?.name       || '',
    email:      user?.email      || '',
    avatar_url: user?.avatar_url || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name:       user.name       || '',
        email:      user.email      || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  // Fetch fresh user data on mount to ensure memberSince is accurate
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await profileApi.getMe();
        if (response.success) {
          updateUser(response.user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  /* ── Event handlers ── */
  const handleProfileChange  = (e) => setFormData((p)      => ({ ...p, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswordData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await profileApi.updateProfile(formData);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile updated successfully ✓');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword:     passwordData.newPassword,
      });
      if (response.success) {
        toast.success('Password changed successfully ✓');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      const response = await profileApi.deleteAccount();
      if (response.success) {
        toast.success('Account deleted');
        logout();
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-50 pt-28 pb-24 px-4 md:px-8">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-200/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Section delay={0}>
          <HeroProfileCard
            avatarUrl={formData.avatar_url}
            name={formData.name}
            email={formData.email}
            role={user?.role}
            createdAt={user?.created_at}
          />
        </Section>

        <Section delay={80}>
          <PersonalInfoForm
            formData={formData}
            onFieldChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
            isLoading={loading}
          />
        </Section>

        <Section delay={160}>
          <SecurityForm
            passwordData={passwordData}
            onFieldChange={handlePasswordChange}
            onSubmit={handlePasswordSubmit}
            isLoading={passwordLoading}
          />
        </Section>

        <Section delay={240}>
          <QuickLinks
            role={user?.role}
            onNavigate={navigate}
            onSignOut={() => { logout(); navigate('/'); }}
          />
        </Section>

        <Section delay={320}>
          <DangerZone onDeleteClick={() => setShowDeleteModal(true)} />
        </Section>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        userEmail={user?.email || ''}
        deleteConfirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
        onDelete={handleDeleteAccount}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ProfilePage;
