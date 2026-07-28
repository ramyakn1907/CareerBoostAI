import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, UploadCloud, History, FileText, 
  User, Settings, LogOut, ChevronLeft, ChevronRight, 
  ShieldCheck, Menu, X, Cpu, BarChart3
} from 'lucide-react';
import LogoImg from '../assets/logo.jpg';

const navVariants = {
  initial: { opacity: 0, y: 8 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 24 }
  })
};

const Sidebar = ({ collapsed: propCollapsed, setCollapsed: propSetCollapsed }) => {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const setCollapsed = propSetCollapsed !== undefined ? propSetCollapsed : setLocalCollapsed;

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = useMemo(() => {
    const items = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Upload Resume', path: '/dashboard?tab=upload', icon: UploadCloud },
      { name: 'Analysis History', path: '/history', icon: History },
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'AI Provider', path: '/settings/ai-provider', icon: Cpu },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];
    if (user?.is_admin) {
      items.push({ name: 'Admin Analytics', path: '/admin-dashboard', icon: BarChart3 });
    }
    return items;
  }, [user]);

  const isActive = (path) => {
    if (path.includes('?tab=upload')) {
      return location.pathname === '/dashboard' && location.search.includes('tab=upload');
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' && !location.search.includes('tab=upload');
    }
    if (path === '/settings') {
      return location.pathname === '/settings';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 theme-sidebar border-b px-4 py-3 flex items-center justify-between backdrop-blur-2xl">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src={LogoImg} alt="CareerBoost Logo" className="w-9 h-9 rounded-2xl border border-white/20 object-cover shadow-md" />
          <span className="text-base font-extrabold theme-text-heading tracking-tight">
            CareerBoost <span className="theme-text-primary">AI</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl border theme-border theme-text-heading"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Collapsible Floating Glass Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 theme-sidebar border-r flex flex-col justify-between transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Branding & Toggle */}
        <div>
          <div className={`p-5 flex items-center border-b theme-border relative ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden shrink-0">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/30">
                <img src={LogoImg} alt="CareerBoost Logo" className="w-full h-full object-cover" />
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="text-base font-extrabold theme-text-heading tracking-tight leading-tight">
                    CareerBoost <span className="theme-text-primary">AI</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest theme-text-muted font-bold">Pro Platform</span>
                </motion.div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex absolute -right-3 top-7 z-50 p-1 rounded-full border theme-border theme-text-muted hover:theme-text-heading theme-sidebar shadow-md transition-all cursor-pointer hover:scale-105"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {menuItems.map((item, i) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  custom={i}
                  initial="initial"
                  animate="animate"
                  variants={navVariants}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-semibold text-xs transition-all duration-200 relative group ${
                      active
                        ? 'theme-btn-primary shadow-md'
                        : 'border border-transparent theme-text-muted hover:theme-text-heading hover:bg-orange-500/10'
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'theme-text-muted group-hover:theme-text-primary'}`} />
                    {!collapsed && (
                      <span className="whitespace-nowrap truncate">{item.name}</span>
                    )}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-1.5 h-6 rounded-full bg-white opacity-90 shadow-md"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t theme-border space-y-2">
          {user && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl theme-card border flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0 border border-white/20 overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold theme-text-heading truncate leading-tight">{user?.username}</span>
                <span className="text-[10px] theme-text-muted flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Free Pro Plan
                </span>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-semibold text-xs border theme-border theme-text-muted hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 transition-all duration-200 cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </motion.button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
