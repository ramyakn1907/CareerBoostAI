import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Settings, Cpu, CheckCircle2, AlertTriangle, Key, Activity, 
  Trash2, X, Eye, EyeOff, Play, RefreshCw, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';

const formatLastVerified = (timeString) => {
  if (!timeString) return 'Never';
  let dateStr = timeString;
  if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
    dateStr = dateStr.includes('T') ? dateStr + 'Z' : dateStr.replace(' ', 'T') + 'Z';
  }
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return 'Never';
  }
};

const AISettingsPage = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  // Page States
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Fetch AI Settings and any pending alerts
  const fetchAISettings = async () => {
    try {
      const res = await API.get('/ai-settings');
      setSettings(res.data);
      
      // Also fetch any backend alerts
      const alertRes = await API.get('/ai-settings/alerts');
      if (alertRes.data && alertRes.data.length > 0) {
        alertRes.data.forEach(alert => {
          triggerToast(alert.message, alert.type);
        });
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load AI provider settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAISettings();
  }, []);

  const triggerToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleModeChange = async (mode) => {
    if (mode === 'personal' && !settings?.has_personal_key) {
      // Prompt user to connect key first
      setShowKeyModal(true);
      return;
    }
    setLoading(true);
    try {
      const res = await API.put('/ai-settings/mode', { preferred_mode: mode });
      setSettings(res.data);
      triggerToast(`Switched preferred mode to ${mode === 'shared' ? 'CareerBoost Shared API' : 'Personal Gemini API'}!`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.detail || 'Failed to switch mode', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAPI = async () => {
    if (!apiKeyInput.trim()) {
      triggerToast('API Key cannot be blank', 'error');
      return;
    }
    setVerifying(true);
    try {
      const res = await API.post('/ai-settings/verify', { api_key: apiKeyInput });
      setSettings(res.data);
      setApiKeyInput('');
      setShowKeyModal(false);
      triggerToast('Connected & verified Google Gemini API Key successfully!', 'success');
      
      // Automatically toggle to personal mode
      const updated = await API.put('/ai-settings/mode', { preferred_mode: 'personal' });
      setSettings(updated.data);
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.detail || 'Key verification failed. Ensure Gemini Key is correct.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await API.post('/ai-settings/test');
      setSettings(res.data);
      triggerToast(`✓ Connected! Latency measured: ${res.data.latency}ms`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.detail || 'Connection test failed.', 'error');
      // Refresh to get updated offline status
      fetchAISettings();
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveKey = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your personal Google Gemini API key?\n\n' +
      'This will switch your profile back to the CareerBoost Shared API.'
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const res = await API.delete('/ai-settings/personal-key');
      setSettings(res.data);
      triggerToast('Personal Gemini API Key removed successfully', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to remove API key', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async (model) => {
    setLoading(true);
    try {
      const res = await API.put('/ai-settings/model', { selected_model: model });
      setSettings(res.data);
      triggerToast(`Model updated to ${model}!`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.detail || 'Failed to update model', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        
        {/* Floating Toast Notification Containers */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-2xl shadow-xl border backdrop-blur-xl flex items-start gap-3 transition-all transform translate-y-0 scale-100 ${
                t.type === 'error' 
                  ? 'bg-rose-950/80 border-rose-500/30 text-rose-200' 
                  : t.type === 'warning'
                  ? 'bg-amber-950/80 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              }`}
            >
              {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-white/40 hover:text-white cursor-pointer shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h1 className="text-2xl font-extrabold theme-text-heading tracking-tight flex items-center gap-2.5">
              <Cpu className="w-6 h-6 theme-text-primary" />
              AI Provider Settings
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Configure models, test endpoint latencies, and connect personal Google Gemini credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing || loading}
              className="px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-heading text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-orange-500/10 transition-all disabled:opacity-50"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
              ) : (
                <Activity className="w-4 h-4 theme-text-primary" />
              )}
              Test Connection
            </button>
          </div>
        </div>

        {loading && !settings ? (
          <div className="space-y-6">
            <div className="h-44 w-full bg-white/5 animate-pulse rounded-3xl" />
            <div className="h-64 w-full bg-white/5 animate-pulse rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Diagnostics Health Dashboard */}
            <div className="lg:col-span-1 space-y-6">
              <div className="theme-card p-6 rounded-3xl border shadow-md space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
                
                <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2 border-b theme-border pb-3">
                  <Activity className="w-4.5 h-4.5 theme-text-primary" />
                  AI Provider Health
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="theme-text-muted">AI Provider</span>
                    <span className="font-extrabold theme-text-heading">Google Gemini</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="theme-text-muted">Provider Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${settings?.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {settings?.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="theme-text-muted">Preferred Mode</span>
                    <span className="font-bold theme-text-primary uppercase tracking-wide text-[10px]">
                      {settings?.preferred_mode === 'shared' ? 'Shared API' : 'Personal API'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="theme-text-muted">Active API Model</span>
                    <span className="font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20 text-[10px]">{settings?.selected_model}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="theme-text-muted">API Latency</span>
                    <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 text-[10px]">{settings?.latency}ms</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="theme-text-muted">Last Verified</span>
                    <span className="font-mono text-[10px] theme-text-muted">
                      {formatLastVerified(settings?.last_verified)}

                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="w-full py-2.5 rounded-xl border theme-border theme-card hover:bg-orange-500/15 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {testing ? <RefreshCw className="w-4 h-4 animate-spin text-orange-400" /> : <Play className="w-4 h-4 theme-text-primary" />}
                    Diagnostics Verification Run
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Key Config & Options selection */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Option Selector Card */}
              <div className="theme-card p-6 rounded-3xl border shadow-md space-y-6">
                <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2 border-b theme-border pb-3">
                  <Layers className="w-4.5 h-4.5 theme-text-primary" />
                  Select Routing Mode
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Shared Option */}
                  <label 
                    onClick={() => handleModeChange('shared')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer block relative ${
                      settings?.preferred_mode === 'shared' 
                        ? 'border-orange-500/50 bg-orange-500/5 shadow-md' 
                        : 'theme-border theme-card hover:border-orange-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="ai_mode" 
                        checked={settings?.preferred_mode === 'shared'}
                        onChange={() => {}} 
                        className="accent-orange-500" 
                      />
                      <span className="text-xs font-extrabold theme-text-heading">CareerBoost Shared AI</span>
                      <span className="ml-auto text-[9px] uppercase font-extrabold tracking-widest bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/25">Default</span>
                    </div>
                    <p className="text-[11px] theme-text-muted mt-2 pl-6 leading-relaxed">
                      Uses our centralized shared developer Gemini quota. Free tier suitable for standard resumes and cover letters.
                    </p>
                  </label>

                  {/* Personal Option */}
                  <label 
                    onClick={() => handleModeChange('personal')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer block relative ${
                      settings?.preferred_mode === 'personal' 
                        ? 'border-orange-500/50 bg-orange-500/5 shadow-md' 
                        : 'theme-border theme-card hover:border-orange-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="ai_mode" 
                        checked={settings?.preferred_mode === 'personal'}
                        onChange={() => {}} 
                        className="accent-orange-500" 
                      />
                      <span className="text-xs font-extrabold theme-text-heading">Personal Gemini API</span>
                      {settings?.has_personal_key && (
                        <span className="ml-auto text-[9px] uppercase font-extrabold tracking-widest bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded border border-orange-500/25">Connected</span>
                      )}
                    </div>
                    <p className="text-[11px] theme-text-muted mt-2 pl-6 leading-relaxed">
                      Connect your own Google AI Key. Ideal for unlimited high-priority usage or testing preview Gemini capabilities.
                    </p>
                  </label>

                </div>
              </div>

              {/* API Credentials Card */}
              <div className="theme-card p-6 rounded-3xl border shadow-md space-y-6">
                <div className="flex justify-between items-center border-b theme-border pb-3">
                  <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2">
                    <Key className="w-4.5 h-4.5 theme-text-primary" />
                    Gemini API Keys
                  </h3>
                  {settings?.has_personal_key && (
                    <button 
                      onClick={handleRemoveKey}
                      className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Disconnect Key
                    </button>
                  )}
                </div>

                {settings?.has_personal_key ? (
                  <div className="p-5 rounded-2xl border theme-border bg-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Connected API Key</span>
                      <p className="text-xs font-mono font-bold text-orange-400 tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        {settings?.masked_key}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowKeyModal(true)}
                        className="px-3.5 py-2 text-xs font-bold theme-card border theme-border theme-text-heading rounded-xl cursor-pointer hover:bg-white/5 transition-all"
                      >
                        Update Key
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed theme-border p-8 rounded-2xl text-center space-y-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Key className="w-6 h-6 theme-text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold theme-text-heading">No personal Google Gemini API key connected</h4>
                      <p className="text-[11px] theme-text-muted mt-1 max-w-sm mx-auto">
                        Connect your personal token to unlock higher quotas, latency statistics, and custom models choice.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowKeyModal(true)}
                      className="px-4 py-2 text-xs theme-btn-primary text-white font-bold cursor-pointer"
                    >
                      Connect Gemini API Key
                    </button>
                  </div>
                )}
              </div>

              {/* Model Selector Card */}
              <div className="theme-card p-6 rounded-3xl border shadow-md space-y-6">
                <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2 border-b theme-border pb-3">
                  <Layers className="w-4.5 h-4.5 theme-text-primary" />
                  Model Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold theme-text-muted block">Selected Gemini Model</label>
                    <select
                      value={settings?.selected_model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none cursor-pointer transition-all focus:border-orange-500"
                    >
                      {settings?.available_models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <p className="text-[10px] theme-text-muted leading-relaxed">
                      Only displays models verified as compatible and active by the backend engine.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-black/10 border theme-border flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Model Fallback Protection</span>
                    <p className="text-[11px] theme-text-muted leading-relaxed mt-1">
                      If your chosen model is unavailable during request execution, the platform will automatically route down to secondary options (Gemini 2.5 Flash &rarr; Gemini 2.0 Flash) to prevent generation errors.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal: Connect Key Popup */}
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowKeyModal(false)} />
            
            {/* Modal Box */}
            <div className="theme-card p-6 rounded-3xl border shadow-xl w-full max-w-md relative z-10 space-y-6">
              <div className="flex justify-between items-center border-b theme-border pb-3">
                <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 theme-text-primary" />
                  Connect Google Gemini
                </h3>
                <button onClick={() => setShowKeyModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider theme-text-muted block">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all focus:border-orange-500"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-white/40 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] theme-text-muted leading-relaxed block pt-1">
                    Your key is symmetrically encrypted using Fernet (AES-128) and never logged or stored in plain text.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-heading text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectAPI}
                  disabled={verifying}
                  className="px-4 py-2.5 theme-btn-primary text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying && <RefreshCw className="w-4.5 h-4.5 animate-spin" />}
                  Verify & Connect
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AISettingsPage;
