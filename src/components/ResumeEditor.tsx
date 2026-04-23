import React, { useState, useEffect, useRef } from 'react';
import { Resume, ResumeSections } from '../types';
import { auth } from '../lib/firebase';
import { api } from '../services/api';
import { generateDocx } from '../services/docxExport';
import { ModernTemplate, ProfessionalTemplate, CreativeTemplate } from './Templates';
import { 
  Save, Download, Sparkles, Plus, Trash2, 
  ChevronLeft, ChevronRight, Wand2, Search,
  Briefcase, GraduationCap, User as UserIcon, List, Folder,
  Upload, Linkedin, Palette, Type, Check, FileCode,
  ZoomIn, ZoomOut, Maximize2, Settings, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EditorProps {
  initialData: Resume;
  onBack: () => void;
}

export const ResumeEditor: React.FC<EditorProps> = ({ initialData, onBack }) => {
  const [resume, setResume] = useState<Resume>(initialData);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [zoom, setZoom] = useState(0.85);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [linkedinText, setLinkedinText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveResume = async (updatedData: Resume) => {
    const user = auth.currentUser;
    if (!user) return;
    setIsSaving(true);
    try {
      const saved = await api.saveResume(user.uid, updatedData);
      if (!resume.id && saved.id) {
        setResume({ ...updatedData, id: saved.id });
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (path: string, value: any) => {
    setResume(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
         current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleAiSummary = async () => {
    setIsAiLoading(true);
    try {
      const summary = await api.generateSummary(
        resume.sections.experience[0]?.position || "Professional",
        resume.sections.experience.map(e => `${e.company} as ${e.position}`).join(', '),
        resume.sections.skills
      );
      handleChange('sections.summary', summary);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEnhanceBullet = async (index: number) => {
    setIsAiLoading(true);
    try {
      const enhanced = await api.enhanceBullet(
        resume.sections.experience[index].description,
        resume.sections.experience[index].position
      );
      const newExp = [...resume.sections.experience];
      newExp[index].description = enhanced;
      handleChange('sections.experience', newExp);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAtsAnalysis = async () => {
    setIsAiLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    try {
      const content = JSON.stringify(resume.sections);
      const result = await api.analyzeAts(content, jobDescription);
      setAtsAnalysis(result);
      if (resume.id) {
        await api.saveResume(user.uid, {
          ...resume,
          metadata: { ...resume.metadata, lastAtsScore: result.score }
        });
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiLoading(true);
    try {
      const parsedData = await api.parseOldResume(file);
      setResume(prev => ({ 
        ...prev, 
        personalInfo: { ...prev.personalInfo, ...parsedData.personalInfo }, 
        sections: { ...prev.sections, ...parsedData.sections } 
      }));
      setActiveSection('personal');
    } catch (err) {
      console.error("Parse Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLinkedinImport = async () => {
    if (!linkedinText) return;
    setIsAiLoading(true);
    try {
      const parsedData = await api.parseLinkedIn(linkedinText);
      setResume(prev => ({ 
        ...prev, 
        personalInfo: { ...prev.personalInfo, ...parsedData.personalInfo }, 
        sections: { ...prev.sections, ...parsedData.sections } 
      }));
      setActiveSection('personal');
      setLinkedinText('');
    } catch (err) {
      console.error("LinkedIn Parse Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const downloadPdf = async () => {
    // Target the visible preview content that the user is actually looking at
    const element = document.getElementById('resume-preview-content');
    if (!element) return;
    
    setIsAiLoading(true);
    try {
      if ('fonts' in document) {
        await (document as any).fonts.ready;
      }
      
      // Brief delay to ensure reflow is complete
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, { 
        scale: 2, // High DPI capture
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('resume-preview-content');
          if (el) {
            // Restore actual A4 size for the capture clone (removing visual scaling)
            el.style.transform = 'none';
            el.style.width = '210mm';
            el.style.minHeight = '297mm';
            el.style.margin = '0';
            el.style.padding = '0';
            el.style.boxShadow = 'none';
            el.style.border = 'none';
            el.style.position = 'absolute';
            el.style.left = '0';
            el.style.top = '0';

            const parent = el.parentElement;
            if (parent) {
              parent.style.width = '210mm';
              parent.style.height = 'auto';
              parent.style.overflow = 'visible';
            }
          }

          // Sanitize CSS for html2canvas compatibility
          const cssSanitize = (css: string) => {
            return css
              .replace(/oklch\([^)]+\)/g, '#1e293b')
              .replace(/oklab\([^)]+\)/g, '#1e293b')
              .replace(/color-mix\([^)]+\)/g, '#334155');
          };

          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const tag = styleTags[i];
            if (tag.innerHTML) tag.innerHTML = cssSanitize(tag.innerHTML);
          }
        }
      });
      
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering engine returned zero dimensions.');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeightInPdfUnits = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightRemaining = imgHeightInPdfUnits;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdfUnits, undefined, 'FAST');
      heightRemaining -= pdfHeight;

      // Add additional pages if content overflows 1 page
      while (heightRemaining > 1) { // 1mm threshold
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdfUnits, undefined, 'FAST');
        heightRemaining -= pdfHeight;
      }
      
      pdf.save(`${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      alert(`PDF Export Error: ${error?.message || 'Calculation mismatch'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Identity', icon: UserIcon },
    { id: 'summary', label: 'Profile', icon: Wand2 },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Matrix', icon: List },
    { id: 'education', label: 'Academic', icon: GraduationCap },
    { id: 'import', label: 'Import Engine', icon: Upload },
    { id: 'design', label: 'Customization', icon: Palette },
    { id: 'ats', label: 'ATS Logic', icon: Search },
  ];

  return (
    <div className="h-[calc(100vh-73px)] flex overflow-hidden bg-[#0a0a0b] text-white">
      {/* 1. Global Navigation (Left Sidebar) */}
      <aside className="w-18 bg-black border-r border-zinc-800 flex flex-col items-center py-6 gap-6 z-30 shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30 italic mb-4">
          JX
        </div>
        
        <div className="flex flex-col gap-4">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`p-3 rounded-2xl transition-all group relative ${
                activeSection === s.id 
                  ? 'bg-zinc-800 text-indigo-400 shadow-xl' 
                  : 'text-zinc-600 hover:text-indigo-400 hover:bg-zinc-800/50'
              }`}
            >
              <s.icon className="w-5 h-5" />
              <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest border border-zinc-700 shadow-2xl">
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-zinc-800 pt-6">
          <button onClick={onBack} className="p-3 text-zinc-600 hover:text-white transition-colors group relative">
            <ChevronLeft className="w-5 h-5" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest border border-zinc-700">Exit Editor</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace (Canvas) */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950/50">
        {/* Canvas Toolbar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="flex bg-black/40 rounded-xl p-1 border border-zinc-800">
              {['modern', 'professional', 'creative'].map(id => (
                <button 
                  key={id}
                  onClick={() => handleChange('templateId', id)}
                  className={`text-[9px] uppercase font-black px-4 py-2 rounded-lg tracking-wider transition-all mono ${
                    resume.templateId === id ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
            
            <div className="h-6 w-[1px] bg-zinc-800" />
            
            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1 border border-zinc-800">
               <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="text-zinc-500 hover:text-white p-1 transition-colors"><ZoomOut className="w-4 h-4" /></button>
               <span className="text-[10px] font-black text-zinc-400 w-10 text-center mono uppercase tracking-widest">{Math.round(zoom * 100)}%</span>
               <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="text-zinc-500 hover:text-white p-1 transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => generateDocx(resume)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-black hover:text-white hover:border-zinc-700 transition-all uppercase tracking-widest"
              >
                <FileCode className="w-3.5 h-3.5" /> Word
              </button>
              <button 
                onClick={downloadPdf}
                disabled={isAiLoading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest disabled:opacity-50"
              >
                {isAiLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles className="w-3.5 h-3.5" /></motion.div> : <Download className="w-3.5 h-3.5" />}
                Export PDF
              </button>
          </div>
        </header>

        {/* The Actual Canvas Area */}
        <div className="flex-1 overflow-auto bg-zinc-900/30 custom-scrollbar relative">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="min-w-full p-20 flex justify-center items-start">
            <div 
              style={{ 
                width: `${210 * zoom}mm`,
                height: `${297 * zoom}mm`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="shrink-0 relative"
            >
              <motion.div 
                layout
                id="resume-preview-content"
                style={{ 
                  transform: `scale(${zoom})`, 
                  transformOrigin: 'top left',
                  width: '210mm',
                  position: 'absolute',
                  left: 0,
                  top: 0
                }}
                className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm bg-white overflow-hidden"
              >
                {resume.templateId === 'modern' && <ModernTemplate data={resume} onEditSection={setActiveSection} activeSection={activeSection} />}
                {resume.templateId === 'professional' && <ProfessionalTemplate data={resume} onEditSection={setActiveSection} activeSection={activeSection} />}
                {resume.templateId === 'creative' && <CreativeTemplate data={resume} onEditSection={setActiveSection} activeSection={activeSection} />}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Context Editor (Right Pane) */}
      <aside className="w-[420px] bg-black border-l border-zinc-800 flex flex-col z-30 shrink-0">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
               {sections.find(s => s.id === activeSection)?.icon && (
                 React.createElement(sections.find(s => s.id === activeSection)!.icon, { className: "w-4 h-4 text-indigo-400" })
               )}
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200 mono">
               Edit: {sections.find(s => s.id === activeSection)?.label}
             </h3>
          </div>
          <button 
            disabled={isSaving}
            onClick={() => saveResume(resume)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              isSaving ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            <Check className="w-3 h-3" />
            {isSaving ? 'SYNC' : 'READY'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSection}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               className="space-y-8"
             >
               {activeSection === 'personal' && (
                 <div className="space-y-6">
                   <div className="space-y-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
                     <Input label="Full Identity Name" value={resume.personalInfo.fullName} onChange={(v: string) => handleChange('personalInfo.fullName', v)} />
                     <Input label="Digital Correspondence" value={resume.personalInfo.email} onChange={(v: string) => handleChange('personalInfo.email', v)} />
                     <Input label="Direct Communication Line" value={resume.personalInfo.phone} onChange={(v: string) => handleChange('personalInfo.phone', v)} />
                     <Input label="Operational Base Location" value={resume.personalInfo.location} onChange={(v: string) => handleChange('personalInfo.location', v)} />
                   </div>
                   <div className="space-y-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
                     <Input label="LinkedIn Architecture Record" value={resume.personalInfo.linkedin} onChange={(v: string) => handleChange('personalInfo.linkedin', v)} />
                     <Input label="Source Repository Index" value={resume.personalInfo.github} onChange={(v: string) => handleChange('personalInfo.github', v)} />
                   </div>
                 </div>
               )}

               {activeSection === 'summary' && (
                 <div className="space-y-6">
                   <div className="flex flex-col gap-4">
                     <button onClick={handleAiSummary} disabled={isAiLoading} className="w-full h-12 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20 flex items-center justify-center gap-3 hover:bg-indigo-600/20 transition-all font-black text-xs uppercase tracking-widest mono">
                       {isAiLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkle className="w-4 h-4" /></motion.div> : <Sparkles className="w-4 h-4" />}
                       AI Synthesis Strategy
                     </button>
                     <Textarea value={resume.sections.summary} onChange={(v: string) => handleChange('sections.summary', v)} minHeight="350px" />
                   </div>
                 </div>
               )}

               {activeSection === 'experience' && (
                 <div className="space-y-6 pb-20">
                    <div className="space-y-8">
                      {resume.sections.experience.map((exp, index) => (
                        <div key={exp.id} className="relative p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 group/item">
                          <button 
                            onClick={() => {
                              const newExp = resume.sections.experience.filter((_, i) => i !== index);
                              handleChange('sections.experience', newExp);
                            }}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-red-400 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100 shadow-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="space-y-4">
                            <Input label="Organization" value={exp.company} onChange={(v: string) => {
                              const newExp = [...resume.sections.experience];
                              newExp[index].company = v;
                              handleChange('sections.experience', newExp);
                            }} />
                            <Input label="Core Responsibility" value={exp.position} onChange={(v: string) => {
                              const newExp = [...resume.sections.experience];
                              newExp[index].position = v;
                              handleChange('sections.experience', newExp);
                            }} />
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Entry" value={exp.startDate} placeholder="MM/YYYY" onChange={(v: string) => {
                                 const newExp = [...resume.sections.experience];
                                 newExp[index].startDate = v;
                                 handleChange('sections.experience', newExp);
                              }} />
                              <Input label="Relinquish" value={exp.endDate} placeholder="MM/YYYY or Present" onChange={(v: string) => {
                                 const newExp = [...resume.sections.experience];
                                 newExp[index].endDate = v;
                                 handleChange('sections.experience', newExp);
                              }} />
                            </div>
                            <div className="pt-2">
                              <button onClick={() => handleEnhanceBullet(index)} className="w-full text-[10px] font-black text-indigo-400 bg-indigo-400/5 py-2 rounded-lg border border-indigo-400/10 flex items-center justify-center gap-2 hover:bg-indigo-400/10 transition-all mono uppercase mb-2">
                                <Sparkles className="w-3 h-3" /> Optimize Bullets
                              </button>
                              <Textarea 
                                value={exp.description} 
                                onChange={(v: string) => {
                                  const newExp = [...resume.sections.experience];
                                  newExp[index].description = v;
                                  handleChange('sections.experience', newExp);
                                }} 
                                minHeight="180px"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleChange('sections.experience', [...resume.sections.experience, { id: Date.now().toString(), company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }])}
                      className="w-full py-4 border border-zinc-800 rounded-xl text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all flex items-center justify-center gap-2 bg-zinc-950"
                    >
                      <Plus className="w-4 h-4" /> Initialize New Block
                    </button>
                 </div>
               )}

               {activeSection === 'skills' && (
                 <div className="space-y-6">
                    <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 flex flex-wrap gap-2">
                      {resume.sections.skills.map((skill, index) => (
                        <span key={index} className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 flex items-center gap-2 group/tag">
                          {skill}
                          <button onClick={() => {
                            const newSkills = resume.sections.skills.filter((_, i) => i !== index);
                            handleChange('sections.skills', newSkills);
                          }} className="text-zinc-600 hover:text-red-400">
                             <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="Add skill..." 
                        className="bg-transparent border-none text-xs font-bold text-white outline-none w-24 p-1.5"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.currentTarget as HTMLInputElement).value.trim();
                            if (val && !resume.sections.skills.includes(val)) {
                              handleChange('sections.skills', [...resume.sections.skills, val]);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 italic mono text-center">Press Enter to register technical token</p>
                 </div>
               )}

               {activeSection === 'education' && (
                  <div className="space-y-8">
                    {resume.sections.education.map((edu, index) => (
                       <div key={edu.id} className="relative p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 group/item">
                          <button 
                            onClick={() => {
                              const newEdu = resume.sections.education.filter((_, i) => i !== index);
                              handleChange('sections.education', newEdu);
                            }}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-red-400 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100 shadow-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="space-y-4">
                             <Input label="Academic Entity" value={edu.school} onChange={(v: string) => {
                               const newEdu = [...resume.sections.education];
                               newEdu[index].school = v;
                               handleChange('sections.education', newEdu);
                             }} />
                             <Input label="Degree / Qualification" value={edu.degree} onChange={(v: string) => {
                               const newEdu = [...resume.sections.education];
                               newEdu[index].degree = v;
                               handleChange('sections.education', newEdu);
                             }} />
                             <Input label="Academic Discipline" value={edu.field} onChange={(v: string) => {
                               const newEdu = [...resume.sections.education];
                               newEdu[index].field = v;
                               handleChange('sections.education', newEdu);
                             }} />
                             <div className="grid grid-cols-2 gap-4">
                                <Input label="Activation" value={edu.startDate} onChange={(v: string) => {
                                   const newEdu = [...resume.sections.education];
                                   newEdu[index].startDate = v;
                                   handleChange('sections.education', newEdu);
                                }} />
                                <Input label="Conclusion" value={edu.endDate} onChange={(v: string) => {
                                   const newEdu = [...resume.sections.education];
                                   newEdu[index].endDate = v;
                                   handleChange('sections.education', newEdu);
                                }} />
                             </div>
                          </div>
                       </div>
                    ))}
                    <button 
                      onClick={() => handleChange('sections.education', [...resume.sections.education, { id: Date.now().toString(), school: '', degree: '', field: '', startDate: '', endDate: '', location: '' }])}
                      className="w-full py-4 border border-zinc-800 rounded-xl text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all flex items-center justify-center gap-2 bg-zinc-950"
                    >
                      <Plus className="w-4 h-4" /> Add Academic Node
                    </button>
                  </div>
               )}

               {activeSection === 'design' && (
                 <div className="space-y-10">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mono">Chromatic Alignment</label>
                      <div className="grid grid-cols-7 gap-3">
                        {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#1e293b'].map(color => (
                          <button 
                            key={color} 
                            onClick={() => handleChange('styling.primaryColor', color)}
                            className={`aspect-square rounded-lg border-2 transition-all shadow-xl ${resume.styling.primaryColor === color ? 'border-white ring-4 ring-indigo-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mono">Typographical System</label>
                       <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'Inter', label: 'Modern Sans', preview: 'Aa' },
                            { id: 'serif', label: 'Classical Serif', preview: 'Aa' },
                            { id: 'JetBrains Mono', label: 'Technical Mono', preview: 'Aa' },
                            { id: 'system-ui', label: 'Universal UI', preview: 'Aa' }
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => handleChange('styling.fontFamily', f.id)}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${resume.styling.fontFamily === f.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}`}
                              style={{ fontFamily: f.id }}
                            >
                               <span className="text-sm font-medium text-zinc-200">{f.label}</span>
                               <span className="text-lg font-black text-indigo-400 opacity-50">{f.preview}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mono">Optical Vertical Scale</label>
                      <div className="flex bg-zinc-900/60 rounded-2xl p-1.5 border border-zinc-800">
                        {['small', 'medium', 'large'].map(size => (
                          <button 
                            key={size}
                            onClick={() => handleChange('styling.fontSize', size)}
                            className={`flex-1 text-[10px] font-black uppercase py-3 rounded-xl transition-all ${resume.styling.fontSize === size ? 'bg-zinc-800 text-indigo-400 shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>
               )}

               {activeSection === 'ats' && (
                 <div className="space-y-10">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                      <Search className="absolute -bottom-4 -right-4 w-16 h-16 opacity-5 rotate-12" />
                      <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        ATS Simulation Module
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed italic mb-6">Calibrate your professional identity against semantic search algorithms.</p>
                      
                      <Textarea 
                        value={jobDescription} 
                        onChange={setJobDescription} 
                        placeholder="Paste target architectural specifications (Job Description)..." 
                        className="bg-zinc-950/80 border-zinc-800 text-white text-xs"
                        minHeight="250px"
                      />
                      
                      <button 
                        onClick={handleAtsAnalysis}
                        disabled={!jobDescription || isAiLoading}
                        className="w-full mt-6 bg-indigo-600 text-white h-12 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3"
                      >
                        {isAiLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkle className="w-4 h-4" /></motion.div> : <Settings className="w-4 h-4" />}
                        Trigger Calibration Scan
                      </button>
                    </div>

                    {atsAnalysis && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                         <div className="flex items-center justify-between bg-zinc-900 shadow-2xl rounded-2xl p-8 border border-zinc-800">
                            <div>
                               <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Simulation Score</h5>
                               <div className="text-5xl font-black text-white italic tracking-tighter">
                                 {atsAnalysis.score}<span className="text-xl text-indigo-500">%</span>
                               </div>
                            </div>
                            <div className="w-20 h-20 relative">
                               <svg className="w-full h-full -rotate-90">
                                  <circle cx="40" cy="40" r="36" fill="none" stroke="#18181b" strokeWidth="4" />
                                  <circle 
                                    cx="40" cy="40" r="36" fill="none" stroke="#6366f1" strokeWidth="4"
                                    strokeDasharray="226"
                                    strokeDashoffset={226 - (226 * atsAnalysis.score) / 100}
                                    strokeLinecap="round"
                                  />
                               </svg>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mono">Semantic Corrections</h5>
                            <div className="space-y-2">
                               {atsAnalysis.suggestions.map((s: string, i: number) => (
                                 <div key={i} className="text-xs text-zinc-400 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 flex gap-3">
                                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                                    {s}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                    )}
                 </div>
               )}

               {activeSection === 'import' && (
                 <div className="space-y-8">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer p-8 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-indigo-500 bg-zinc-900/20 hover:bg-indigo-500/5 transition-all text-center"
                    >
                       <Upload className="w-10 h-10 text-zinc-600 group-hover:text-indigo-400 mx-auto mb-4 transition-colors" />
                       <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Legacy Protocol</h4>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">System interfaces: PDF, DOCX Extraction Engine</p>
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <Linkedin className="w-5 h-5 text-indigo-500" />
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">LinkedIn Record Interface</h4>
                       </div>
                       <Textarea 
                         value={linkedinText} 
                         onChange={setLinkedinText} 
                         placeholder="Paste LinkedIn archival text here..." 
                         className="bg-zinc-900 placeholder:text-zinc-700"
                         minHeight="200px"
                       />
                       <button 
                         onClick={handleLinkedinImport}
                         disabled={!linkedinText || isAiLoading}
                         className="w-full h-12 bg-zinc-100 text-zinc-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                       >
                         Sync Professional Graph
                       </button>
                    </div>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </aside>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder = '' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 mono">{label}</label>
    <div className="relative group">
       <input 
         type="text" 
         value={value} 
         onChange={(e) => onChange(e.target.value)} 
         className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3.5 rounded-xl focus:border-zinc-700 transition-all font-medium text-sm outline-none placeholder:text-zinc-800 focus:bg-zinc-800/50"
         placeholder={placeholder}
       />
       <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-zinc-800 group-focus-within:bg-indigo-500 transition-colors" />
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder = '', minHeight = '120px', className = '' }: any) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 mono">{label}</label>}
    <textarea 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-6 py-5 rounded-2xl focus:border-zinc-700 transition-all font-medium text-sm resize-none outline-none focus:bg-zinc-800/50 leading-relaxed ${className}`}
      placeholder={placeholder}
      style={{ minHeight }}
    />
  </div>
);
