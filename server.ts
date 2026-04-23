import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// User requested model: gpt oss 120 b
// Common Groq model IDs: llama-3.3-70b-versatile, mixtral-8x7b-32768, etc.
// We will use the user's specific string or fallback to llama-3.3-70b-versatile
const AI_MODEL = "llama-3.3-70b-versatile"; 

// MongoDB Setup
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jobx";
const client = new MongoClient(mongoUri);
let db: any;

async function connectMongo() {
  try {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

async function startServer() {
  await connectMongo();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "JobX API is active" });
  });

  // AI Routes: Summary Generation
  app.post("/api/ai/summary", async (req, res) => {
    const { role, context, skills } = req.body;
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer. Generate a powerful, one-paragraph professional summary. Return ONLY the markdown content.",
          },
          {
            role: "user",
            content: `Role: ${role}\nExperience: ${context}\nSkills: ${skills.join(", ")}`,
          },
        ],
        model: AI_MODEL,
      });
      res.json({ summary: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Routes: Bullet Enhancement
  app.post("/api/ai/enhance", async (req, res) => {
    const { content, role } = req.body;
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an ATS expert. Enhance the following resume bullet point to be more impactful. Use strong action verbs and quantify results where possible. Return ONLY the enhanced markdown bullet points.",
          },
          {
            role: "user",
            content: `Content: ${content}\nTarget Role: ${role}`,
          },
        ],
        model: AI_MODEL,
      });
      res.json({ enhanced: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Routes: ATS Analysis
  app.post("/api/ai/analyze-ats", async (req, res) => {
    const { content, jobDescription } = req.body;
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) analyzer. 
Analyze the provided resume content against the job description.
Return a valid JSON object with the following schema:
{
  "score": number (0-100),
  "feedback": "string",
  "missingKeywords": ["string"],
  "suggestions": ["string"]
}
Return ONLY the JSON.`,
          },
          {
            role: "user",
            content: `Resume Content: ${content}\n\nJob Description: ${jobDescription}`,
          },
        ],
        model: AI_MODEL,
        response_format: { type: "json_object" },
      });
      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // NEW: Parse Old Resume
  app.post("/api/parse/resume", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    try {
      let text = "";
      if (req.file.mimetype === "application/pdf") {
        const data = await pdf(req.file.buffer);
        text = data.text;
      } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const data = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = data.value;
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Extract structured resume data from the following text. Return a valid JSON object matching our Resume schema (personalInfo, sections). Return ONLY the JSON.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        model: AI_MODEL,
        response_format: { type: "json_object" },
      });
      
      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // NEW: Fetch from LinkedIn (Text Based)
  app.post("/api/parse/linkedin", async (req, res) => {
    const { linkedinText } = req.body;
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting resume data from LinkedIn profile text. Convert the provided text into a valid JSON object matching our Resume schema. Return ONLY the JSON.",
          },
          {
            role: "user",
            content: linkedinText,
          },
        ],
        model: AI_MODEL,
        response_format: { type: "json_object" },
      });
      
      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Database Routes: Resume Management
  app.get("/api/resumes", async (req, res) => {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const resumes = await db.collection("resumes").find({ userId }).sort({ updatedAt: -1 }).toArray();
      res.json(resumes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/resumes", async (req, res) => {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const resume = { ...req.body, userId, createdAt: new Date(), updatedAt: new Date() };
    try {
      const result = await db.collection("resumes").insertOne(resume);
      res.json({ ...resume, id: result.insertedId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/resumes/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    // Remove _id and id from update body to prevent immutable field errors
    const { _id, id: resumeId, ...updateData } = req.body;

    try {
      await db.collection("resumes").updateOne(
        { _id: new ObjectId(id), userId },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/resumes/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      await db.collection("resumes").deleteOne({ _id: new ObjectId(id), userId });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
