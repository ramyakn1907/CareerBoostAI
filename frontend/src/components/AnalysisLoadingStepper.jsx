import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UploadCloud, FileText, Cpu, CheckCircle2, Award } from 'lucide-react';

const steps = [
  { label: 'Uploading Resume...', icon: UploadCloud, duration: 800 },
  { label: 'Extracting Text & Document Structure...', icon: FileText, duration: 1200 },
  { label: 'Understanding Candidate Profile...', icon: Cpu, duration: 1400 },
  { label: 'Running ATS Compliance Analysis...', icon: Award, duration: 1500 },
  { label: 'Generating AI Suggestions & Skill Gaps...', icon: Sparkles, duration: 1600 },
  { label: 'Preparing Executive Report...', icon: CheckCircle2, duration: 1000 },
];

const AnalysisLoadingStepper = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let activeStep = 0;
    const interval = setInterval(() => {
      activeStep += 1;
      if (activeStep < steps.length) {
        setCurrentStep(activeStep);
        setProgress(Math.round(((activeStep + 1) / steps.length) * 100));
      } else {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#120a1d]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-purple-50">
      {/* Glow background orb */}
      <div className="w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[140px] absolute pointer-events-none animate-pulse-glow" />

      <div className="w-full max-w-lg glass-panel p-8 md:p-10 rounded-3xl border theme-border shadow-glow-card relative z-10 text-center flex flex-col items-center">
        
        {/* Animated Central Icon Ring */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-28 h-28 rounded-full border-2 border-dashed border-orange-500/30 flex items-center justify-center"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-glow-purple">
              <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest theme-text-muted glass-pill px-3 py-1 rounded-full mb-3 border theme-border">
          Powered by CareerBoost AI Engine
        </span>

        <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
          Analyzing Your Resume
        </h3>

        {/* Animated Step Label */}
        <div className="h-8 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-semibold theme-text-body tracking-wide"
            >
              {steps[currentStep].label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full theme-bg border theme-border h-2.5 rounded-full overflow-hidden p-0.5 mb-6">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full shadow-glow-purple"
          />
        </div>

        {/* Step Checkmarks Bar */}
        <div className="w-full grid grid-cols-6 gap-2">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-orange-500 shadow-glow-purple' : 'bg-orange-950/30'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AnalysisLoadingStepper;
