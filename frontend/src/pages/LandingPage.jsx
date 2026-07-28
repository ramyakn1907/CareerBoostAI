import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, FileText, Cpu, Shield, Sparkles, CheckCircle } from 'lucide-react';
import LogoImg from '../assets/logo.jpg';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between text-purple-50 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[160px] -z-10 animate-pulse-glow"></div>
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[160px] -z-10 animate-pulse-glow"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-purple-500/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-glow-purple border border-white/20">
              <img src={LogoImg} alt="CareerBoost Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              CareerBoost <span className="text-gradient font-extrabold">AI</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-6">
            {user ? (
              <Link 
                to="/dashboard" 
                className="px-5 py-2.5 rounded-xl btn-purple text-white font-semibold text-xs shadow-glow-purple hover:scale-105 transition-all duration-300"
              >
                Go to Executive Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-purple-200 hover:text-white transition-colors duration-200">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 font-semibold text-xs transition-all duration-300"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center justify-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill border border-purple-500/30 text-xs font-semibold text-purple-300 mb-8 animate-float shadow-glow-purple">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Next-Gen Executive Resume Intelligence</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl text-white">
          Supercharge Your Resume with <span className="text-gradient">CareerBoost AI</span>
        </h1>

        <p className="text-base md:text-lg text-purple-200/80 max-w-2xl mb-10 leading-relaxed font-normal">
          Get real-time ATS compatibility scores, grammar critiques, and missing skill suggestions tailored to land top technical roles.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl btn-purple text-white font-bold text-sm shadow-glow-purple cursor-pointer"
          >
            Start Analyzing Now
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl btn-secondary text-purple-100 font-bold text-sm cursor-pointer"
          >
            Explore Features
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full pt-16 border-t border-purple-900/40">
          <h2 className="text-2xl font-bold mb-12 text-white">
            Built for Technical & Executive Leaders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-3xl text-left flex flex-col gap-4 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-glow-purple">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-1">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Smart PDF & DOCX Parsing</h3>
              <p className="text-purple-200/70 text-xs leading-relaxed">
                Upload your resume in PDF or DOCX format. Cleanly parses layout sections, work histories, and tech stack details.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-3xl text-left flex flex-col gap-4 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-glow-purple">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300 mb-1">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">CareerBoost AI Diagnostics</h3>
              <p className="text-purple-200/70 text-xs leading-relaxed">
                Powered by CareerBoost AI engine. Computes ATS scores, grammar corrections, missing keywords, and action plans.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-3xl text-left flex flex-col gap-4 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-glow-purple">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-1">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Encrypted Local History</h3>
              <p className="text-purple-200/70 text-xs leading-relaxed">
                Your data is stored securely. Review previous analysis reports, track ATS score growth, and export reports anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-purple-950/20 py-8 text-center text-xs text-purple-300/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CareerBoost AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-purple-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-purple-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-purple-200 cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

