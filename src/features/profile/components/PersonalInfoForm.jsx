import React from 'react';
import PropTypes from 'prop-types';
import { FiUser, FiMail, FiCamera, FiSave } from 'react-icons/fi';
import { GlassCard, CardHeader, StyledInput } from './ProfileLayoutHelpers';

const PersonalInfoForm = ({ formData, onFieldChange, onSubmit, isLoading }) => {
  const initials = (formData.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <GlassCard>
      <CardHeader
        icon={FiUser}
        iconBg="bg-indigo-50 text-indigo-600"
        title="Personal Information"
        subtitle="Update your name, email address, and profile picture"
      />
      <form onSubmit={onSubmit} className="p-8 space-y-6">

        {/* Avatar URL field with live preview */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-gradient-to-r from-indigo-50/60 to-violet-50/40 rounded-2xl border border-indigo-100/60">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 overflow-hidden border-2 border-white">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
          <div className="flex-grow w-full">
            <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1.5">
              Avatar Image URL
            </label>
            <div className="relative">
              <FiCamera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={onFieldChange}
                placeholder="https://example.com/my-photo.jpg"
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-indigo-100 hover:border-indigo-200 focus:border-indigo-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder:text-slate-300 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Paste a direct link to your profile image — preview updates live.
            </p>
          </div>
        </div>

        {/* Name + Email grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StyledInput
            label="Full Name"
            icon={FiUser}
            name="name"
            required
            value={formData.name}
            onChange={onFieldChange}
            placeholder="John Doe"
          />
          <StyledInput
            label="Email Address"
            icon={FiMail}
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={onFieldChange}
            placeholder="you@example.com"
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative overflow-hidden flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none text-sm"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiSave className="w-4 h-4" />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </GlassCard>
  );
};

PersonalInfoForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    avatar_url: PropTypes.string,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default PersonalInfoForm;
