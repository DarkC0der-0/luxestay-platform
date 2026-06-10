import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import apiClient from '@/shared/lib/axios';
import { FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import AuthMobileLogo from './AuthMobileLogo';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await apiClient.post('/auth/signup', formData);
      const loginRes = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      setAuth(loginRes.data.user, loginRes.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
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
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Create Account</h1>
        <p className="text-slate-500 font-medium leading-relaxed text-sm xs:text-base">Join our exclusive community of travelers and hosts.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-shake rounded-r-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="animate-fade-in-up delay-100">
          <Input
            label="Full Name"
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<FiUser />}
            required
          />
        </div>
        <div className="animate-fade-in-up delay-200">
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@luxury.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<FiMail />}
            required
          />
        </div>
        <div className="animate-fade-in-up delay-300">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            leftIcon={<FiLock />}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in-up delay-400">
          <div 
            onClick={() => setFormData({ ...formData, role: 'guest' })}
            className={`p-3 xs:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center space-y-2 ${formData.role === 'guest' ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
          >
            <span className={`text-[10px] xs:text-xs font-black uppercase tracking-widest ${formData.role === 'guest' ? 'text-indigo-600' : 'text-slate-400'}`}>I want to book</span>
          </div>
          <div 
            onClick={() => setFormData({ ...formData, role: 'host' })}
            className={`p-3 xs:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center space-y-2 ${formData.role === 'host' ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
          >
            <span className={`text-[10px] xs:text-xs font-black uppercase tracking-widest ${formData.role === 'host' ? 'text-indigo-600' : 'text-slate-400'}`}>I want to host</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="animate-fade-in-up delay-500">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full !rounded-2xl py-5 mt-4"
            isLoading={isLoading}
            rightIcon={<FiCheckCircle className="text-xl" />}
          >
            Get Started
          </Button>
        </div>
      </form>

      {/* Registration Link */}
      <div className="mt-12 text-center text-sm font-bold text-slate-400 animate-fade-in-up delay-500">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
