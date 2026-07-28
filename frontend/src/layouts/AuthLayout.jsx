import React from 'react';
import { Link } from 'react-router-dom';
import LogoImg from '../assets/logo.jpg';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen theme-bg theme-text-body flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Deep Ambient Aurora Glow Orbs */}
      <div className="fixed -top-40 left-1/3 w-[550px] h-[550px] bg-orange-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/3 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" />

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md theme-card p-8 md:p-10 rounded-3xl border shadow-2xl relative z-10 mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="flex items-center gap-3 mb-5 group">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-all duration-300 flex items-center justify-center border border-white/20">
              <img src={LogoImg} alt="CareerBoost Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight theme-text-heading">
              CareerBoost <span className="theme-text-primary">AI</span>
            </span>
          </Link>
          {title && <h2 className="text-2xl font-extrabold theme-text-heading tracking-tight">{title}</h2>}
          {subtitle && <p className="text-xs theme-text-muted mt-1.5 font-medium">{subtitle}</p>}
        </div>

        {/* Form / Content */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
