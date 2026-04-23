import { Resume } from './types';

export const RESUME_SAMPLES: Partial<Resume>[] = [
  {
    title: "Software Engineer Specialist",
    templateId: "modern",
    styling: { primaryColor: '#4f46e5', fontFamily: 'Inter', fontSize: 'medium' },
    personalInfo: {
      fullName: "Alex Rivera",
      email: "alex.rivera@tech.com",
      phone: "+1 (555) 012-3456",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexrivera",
      github: "github.com/arivera"
    },
    sections: {
      summary: "High-impact Software Engineer with 8+ years of experience in distributed systems and cloud architecture. Expert in React, Node.js, and Kubernetes. Proven track record of scaling platforms to 1M+ active users.",
      experience: [
        { id: "1", company: "CloudScale Inc.", position: "Senior Backend Engineer", location: "Remote", startDate: "01/2020", endDate: "Present", current: true, description: "• Architected microservices infrastructure using Go and gRPC.\n• Managed team of 5 engineers.\n• Optimized database queries in PostgreSQL." }
      ],
      education: [{ id: "1", school: "Stanford University", degree: "BS", field: "Computer Science", location: "Stanford, CA", startDate: "2012", endDate: "2016" }],
      skills: ["React", "Python", "Kubernetes", "AWS", "TypeScript"],
      projects: []
    }
  },
  {
    title: "Senior Product Manager",
    templateId: "professional",
    styling: { primaryColor: '#10b981', fontFamily: 'serif', fontSize: 'medium' },
    personalInfo: {
      fullName: "Sarah Chen",
      email: "sarah.chen@product.com",
      phone: "+1 (555) 234-5678",
      location: "Seattle, WA",
      linkedin: "linkedin.com/in/sarahchen"
    },
    sections: {
      summary: "Data-driven Product Manager with a focus on B2B SaaS and machine learning integrations. Led product lifecycle for platforms generating $10M+ ARR.",
      experience: [
        { id: "1", company: "DataFlow Systems", position: "Lead PM", location: "Seattle", startDate: "03/2019", endDate: "Present", current: true, description: "• Increased user retention by 35% through feature prioritization.\n• Led cross-functional team of 15 designers and engineers." }
      ],
      education: [{ id: "1", school: "MIT", degree: "MBA", field: "Business Administration", location: "Cambridge, MA", startDate: "2016", endDate: "2018" }],
      skills: ["Roadmapping", "Agile", "SQL", "User Research"],
      projects: []
    }
  },
  {
    title: "Graphic Designer",
    templateId: "creative",
    styling: { primaryColor: '#ec4899', fontFamily: 'system-ui', fontSize: 'medium' },
    personalInfo: {
      fullName: "Mikael Sorenson",
      email: "mikael@visuals.io",
      phone: "+1 (555) 345-6789",
      location: "Austin, TX"
    },
    sections: {
      summary: "Multidisciplinary Graphic Designer with a passion for minimalist aesthetics and storytelling through typography.",
      experience: [
        { id: "1", company: "Studio Neon", position: "Visual Designer", location: "Austin", startDate: "06/2021", endDate: "Present", current: true, description: "• Delivered brand identities for 20+ startups.\n• Specialized in vector illustration and motion graphics." }
      ],
      education: [{ id: "1", school: "RISD", degree: "BFA", field: "Graphic Design", location: "Providence, RI", startDate: "2017", endDate: "2021" }],
      skills: ["Illustrator", "Photoshop", "After Effects", "Figma"],
      projects: []
    }
  },
  {
    title: "Marketing Strategist",
    templateId: "modern",
    styling: { primaryColor: '#f59e0b', fontFamily: 'Inter', fontSize: 'medium' },
    personalInfo: {
      fullName: "Elena Rodriguez",
      email: "elena@growth.com",
      phone: "+1 (555) 456-7890",
      location: "Miami, FL"
    },
    sections: {
      summary: "Growth Marketing expert specializing in SEO and high-conversion content strategies.",
      experience: [
        { id: "1", company: "ViralLoop", position: "Growth Lead", location: "Miami", startDate: "09/2020", endDate: "Present", current: true, description: "• Scaled organic traffic by 200% in 12 months.\n• Managed $500k monthly ad spend across Meta and Google." }
      ],
      education: [],
      skills: ["SEO", "Copywriting", "Analytics", "Growth Hacking"],
      projects: []
    }
  },
  {
    title: "Financial Analyst",
    templateId: "professional",
    styling: { primaryColor: '#06b6d4', fontFamily: 'serif', fontSize: 'small' },
    personalInfo: {
      fullName: "David Park",
      email: "david.park@finance.com",
      phone: "+1 (555) 567-8901",
      location: "Chicago, IL"
    },
    sections: {
      summary: "Detail-oriented Financial Analyst with expertise in market modeling and risk assessment.",
      experience: [
        { id: "1", company: "Heritage Capital", position: "Senior Analyst", location: "Chicago", startDate: "01/2022", endDate: "Present", current: true, description: "• Developed predictive models for hedge fund performance.\n• Automated reporting workflows using Python." }
      ],
      education: [],
      skills: ["Financial Modeling", "Excel Expert", "Python", "Forecasting"],
      projects: []
    }
  },
  {
    title: "Human Resources Manager",
    templateId: "modern",
    styling: { primaryColor: '#ef4444', fontFamily: 'Inter', fontSize: 'medium' },
    personalInfo: {
      fullName: "Karen Smith",
      email: "karen.hr@enterprise.com",
      phone: "+1 (555) 678-9012",
      location: "Atlanta, GA"
    },
    sections: {
      summary: "People-first HR professional with 10 years of experience in talent acquisition and cultural transformation.",
      experience: [
        { id: "1", company: "Global Tech Inc", position: "HR Director", location: "Atlanta", startDate: "05/2015", endDate: "Present", current: true, description: "• Reduced employee turnover by 15%.\n• Implemented DEI initiatives across 5 offices." }
      ],
      education: [],
      skills: ["Talent Acquisition", "Employee Relations", "Conflict Resolution", "DEI"],
      projects: []
    }
  },
  {
    title: "Data Scientist",
    templateId: "professional",
    styling: { primaryColor: '#4f46e5', fontFamily: 'JetBrains Mono', fontSize: 'small' },
    personalInfo: {
      fullName: "Lucas Zhao",
      email: "lucas.z@datahub.net",
      phone: "+1 (555) 789-0123",
      location: "Boston, MA"
    },
    sections: {
      summary: "PhD candidate and Data Scientist focusing on NLP and Large Language Models.",
      experience: [
        { id: "1", company: "OpenInsights", position: "Research Scientist", location: "Boston", startDate: "08/2021", endDate: "Present", current: true, description: "• Fine-tuned transformer models for sentiment analysis.\n• Published 3 papers in top AI conferences." }
      ],
      education: [],
      skills: ["PyTorch", "NLP", "Statistics", "Machine Learning"],
      projects: []
    }
  },
  {
    title: "Sales Executive",
    templateId: "modern",
    styling: { primaryColor: '#10b981', fontFamily: 'Inter', fontSize: 'large' },
    personalInfo: {
      fullName: "Tom Baker",
      email: "tom.b@salesforce.com",
      phone: "+1 (555) 890-1234",
      location: "Denver, CO"
    },
    sections: {
      summary: "Top-performing Sales Executive consistently exceeding quotas by 150%+.",
      experience: [
        { id: "1", company: "CloudWorks", position: "AE", location: "Denver", startDate: "04/2017", endDate: "Present", current: true, description: "• Closed $5M in new business in 2023.\n• Built a pipeline of 200+ qualified leads." }
      ],
      education: [],
      skills: ["CRM", "Negotiation", "B2B Sales", "Lead Gen"],
      projects: []
    }
  },
  {
    title: "Customer Success Lead",
    templateId: "creative",
    styling: { primaryColor: '#f59e0b', fontFamily: 'system-ui', fontSize: 'medium' },
    personalInfo: {
      fullName: "Sonia Gupta",
      email: "sonia@care.com",
      phone: "+1 (555) 901-2345",
      location: "San Jose, CA"
    },
    sections: {
      summary: "Customer success veteran ensuring maximum ROI for enterprise clients.",
      experience: [
        { id: "1", company: "SaaSify", position: "CSM Manager", location: "San Jose", startDate: "11/2019", endDate: "Present", current: true, description: "• Maintained 98% CSAT score.\n• Spearheaded onboarding for Fortune 100 accounts." }
      ],
      education: [],
      skills: ["Retention", "Problem Solving", "Strategic Planning", "UX"],
      projects: []
    }
  },
  {
    title: "Operations Manager",
    templateId: "modern",
    styling: { primaryColor: '#71717a', fontFamily: 'Inter', fontSize: 'small' },
    personalInfo: {
      fullName: "James Hall",
      email: "james.h@logistics.net",
      phone: "+1 (555) 012-9876",
      location: "Houston, TX"
    },
    sections: {
      summary: "Efficiency-driven Operations Manager with experience in large-scale supply chain logistics.",
      experience: [
        { id: "1", company: "FastTrack Logistics", position: "Operations Lead", location: "Houston", startDate: "02/2016", endDate: "Present", current: true, description: "• Reduced operational costs by 20%.\n• Managed a warehouse of 100+ staff." }
      ],
      education: [],
      skills: ["Logistics", "Supply Chain", "Six Sigma", "Leadership"],
      projects: []
    }
  }
];
