import { GoogleGenAI, Type } from "@google/genai";
import { ResumeSections, AtsScoreResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3-flash-preview";

export const generateSummary = async (role: string, experience: string, skills: string[]) => {
  const prompt = `Generate a professional, ATS-friendly resume summary for a ${role} with the following experience: ${experience}. Top skills: ${skills.join(', ')}. Keep it under 4 lines, action-oriented, and concise.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  
  return response.text?.trim() || "";
};

export const enhanceBulletPoint = async (bullet: string, role: string) => {
  const prompt = `Enhance the following resume bullet point to be more impactful and quantifiable. Convert it into an action-driven achievement for a ${role} role. Bullet point: "${bullet}"`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  
  return response.text?.trim() || bullet;
};

export const analyzeAtsScore = async (resumeContent: string, jobDescription: string): Promise<AtsScoreResult> => {
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze the following resume against the job description for ATS compatibility. 
    Resume: ${resumeContent}
    Job Description: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "ATS score from 0-100" },
          feedback: { type: Type.STRING, description: "General feedback" },
          missingKeywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Industry keywords missing from resume but present in JD"
          },
          suggestions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Actionable steps to improve score"
          }
        },
        required: ["score", "feedback", "missingKeywords", "suggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text?.trim() || "{}") as AtsScoreResult;
  } catch (e) {
    console.error("Failed to parse ATS result", e);
    return {
      score: 0,
      feedback: "Error analyzing resume. Please try again.",
      missingKeywords: [],
      suggestions: ["Ensure text is clear and readable."]
    };
  }
};

export const extractKeywords = async (jobDescription: string) => {
  const prompt = `Extract top 10 relevant hard skills and keywords from this job description for ATS optimization: "${jobDescription}"`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text?.trim() || "[]") as string[];
  } catch (e) {
    return [];
  }
};
