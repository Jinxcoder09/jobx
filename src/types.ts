export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies: string[];
}

export interface ResumeSections {
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

export interface ResumeStyling {
  primaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface Resume {
  id?: string;
  userId: string;
  title: string;
  templateId: string;
  styling: ResumeStyling;
  personalInfo: PersonalInfo;
  sections: ResumeSections;
  metadata: {
    lastAtsScore?: number;
    isPublic: boolean;
  };
  createdAt: any;
  updatedAt: any;
}

export interface AtsScoreResult {
  score: number;
  feedback: string;
  missingKeywords: string[];
  suggestions: string[];
}
