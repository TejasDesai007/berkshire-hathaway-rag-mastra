import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { retrieveRelevantChunks } from "../mastra/rag/retrieve";
import { generateAnswer } from "../mastra/rag/answer";
import { Pool } from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection for status check
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Berkshire Hathaway RAG API",
  });
});

// Check database status and data availability
app.get("/api/status", async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await pool.query("SELECT 1");
    const dbConnected = dbCheck.rowCount === 1;

    // Check if data exists
    const dataCheck = await pool.query(
      "SELECT COUNT(*) as total_chunks FROM document_chunks"
    );
    const totalChunks = parseInt(dataCheck.rows[0].total_chunks);

    const docCheck = await pool.query(
      "SELECT COUNT(*) as total_docs FROM documents"
    );
    const totalDocs = parseInt(docCheck.rows[0].total_docs);

    res.json({
      status: "ok",
      database: {
        connected: dbConnected,
        totalChunks,
        totalDocuments: totalDocs,
        ready: totalChunks > 0,
      },
      environment: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
      database: {
        connected: false,
        ready: false,
      },
    });
  }
});

// Retrieve chunks only (without generating answer)
app.post("/api/retrieve", async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Query is required and must be a string",
      });
    }

    const chunks = await retrieveRelevantChunks(query, limit);

    const formattedChunks = chunks.map((chunk, index) => ({
      index: index + 1,
      content: chunk.content,
      score: chunk.score,
      source: chunk.source || "Unknown",
      year: chunk.year || "Unknown",
    }));

    res.json({
      success: true,
      query,
      chunks: formattedChunks,
      total: chunks.length,
      summary: `Retrieved ${chunks.length} relevant chunk(s) from Berkshire Hathaway letters.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve chunks",
      message: error.message,
    });
  }
});

// Main query endpoint - retrieves and generates answer
app.post("/api/query", async (req, res) => {
  try {
    const { question, limit = 5 } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Question is required and must be a string",
      });
    }

    // Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(question, limit);

    if (chunks.length === 0) {
      return res.json({
        success: true,
        question,
        answer:
          "I couldn't find any relevant information in the Berkshire Hathaway shareholder letters to answer this question.",
        sources: [],
        ragVerification: {
          chunksRetrieved: 0,
          chunksUsed: [],
          contextLength: 0,
          verifiedFromDatabase: true,
        },
      });
    }

    // Format context
    const formattedContext = chunks
      .map((chunk, index) => {
        const sourceInfo =
          chunk.source || chunk.year
            ? ` (Source: ${chunk.source || ""}${chunk.year ? `, Year: ${chunk.year}` : ""})`
            : "";
        return `[Chunk ${index + 1}${sourceInfo}]\n${chunk.content}`;
      })
      .join("\n\n---\n\n");

    // Generate answer
    const answer = await generateAnswer(question, formattedContext);

    res.json({
      success: true,
      question,
      answer,
      ragVerification: {
        chunksRetrieved: chunks.length,
        chunksUsed: chunks.map((chunk, index) => ({
          chunkNumber: index + 1,
          source: chunk.source || "Unknown",
          year: chunk.year || "Unknown",
          relevanceScore: chunk.score.toFixed(4),
          preview: chunk.content.substring(0, 100) + "...",
        })),
        contextLength: formattedContext.length,
        verifiedFromDatabase: true,
      },
      sources: chunks.map((chunk) => ({
        source: chunk.source || "Unknown",
        year: chunk.year || "Unknown",
        score: chunk.score,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to process query",
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Berkshire Hathaway RAG API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🔍 Query endpoint: http://localhost:${PORT}/api/query`);
});

