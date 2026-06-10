import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import apiClient from '@/shared/lib/axios';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import AuthMobileLogo from './AuthMobileLogo';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] p-6 xs:p-8 sm:p-12 border border-slate-100/80 shadow-2xl shadow-slate-200/30 max-lg:bg-white/85 max-lg:backdrop-blur-2xl max-lg:border-white/20 max-lg:shadow-[0_32px_64px_rgba(0,0,0,0.25)] relative z-10 animate-fade-in-up">
      {/* Mobile Brand Logo */}
      <AuthMobileLogo />

      {/* Form Header */}
      <div className="text-center lg:text-left mb-10">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome Back</h1>
        <p className="text-slate-500 font-medium leading-relaxed text-sm xs:text-base">Sign in to your premium account to continue your journey.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-shake rounded-r-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="animate-fade-in-up delay-100">
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@luxury.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<FiMail />}
            required
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<FiLock />}
            required
          />
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end pt-1 animate-fade-in-up delay-300">
          <Link 
            to="/forgot-password" 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors tracking-tight"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="animate-fade-in-up delay-300">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full !rounded-2xl py-5 mt-4"
            isLoading={isLoading}
            rightIcon={<FiArrowRight className="text-xl" />}
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Registration Link */}
      <div className="mt-12 text-center text-sm font-bold text-slate-400 animate-fade-in-up delay-400">
        New to LUXESTAY?{' '}
        <Link 
          to="/signup" 
          className="text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
