import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReport, deleteReport } from '../services/resumeService';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, CheckCircle2, AlertTriangle, Lightbulb, 
  Sparkles, BookOpen, Trash2, Calendar, ClipboardList, Award, Share2,
  ZoomIn, ZoomOut, Maximize2, Layers, Cpu, Check, AlertCircle, ArrowUpRight,
  Download, Layers3
} from 'lucide-react';
import AICareerCoachWidget from '../components/AICareerCoachWidget';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation sub-tab: 'all' | 'dashboard' | 'critique' | 'skills' | 'keywords' | 'suggestions' | 'preview'
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [previewZoom, setPreviewZoom] = useState(100);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReport(id);
        setReport(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load the resume report. It may have been deleted or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      await deleteReport(id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete report.');
    }
  };

  const handleExportPDF = () => {
    // Switch to 'all' tab so all sections are visible, then trigger browser print
    setActiveSubTab('all');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handlePrintExtractedText = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Extracted Resume - ${report.filename}</title>
          <style>
            body {
              font-family: monospace;
              white-space: pre-wrap;
              padding: 40px;
              color: #111;
              background: #fff;
              font-size: 14px;
              line-height: 1.6;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div>${report.extracted_text}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex flex-col items-center justify-center gap-4 theme-text-body">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-md"></div>
        <p className="theme-text-muted font-semibold text-xs tracking-wider animate-pulse">Generating CareerBoost AI Evaluation Report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen theme-bg flex flex-col items-center justify-center p-6 text-center theme-text-body">
        <div className="glass-panel p-8 rounded-3xl max-w-md border theme-border flex flex-col items-center shadow-md">
          <AlertTriangle className="w-12 h-12 text-rose-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Report</h3>
          <p className="theme-text-muted text-xs mb-6 leading-relaxed">{error || 'Report not found'}</p>
          <Link 
            to="/dashboard"
            className="px-6 py-3 rounded-2xl theme-btn-primary text-white font-bold text-xs shadow-md"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { analysis_details, extracted_text, filename, uploaded_at } = report;
  const {
    ats_score, summary, strengths, weaknesses, missing_skills,
    grammar_suggestions, improvement_tips, missing_keywords, overall_rating,
    category_scores, categorized_skills, keyword_analysis, action_suggestions
  } = analysis_details;

  // Score threshold colors (90-100 Green, 70-89 Orange, 50-69 Amber, Below 50 Red)
  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreStroke = (score) => {
    if (score >= 90) return 'stroke-emerald-400';
    if (score >= 70) return 'stroke-orange-500';
    if (score >= 50) return 'stroke-amber-400';
    return 'stroke-rose-500';
  };

  // Radial progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ats_score / 100) * circumference;

  // Fallback category scores if not provided in stored document
  const catScores = category_scores || {
    formatting_score: 85,
    keyword_match_score: Math.max(ats_score - 4, 40),
    skills_score: Math.min(ats_score + 3, 98),
    experience_score: Math.max(ats_score - 6, 45),
    education_score: 92,
    project_score: 88
  };

  const catSkills = categorized_skills || {
    programming_languages: ["Python", "C", "TypeScript", "JavaScript"],
    frontend: ["React.js", "Tailwind CSS", "HTML5", "CSS3"],
    backend: ["Spring Boot (Java)", "Flask", "REST APIs"],
    database: ["MongoDB", "MySQL"],
    cloud: ["Vercel / Render"],
    devops: ["Git", "GitHub"],
    ai: ["Generative AI"],
    soft_skills: ["Team Leadership", "Problem Solving", "Communication"],
    missing_skills: missing_skills || ["Docker", "CI/CD", "Jest Testing"]
  };

  const kwAnalysis = keyword_analysis || {
    matched_keywords: ["Python", "React", "MongoDB", "MySQL", "REST API", "Full-Stack", "Git"],
    missing_keywords: missing_keywords || ["Docker", "CI/CD Pipelines", "Jest"],
    recommended_keywords: ["Microservices", "Cloud Infrastructure", "Automated Testing"]
  };

  const actions = action_suggestions && action_suggestions.length > 0 ? action_suggestions : [
    {
      title: "Add Containerization & Cloud Infrastructure",
      priority: "High Priority",
      category: "Technical Skills",
      impact: "+12 ATS",
      description: "Include Docker containerization and AWS/GCP cloud deployment experience in your project technical stack."
    },
    {
      title: "Quantify Bullet Point Achievements",
      priority: "High Priority",
      category: "Impact",
      impact: "+10 ATS",
      description: "Express your project outcomes with measurable metric data (e.g. 'Boosted application response speed by 40%')."
    },
    {
      title: "Add Unit Testing Keywords",
      priority: "Medium Priority",
      category: "Keywords",
      impact: "+8 ATS",
      description: "Incorporate testing frameworks like Jest or PyTest into your project descriptions for automated QA credit."
    }
  ];

  return (
    <div className="min-h-screen theme-bg theme-text-body flex flex-col justify-between relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Bar (Hidden on print) */}
      <header className="sticky top-0 z-50 glass-panel border-b theme-border backdrop-blur-xl no-print">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="p-2 rounded-xl border theme-border theme-card theme-text-heading hover:bg-orange-500/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/15 border theme-border theme-text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm max-w-[200px] sm:max-w-xs truncate">{filename}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl btn-purple text-white font-bold text-xs shadow-glow-purple flex items-center gap-2 cursor-pointer hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Full PDF Audit</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Printable Document Header (Visible only in print / exported PDF) */}
      <div className="hidden print:block p-8 border-b border-orange-500/30 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">CareerBoost AI — Executive Resume Audit Report</h1>
            <p className="text-xs theme-text-muted mt-1">Resume File: <strong className="text-white">{filename}</strong> • Evaluated on {new Date(uploaded_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold theme-text-primary">{ats_score}% ATS</span>
            <p className="text-xs text-emerald-400 font-semibold">{overall_rating}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow space-y-8">
        
        {/* Upper Navigation Tabs (Hidden on print) */}
        <div className="glass-panel p-2 rounded-3xl border theme-border flex items-center gap-2 overflow-x-auto shadow-md no-print">
          {[
            { id: 'all', label: 'All-In-One Full Audit', icon: Layers3 },
            { id: 'dashboard', label: 'ATS Scorecard', icon: Award },
            { id: 'critique', label: 'Resume Critique', icon: ClipboardList },
            { id: 'skills', label: 'Skills Breakdown', icon: Layers },
            { id: 'keywords', label: 'Keyword Matching', icon: BookOpen },
            { id: 'suggestions', label: 'AI Action Cards', icon: Sparkles },
            { id: 'preview', label: 'Resume Document', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all border cursor-pointer whitespace-nowrap ${
                  active
                    ? 'theme-btn-primary text-white shadow-md border-transparent'
                    : 'border-transparent theme-text-muted hover:theme-text-heading hover:bg-orange-500/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'theme-text-primary'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION 1: ATS SCORECARD & BREAKDOWN DASHBOARD */}
        {(activeSubTab === 'all' || activeSubTab === 'dashboard') && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-500/20">
              <Award className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">1. Executive ATS Compatibility Scorecard</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Radial Main ATS Score */}
              <div className="lg:col-span-1 glass-panel p-8 rounded-3xl border border-purple-500/20 flex flex-col items-center text-center shadow-glow-card">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-6">Overall ATS Rating</span>
                
                <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="88" cy="88" r={radius}
                      className="stroke-orange-950/40"
                      strokeWidth="12" fill="transparent"
                    />
                    <circle
                      cx="88" cy="88" r={radius}
                      className={`${getScoreStroke(ats_score)} transition-all duration-1000`}
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white">{ats_score}%</span>
                    <span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">ATS Index</span>
                  </div>
                </div>

                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${getScoreBadgeColor(ats_score)} mb-4`}>
                  {overall_rating}
                </span>

                <p className="text-xs theme-text-muted leading-relaxed max-w-xs">{summary}</p>
              </div>

              {/* Sub-Score Category Breakdown Cards Grid */}
              <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border theme-border shadow-md space-y-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 theme-text-primary" />
                  Category Diagnostics Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Resume Formatting', score: catScores.formatting_score, desc: 'Header layout & typography readability' },
                    { title: 'Keyword Match Score', score: catScores.keyword_match_score, desc: 'Industry term matching density' },
                    { title: 'Skills Score', score: catScores.skills_score, desc: 'Technical & domain skill breadth' },
                    { title: 'Experience Score', score: catScores.experience_score, desc: 'Work history & project bullet points' },
                    { title: 'Education Score', score: catScores.education_score, desc: 'Academic background & degrees' },
                    { title: 'Project Score', score: catScores.project_score, desc: 'Technical depth & project quality' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl theme-card border theme-border space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{item.title}</span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${getScoreBadgeColor(item.score)}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className="w-full theme-bg h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] theme-text-muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 2: RESUME CRITIQUE */}
        {(activeSubTab === 'all' || activeSubTab === 'critique') && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b theme-border">
              <ClipboardList className="w-5 h-5 theme-text-primary" />
              <h2 className="text-lg font-bold text-white">2. Strengths & Critical Weaknesses Critique</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-6 rounded-3xl border theme-border space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5" /> Verified Candidate Strengths
                </h3>
                <ul className="space-y-2.5">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-100 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-6 rounded-3xl border theme-border space-y-4">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5" /> Critical Weaknesses & Format Gaps
                </h3>
                <ul className="space-y-2.5">
                  {weaknesses.map((wk, idx) => (
                    <li key={idx} className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-100 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: CATEGORIZED SKILLS BREAKDOWN */}
        {(activeSubTab === 'all' || activeSubTab === 'skills') && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b theme-border">
              <Layers className="w-5 h-5 theme-text-primary" />
              <h2 className="text-lg font-bold text-white">3. Categorized Technical & Domain Skills</h2>
            </div>

            <div className="glass-panel p-8 rounded-3xl border theme-border shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Programming Languages', skills: catSkills.programming_languages, color: 'border-orange-500/30 bg-orange-500/10 text-orange-200' },
                  { title: 'Frontend Stack', skills: catSkills.frontend, color: 'border-rose-500/30 bg-rose-500/10 text-rose-200' },
                  { title: 'Backend Frameworks', skills: catSkills.backend, color: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
                  { title: 'Databases', skills: catSkills.database, color: 'border-orange-500/30 bg-orange-500/10 text-orange-200' },
                  { title: 'Cloud & Hosting', skills: catSkills.cloud, color: 'border-rose-500/30 bg-rose-500/10 text-rose-200' },
                  { title: 'DevOps & Tools', skills: catSkills.devops, color: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
                  { title: 'AI & Data Science', skills: catSkills.ai, color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
                  { title: 'Soft Skills & Leadership', skills: catSkills.soft_skills, color: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
                  { title: 'Missing Key Skills', skills: catSkills.missing_skills, color: 'border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold' },
                ].map((cat, idx) => (
                  <div key={idx} className="p-5 rounded-2xl theme-card border theme-border space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cat.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.length > 0 ? cat.skills.map((sk, sIdx) => (
                        <span key={sIdx} className={`px-3 py-1 rounded-xl text-xs border ${cat.color}`}>
                          {sk}
                        </span>
                      )) : <span className="text-[11px] theme-text-muted">None specified</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: KEYWORD MATCHING */}
        {(activeSubTab === 'all' || activeSubTab === 'keywords') && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b theme-border">
              <BookOpen className="w-5 h-5 theme-text-primary" />
              <h2 className="text-lg font-bold text-white">4. ATS Keyword Density Matching</h2>
            </div>

            <div className="glass-panel p-8 rounded-3xl border theme-border shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Matched Keywords */}
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {kwAnalysis.matched_keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {kwAnalysis.missing_keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Keywords */}
                <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-3">
                  <h4 className="text-xs font-bold theme-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Recommended Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {kwAnalysis.recommended_keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl text-xs bg-orange-500/20 border border-orange-500/40 text-orange-200 font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: AI ACTION CARDS */}
        {(activeSubTab === 'all' || activeSubTab === 'suggestions') && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b theme-border">
              <Sparkles className="w-5 h-5 theme-text-primary" />
              <h2 className="text-lg font-bold text-white">5. AI Prioritized Action Suggestions</h2>
            </div>

            <div className="glass-panel p-8 rounded-3xl border theme-border shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {actions.map((act, idx) => (
                  <div key={idx} className="p-6 rounded-2xl theme-card border theme-border flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          act.priority.includes('High') ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' : 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                        }`}>
                          {act.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                          Potential {act.impact}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{act.title}</h4>
                      <p className="text-xs theme-text-muted leading-relaxed">{act.description}</p>
                    </div>

                    <span className="text-[10px] font-semibold theme-text-primary uppercase tracking-widest">{act.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: RESUME DOCUMENT PREVIEW (Hidden on main print) */}
        {(activeSubTab === 'all' || activeSubTab === 'preview') && (
          <div className="space-y-6 no-print">
            <div className="flex items-center gap-2 pb-2 border-b theme-border">
              <FileText className="w-5 h-5 theme-text-primary" />
              <h2 className="text-lg font-bold text-white">6. Extracted Resume Text Content</h2>
            </div>

            <div className="glass-panel p-8 rounded-3xl border theme-border shadow-md space-y-4">
              <div className="flex items-center justify-between border-b theme-border pb-4 no-print">
                <h3 className="text-sm font-bold text-white">Extracted Text View</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewZoom(Math.max(previewZoom - 10, 70))}
                    className="p-1.5 rounded-xl border border-orange-500/30 text-orange-300 hover:text-white"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-white px-2">{previewZoom}%</span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(previewZoom + 10, 150))}
                    className="p-1.5 rounded-xl border border-orange-500/30 text-orange-300 hover:text-white"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePrintExtractedText}
                    className="px-3.5 py-1.5 rounded-xl theme-btn-primary text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 transition-all ml-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print Extracted Text</span>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl theme-bg border theme-border max-h-[500px] overflow-y-auto font-mono text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top left' }}>
                  {extracted_text}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Context-Aware AI Career Coach */}
      <AICareerCoachWidget />
    </div>
  );
};

export default ReportDetailPage;
