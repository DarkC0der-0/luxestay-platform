import React from 'react';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthMobileBackground from '../components/AuthMobileBackground';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex overflow-hidden relative bg-slate-50">
      {/* Left Panel: Visual Section (Hidden on mobile) */}
      <AuthSidePanel 
        title="Begin your journey."
        description="Create an account to join our exclusive community of travelers and hosts."
      />

      {/* Right Panel: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative min-h-screen z-10">
        {/* Full-screen Background Blur on Mobile */}
        <AuthMobileBackground />

        {/* Register Card & Form */}
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;

