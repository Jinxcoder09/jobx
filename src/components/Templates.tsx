import React from 'react';
import { Resume } from '../types';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Link as LinkIcon, Linkedin, Github, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TemplateProps {
  data: Resume;
  onEditSection?: (sectionId: string) => void;
  activeSection?: string;
}

const SectionWrapper: React.FC<{
  id: string;
  activeSection?: string;
  onEditSection?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  primaryColor?: string;
  position?: 'left' | 'right';
}> = ({ id, activeSection, onEditSection, children, className = "", primaryColor = "#4f46e5", position = 'left' }) => {
  const isActive = activeSection === id;
  
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onEditSection?.(id);
      }}
      className={`relative group/section cursor-pointer rounded-lg transition-all duration-300 border-2 ${
        isActive 
          ? `shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] bg-slate-50/30` 
          : 'border-transparent hover:border-slate-200 hover:bg-slate-50/50'
      } ${className}`}
      style={{ borderColor: isActive ? primaryColor : 'transparent' }}
    >
      <div 
        className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white shadow-xl transition-all duration-300 z-10 ${
          position === 'left' ? '-left-6' : '-right-6'
        } ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover/section:opacity-70 group-hover/section:scale-75'
        }`}
        style={{ backgroundColor: primaryColor }}
      >
        <Wand2 className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
};

export const ModernTemplate: React.FC<TemplateProps> = ({ data, onEditSection, activeSection }) => {
  const { personalInfo, sections, styling } = data;
  const primaryColor = styling?.primaryColor || '#4f46e5';

  return (
    <div 
      className="bg-white text-slate-800 p-0 relative print-container" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        fontFamily: styling?.fontFamily || 'Inter',
        fontSize: styling?.fontSize === 'small' ? '12px' : styling?.fontSize === 'large' ? '16px' : '14px',
        lineHeight: '1.5',
        boxSizing: 'border-box'
      }}
    >
      <div className="p-[20mm] w-full h-full flex flex-col">
        <SectionWrapper id="personal" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
          <header className="border-b-2 pb-6 mb-8 block w-full clear-both" style={{ borderColor: primaryColor }}>
            <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter mb-4 leading-none block w-full break-words">{personalInfo.fullName}</h1>
            <div className="flex flex-wrap gap-y-2 gap-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider block w-full">
              <div className="inline-flex items-center whitespace-nowrap leading-none"><Mail className="w-3.5 h-3.5 shrink-0 mr-1.5" style={{ color: primaryColor }} />{personalInfo.email}</div>
              <div className="inline-flex items-center whitespace-nowrap leading-none"><Phone className="w-3.5 h-3.5 shrink-0 mr-1.5" style={{ color: primaryColor }} />{personalInfo.phone}</div>
              <div className="inline-flex items-center whitespace-nowrap leading-none"><MapPin className="w-3.5 h-3.5 shrink-0 mr-1.5" style={{ color: primaryColor }} />{personalInfo.location}</div>
            </div>
          </header>
        </SectionWrapper>

        <div className="flex-1">
          <div className="space-y-8">
            <SectionWrapper id="summary" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
              {sections.summary && (
                <article className="py-2">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-3" style={{ color: primaryColor }}>
                    Professional Summary
                    <div className="h-[1px] flex-1 opacity-10" style={{ backgroundColor: primaryColor }} />
                  </h2>
                  <div className="leading-relaxed text-slate-700 font-medium break-words overflow-wrap-anywhere">
                    <ReactMarkdown>{sections.summary}</ReactMarkdown>
                  </div>
                </article>
              )}
            </SectionWrapper>

            <SectionWrapper id="experience" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
              {sections.experience.length > 0 && (
                <article className="py-2">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3" style={{ color: primaryColor }}>
                    Experience
                    <div className="h-[1px] flex-1 opacity-10" style={{ backgroundColor: primaryColor }} />
                  </h2>
                  <div className="space-y-6">
                    {sections.experience.map((exp) => (
                      <div key={exp.id} className="print-section-item">
                        <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                          <h3 className="font-black text-slate-900 text-base tracking-tight">{exp.position}</h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums whitespace-nowrap">
                            {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] mb-3 font-bold text-slate-500 uppercase tracking-wide italic flex-wrap gap-2">
                          <span>{exp.company}</span>
                          <span>{exp.location}</span>
                        </div>
                        <div className="text-xs leading-relaxed text-slate-700 prose-resume break-words overflow-wrap-anywhere">
                          <ReactMarkdown>{exp.description}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </SectionWrapper>

            <div className="flex w-full gap-10">
              {sections.education.length > 0 && (
                <SectionWrapper id="education" className="flex-1" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
                  <section className="py-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3" style={{ color: primaryColor }}>
                      Education
                      <div className="h-[1px] flex-1" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
                    </h2>
                    <div className="space-y-4">
                      {sections.education.map((edu) => (
                        <div key={edu.id} className="print-section-item">
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{edu.degree} in {edu.field}</h3>
                          <div className="text-xs text-slate-600 font-medium mt-0.5">{edu.school}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                            {edu.startDate} — {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </SectionWrapper>
              )}

              {sections.skills.length > 0 && (
                <SectionWrapper id="skills" className="flex-1" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
                  <section className="py-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3" style={{ color: primaryColor }}>
                      Skills
                      <div className="h-[1px] flex-1" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {sections.skills.map((skill, index) => (
                        <span key={index} className="bg-[#f8fafc] text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 shadow-sm whitespace-nowrap inline-flex items-center justify-center min-h-[28px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </SectionWrapper>
              )}
            </div>
            
            {sections.projects && sections.projects.length > 0 && (
              <article className="print-section">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3" style={{ color: primaryColor }}>
                  Projects
                  <div className="h-[1px] flex-1 opacity-10" style={{ backgroundColor: primaryColor }} />
                </h2>
                <div className="space-y-4">
                  {sections.projects.map((proj) => (
                    <div key={proj.id} className="print-section-item">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                        {proj.link && <span className="text-[10px] text-indigo-600 lowercase font-mono">{proj.link}</span>}
                      </div>
                      <div className="text-xs text-slate-700 mb-1 leading-relaxed break-words overflow-wrap-anywhere">
                        <ReactMarkdown>{proj.description}</ReactMarkdown>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="text-[9px] font-mono text-slate-500">#{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, onEditSection, activeSection }) => {
  const { personalInfo, sections, styling } = data;
  const primaryColor = styling?.primaryColor || '#f97316';

  return (
    <div 
      className="bg-white text-slate-800 relative flex print-container" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        fontFamily: styling?.fontFamily || 'system-ui',
        fontSize: styling?.fontSize === 'small' ? '12px' : styling?.fontSize === 'large' ? '16px' : '14px',
        boxSizing: 'border-box'
      }}
    >
      <div className="w-[70mm] bg-[#f8fafc] p-[10mm] flex flex-col gap-8 border-r border-[#e2e8f0]" style={{ minHeight: '297mm' }}>
        <SectionWrapper id="personal" position="right" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
          <header className="mb-8">
            <h1 className="text-3xl font-black leading-tight mb-4 break-words" style={{ color: primaryColor }}>
              {personalInfo.fullName.split(' ')[0]}<br/>
              <span className="opacity-50">{personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div className="space-y-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest mono">
              <div className="inline-flex items-center overflow-hidden leading-none"><Mail className="w-3.5 h-3.5 shrink-0 mr-2" /> {personalInfo.email}</div>
              <div className="inline-flex items-center overflow-hidden leading-none"><Phone className="w-3.5 h-3.5 shrink-0 mr-2" /> {personalInfo.phone}</div>
              <div className="inline-flex items-center overflow-hidden leading-none"><MapPin className="w-3.5 h-3.5 shrink-0 mr-2" /> {personalInfo.location}</div>
            </div>
          </header>
        </SectionWrapper>

        {sections.skills.length > 0 && (
          <SectionWrapper id="skills" position="right" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
            <section className="py-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 mono" style={{ color: primaryColor }}>Expertise Matrix</h2>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                {sections.skills.map((skill, index) => (
                  <span key={index} className="bg-white px-2 py-1 rounded-lg border border-zinc-200 whitespace-nowrap inline-flex items-center justify-center min-h-[22px]">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}

        {sections.education.length > 0 && (
          <SectionWrapper id="education" position="right" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
            <section className="py-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 mono" style={{ color: primaryColor }}>Academic Record</h2>
              <div className="space-y-4">
                {sections.education.map((edu) => (
                  <div key={edu.id} className="print-section-item">
                    <div className="font-bold text-[11px] text-zinc-900 break-words">{edu.degree}</div>
                    <div className="text-[10px] text-zinc-500 font-medium">{edu.school}</div>
                    <div className="text-[9px] font-black text-zinc-400 mt-0.5">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          </SectionWrapper>
        )}
      </div>

      <div className="flex-1 p-[15mm] space-y-10">
        <SectionWrapper id="summary" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
          {sections.summary && (
            <article className="py-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 mono" style={{ opacity: 0.4 }}>Mission Manifesto</h2>
              <div className="italic text-slate-700 leading-relaxed font-serif text-lg break-words overflow-wrap-anywhere">
                <ReactMarkdown>{sections.summary}</ReactMarkdown>
              </div>
            </article>
          )}
        </SectionWrapper>

        <SectionWrapper id="experience" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
          {sections.experience.length > 0 && (
            <article className="py-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 mono" style={{ opacity: 0.4 }}>Operational History</h2>
              <div className="space-y-8">
                {sections.experience.map((exp) => (
                  <div key={exp.id} className="print-section-item">
                    <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                      <h3 className="font-black text-zinc-900 uppercase tracking-tighter text-base break-words">{exp.position}</h3>
                      <span className="text-[10px] font-black text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full uppercase mono tracking-widest whitespace-nowrap">{exp.startDate} - {exp.current ? 'NOW' : exp.endDate}</span>
                    </div>
                    <div className="text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-widest break-words">{exp.company} • {exp.location}</div>
                    <div className="text-sm leading-relaxed prose-resume max-w-none break-words overflow-wrap-anywhere" style={{ opacity: 0.8 }}>
                      <ReactMarkdown>{exp.description}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </SectionWrapper>
      </div>
    </div>
  );
};

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, onEditSection, activeSection }) => {
  const { personalInfo, sections, styling } = data;
  const primaryColor = styling?.primaryColor || '#1e293b';

  return (
    <div 
      className="bg-white text-slate-900 relative print-container" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        fontFamily: styling?.fontFamily || 'serif',
        fontSize: styling?.fontSize === 'small' ? '12px' : styling?.fontSize === 'large' ? '16px' : '14px',
        lineHeight: '1.4',
        boxSizing: 'border-box'
      }}
    >
      <div className="p-[20mm]">
        <SectionWrapper id="personal" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
          <header className="text-center border-b-[3px] pb-8 mb-12 block w-full clear-both" style={{ borderColor: primaryColor }}>
            <h1 className="text-5xl font-black uppercase tracking-tight mb-6 leading-[1.1] block w-full break-words" style={{ color: primaryColor }}>{personalInfo.fullName}</h1>
            <div className="flex justify-center flex-wrap gap-8 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 mono block w-full">
              <div className="inline-flex items-center whitespace-nowrap leading-none"><Mail className="w-4 h-4 shrink-0 mr-2" /> {personalInfo.email}</div>
              <div className="inline-flex items-center whitespace-nowrap leading-none"><Phone className="w-4 h-4 shrink-0 mr-2" /> {personalInfo.phone}</div>
              <div className="inline-flex items-center whitespace-nowrap leading-none"><MapPin className="w-4 h-4 shrink-0 mr-2" /> {personalInfo.location}</div>
            </div>
          </header>
        </SectionWrapper>

        <div className="space-y-10">
          <SectionWrapper id="summary" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
            {sections.summary && (
              <section className="py-2">
                <h2 className="font-black border-b border-zinc-200 uppercase tracking-[0.3em] mb-4 text-[11px] mono py-1" style={{ color: primaryColor }}>I. Professional Profile</h2>
                <div className="leading-relaxed text-zinc-800 text-[13px] break-words overflow-wrap-anywhere">
                  <ReactMarkdown>{sections.summary}</ReactMarkdown>
                </div>
              </section>
            )}
          </SectionWrapper>

          <SectionWrapper id="experience" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
            {sections.experience.length > 0 && (
              <section className="py-2">
                <h2 className="font-black border-b border-zinc-200 uppercase tracking-[0.3em] mb-6 text-[11px] mono py-1" style={{ color: primaryColor }}>II. Professional Experience</h2>
                <div className="space-y-8">
                  {sections.experience.map((exp) => (
                    <div key={exp.id} className="print-section-item">
                      <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                        <h3 className="font-black text-lg uppercase tracking-tight break-words">{exp.position}</h3>
                        <span className="text-[10px] font-black text-zinc-500 mono uppercase tracking-widest whitespace-nowrap tabular-nums">{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3 flex-wrap gap-2">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      <div className="text-sm prose-resume max-w-none leading-relaxed font-serif break-words overflow-wrap-anywhere" style={{ opacity: 0.9 }}>
                        <ReactMarkdown>{exp.description}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </SectionWrapper>

          <div className="flex w-full gap-10">
            {sections.education.length > 0 && (
              <SectionWrapper id="education" className="flex-1" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
                <section className="py-2">
                  <h2 className="font-black border-b border-zinc-200 uppercase tracking-[0.3em] mb-4 text-[11px] mono py-1" style={{ color: primaryColor }}>III. Academic Pedigree</h2>
                  <div className="space-y-4">
                    {sections.education.map((edu) => (
                      <div key={edu.id} className="print-section-item">
                        <div className="flex justify-between font-black text-[13px] uppercase tracking-tighter flex-wrap gap-2">
                          <span className="break-words">{edu.school}</span>
                          <span className="mono text-[10px] text-zinc-400 whitespace-nowrap">{edu.startDate} — {edu.endDate}</span>
                        </div>
                        <div className="text-[11px] font-bold italic text-zinc-600 uppercase tracking-tight mt-0.5 break-words">{edu.degree} in {edu.field}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </SectionWrapper>
            )}

            {sections.skills.length > 0 && (
              <SectionWrapper id="skills" className="flex-1" activeSection={activeSection} onEditSection={onEditSection} primaryColor={primaryColor}>
                <section className="py-2">
                  <h2 className="font-black border-b border-zinc-200 uppercase tracking-[0.3em] mb-4 text-[11px] mono py-1" style={{ color: primaryColor }}>IV. Core Competencies</h2>
                  <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-widest">
                    {sections.skills.map((skill, index) => (
                      <span key={index} className="bg-zinc-50 px-2 py-1 rounded text-zinc-700 border border-zinc-200 whitespace-nowrap inline-flex items-center justify-center min-h-[24px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </SectionWrapper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

