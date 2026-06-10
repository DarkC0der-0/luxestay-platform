import React from 'react';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthMobileBackground from '../components/AuthMobileBackground';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex overflow-hidden relative bg-slate-50">
      {/* Left Panel: Visual Section (Hidden on mobile) */}
      <AuthSidePanel 
        title="Your portal to the extraordinary."
        description="Sign in to access your curated dashboard, custom reservations, and premium travel concierges."
      />

      {/* Right Panel: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative min-h-screen z-10">
        {/* Full-screen Background Blur on Mobile */}
        <AuthMobileBackground />

        {/* Login Card & Form */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;

