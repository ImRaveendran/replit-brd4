import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertDocumentSchema, insertGenerationSchema, generationResultSchema, epicSchema, userStorySchema } from "@shared/schema";
import multer from "multer";
import { createReadStream } from "fs";
import { promisify } from "util";
import { unlink } from "fs/promises";

// Setup multer for file uploads
const upload = multer({ dest: "uploads/" });

// Groq integration
async function processDocumentWithGroq(content: string): Promise<any> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not found. Please set GROQ_API_KEY or VITE_GROQ_API_KEY environment variable.");
  }

  const prompt = `
You are an expert business analyst. Given the following Business Requirements Document (BRD), generate exactly 7 or more Epics and 3-4 User Stories per Epic.

For each Epic, provide:
- epic_name: A clear, concise name for the epic
- epic_description: A detailed description of what the epic encompasses

For each User Story within an Epic, provide:
- story_name: A clear, concise name for the user story
- description: A detailed user story in the format "As a [user type], I want [goal] so that [benefit]"
- label: A category/tag for the story (e.g., "Authentication", "UI/UX", "API", etc.)
- status: One of "To Do", "In Progress", "Ready", "Done"
- acceptance_criteria: An array of specific, testable criteria (3-5 items)
- nfrs: An array of Non-Functional Requirements (2-3 items)
- definition_of_done: An array of completion criteria (3-4 items)
- definition_of_ready: An array of readiness criteria (3-4 items)

Ensure you generate a MINIMUM of 7 Epics, each with 3-4 User Stories.

Return ONLY a valid JSON object in this exact format:
{
  "epics": [
    {
      "epic_name": "Example Epic Name",
      "epic_description": "Detailed description of the epic...",
      "user_stories": [
        {
          "story_name": "Example Story Name",
          "description": "As a user, I want to do something so that I can achieve a goal",
          "label": "Category",
          "status": "To Do",
          "acceptance_criteria": ["Criteria 1", "Criteria 2", "Criteria 3"],
          "nfrs": ["NFR 1", "NFR 2"],
          "definition_of_done": ["DoD 1", "DoD 2", "DoD 3"],
          "definition_of_ready": ["DoR 1", "DoR 2", "DoR 3"]
        }
      ]
    }
  ]
}

BRD Content:
${content}
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content_text = data.choices?.[0]?.message?.content;
    
    if (!content_text) {
      throw new Error("No content received from Groq API");
    }

    // Parse the JSON response
    let parsedResult;
    try {
      // Clean the response to extract JSON
      const jsonMatch = content_text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      parsedResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", content_text);
      throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate the response structure
    try {
      return generationResultSchema.parse(parsedResult);
    } catch (validationError) {
      console.error("Validation failed for:", parsedResult);
      throw new Error(`Invalid response structure: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Groq processing error:", error);
    throw error;
  }
}

// Text extraction utilities
async function extractTextFromFile(filePath: string, filename: string): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop();
  
  try {
    switch (extension) {
      case 'txt':
        const fs = await import('fs/promises');
        return await fs.readFile(filePath, 'utf-8');
      
      case 'pdf':
        const pdfParse = await import('pdf-parse');
        const pdfBuffer = await import('fs/promises').then(fs => fs.readFile(filePath));
        const pdfData = await pdfParse.default(pdfBuffer);
        return pdfData.text;
      
      case 'doc':
      case 'docx':
        const mammoth = await import('mammoth');
        const docBuffer = await import('fs/promises').then(fs => fs.readFile(filePath));
        const docResult = await mammoth.extractRawText({ buffer: docBuffer });
        return docResult.value;
      
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${filename}:`, error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and process document
  app.post("/api/documents/upload", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text from uploaded file
      let content: string;
      try {
        content = await extractTextFromFile(req.file.path, req.file.originalname);
      } catch (extractError) {
        await unlink(req.file.path); // Clean up uploaded file
        return res.status(400).json({ 
          message: `Failed to process file: ${extractError instanceof Error ? extractError.message : 'Unknown error'}` 
        });
      }

      // Clean up uploaded file
      await unlink(req.file.path);

      if (!content.trim()) {
        return res.status(400).json({ message: "Document appears to be empty or unreadable" });
      }

      // Create document record
      const document = await storage.createDocument({
        filename: req.file.originalname,
        content: content,
      });

      // Create initial generation record
      const generation = await storage.createGeneration({
        documentId: document.id,
        epics: {},
        status: "processing",
      });

      res.json({ 
        documentId: document.id, 
        generationId: generation.id,
        message: "Document uploaded successfully. Processing started." 
      });

      // Process with Groq asynchronously
      processDocumentWithGroq(content)
        .then(async (result) => {
          await storage.updateGenerationStatus(
            generation.id,
            "completed",
            result.epics,
            new Date()
          );
        })
        .catch(async (error) => {
          console.error("Groq processing failed:", error);
          await storage.updateGenerationStatus(
            generation.id,
            "failed",
            { error: error.message }
          );
        });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get generation status and results
  app.get("/api/generations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid generation ID" });
      }

      const generation = await storage.getGeneration(id);
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }

      res.json(generation);
    } catch (error) {
      console.error("Get generation error:", error);
      res.status(500).json({ 
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get document generations
  app.get("/api/documents/:id/generations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const generations = await storage.getGenerationsByDocument(id);
      res.json(generations);
    } catch (error) {
      console.error("Get document generations error:", error);
      res.status(500).json({ 
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
