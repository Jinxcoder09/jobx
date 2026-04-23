import React, { useState, useEffect } from 'react';
import { Resume } from '../types';
import { api } from '../services/api';
import { auth } from '../lib/firebase';
import { RESUME_SAMPLES } from '../samples';
import { 
  Plus, FileText, Trash2, Clock, 
  ExternalLink, Search, Filter, 
  AlertCircle, ChevronRight, Layout, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface DashboardProps {
  onEdit: (resume: Resume) => void;
  onNew: (sample?: Partial<Resume>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEdit, onNew }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'my-resumes' | 'templates'>('my-resumes');

  useEffect(() => {
    const fetchResumes = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const data = await api.fetchResumes(user.uid);
        setResumes(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) return;
    if (!window.confirm('Erase this data record permanently?')) return;
    try {
      await api.deleteResume(user.uid, id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredResumes = resumes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'Recently';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d, yyyy');
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 mono">Operational Command</h1>
           <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Your Intelligence Hub</h2>
        </div>
        <button 
          onClick={() => onNew()}
          className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-950 px-8 py-4 rounded-2xl font-black hover:bg-white transition-all shadow-xl shadow-white/5 active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          INITIALIZE NEW RECORD
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-800 mb-8">
        <button 
          onClick={() => setActiveTab('my-resumes')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'my-resumes' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          My Records
          {activeTab === 'my-resumes' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'templates' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          Ready Samples
          {activeTab === 'templates' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'my-resumes' ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text"
                placeholder="Query datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-zinc-700 outline-none transition-all mono text-sm"
              />
            </div>
            <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-zinc-400 text-sm font-bold hover:bg-zinc-800 transition-all">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="h-64 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800" />
                ))
              ) : filteredResumes.length > 0 ? (
                filteredResumes.map((resume, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    key={resume.id}
                    onClick={() => onEdit(resume)}
                    className="group glass rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-indigo-500/30 transition-all hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex flex-col cursor-pointer"
                  >
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-zinc-800/50 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-500 ring-1 ring-zinc-700">
                          <FileText className="w-6 h-6" />
                        </div>
                        <button 
                          onClick={(e) => handleDelete(e, resume.id!)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">{resume.title}</h3>
                      <p className="text-zinc-500 text-sm mb-4 italic">{resume.personalInfo.fullName || 'Unidentified User'}</p>
                      
                      <div className="flex items-center gap-4 text-[10px] font-black text-zinc-600 mono uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-indigo-500" /> {formatDate(resume.updatedAt)}</div>
                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{resume.templateId}</span>
                      </div>

                      {resume.metadata.lastAtsScore && (
                        <div className="mt-6 flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 w-fit">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{resume.metadata.lastAtsScore}% ATS MATCH</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                   <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                   <h3 className="text-white font-black uppercase tracking-widest mb-2">No Active Records Found</h3>
                   <p className="text-zinc-600 text-sm mb-8">Initialize your first data packet or select a ready template to begin.</p>
                   <button onClick={() => setActiveTab('templates')} className="text-indigo-400 font-bold hover:underline mono text-xs uppercase tracking-widest">Browse Template Library</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {RESUME_SAMPLES.map((sample, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={index}
              className="group glass rounded-[40px] overflow-hidden border border-zinc-800/10 hover:border-indigo-500/30 transition-all hover:shadow-2xl flex flex-col"
            >
              <div className="h-56 bg-zinc-950 relative overflow-hidden group-hover:bg-zinc-900 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                  <Layout className="w-48 h-48 text-indigo-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute bottom-6 left-8 right-8">
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-lg uppercase tracking-widest mb-3 inline-block shadow-lg shadow-indigo-600/30">
                    {sample.templateId}
                  </span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{sample.title}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-zinc-500 text-xs mb-8 line-clamp-3 italic leading-relaxed">“{sample.sections?.summary}”</p>
                <div className="flex flex-wrap gap-2 mb-8">
                   {sample.sections?.skills.slice(0, 4).map((skill, i) => (
                     <span key={i} className="text-[9px] font-black bg-zinc-900 text-zinc-500 px-2.5 py-1.5 rounded-lg border border-zinc-800 uppercase mono tracking-tight">{skill}</span>
                   ))}
                </div>
                <button 
                  onClick={() => onNew(sample)}
                  className="w-full bg-white text-zinc-950 py-4 rounded-2xl font-black text-xs hover:bg-indigo-400 hover:text-white transition-all uppercase tracking-[0.2em] shadow-xl"
                >
                  USE DATA PACKET
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
