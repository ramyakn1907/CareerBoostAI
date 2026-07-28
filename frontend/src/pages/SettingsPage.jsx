import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, Moon, Bell, Cpu, Globe, Trash2, 
  ShieldAlert, CheckCircle2, Sparkles, Flame
} from 'lucide-react';

const SettingsPage = () => {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState(true);
  const [aiModel, setAiModel] = useState('CareerBoost AI Pro');
  const [language, setLanguage] = useState('English');
  const [savedNotice, setSavedNotice] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveSettings = () => {
    setSavedNotice('Settings updated successfully!');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '🚨 WARNING: Are you sure you want to PERMANENTLY DELETE your CareerBoost AI account?\n\n' +
      'This action will permanently purge your profile, saved resume analyses, and AI chat conversations from MongoDB. This action CANNOT be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h1 className="text-2xl font-extrabold theme-text-heading tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 theme-text-primary" />
              Platform Settings
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Configure system preferences, AI intelligence model engine, notification alerts, and account security.
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {savedNotice}
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          
          {/* Section 1: Application Design & Theme Signature */}
          <div className="theme-card p-8 rounded-3xl border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold theme-text-heading flex items-center gap-2.5">
                  <Flame className="w-5 h-5 theme-text-primary" />
                  Signature Platform Design
                </h3>
                <p className="text-xs theme-text-muted mt-0.5">
                  Active theme: Sunset Coral & Midnight Glassmorphic System.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold border theme-border theme-text-primary bg-orange-500/10">
                Signature Active
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-t theme-border">
              <div>
                <h4 className="text-xs font-bold theme-text-heading">System Interface Language</h4>
                <p className="text-[11px] theme-text-muted mt-0.5">Primary application interface and report export localization.</p>
              </div>
              <select
                value={language}
                onChange={(e) => { setLanguage(e.target.value); handleSaveSettings(); }}
                className="px-4 py-2 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none cursor-pointer"
              >
                <option value="English">English (United States)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          {/* Section 2: AI Engine Settings */}
          <div className="theme-card p-8 rounded-3xl border space-y-6">
            <h3 className="text-base font-bold theme-text-heading flex items-center gap-2.5">
              <Cpu className="w-5 h-5 theme-text-primary" />
              AI Intelligence Engine
            </h3>

            <div className="flex items-center justify-between py-3 border-b theme-border">
              <div>
                <h4 className="text-xs font-bold theme-text-heading">Select CareerBoost AI Model</h4>
                <p className="text-[11px] theme-text-muted mt-0.5">Choose the model engine backing resume parsing and ATS score calculations.</p>
              </div>
              <select
                value={aiModel}
                onChange={(e) => { setAiModel(e.target.value); handleSaveSettings(); }}
                className="px-4 py-2 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none cursor-pointer font-bold"
              >
                <option value="CareerBoost AI Pro">CareerBoost AI Pro (Fast & Accurate)</option>
                <option value="CareerBoost AI Deep">CareerBoost AI Deep (Deep Contextual)</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-xs font-bold theme-text-heading">Analysis Notifications</h4>
                <p className="text-[11px] theme-text-muted mt-0.5">Receive alert badges when ATS analysis and report exports finish.</p>
              </div>
              <button
                onClick={() => { setNotifications(!notifications); handleSaveSettings(); }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-1 ${
                  notifications ? 'bg-orange-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Section 3: Danger Zone */}
          <div className="theme-card p-8 rounded-3xl border border-rose-500/30 space-y-4">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Account Security & Danger Zone
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <h4 className="text-xs font-bold theme-text-heading">Permanently Delete Account</h4>
                <p className="text-[11px] theme-text-muted">Permanently purge your account credentials, resume analyses, and chat history from MongoDB.</p>
              </div>
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-extrabold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting Account...' : 'Delete Account Permanently'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
