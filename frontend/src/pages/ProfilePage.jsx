import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/resumeService';
import { motion } from 'framer-motion';
import { 
  User, Mail, GraduationCap, Award, Briefcase, 
  Globe, Code, FileText, ShieldCheck, Edit3, Save, Sparkles, Check,
  Trash2, ShieldAlert, RefreshCw, Wand2
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSyncSuccess, setAutoSyncSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile details state initialized dynamically per logged-in user
  const [profileData, setProfileData] = useState({
    college: '',
    degree: '',
    gradYear: '',
    targetRole: '',
    linkedin: '',
    github: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        college: user.college || '',
        degree: user.degree || '',
        gradYear: user.gradYear || user.grad_year || '',
        targetRole: user.targetRole || user.target_role || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await getHistory();
      setHistory(data);

      // Auto-extract candidate profile fields if currently empty
      if (data && data.length > 0) {
        const latestText = data[0].extracted_text || '';
        autoExtractProfileFromText(latestText, false);
      }
    } catch (err) {
      console.error('Failed to load profile stats', err);
    }
  };

  const autoExtractProfileFromText = (text, userTriggered = false) => {
    if (!text) return null;

    let updated = false;
    const newProfile = { ...profileData };

    // 1. LinkedIn
    const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    if (linkedinMatch && (!newProfile.linkedin || userTriggered)) {
      newProfile.linkedin = `linkedin.com/in/${linkedinMatch[3]}`;
      updated = true;
    }

    // 2. GitHub
    const githubMatch = text.match(/(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
    if (githubMatch && (!newProfile.github || userTriggered)) {
      newProfile.github = `github.com/${githubMatch[3]}`;
      updated = true;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // 3. College
    if (!newProfile.college || userTriggered) {
      for (const line of lines) {
        const collegeMatch = line.match(/([A-Z][a-zA-Z0-9\s,&.-]{2,60}(?:Institute|University|College|Academy|Polytechnic|School)[a-zA-Z0-9\s,&.-]*)/);
        if (collegeMatch) {
          const colStr = collegeMatch[1].split(' - ')[0].split(' | ')[0].split('\t')[0].trim();
          if (colStr.length < 80) {
            newProfile.college = colStr;
            updated = true;
            break;
          }
        }
      }
    }

    // 4. Degree
    if (!newProfile.degree || userTriggered) {
      for (const line of lines) {
        const degreeMatch = line.match(/(B\.E\.|B\.Tech|B\.S\.|M\.E\.|M\.Tech|M\.S\.|Bachelor|Master|Diploma)[A-Za-z0-9\s,.-]*(?:Computer Science|Engineering|Information Technology|Software|Data Science|Electronics|Mechanical)?/i);
        if (degreeMatch) {
          const degStr = degreeMatch[0].split(' - ')[0].split(' | ')[0].split(' 202')[0].split(' 203')[0].trim();
          if (degStr.length < 80) {
            newProfile.degree = degStr;
            updated = true;
            break;
          }
        }
      }
    }

    // 5. Grad Year
    const gradMatch = text.match(/(?:Graduation|Expected|Batch|Passout|Passed|Year|CGPA|202[0-9]|203[0-5])?.*?(\b202[0-9]\b|\b203[0-5]\b)/i);
    if (gradMatch && (!newProfile.gradYear || userTriggered)) {
      newProfile.gradYear = gradMatch[1];
      updated = true;
    }

    // 6. Target Role
    const roleMatch = text.match(/(Software Engineer|Full-Stack Developer|Frontend Developer|Backend Developer|Python Developer|Java Developer|Data Analyst|DevOps Engineer|Cloud Engineer|System Engineer)/i);
    if (roleMatch && (!newProfile.targetRole || userTriggered)) {
      newProfile.targetRole = roleMatch[1];
      updated = true;
    }

    if (updated) {
      setProfileData(newProfile);
      if (userTriggered) {
        setAutoSyncSuccess(true);
        setTimeout(() => setAutoSyncSuccess(false), 3000);
      }
      return newProfile;
    }
    return null;
  };

  const handleManualAutoSync = async () => {
    if (history.length > 0 && history[0].extracted_text) {
      const updatedProfile = autoExtractProfileFromText(history[0].extracted_text, true);
      if (updatedProfile) {
        try {
          await updateProfile({
            username: user.username,
            email: user.email,
            college: updatedProfile.college,
            degree: updatedProfile.degree,
            grad_year: updatedProfile.gradYear,
            target_role: updatedProfile.targetRole,
            linkedin: updatedProfile.linkedin,
            github: updatedProfile.github
          });
        } catch (err) {
          console.error('Failed to auto-save profile sync', err);
        }
      }
    } else {
      alert('Please upload a resume first to auto-sync your profile details!');
    }
  };

  const resumeCount = history.length;
  const avgAts = resumeCount > 0 ? Math.round(history.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumeCount) : 0;

  const handleSave = async () => {
    try {
      await updateProfile({
        username: user.username,
        email: user.email,
        college: profileData.college,
        degree: profileData.degree,
        grad_year: profileData.gradYear,
        target_role: profileData.targetRole,
        linkedin: profileData.linkedin,
        github: profileData.github
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile changes.');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file size should be less than 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await updateProfile({
            username: user.username,
            email: user.email,
            college: profileData.college,
            degree: profileData.degree,
            grad_year: profileData.gradYear,
            target_role: profileData.targetRole,
            linkedin: profileData.linkedin,
            github: profileData.github,
            profile_pic: reader.result
          });
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
          console.error("Failed to upload profile picture", err);
          alert("Failed to upload profile picture.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '🚨 PERMANENT DELETE WARNING:\n\nAre you sure you want to delete your CareerBoost AI account?\n\n' +
      'All your resume analyses, stored reports, and AI chat conversations will be permanently deleted from MongoDB. This action CANNOT be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete account.');
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
              <User className="w-6 h-6 theme-text-primary" />
              Account & Candidate Profile
            </h1>
            <p className="text-xs theme-text-muted mt-1">
              Manage your career portfolio credentials, target job role, and academic links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile Saved!
              </span>
            )}
            {autoSyncSuccess && (
              <span className="text-xs text-orange-400 font-bold flex items-center gap-1">
                <Wand2 className="w-4 h-4" /> Auto-Synced from Resume!
              </span>
            )}
            <button
              onClick={handleManualAutoSync}
              className="px-3.5 py-2.5 rounded-xl border theme-border theme-card theme-text-heading text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-orange-500/10 transition-all"
              title="Auto-fill candidate details from your uploaded resume"
            >
              <Wand2 className="w-4 h-4 theme-text-primary" />
              Auto-Sync from Resume
            </button>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="px-4 py-2.5 theme-btn-primary text-white font-bold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Card Top Header */}
        <div className="theme-card p-8 rounded-3xl border shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Avatar Badge */}
            <div className="relative group">
              <input
                type="file"
                id="profile-pic-input"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label 
                htmlFor="profile-pic-input"
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md border border-white/20 overflow-hidden cursor-pointer relative block"
              >
                {user?.profilePic ? (
                  <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
              </label>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white border-2 theme-border" title="Verified Profile">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-2xl font-extrabold theme-text-heading">{user?.username}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold theme-text-primary border theme-border self-center md:self-auto">
                  Pro Candidate Member
                </span>
              </div>

              <p className="text-xs theme-text-muted flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 theme-text-primary" />
                {user?.email}
              </p>

              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1.5 text-xs theme-text-body">
                  <GraduationCap className="w-4 h-4 theme-text-primary" />
                  <span>{profileData.degree || 'Degree Program'} ({profileData.gradYear || 'Grad Year'})</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs theme-text-body">
                  <Briefcase className="w-4 h-4 theme-text-primary" />
                  <span>Target: <strong className="theme-text-heading">{profileData.targetRole || 'Not specified yet'}</strong></span>
                </div>
              </div>
            </div>

            {/* Resume Stats Overview */}
            <div className="flex md:flex-col gap-4 border-t md:border-t-0 md:border-l theme-border pt-4 md:pt-0 md:pl-6 text-center md:text-right">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Resumes Analyzed</span>
                <p className="text-2xl font-extrabold theme-text-heading">{resumeCount}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider theme-text-muted">Average ATS Rating</span>
                <p className="text-2xl font-extrabold theme-text-primary">{avgAts}%</p>
              </div>
            </div>

          </div>
        </div>

        {/* Academic & Professional Details Form Grid */}
        <div className="theme-card p-8 rounded-3xl border shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold theme-text-heading flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 theme-text-primary" />
              Academic & Portfolio Links
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-orange-400 font-bold hover:underline cursor-pointer"
              >
                Click 'Edit Profile' or 'Auto-Sync' to modify
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider block">College / University</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. Rajalakshmi Institute of Technology"
                value={profileData.college}
                onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all disabled:opacity-80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider block">Degree Program</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. B.E. Computer Science and Engineering"
                value={profileData.degree}
                onChange={(e) => setProfileData({ ...profileData, degree: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all disabled:opacity-80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider block">Graduation Year</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. 2029"
                value={profileData.gradYear}
                onChange={(e) => setProfileData({ ...profileData, gradYear: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all disabled:opacity-80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider block">Target Job Role</label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. Full-Stack Software Engineer"
                value={profileData.targetRole}
                onChange={(e) => setProfileData({ ...profileData, targetRole: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all disabled:opacity-80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile URL
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. linkedin.com/in/yourprofile"
                value={profileData.linkedin}
                onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all disabled:opacity-80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider block flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 theme-text-primary" /> GitHub Portfolio URL
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. github.com/yourusername"
                value={profileData.github}
                onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl theme-bg border theme-border theme-text-heading text-xs outline-none transition-all disabled:opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Account Danger Zone */}
        <div className="theme-card p-8 rounded-3xl border border-rose-500/30 space-y-4">
          <h3 className="text-base font-bold text-rose-400 flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Danger Zone
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h4 className="text-xs font-bold theme-text-heading">Permanently Delete Account</h4>
              <p className="text-[11px] theme-text-muted">Permanently delete your profile credentials, saved resume analyses, and AI chat conversations.</p>
            </div>
            <button
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className="px-5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 text-xs font-extrabold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
