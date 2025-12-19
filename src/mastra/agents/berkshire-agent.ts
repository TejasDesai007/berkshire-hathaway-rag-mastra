import dotenv from "dotenv";
dotenv.config();

import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core";
import { z } from "zod";
import { retrieveRelevantChunks } from "../rag/retrieve";
import { generateAnswer } from "../rag/answer";

// Tool to retrieve relevant chunks from Berkshire Hathaway letters
const retrieveChunksTool = createTool({
  id: "retrieve_chunks",
  description: "Retrieves relevant chunks from Berkshire Hathaway shareholder letters based on a query. Use this to find information from the letters before answering questions.",
  inputSchema: z.object({
    query: z.string().describe("The search query to find relevant information from the letters"),
    limit: z.number().optional().default(5).describe("Number of chunks to retrieve (default: 5)"),
  }),
  execute: async ({ context }) => {
    try {
      const { query, limit } = context;
      const chunks = await retrieveRelevantChunks(query, limit);
      
      const formattedChunks = chunks.map((chunk, index) => ({
        index: index + 1,
        content: chunk.content,
        score: chunk.score,
        source: chunk.source || "Unknown",
        year: chunk.year || "Unknown",
      }));

      return {
        chunks: formattedChunks,
        total: chunks.length,
        summary: `Retrieved ${chunks.length} relevant chunk(s) from Berkshire Hathaway letters.`,
        verification: {
          retrievedFromDatabase: true,
          databaseQuery: query,
          chunksWithScores: formattedChunks.map(chunk => ({
            chunkNumber: chunk.index,
            score: chunk.score,
            source: chunk.source,
            year: chunk.year,
          })),
        },
      };
    } catch (error: any) {
      return {
        error: true,
        message: `Failed to retrieve chunks: ${error.message || "Unknown error"}`,
        chunks: [],
        total: 0,
        summary: "Retrieval failed. Please check your database connection and environment variables.",
      };
    }
  },
});

// Tool to generate an answer based on retrieved context
const generateAnswerTool = createTool({
  id: "generate_answer",
  description: "Generates an answer to a question using the provided context from Berkshire Hathaway letters. Use this after retrieving relevant chunks.",
  inputSchema: z.object({
    question: z.string().describe("The question to answer"),
    context: z.string().describe("The context retrieved from the letters to use for answering"),
  }),
  execute: async ({ context }) => {
    const { question, context: retrievedContext } = context;
    
    try {
      const answer = await generateAnswer(question, retrievedContext);
      return {
        answer,
        question,
      };
    } catch (error: any) {
      return {
        error: true,
        message: `Failed to generate answer: ${error.message || "Unknown error"}`,
        answer: "I encountered an error while generating the answer. Please check your OpenAI API key and try again.",
        question,
      };
    }
  },
});

// Combined RAG tool that retrieves and answers in one step
const answerQuestionTool = createTool({
  id: "answer_question",
  description: "Answers a question about Berkshire Hathaway by automatically retrieving relevant information from the shareholder letters and generating an answer. This is the primary tool to use for answering user questions.",
  inputSchema: z.object({
    question: z.string().describe("The question to answer about Berkshire Hathaway"),
    limit: z.number().optional().default(5).describe("Number of chunks to retrieve (default: 5)"),
  }),
  execute: async ({ context }) => {
    const { question, limit } = context;
    
    try {
      // Retrieve relevant chunks
      const chunks = await retrieveRelevantChunks(question, limit);
      
      if (chunks.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the Berkshire Hathaway shareholder letters to answer this question.",
          question,
          sources: [],
        };
      }
      
      // Format context
      const formattedContext = chunks
        .map((chunk, index) => {
          const sourceInfo = chunk.source || chunk.year 
            ? ` (Source: ${chunk.source || ""}${chunk.year ? `, Year: ${chunk.year}` : ""})`
            : "";
          return `[Chunk ${index + 1}${sourceInfo}]\n${chunk.content}`;
        })
        .join("\n\n---\n\n");
      
      // Generate answer
      const answer = await generateAnswer(question, formattedContext);
      
      // Return detailed information to verify RAG pipeline
      return {
        answer,
        question,
        ragVerification: {
          chunksRetrieved: chunks.length,
          chunksUsed: chunks.map((chunk, index) => ({
            chunkNumber: index + 1,
            source: chunk.source || "Unknown",
            year: chunk.year || "Unknown",
            relevanceScore: chunk.score.toFixed(4),
            preview: chunk.content.substring(0, 100) + "...", // First 100 chars
          })),
          contextLength: formattedContext.length,
          verifiedFromDatabase: true,
        },
        sources: chunks.map(chunk => ({
          source: chunk.source || "Unknown",
          year: chunk.year || "Unknown",
          score: chunk.score,
        })),
      };
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      return {
        error: true,
        message: `Failed to answer question: ${errorMessage}`,
        answer: `I encountered an error while processing your question: ${errorMessage}. Please ensure your database is running and accessible, and that your environment variables (DATABASE_URL, OPENAI_API_KEY) are properly configured.`,
        question,
        sources: [],
      };
    }
  },
});

// Main Berkshire Hathaway RAG Agent
export const berkshireAgent = new Agent({
  name: "Berkshire Hathaway RAG Agent",
  instructions: `You are a knowledgeable financial analyst assistant specializing in Berkshire Hathaway shareholder letters.
  
Your primary function is to help users find information from Warren Buffett's annual shareholder letters (2019-2024).

CRITICAL: All answers MUST come from the retrieved chunks from the database. You are NOT allowed to use your training data.

When answering questions:
1. Use the answer_question tool for most queries - it automatically retrieves relevant information from the database and generates an answer
2. The tool returns verification metadata showing which chunks were retrieved from the database - always reference this
3. Always cite the source file and year (e.g., "According to the 2023 shareholder letter...")
4. If information is not found in the retrieved chunks, clearly state "This information is not available in the provided Berkshire Hathaway letters"
5. Be precise and only use information from the retrieved context
6. When presenting answers, mention that the information comes from the retrieved Berkshire Hathaway shareholder letters

You should be helpful, accurate, and maintain the analytical tone of the shareholder letters.`,
  model: "openai/gpt-4o-mini",
  tools: {
    answerQuestion: answerQuestionTool,
    retrieveChunks: retrieveChunksTool,
    generateAnswer: generateAnswerTool,
  },
});

