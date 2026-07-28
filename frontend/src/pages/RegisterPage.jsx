import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim() || username.length < 3) {
      setValidationError('Username must be at least 3 characters long');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Get started with AI-driven resume diagnostics">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(validationError || error) && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold theme-text-muted uppercase tracking-wider block">Username</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center theme-text-muted">
              <User className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="developer_jane"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl theme-bg border theme-border theme-text-heading text-sm outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold theme-text-muted uppercase tracking-wider block">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center theme-text-muted">
              <Mail className="w-4.5 h-4.5" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@domain.com"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl theme-bg border theme-border theme-text-heading text-sm outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold theme-text-muted uppercase tracking-wider block">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center theme-text-muted">
              <Lock className="w-4.5 h-4.5" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl theme-bg border theme-border theme-text-heading text-sm outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold theme-text-muted uppercase tracking-wider block">Confirm Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center theme-text-muted">
              <Lock className="w-4.5 h-4.5" />
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl theme-bg border theme-border theme-text-heading text-sm outline-none transition-all duration-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl theme-btn-primary text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs theme-text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="theme-text-primary font-bold hover:underline transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
