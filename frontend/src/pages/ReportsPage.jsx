import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getHistory } from '../services/resumeService';
import { motion } from 'framer-motion';
import { 
  FileText, Award, Eye, Download, Sparkles, CheckCircle2, TrendingUp, Layers
} from 'lucide-react';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const totalReports = reports.length;
  const avgScore = totalReports > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.ats_score || 0), 0) / totalReports) : 0;
  const topReport = reports.length > 0 ? [...reports].sort((a, b) => b.ats_score - a.ats_score)[0] : null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h1 className="text-2xl font-extrabold theme-text-heading tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 theme-text-primary" />
              Generated Executive Reports
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Access and export your complete AI resume audit document reports.
            </p>
          </div>
        </div>

        {/* Executive Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="theme-card p-6 rounded-3xl border shadow-sm">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Total Reports</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold theme-text-heading">{totalReports}</span>
              <span className="text-xs theme-text-muted">Documents Analyzed</span>
            </div>
          </div>

          <div className="theme-card p-6 rounded-3xl border shadow-sm">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Average Benchmark</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold theme-text-heading">{avgScore}%</span>
              <span className="text-xs text-emerald-500 font-semibold">ATS Compatibility</span>
            </div>
          </div>

          <div className="theme-card p-6 rounded-3xl border shadow-sm">
            <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Highest Scoring Resume</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold theme-text-heading">{topReport ? topReport.ats_score : 0}%</span>
              <span className="text-xs theme-text-muted truncate max-w-[140px]">{topReport ? topReport.filename : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="theme-card p-8 rounded-3xl border shadow-md">
          <h2 className="text-lg font-bold theme-text-heading mb-6 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 theme-text-primary" />
            Active Reports Vault
          </h2>

          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs theme-text-muted">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <FileText className="w-12 h-12 theme-text-muted opacity-30 mb-3" />
              <p className="font-semibold theme-text-heading text-sm">No reports available</p>
              <Link to="/dashboard" className="mt-4 px-5 py-2.5 theme-btn-primary text-white font-bold text-xs shadow-md">
                Generate First Report
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <motion.div
                  key={report._id}
                  whileHover={{ y: -4 }}
                  className="theme-card p-6 rounded-3xl border flex flex-col justify-between gap-6 hover:border-blue-400/50 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-3 rounded-2xl border theme-border theme-text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        report.ats_score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                      }`}>
                        {report.ats_score}% ATS
                      </span>
                    </div>

                    <h3 className="font-bold theme-text-heading text-sm truncate">{report.filename}</h3>
                    <p className="text-[11px] theme-text-muted">
                      Generated {new Date(report.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t theme-border">
                    <Link
                      to={`/report/${report._id}`}
                      className="flex-1 py-2.5 theme-btn-primary text-white font-bold text-xs text-center shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Full Audit
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
