import { Resume, AtsScoreResult } from '../types';

export const api = {
  // AI Services
  generateSummary: async (role: string, context: string, skills: string[]) => {
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, context, skills }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.summary;
  },

  enhanceBullet: async (content: string, role: string) => {
    const res = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, role }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.enhanced;
  },

  analyzeAts: async (content: string, jobDescription: string) => {
    const res = await fetch('/api/ai/analyze-ats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, jobDescription }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  parseOldResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/parse/resume', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  parseLinkedIn: async (linkedinText: string) => {
    const res = await fetch('/api/parse/linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinText }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  // Resume Management (MongoDB)
  fetchResumes: async (userId: string) => {
    const res = await fetch('/api/resumes', {
      headers: { 'x-user-id': userId },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // MongoDB _id to id mapping
    return data.map((r: any) => ({ ...r, id: r._id }));
  },

  saveResume: async (userId: string, resume: Resume) => {
    const method = resume.id ? 'PUT' : 'POST';
    const url = resume.id ? `/api/resumes/${resume.id}` : '/api/resumes';
    
    // Clean data: remove id, _id, and system timestamps
    const { id, _id, createdAt, updatedAt, ...resumeData } = resume as any;

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': userId 
      },
      body: JSON.stringify(resumeData),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  deleteResume: async (userId: string, id: string) => {
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }
};
