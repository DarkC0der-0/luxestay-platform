import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

FadeIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};

const HostStatCard = ({ icon: Icon, label, value, sub, gradient, delay }) => {
  return (
    <FadeIn delay={delay}>
      <div className={`relative overflow-hidden rounded-3xl p-6 text-white ${gradient} shadow-xl`}>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-16 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
          {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
        </div>
      </div>
    </FadeIn>
  );
};

HostStatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  gradient: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

HostStatCard.defaultProps = {
  delay: 0,
};

export default HostStatCard;
