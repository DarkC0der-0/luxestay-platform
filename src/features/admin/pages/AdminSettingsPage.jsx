import React, { useState, useEffect } from 'react';
import apiClient from '@/shared/lib/axios';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  FiUser, FiMail, FiLock, FiCamera, FiShield, FiSettings,
  FiRefreshCw, FiKey, FiAlertCircle, FiEye, FiEyeOff,
  FiPercent, FiGlobe, FiAtSign, FiCalendar, FiCheckCircle,
  FiInfo, FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import SectionCard from '../components/SectionCard';
import FieldGroup from '../components/FieldGroup';
import TextInput from '../components/TextInput';
import ToggleRow from '../components/ToggleRow';
import SaveButton from '../components/SaveButton';

// ─────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────
const TABS = [
  { id: 'profile',   icon: <FiUser size={15} />,    label: 'Profile' },
  { id: 'security',  icon: <FiShield size={15} />,  label: 'Security' },
  { id: 'platform',  icon: <FiSettings size={15} />, label: 'Platform' },
  { id: 'account',   icon: <FiInfo size={15} />,    label: 'Account' },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const AdminSettingsPage = () => {
  const { token, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [profile, setProfile]     = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw]       = useState({ current: false, new: false, confirm: false });
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  // Platform settings
  const [settings, setSettings]   = useState(null);
  const [isSavingSetting, setIsSavingSetting] = useState({});

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch ──────────────────────────────────
  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        apiClient.get('/admin/profile'),
        apiClient.get('/admin/settings'),
      ]);
      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (settingsRes.data.success) setSettings(settingsRes.data.data);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Password strength ──────────────────────
  useEffect(() => {
    const pw = passwords.new;
    let strength = 0;
    if (pw.length >= 8)  strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    setPwStrength(strength);
  }, [passwords.new]);

  const strengthLabel  = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-600'];

  // ── Handlers ──────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data } = await apiClient.patch('/admin/profile', {
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
      });
      if (data.success) {
        toast.success('Profile updated successfully');
        setProfile(data.data);
        setAuth(data.data, token); // Update the global auth store state dynamically
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('New passwords do not match');
    if (passwords.new.length < 8) return toast.error('Password must be at least 8 characters');
    setIsSavingPw(true);
    try {
      const { data } = await apiClient.patch('/admin/profile/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (data.success) {
        toast.success('Password updated successfully');
        setPasswords({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password update failed');
    } finally {
      setIsSavingPw(false);
    }
  };

  const handleToggleSetting = async (key, val) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: val }));
    setIsSavingSetting(prev => ({ ...prev, [key]: true }));
    try {
      const { data } = await apiClient.patch('/admin/settings', { key, value: val });
      if (data.success) toast.success('Setting saved');
    } catch {
      // Revert
      setSettings(prev => ({ ...prev, [key]: !val }));
      toast.error('Failed to update setting');
    } finally {
      setIsSavingSetting(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveSetting = async (key, val) => {
    setIsSavingSetting(prev => ({ ...prev, [key]: true }));
    try {
      const { data } = await apiClient.patch('/admin/settings', { key, value: val });
      if (data.success) toast.success('Setting saved');
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setIsSavingSetting(prev => ({ ...prev, [key]: false }));
    }
  };

  // ── Loading ───────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Page Header ────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account and platform configuration.</p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-all duration-200 active:scale-95 shadow-sm"
        >
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── Tab Navigation ──────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: PROFILE
      ══════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Avatar preview card */}
          <div className="lg:col-span-1">
            <SectionCard icon={<FiUser />} title="Avatar" subtitle="Your public display photo">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden bg-indigo-100 border-2 border-indigo-100 shadow-md">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl font-black text-indigo-600">
                        {(profile?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <FiCamera size={13} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">{profile?.name}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 capitalize">{profile?.role}</p>
                </div>
                <div className="w-full pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FiCalendar size={12} />
                    <span>Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Profile form */}
          <div className="lg:col-span-2">
            <SectionCard icon={<FiUser />} title="Personal Information" subtitle="Update your display name and email address">
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldGroup label="Full Name">
                    <TextInput
                      icon={<FiUser />}
                      value={profile?.name || ''}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </FieldGroup>
                  <FieldGroup label="Email Address">
                    <TextInput
                      icon={<FiMail />}
                      type="email"
                      value={profile?.email || ''}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Avatar URL" hint="Paste a direct link to your profile picture (HTTPS recommended)">
                  <TextInput
                    icon={<FiCamera />}
                    type="url"
                    value={profile?.avatar_url || ''}
                    onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </FieldGroup>

                <FieldGroup label="Role">
                  <TextInput
                    icon={<FiShield />}
                    value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
                    readOnly
                  />
                </FieldGroup>

                <div className="pt-2 flex justify-end">
                  <SaveButton isSaving={isSavingProfile} label="Save Profile" />
                </div>
              </form>
            </SectionCard>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: SECURITY
      ══════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Tips card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiAlertTriangle className="text-amber-500" size={16} />
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Password Tips</h4>
              </div>
              <ul className="space-y-2 text-[11px] text-amber-700 font-medium leading-relaxed">
                <li>• Use at least 8 characters</li>
                <li>• Mix uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
                <li>• Avoid reusing old passwords</li>
                <li>• Never share your credentials</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FiCheckCircle className="text-emerald-500" size={16} />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Status</h4>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-500">
                <div className="flex justify-between">
                  <span>Account Role</span>
                  <span className="font-bold text-indigo-600 capitalize">{profile?.role || 'Admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="font-bold text-slate-700 truncate max-w-[120px]">{profile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since</span>
                  <span className="font-bold text-slate-700">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Password form */}
          <div className="lg:col-span-2">
            <SectionCard icon={<FiLock />} title="Change Password" subtitle="Update your admin account password">
              <form onSubmit={handlePasswordUpdate} className="space-y-5">

                <FieldGroup label="Current Password">
                  <TextInput
                    icon={<FiLock />}
                    type={showPw.current ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Enter current password"
                    required
                    trailingIcon={
                      <button type="button" className="text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                        {showPw.current ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    }
                  />
                </FieldGroup>

                <FieldGroup label="New Password">
                  <TextInput
                    icon={<FiKey />}
                    type={showPw.new ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Enter new password"
                    required
                    trailingIcon={
                      <button type="button" className="text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                        {showPw.new ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    }
                  />
                  {/* Password strength meter */}
                  {passwords.new && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= pwStrength ? strengthColors[pwStrength] : 'bg-slate-100'}`} />
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold ${['', 'text-rose-500', 'text-amber-500', 'text-emerald-500', 'text-emerald-600'][pwStrength]}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </FieldGroup>

                <FieldGroup label="Confirm New Password">
                  <TextInput
                    icon={<FiKey />}
                    type={showPw.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    trailingIcon={
                      <button type="button" className="text-slate-400 hover:text-slate-700 transition-colors" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                        {showPw.confirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    }
                  />
                  {passwords.confirm && passwords.new !== passwords.confirm && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <FiAlertCircle size={11} /> Passwords do not match
                    </p>
                  )}
                </FieldGroup>

                <div className="pt-2 flex justify-end">
                  <SaveButton
                    isSaving={isSavingPw}
                    label="Update Password"
                    icon={<FiKey size={14} />}
                  />
                </div>
              </form>
            </SectionCard>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PLATFORM
      ══════════════════════════════════════════════ */}
      {activeTab === 'platform' && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: fee + branding */}
          <div className="lg:col-span-2 space-y-6">

            {/* Platform Fee */}
            <SectionCard icon={<FiPercent />} title="Marketplace Commission" subtitle="Percentage fee deducted from host earnings per booking">
              <div className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-slate-900">{settings.platform_fee ?? 10}<span className="text-lg text-slate-400 font-semibold">%</span></p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Current platform commission rate</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${(settings.platform_fee ?? 10) > 20 ? 'bg-rose-50 text-rose-600 border-rose-100' : (settings.platform_fee ?? 10) > 10 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {(settings.platform_fee ?? 10) > 20 ? 'High' : (settings.platform_fee ?? 10) > 10 ? 'Moderate' : 'Competitive'}
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0" max="30" step="0.5"
                    value={settings.platform_fee ?? 10}
                    onChange={e => setSettings({ ...settings, platform_fee: parseFloat(e.target.value) })}
                    onMouseUp={() => handleSaveSetting('platform_fee', settings.platform_fee)}
                    onTouchEnd={() => handleSaveSetting('platform_fee', settings.platform_fee)}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-300">
                    <span>0%</span>
                    <span>15%</span>
                    <span>30%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                  This rate is automatically applied to each booking. Changes reflect in the Finance module immediately.
                </p>
              </div>
            </SectionCard>

            {/* Branding & Contact */}
            <SectionCard icon={<FiGlobe />} title="Branding & Contact" subtitle="Global site name and support contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldGroup label="Site Name" hint="The name shown in emails, tabs, and branding">
                  <TextInput
                    icon={<FiGlobe />}
                    value={settings.site_name ?? ''}
                    onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                    onBlur={() => handleSaveSetting('site_name', settings.site_name)}
                    placeholder="LUXESTAY"
                  />
                </FieldGroup>
                <FieldGroup label="Support Email" hint="Shown in user-facing emails and the contact page">
                  <TextInput
                    icon={<FiAtSign />}
                    type="email"
                    value={settings.support_email ?? ''}
                    onChange={e => setSettings({ ...settings, support_email: e.target.value })}
                    onBlur={() => handleSaveSetting('support_email', settings.support_email)}
                    placeholder="support@platform.com"
                  />
                </FieldGroup>
              </div>
            </SectionCard>

          </div>

          {/* Right column: governance toggles */}
          <div className="lg:col-span-1 space-y-6">
            <SectionCard icon={<FiSettings />} title="System Controls" subtitle="Global operational toggles">
              <div>
                <ToggleRow
                  label="Maintenance Mode"
                  description="Disables booking and checkout for all users while the platform is under maintenance."
                  value={!!settings.maintenance_mode}
                  onChange={val => handleToggleSetting('maintenance_mode', val)}
                  dangerOn
                />
                <ToggleRow
                  label="Allow New Registrations"
                  description="Controls whether new users can sign up. Disable to close the platform."
                  value={!!settings.allow_registrations}
                  onChange={val => handleToggleSetting('allow_registrations', val)}
                />
              </div>
            </SectionCard>

            {/* Warning banner if maintenance on */}
            {settings.maintenance_mode && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 flex items-start gap-3 animate-fade-in-up">
                <FiAlertTriangle className="text-rose-500 mt-0.5 shrink-0" size={16} />
                <p className="text-xs font-semibold text-rose-700 leading-relaxed">
                  Maintenance mode is <strong>ON</strong>. All user-facing booking flows are currently suspended.
                </p>
              </div>
            )}
            {!settings.allow_registrations && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 flex items-start gap-3 animate-fade-in-up">
                <FiAlertCircle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                  New registrations are <strong>disabled</strong>. New users cannot create accounts.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: ACCOUNT INFO
      ══════════════════════════════════════════════ */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SectionCard icon={<FiInfo />} title="Account Details" subtitle="Read-only overview of your admin account">
            <div className="space-y-0 divide-y divide-slate-50">
              {[
                { label: 'Full Name',    value: profile?.name },
                { label: 'Email Address', value: profile?.email },
                { label: 'Role',         value: profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '' },
                { label: 'Account ID',   value: profile?.id ? `${profile.id.slice(0, 8)}...` : '' },
                { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : '' },
              ].map(({ label, value }) => (
                <div key={label} className="py-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-bold text-slate-800 text-right">{value || '—'}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<FiShield />} title="Permissions & Access" subtitle="Your current admin capabilities">
            <div className="space-y-3">
              {[
                'Full user management (view, suspend, delete)',
                'Property management (create, edit, remove)',
                'Booking management and status control',
                'Financial oversight and payout management',
                'Support ticket resolution',
                'Platform configuration access',
              ].map(permission => (
                <div key={permission} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheckCircle size={11} />
                  </div>
                  <p className="text-xs font-semibold text-slate-600 leading-snug">{permission}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Danger Zone */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-rose-100/70 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <FiAlertTriangle size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-rose-800 text-sm">Danger Zone</h3>
                  <p className="text-xs text-rose-400 font-medium mt-0.5">These actions are irreversible</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Sign Out of All Sessions</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">This will invalidate all active sessions on all devices.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.error('Session invalidation is managed server-side by your IT team.')}
                    className="px-4 py-2 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-all active:scale-95"
                  >
                    Sign Out All
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminSettingsPage;
