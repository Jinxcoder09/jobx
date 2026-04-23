/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle } from './lib/firebase';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ResumeEditor } from './components/ResumeEditor';
import { Resume } from './types';
import { Sparkles, ArrowRight, Zap, Target, ShieldCheck, FileText, Layout } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editingResume, setEditingResume] = useState<Resume | null>(null);

  const handleNewResume = async (sample?: Partial<Resume>) => {
    if (!user) return;
    
    const newResume: Partial<Resume> = {
      userId: user.uid,
      title: sample?.title || 'Untitled Resume',
      templateId: sample?.templateId || 'modern',
      styling: sample?.styling || {
        primaryColor: '#4f46e5',
        fontFamily: 'Inter',
        fontSize: 'medium'
      },
      personalInfo: sample?.personalInfo || {
        fullName: user.displayName || '',
        email: user.email || '',
        phone: '',
        location: '',
        linkedin: '',
        github: ''
      },
      sections: sample?.sections || {
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: []
      },
      metadata: {
        isPublic: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const saved = await api.saveResume(user.uid, newResume as Resume);
      setEditingResume({ ...newResume, id: saved.id } as Resume);
      setView('editor');
    } catch (error) {
      console.error("Error creating resume:", error);
    }
  };

  const handleEditResume = (resume: Resume) => {
    setEditingResume(resume);
    setView('editor');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="bg-indigo-600 p-4 rounded-3xl"
        >
          <FileText className="text-white w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans selection:bg-indigo-500/30 text-zinc-50 overflow-x-hidden">
        <Navbar onNavigate={() => {}} currentView="" />
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center relative">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800 mb-8"
          >
            <Sparkles className="text-amber-400 w-4 h-4 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mono">AI-Powered Optimization Platform</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8"
          >
            LAND YOUR <br />
            <span className="text-indigo-500 italic font-serif">Dream Job</span> TODAY.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight"
          >
            The world's most advanced AI resume builder. Smart content generation, real-time ATS optimization, and professional templates that pass every filter.
          </motion.p>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={signInWithGoogle}
            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 group mb-20"
          >
            Get Started Free <ArrowRight className="inline ml-2 group-hover:translate-x-2 transition-transform" />
          </motion.button>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-10">
             <FeatureCard 
               icon={Zap} 
               title="Groq Intelligence" 
               desc="Generate professional summaries and impactful bullet points in milliseconds using Llama 3 on Groq." 
             />
             <FeatureCard 
               icon={Target} 
               title="ATS Calibration" 
               desc="Advanced algorithmic analysis cross-referencing your resume against modern recruiter filters." 
             />
             <FeatureCard 
               icon={Layout} 
               title="JobX Protocols" 
               desc="Premium, ATS-optimized templates engineered for both machine parsing and human review." 
             />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Navbar onNavigate={(v) => setView(v)} currentView={view} />
      
      <main>
        {view === 'dashboard' ? (
          <Dashboard onEdit={handleEditResume} onNew={handleNewResume} />
        ) : (
          editingResume && <ResumeEditor initialData={editingResume} onBack={() => setView('dashboard')} />
        )}
      </main>
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-10 rounded-[40px] border border-zinc-800 hover:border-indigo-500/50 transition-all hover:bg-zinc-900/50 backdrop-blur-xl"
  >
    <div className="bg-indigo-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20">
      <Icon className="text-indigo-400 w-8 h-8" />
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-zinc-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);
