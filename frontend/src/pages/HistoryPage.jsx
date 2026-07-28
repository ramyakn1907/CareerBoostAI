import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getHistory, deleteReport } from '../services/resumeService';
import { motion } from 'framer-motion';
import { 
  History, FileText, Eye, Trash2, Search, Filter, 
  Download, RefreshCw, Sparkles, AlertCircle 
} from 'lucide-react';

const HistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistoryList(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report from history?')) return;
    try {
      await deleteReport(id);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  const filteredList = historyList.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (scoreFilter === 'high') return matchesSearch && item.ats_score >= 80;
    if (scoreFilter === 'medium') return matchesSearch && item.ats_score >= 60 && item.ats_score < 80;
    if (scoreFilter === 'low') return matchesSearch && item.ats_score < 60;
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
          <div>
            <h1 className="text-2xl font-extrabold theme-text-heading tracking-tight flex items-center gap-2.5">
              <History className="w-6 h-6 theme-text-primary" />
              Analysis History
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Review all historical resume evaluations, ATS scores, and AI diagnostic reports.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            className="px-4 py-2 rounded-xl border theme-border theme-card theme-text-heading text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh List
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="theme-card p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by resume name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <span className="text-xs font-semibold theme-text-muted flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['all', 'high', 'medium', 'low'].map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                  scoreFilter === f
                    ? 'theme-btn-primary shadow-sm'
                    : 'border-transparent theme-text-muted hover:theme-text-heading'
                }`}
              >
                {f === 'all' ? 'All Scores' : f === 'high' ? 'High (80+)' : f === 'medium' ? 'Medium (60-79)' : 'Low (<60)'}
              </button>
            ))}
          </div>
        </div>

        {/* Professional Data Table */}
        <div className="theme-card rounded-3xl border overflow-hidden shadow-md">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs theme-text-muted">Loading historical reports...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 px-6 flex flex-col items-center">
              <FileText className="w-12 h-12 theme-text-muted opacity-30 mb-3" />
              <p className="font-semibold theme-text-heading text-sm">No analysis reports found</p>
              <p className="text-xs theme-text-muted mt-1 max-w-sm">
                {searchQuery ? 'Try adjusting your search query or score filters.' : 'Upload your resume on the dashboard to generate your first AI report.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b theme-border theme-bg theme-text-muted uppercase tracking-wider font-semibold">
                    <th className="py-4 px-6">Resume Name</th>
                    <th className="py-4 px-6">Upload Date</th>
                    <th className="py-4 px-6">ATS Score</th>
                    <th className="py-4 px-6">Status / Rating</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border theme-text-body">
                  {filteredList.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold theme-text-heading">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl border theme-border theme-text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="max-w-xs truncate">{item.filename}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 theme-text-muted">
                        {new Date(item.uploaded_at).toLocaleDateString()} at {new Date(item.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                          item.ats_score >= 80
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            : item.ats_score >= 60
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        }`}>
                          {item.ats_score}%
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium theme-text-body">
                        {item.overall_rating}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/report/${item._id}`}
                            className="px-3 py-1.5 rounded-xl border theme-border theme-text-heading hover:bg-blue-500/10 transition-all font-semibold flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 transition-all cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
