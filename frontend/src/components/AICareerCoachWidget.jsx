import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage, getConversations, deleteConversation } from '../services/chatService';
import { getHistory } from '../services/resumeService';
import { 
  Sparkles, MessageSquare, X, Send, Bot, User, 
  Copy, Check, RefreshCw, Trash2, ChevronRight, Zap, 
  FileText, ShieldCheck, ArrowDown, Code, Award, Cpu,
  CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp, Lightbulb,
  History, Search, Plus, CornerDownRight, Share2, Download, Maximize2, Minimize2
} from 'lucide-react';

const quickActionCards = [
  { label: "Improve ATS Score", action: "How can I improve my ATS score?", icon: Award },
  { label: "Rewrite Resume Summary", action: "Rewrite my professional summary for software roles", icon: FileText },
  { label: "Improve Project Description", action: "How can I improve my project bullet points with metrics?", icon: Code },
  { label: "Generate Cover Letter", action: "Generate a cover letter tailored for software developer roles", icon: Send },
  { label: "Create LinkedIn About", action: "Create a LinkedIn About section for my profile", icon: Sparkles },
  { label: "Suggest Certifications", action: "Recommend certifications matching my tech stack", icon: CheckCircle2 },
  { label: "Generate Interview Questions", action: "Generate technical and STAR interview questions based on my projects", icon: MessageSquare },
  { label: "30-Day Learning Roadmap", action: "Create a 30-day technical learning roadmap for my profile", icon: TrendingUp },
];

const thinkingSteps = [
  "Analyzing Resume & Candidate Profile...",
  "Checking ATS Compatibility & Keywords...",
  "Reviewing Project Technical Bullet Points...",
  "Generating Personalized Recommendations..."
];

const parseInlineFormatting = (text) => {
  if (!text) return '';
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-extrabold theme-text-heading text-orange-400 dark:text-orange-300">{part}</strong>;
    }
    const italicParts = part.split('*');
    return italicParts.map((subPart, subIdx) => {
      if (subIdx % 2 === 1) {
        return <em key={subIdx} className="italic theme-text-primary font-semibold">{subPart}</em>;
      }
      return subPart;
    });
  });
};

const parseMarkdown = (text) => {
  if (!text) return <p className="text-xs theme-text-body leading-relaxed">Response generated successfully.</p>;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div key={idx} className="h-2" />;
    
    if (cleanLine.startsWith('#')) {
      const match = cleanLine.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];
        const boldParsed = parseInlineFormatting(headingText);
        if (level === 1) return <h1 key={idx} className="text-sm font-extrabold theme-text-heading mt-3 mb-1 tracking-tight border-b pb-1 theme-border">{boldParsed}</h1>;
        if (level === 2) return <h2 key={idx} className="text-xs font-extrabold theme-text-heading mt-3 mb-1 tracking-tight">{boldParsed}</h2>;
        return <h3 key={idx} className="text-[11px] font-bold theme-text-heading mt-2 mb-1 uppercase tracking-wider">{boldParsed}</h3>;
      }
    }
    
    if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
      const listContent = cleanLine.substring(1).trim();
      return (
        <div key={idx} className="flex items-start gap-2 text-xs theme-text-body pl-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full theme-bg-primary mt-1.5 shrink-0" />
          <span className="leading-relaxed flex-1">{parseInlineFormatting(listContent)}</span>
        </div>
      );
    }
    
    const numMatch = cleanLine.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const listContent = numMatch[2];
      return (
        <div key={idx} className="flex items-start gap-2 text-xs theme-text-body pl-2 py-0.5">
          <span className="text-[11px] font-extrabold theme-text-primary mt-0.5 shrink-0 w-4">{num}.</span>
          <span className="leading-relaxed flex-1">{parseInlineFormatting(listContent)}</span>
        </div>
      );
    }
    
    return <p key={idx} className="text-xs theme-text-body leading-relaxed py-1 whitespace-pre-wrap">{parseInlineFormatting(cleanLine)}</p>;
  });
};

const AICareerCoachWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStepIdx, setThinkingStepIdx] = useState(0);
  
  const [latestReport, setLatestReport] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchLatestReport();
    fetchChatConversations();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const fetchLatestReport = async () => {
    try {
      const historyData = await getHistory();
      if (historyData && historyData.length > 0) {
        setLatestReport(historyData[0]);
      }
    } catch (err) {
      console.error('Failed to load latest report for chat context', err);
    }
  };

  const fetchChatConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentAtsScore = latestReport?.ats_score || 88;
  const currentFileName = latestReport?.filename || 'Resume Document Loaded';
  const overallRating = latestReport?.overall_rating || 'Excellent Candidate';

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isThinking) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);
    setThinkingStepIdx(0);

    // Animate thinking steps
    const stepInterval = setInterval(() => {
      setThinkingStepIdx((prev) => (prev < thinkingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const data = await sendChatMessage(text, activeConvId);
      clearInterval(stepInterval);
      if (data.conversation_id) setActiveConvId(data.conversation_id);
      
      const assistantReply = {
        role: 'assistant',
        data: typeof data.reply === 'object' ? data.reply : null,
        content: typeof data.reply === 'string' ? data.reply : null,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantReply]);
      fetchChatConversations();
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠️ I encountered an error connecting to the AI Coach engine. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
  };

  const handleSelectConversation = (conv) => {
    setActiveConvId(conv._id);
    setShowHistorySidebar(false);
    
    // Format conversation messages
    const formatted = conv.messages.map((m) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : null,
      data: typeof m.content === 'object' ? m.content : null,
      timestamp: m.timestamp
    }));
    setMessages(formatted);
  };

  const handleDeleteConv = async (convId, e) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      if (activeConvId === convId) handleNewChat();
      fetchChatConversations();
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  };

  // Render Rich UI Card for AI Responses (Adapted to Active Theme)
  const renderAIResponseCard = (msg, msgIdx) => {
    let data = msg.data;
    if (!data && msg.content) {
      try {
        data = JSON.parse(msg.content);
      } catch (e) {
        data = null;
      }
    }

    if (!data) {
      return (
        <div className="p-4 rounded-3xl theme-card border space-y-2">
          {parseMarkdown(msg.content)}
        </div>
      );
    }

    const {
      overview,
      current_assessment,
      strengths,
      high_priority_improvements,
      recommended_actions,
      estimated_improvement,
      example_rewrite,
      coach_tip
    } = data;

    return (
      <div className="space-y-4">
        
        {/* Card 1: Executive Overview */}
        {overview && (
          <div className="p-4 rounded-3xl theme-card border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold theme-text-heading">
              <Sparkles className="w-4 h-4 theme-text-primary" />
              <span>Executive Overview</span>
            </div>
            <p className="text-xs theme-text-body leading-relaxed">{overview}</p>
          </div>
        )}

        {/* Card 2: Current Assessment Metrics Grid */}
        {current_assessment && (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl theme-card border text-center">
              <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">ATS Score</span>
              <span className="text-lg font-extrabold theme-text-heading">{current_assessment.ats_score}%</span>
            </div>
            <div className="p-3 rounded-2xl theme-card border text-center">
              <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">Strength Level</span>
              <span className="text-xs font-bold theme-text-primary truncate block mt-1">{current_assessment.strength_level}</span>
            </div>
            <div className="p-3 rounded-2xl theme-card border text-center">
              <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">Readiness</span>
              <span className="text-xs font-bold text-emerald-500 truncate block mt-1">{current_assessment.interview_readiness}</span>
            </div>
            <div className="p-3 rounded-2xl theme-card border text-center">
              <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">Rating</span>
              <span className="text-xs font-bold theme-text-body truncate block mt-1">{current_assessment.overall_rating}</span>
            </div>
          </div>
        )}

        {/* Card 3: Strengths List */}
        {strengths && strengths.length > 0 && (
          <div className="p-4 rounded-3xl theme-card border space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Strengths</span>
            </div>
            <div className="space-y-2">
              {strengths.map((str, sIdx) => (
                <div key={sIdx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs theme-text-body flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 4: High Priority Improvements */}
        {high_priority_improvements && high_priority_improvements.length > 0 && (
          <div className="p-4 rounded-3xl theme-card border space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
              <AlertTriangle className="w-4 h-4" />
              <span>High Priority Recommendations</span>
            </div>
            <div className="space-y-2.5">
              {high_priority_improvements.map((imp, iIdx) => (
                <div key={iIdx} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <span className="text-xs font-bold theme-text-heading flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-500 text-[10px] flex items-center justify-center font-extrabold">{iIdx + 1}</span>
                    {imp.title}
                  </span>
                  <p className="text-[11px] theme-text-muted leading-relaxed pl-5">{imp.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 5: Estimated Improvement Progress Bar */}
        {estimated_improvement && (
          <div className="p-4 rounded-3xl theme-card border space-y-3">
            <div className="flex items-center justify-between text-xs font-bold theme-text-heading">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 theme-text-primary" />
                Estimated Score Boost
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-500/40 text-emerald-500">
                {estimated_improvement.improvement_label}
              </span>
            </div>
            <div className="w-full theme-bg h-2.5 rounded-full overflow-hidden p-0.5 border theme-border">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${estimated_improvement.potential_ats}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] theme-text-muted font-semibold">
              <span>Current: {estimated_improvement.current_ats}%</span>
              <span>Potential: {estimated_improvement.potential_ats}%</span>
            </div>
          </div>
        )}

        {/* Card 6: Example Rewrite / Code snippet */}
        {example_rewrite && (
          <div className="p-4 rounded-3xl theme-card border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold theme-text-heading">
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 theme-text-primary" />
                Recommended Bullet Rewrite
              </span>
              <button
                onClick={() => handleCopyText(example_rewrite, msgIdx)}
                className="text-[10px] theme-text-muted hover:theme-text-heading flex items-center gap-1 cursor-pointer"
              >
                {copiedIdx === msgIdx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedIdx === msgIdx ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-3 rounded-2xl theme-bg border theme-border font-mono text-[11px] theme-text-body leading-relaxed">
              {example_rewrite}
            </div>
          </div>
        )}

        {/* Card 7: Interactive Recommended Action Buttons */}
        {recommended_actions && recommended_actions.length > 0 && (
          <div className="p-4 rounded-3xl theme-card border space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider theme-text-muted block">Recommended Actions</span>
            <div className="flex flex-wrap gap-2">
              {recommended_actions.map((act, aIdx) => (
                <button
                  key={aIdx}
                  onClick={() => handleSend(act.label)}
                  className="px-3 py-2 rounded-xl theme-btn-primary text-white text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card 8: Career Coach Tip */}
        {coach_tip && (
          <div className="p-4 rounded-3xl theme-card border flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-0.5">Career Coach Tip</span>
              <p className="text-xs theme-text-body leading-relaxed">{coach_tip}</p>
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <>
      {/* Floating Launch Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-4 rounded-full theme-btn-primary text-white shadow-lg flex items-center justify-center cursor-pointer border border-white/20"
          title="Open CareerBoost AI Coach"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          )}
        </motion.button>
      </div>

      {/* 35-40% Width Slide-Over Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 z-50 h-full theme-sidebar border-l shadow-2xl flex flex-col justify-between overflow-hidden no-print transition-all duration-300 ${
              isFullScreen ? 'w-full' : 'w-full sm:w-[500px] md:w-[42%] lg:w-[38%] xl:w-[35%]'
            }`}
          >
            
            {/* Sticky Header */}
            <div className="p-4 border-b theme-border theme-sidebar flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl theme-btn-primary flex items-center justify-center text-white shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold theme-text-heading flex items-center gap-2">
                    🤖 CareerBoost AI Coach
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold">
                      Resume Loaded ✓
                    </span>
                  </h3>
                  <p className="text-[11px] theme-text-muted truncate max-w-[240px]">
                    {currentFileName} • <strong className="theme-text-primary">{currentAtsScore}% ATS</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                  className="p-2 rounded-xl theme-text-muted hover:theme-text-heading hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Chat History"
                >
                  <History className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleNewChat}
                  className="p-2 rounded-xl theme-text-muted hover:theme-text-heading hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 rounded-xl theme-text-muted hover:theme-text-heading hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={isFullScreen ? "Exit Full Screen" : "View Full Screen"}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4.5 h-4.5" />
                  ) : (
                    <Maximize2 className="w-4.5 h-4.5" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl theme-text-muted hover:theme-text-heading hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation History Drawer Overlay */}
            {showHistorySidebar && (
              <div className="p-4 theme-card border-b theme-border space-y-3">
                <div className="flex items-center justify-between text-xs font-bold theme-text-heading">
                  <span>Previous Chat Conversations</span>
                  <button onClick={() => setShowHistorySidebar(false)} className="theme-text-muted hover:theme-text-heading">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {conversations.length === 0 ? (
                    <p className="text-[11px] theme-text-muted">No saved conversations yet.</p>
                  ) : conversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        activeConvId === conv._id
                          ? 'theme-btn-primary text-white'
                          : 'theme-border theme-text-body hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="truncate max-w-[200px]">{conv.title}</span>
                      <button
                        onClick={(e) => handleDeleteConv(conv._id, e)}
                        className="text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Chat Scroll Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6 font-sans">
              
              {/* WELCOME STATE CARD */}
              {messages.length === 0 && (
                <div className="space-y-6">
                  <div className="theme-card p-6 rounded-3xl border shadow-md space-y-3 text-center">
                    <div className="w-14 h-14 rounded-2xl theme-btn-primary flex items-center justify-center text-white mx-auto shadow-md">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-extrabold theme-text-heading">👋 Welcome back, {user?.username || 'Ramya'}.</h4>
                    <p className="text-xs theme-text-body leading-relaxed">
                      I've analyzed your resume document <strong className="theme-text-heading">({currentFileName})</strong>. Current ATS Rating: <strong className="theme-text-primary">{currentAtsScore}% ({overallRating})</strong>.
                    </p>
                    <p className="text-xs theme-text-muted">
                      I'm ready to help you improve your resume, prepare for interviews, generate cover letters, rewrite projects, and plan your career roadmap.
                    </p>
                  </div>

                  {/* Categorized Quick Action Grid */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider theme-text-muted block">What would you like to do today?</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {quickActionCards.map((card, cIdx) => {
                        const Icon = card.icon;
                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleSend(card.action)}
                            className="p-3.5 rounded-2xl theme-card border text-left flex items-center gap-3 hover:scale-[1.02] transition-all cursor-pointer group"
                          >
                            <div className="p-2 rounded-xl theme-border border theme-text-primary group-hover:theme-text-heading shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold theme-text-heading group-hover:theme-text-primary transition-colors leading-tight">
                              {card.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Render Container */}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {msg.role === 'user' ? (
                    /* User Message Bubble */
                    <div className="max-w-[85%] p-4 rounded-3xl theme-btn-primary text-white font-semibold text-xs rounded-br-none shadow-md space-y-1">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[9px] text-white/70 text-right block">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ) : (
                    /* AI Coach Rich UI Card Response */
                    <div className="w-full space-y-3">
                      {renderAIResponseCard(msg, idx)}
                      
                      {/* Follow-up Prompt Chips */}
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">What would you like to do next?</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["Improve Resume", "Generate Cover Letter", "Mock Interview", "30-Day Roadmap"].map((chip, chIdx) => (
                            <button
                              key={chIdx}
                              onClick={() => handleSend(chip)}
                              className="px-3 py-1 rounded-xl theme-card border theme-border theme-text-heading text-[11px] font-semibold hover:theme-text-primary transition-all cursor-pointer"
                            >
                              ⚡ {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {/* Multi-stage Thinking Animation */}
              {isThinking && (
                <div className="p-4 rounded-3xl theme-card border flex items-center gap-3 text-xs font-semibold theme-text-body shadow-sm">
                  <div className="w-8 h-8 rounded-xl theme-btn-primary flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <span>{thinkingSteps[thinkingStepIdx]}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t theme-border theme-sidebar sticky bottom-0 z-20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask your AI Career Coach..."
                  className="flex-1 px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isThinking}
                  className="p-3 rounded-2xl theme-btn-primary text-white shadow-md disabled:opacity-50 cursor-pointer hover:scale-105 transition-all"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICareerCoachWidget;
