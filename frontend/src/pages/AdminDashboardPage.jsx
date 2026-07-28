import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  ShieldAlert, BarChart3, Database, Key, Clock, AlertTriangle, 
  Cpu, RefreshCw, Calendar, Sparkles, TrendingUp
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Page States
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/ai-settings/admin-stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Access denied. Only administrators can view this dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If user is loaded and not an admin, redirect or show error
    if (user && !user.is_admin) {
      setError('Access denied. Administrator privileges required.');
      setLoading(false);
      return;
    }
    fetchAdminStats();
  }, [user]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12 p-8 rounded-3xl border border-rose-500/20 bg-rose-950/10 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-extrabold theme-text-heading">Unauthorized Access</h2>
          <p className="text-xs theme-text-muted">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 text-xs theme-btn-primary text-white font-bold cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h1 className="text-2xl font-extrabold theme-text-heading tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 theme-text-primary" />
              Admin AI Analytics
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Global metrics, response latencies, model consumption trends, and API key registrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminStats}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-heading text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-orange-500/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-28 bg-white/5 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Total requests */}
              <div className="theme-card p-6 rounded-3xl border shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Total AI Requests</span>
                  <p className="text-xl font-extrabold theme-text-heading mt-1">{stats?.total_requests}</p>
                </div>
              </div>

              {/* Stat 2: Active Keys */}
              <div className="theme-card p-6 rounded-3xl border shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Connected Keys</span>
                  <p className="text-xl font-extrabold theme-text-heading mt-1">{stats?.connected_apis}</p>
                </div>
              </div>

              {/* Stat 3: Average Latency */}
              <div className="theme-card p-6 rounded-3xl border shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Average Latency</span>
                  <p className="text-xl font-extrabold theme-text-heading mt-1">{stats?.avg_latency}ms</p>
                </div>
              </div>

              {/* Stat 4: Quota Warnings */}
              <div className="theme-card p-6 rounded-3xl border shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Quota Warnings</span>
                  <p className="text-xl font-extrabold theme-text-heading mt-1">{stats?.quota_warnings}</p>
                </div>
              </div>

            </div>

            {/* Split analytics info grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Request Distribution (Pie Chart Style details) */}
              <div className="lg:col-span-1 theme-card p-6 rounded-3xl border shadow-md space-y-6">
                <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2 border-b theme-border pb-3">
                  <Cpu className="w-4.5 h-4.5 theme-text-primary" />
                  Routing Distribution
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="theme-text-body">CareerBoost Shared API</span>
                      <span className="theme-text-heading">{stats?.shared_requests} requests</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" 
                        style={{ width: `${stats?.total_requests ? (stats.shared_requests / stats.total_requests) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="theme-text-body">Personal Gemini Keys</span>
                      <span className="theme-text-heading">{stats?.personal_requests} requests</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" 
                        style={{ width: `${stats?.total_requests ? (stats.personal_requests / stats.total_requests) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t theme-border grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-black/10 rounded-2xl border theme-border">
                    <span className="text-[9px] uppercase font-bold theme-text-muted">Most Used Model</span>
                    <p className="text-xs font-bold text-orange-400 mt-1 truncate">{stats?.most_used_model}</p>
                  </div>
                  <div className="p-3 bg-black/10 rounded-2xl border theme-border">
                    <span className="text-[9px] uppercase font-bold theme-text-muted">API Usage Ratio</span>
                    <p className="text-xs font-extrabold theme-text-heading mt-1">
                      {stats?.total_requests ? Math.round((stats.personal_requests / stats.total_requests) * 100) : 0}% Personal
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Trend Metrics (Last 7 Days) */}
              <div className="lg:col-span-2 theme-card p-6 rounded-3xl border shadow-md space-y-6">
                <h3 className="text-sm font-bold theme-text-heading flex items-center gap-2 border-b theme-border pb-3">
                  <Calendar className="w-4.5 h-4.5 theme-text-primary" />
                  AI Request History (Last 7 Days)
                </h3>

                {stats?.daily_usage && stats.daily_usage.length > 0 ? (
                  <div className="space-y-3">
                    {stats.daily_usage.map(day => (
                      <div 
                        key={day._id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border theme-border bg-black/5 hover:bg-black/10 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 font-semibold text-xs">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="theme-text-heading">{day._id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold theme-text-primary bg-orange-500/10 px-3 py-1 rounded-xl border border-orange-500/20 text-xs">{day.count} API calls</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed theme-border p-8 rounded-2xl text-center space-y-2">
                    <BarChart3 className="w-8 h-8 theme-text-muted mx-auto" />
                    <p className="text-xs theme-text-muted">No API request history available for the last 7 days.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
