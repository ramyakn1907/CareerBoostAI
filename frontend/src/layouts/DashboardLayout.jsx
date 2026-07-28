import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AICareerCoachWidget from '../components/AICareerCoachWidget';

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen theme-bg theme-text-body flex flex-col justify-between relative overflow-hidden font-sans transition-all duration-300">
      
      {/* Background Ambient Aurora Orbs */}
      <div className="fixed -top-40 left-1/3 w-[650px] h-[650px] bg-orange-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-1/3 -right-20 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 left-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" />

      {/* Fixed Collapsible Navigation Sidebar (Width w-64 or w-20) */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content & Footer Wrapper (Offset lg:pl-64 or lg:pl-20) */}
      <div className={`${collapsed ? 'lg:pl-20' : 'lg:pl-64'} flex-1 flex flex-col justify-between transition-all duration-300 min-h-screen relative z-10`}>
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t theme-border theme-sidebar py-6 text-center text-xs theme-text-muted mt-12 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} CareerBoost AI. Production AI Resume Analyzer.</p>
            <div className="flex gap-6">
              <span className="hover:theme-text-heading cursor-pointer">Privacy Policy</span>
              <span className="hover:theme-text-heading cursor-pointer">Terms & Conditions</span>
              <span className="hover:theme-text-heading cursor-pointer">CareerBoost AI Engine</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating AI Career Assistant */}
      <AICareerCoachWidget />
    </div>
  );
};

export default DashboardLayout;
