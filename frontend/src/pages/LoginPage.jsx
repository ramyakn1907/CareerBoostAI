import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!usernameOrEmail.trim()) {
      setValidationError('Username or Email is required');
      return;
    }
    if (!password) {
      setValidationError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your AI Career Dashboard">
      <form onSubmit={handleSubmit} className="space-y-5">
        {(validationError || error) && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold theme-text-muted uppercase tracking-wider block">Username or Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center theme-text-muted">
              <Mail className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter email or username"
              className="w-full pl-11 pr-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-sm outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold theme-text-muted uppercase tracking-wider block">Password</label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center theme-text-muted">
              <Lock className="w-4.5 h-4.5" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-sm outline-none transition-all duration-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl theme-btn-primary text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs theme-text-muted mt-7">
        Don't have an account?{' '}
        <Link to="/register" className="theme-text-primary font-bold hover:underline transition-colors">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
