import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { FiCalendar, FiEdit3, FiStar, FiCheck, FiGlobe } from 'react-icons/fi';
import { GlassCard } from './ProfileLayoutHelpers';

const HeroProfileCard = ({ avatarUrl, name, email, role, createdAt }) => {
  const initials = (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = createdAt
    ? format(new Date(createdAt), 'MMMM yyyy')
    : 'N/A';

  const roleLabel = role === 'host' ? 'Host' : 'Guest';
  const roleBadgeClass =
    role === 'host'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-indigo-50 text-indigo-700 border-indigo-200';

  return (
    <GlassCard>
      {/* Banner gradient */}
      <div className="h-32 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
        <div className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-2 left-12 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Avatar row */}
      <div className="px-8 pb-8">
        <div className="-mt-12 mb-4 flex items-end justify-between">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-200 border-4 border-white overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {/* edit badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer">
              <FiEdit3 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Member since pill */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-2xl border border-slate-200/80">
              <FiCalendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Name + role badge + email */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {name || 'Your Name'}
            </h1>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
          <p className="text-slate-500 text-sm">{email}</p>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Role',           value: roleLabel,  icon: FiStar,   color: 'text-amber-500'   },
            { label: 'Email verified', value: 'Verified', icon: FiCheck,  color: 'text-emerald-500' },
            { label: 'Status',         value: 'Active',   icon: FiGlobe,  color: 'text-indigo-500'  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-50/80 rounded-2xl border border-slate-100 p-3.5 text-center">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
              <p className="text-xs font-bold text-slate-800">{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

HeroProfileCard.propTypes = {
  avatarUrl: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  role: PropTypes.string,
  createdAt: PropTypes.string,
};

export default HeroProfileCard;
