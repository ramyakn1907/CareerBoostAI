import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { analyzeResume, getHistory } from '../services/resumeService';
import AnalysisLoadingStepper from '../components/AnalysisLoadingStepper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Award, UploadCloud, History, ArrowUpRight, 
  Sparkles, CheckCircle2, AlertCircle, Layers, Cpu, Calendar,
  ShieldCheck, Lock, User, RefreshCw, X, FileCheck
} from 'lucide-react';

const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab state: default to 'upload' or tab from URL query
  const defaultTab = searchParams.get('tab') || 'upload';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showLoadingStepper, setShowLoadingStepper] = useState(false);
  const [pendingAnalysisId, setPendingAnalysisId] = useState(null);

  // History & Statistics States
  const [analyses, setAnalyses] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'upload') {
      setActiveTab('upload');
      setTimeout(() => {
        document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams]);

  const fetchHistoryData = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getHistory();
      setAnalyses(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Compute Dashboard Statistics
  const totalAnalyses = analyses.length;
  const reportsGenerated = totalAnalyses;
  const avgAtsScore = totalAnalyses > 0 
    ? Math.round(analyses.reduce((acc, curr) => acc + (curr.ats_score || 0), 0) / totalAnalyses)
    : 0;
  
  const lastAnalysisDate = totalAnalyses > 0 && analyses[0]?.uploaded_at
    ? new Date(analyses[0].uploaded_at).toLocaleDateString()
    : 'No analyses yet';

  // File handling & validation
  const validateAndSetFile = (file) => {
    setUploadError('');
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !['pdf', 'docx', 'doc'].includes(ext)) {
      setUploadError('Invalid file format. Only PDF and DOCX files are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit. Please upload a smaller document.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError('');
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError('Please select a PDF or DOCX file to analyze.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const responseData = await analyzeResume(selectedFile);
      const newAnalysisId = responseData._id;
      setPendingAnalysisId(newAnalysisId);
      
      // Auto-refresh user profile to reflect extracted details immediately
      if (refreshUser) {
        await refreshUser();
      }

      // Trigger Stepper
      setShowLoadingStepper(true);
    } catch (err) {
      console.error(err);
      setUploadError(err.detail || err.message || 'Failed to analyze resume. Please try again.');
      setIsUploading(false);
    }
  };

  const handleStepperComplete = () => {
    setShowLoadingStepper(false);
    setIsUploading(false);
    if (pendingAnalysisId) {
      navigate(`/report/${pendingAnalysisId}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Animated Loading Stepper */}
      {showLoadingStepper && (
        <AnalysisLoadingStepper onComplete={handleStepperComplete} />
      )}
      <DashboardLayout>

      <div className="space-y-8">
        
        {/* Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b theme-border">
          <div>
            <h1 className="text-3xl font-extrabold theme-text-heading tracking-tight flex items-center gap-3">
              Executive Dashboard
              <span className="text-[11px] px-3 py-1 rounded-full border theme-border theme-text-muted font-semibold uppercase tracking-wider">
                Pro AI
              </span>
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Welcome back, <span className="theme-text-heading font-semibold">{user?.username}</span>. Manage your resume evaluations and AI diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('upload');
                setTimeout(() => {
                  document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="px-4 py-2.5 theme-btn-primary text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              New Resume Analysis
            </button>
          </div>
        </div>

        {/* 5 Cleaner Dashboard Statistic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Stat 1: Total Resume Analyses */}
          <div className="theme-card p-5 rounded-3xl border relative overflow-hidden group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider">Analyses</span>
              <div className="p-2 rounded-xl border theme-border theme-text-primary">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold theme-text-heading tracking-tight">{totalAnalyses}</span>
              <p className="text-[11px] theme-text-muted mt-1">Total Resumes Uploaded</p>
            </div>
          </div>

          {/* Stat 2: Average ATS Score */}
          <div className="theme-card p-5 rounded-3xl border relative overflow-hidden group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider">Avg ATS Score</span>
              <div className="p-2 rounded-xl border border-emerald-500/30 text-emerald-500">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold theme-text-heading tracking-tight">{avgAtsScore}%</span>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Average Benchmark
              </p>
            </div>
          </div>

          {/* Stat 3: Last Analysis Date */}
          <div className="theme-card p-5 rounded-3xl border relative overflow-hidden group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider">Last Audit</span>
              <div className="p-2 rounded-xl border theme-border theme-text-primary">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm font-extrabold theme-text-heading tracking-tight leading-tight block truncate">{lastAnalysisDate}</span>
              <p className="text-[11px] theme-text-muted mt-1">Latest Evaluation</p>
            </div>
          </div>

          {/* Stat 4: AI Model Status */}
          <div className="theme-card p-5 rounded-3xl border relative overflow-hidden group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider">AI Engine</span>
              <div className="p-2 rounded-xl border theme-border theme-text-accent">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold theme-text-heading tracking-tight block">Powered by CareerBoost AI Engine</span>
              <p className="text-[10px] theme-text-muted mt-1">Active Status</p>
            </div>
          </div>

          {/* Stat 5: Reports Generated */}
          <div className="theme-card p-5 rounded-3xl border relative overflow-hidden group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider">Vault Reports</span>
              <div className="p-2 rounded-xl border theme-border theme-text-primary">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold theme-text-heading tracking-tight">{reportsGenerated}</span>
              <p className="text-[11px] theme-text-muted mt-1">Exportable Audits</p>
            </div>
          </div>

        </div>

        {/* Dropzone & Upload Section */}
        <div id="upload-section" className="theme-card p-8 rounded-3xl border space-y-6">
          <div className="flex items-center justify-between border-b theme-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl theme-btn-primary text-white">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold theme-text-heading">AI Resume Document Parser</h2>
                <p className="text-xs theme-text-muted">Upload your PDF or DOCX resume to trigger ATS compatibility scoring.</p>
              </div>
            </div>

            <span className="text-[11px] px-3 py-1 rounded-full border theme-border theme-text-muted font-bold">
              Max file size: 5MB
            </span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'theme-border hover:border-blue-400'
            }`}
          >
            <input
              type="file"
              id="resume-upload-input"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <label htmlFor="resume-upload-input" className="cursor-pointer space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl theme-btn-primary flex items-center justify-center text-white shadow-md">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold theme-text-heading">
                    Click to upload or drag & drop your resume
                  </p>
                  <p className="text-xs theme-text-muted">
                    Supports PDF, DOCX (Maximum file size: 5MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                  <FileCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold theme-text-heading">{selectedFile.name}</h4>
                  <p className="text-xs theme-text-muted mt-0.5">{formatFileSize(selectedFile.size)} • Verified Format</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRemoveFile}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-semibold hover:bg-rose-500/10 cursor-pointer"
                  >
                    Change File
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="px-6 py-2.5 theme-btn-primary text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isUploading ? 'Analyzing...' : 'Run CareerBoost AI Analysis'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
    </>
  );
};

export default DashboardPage;
