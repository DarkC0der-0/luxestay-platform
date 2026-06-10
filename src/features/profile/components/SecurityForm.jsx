import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiShield, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GlassCard, CardHeader, StyledInput } from './ProfileLayoutHelpers';

const SecurityForm = ({ passwordData, onFieldChange, onSubmit, isLoading }) => {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  /* Password strength helper */
  const pwLen      = passwordData.newPassword.length;
  const pwStrength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : pwLen < 14 ? 3 : 4;
  const pwStrengthColors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];
  const pwStrengthLabel  = ['', 'Too short', 'Fair', 'Good', 'Strong'];

  return (
    <GlassCard>
      <CardHeader
        icon={FiLock}
        iconBg="bg-amber-50 text-amber-600"
        title="Security"
        subtitle="Update your password to keep your account safe"
      />
      <form onSubmit={onSubmit} className="p-8 space-y-5">
        <StyledInput
          label="Current Password"
          icon={FiShield}
          type={showCurrentPw ? 'text' : 'password'}
          name="currentPassword"
          required
          value={passwordData.currentPassword}
          onChange={onFieldChange}
          placeholder="••••••••••"
          rightSlot={
            <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StyledInput
            label="New Password"
            icon={FiLock}
            type={showNewPw ? 'text' : 'password'}
            name="newPassword"
            required
            value={passwordData.newPassword}
            onChange={onFieldChange}
            placeholder="Min. 6 characters"
            rightSlot={
              <button type="button" onClick={() => setShowNewPw((v) => !v)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            }
          />
          <StyledInput
            label="Confirm New Password"
            icon={FiLock}
            type={showConfirmPw ? 'text' : 'password'}
            name="confirmPassword"
            required
            value={passwordData.confirmPassword}
            onChange={onFieldChange}
            placeholder="Repeat new password"
            rightSlot={
              <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        {passwordData.newPassword && (
          <div className="flex gap-1.5 items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= pwStrength ? pwStrengthColors[pwStrength] : 'bg-slate-100'
                }`}
              />
            ))}
            <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">
              {pwStrengthLabel[pwStrength]}
            </span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative overflow-hidden flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none text-sm"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiShield className="w-4 h-4" />}
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </GlassCard>
  );
};

SecurityForm.propTypes = {
  passwordData: PropTypes.shape({
    currentPassword: PropTypes.string.isRequired,
    newPassword: PropTypes.string.isRequired,
    confirmPassword: PropTypes.string.isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default SecurityForm;
