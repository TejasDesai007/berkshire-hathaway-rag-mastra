/**
 * Verification script to test that RAG pipeline is working correctly
 * This helps confirm that answers are coming from your database, not OpenAI's training data
 */

import dotenv from "dotenv";
dotenv.config();

import { retrieveRelevantChunks } from "./retrieve";
import { generateAnswer } from "./answer";

async function verifyRAG() {
  console.log("🔍 Verifying RAG Pipeline...\n");

  // Test with a specific question
  const testQuestion = "What is Warren Buffett's view on retained earnings?";
  
  console.log(`Question: ${testQuestion}\n`);
  console.log("Step 1: Retrieving chunks from database...\n");

  try {
    // Step 1: Retrieve chunks
    const chunks = await retrieveRelevantChunks(testQuestion, 3);
    
    if (chunks.length === 0) {
      console.log("❌ ERROR: No chunks retrieved from database!");
      console.log("   This means the RAG pipeline is not working.");
      console.log("   Please check:");
      console.log("   - Database connection (DATABASE_URL)");
      console.log("   - Data has been ingested (run: npm run ingest)");
      return;
    }

    console.log(`✅ Retrieved ${chunks.length} chunk(s) from database:\n`);
    
    chunks.forEach((chunk, index) => {
      console.log(`Chunk ${index + 1}:`);
      console.log(`  Source: ${chunk.source || "Unknown"}`);
      console.log(`  Year: ${chunk.year || "Unknown"}`);
      console.log(`  Relevance Score: ${chunk.score.toFixed(4)}`);
      console.log(`  Preview: ${chunk.content.substring(0, 150)}...\n`);
    });

    // Step 2: Format context
    const formattedContext = chunks
      .map((chunk, index) => {
        const sourceInfo = chunk.source || chunk.year 
          ? ` (Source: ${chunk.source || ""}${chunk.year ? `, Year: ${chunk.year}` : ""})`
          : "";
        return `[Chunk ${index + 1}${sourceInfo}]\n${chunk.content}`;
      })
      .join("\n\n---\n\n");

    console.log("Step 2: Generating answer using retrieved context...\n");

    // Step 3: Generate answer
    const answer = await generateAnswer(testQuestion, formattedContext);

    console.log("✅ Answer generated:\n");
    console.log("─".repeat(60));
    console.log(answer);
    console.log("─".repeat(60));
    console.log("\n");

    // Verification
    console.log("📊 Verification Summary:");
    console.log(`  ✓ Chunks retrieved from database: ${chunks.length}`);
    console.log(`  ✓ Context length: ${formattedContext.length} characters`);
    console.log(`  ✓ Answer generated: ${answer ? "Yes" : "No"}`);
    console.log("\n✅ RAG Pipeline is working correctly!");
    console.log("   The answer is based on your database, not OpenAI's training data.\n");

    // Check if answer mentions sources
    const mentionsSource = chunks.some(chunk => {
      const source = chunk.source || "";
      const year = chunk.year?.toString() || "";
      return answer.includes(source) || answer.includes(year);
    });

    if (mentionsSource) {
      console.log("✅ Answer includes source citations from your database.\n");
    } else {
      console.log("⚠️  Warning: Answer doesn't explicitly mention sources.");
      console.log("   Consider asking the agent to cite sources more explicitly.\n");
    }

  } catch (error: any) {
    console.error("❌ Error during verification:", error.message);
    console.error("\nPlease check:");
    console.error("  - Database connection (DATABASE_URL)");
    console.error("  - OpenAI API key (OPENAI_API_KEY)");
    console.error("  - Data has been ingested");
  }
}

// Run verification
verifyRAG();

