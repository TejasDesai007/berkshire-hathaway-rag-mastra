import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import path from "path";
import OpenAI from "openai";

import { loadPdfDocuments } from "./documentLoader";
import { CHUNK_CONFIG } from "./chunking.config";

// -------------------- OPENAI --------------------

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -------------------- UTILS --------------------

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + size;
    const chunk = text.slice(start, Math.min(end, text.length)).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start += size - overlap;
  }

  return chunks;
}

// -------------------- DB --------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureSchema() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      source TEXT,
      year INT,
      page_count INT,
      file_size BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS document_chunks (
      id SERIAL PRIMARY KEY,
      document_id INT REFERENCES documents(id),
      chunk_index INT,
      content TEXT,
      embedding VECTOR(1536),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// -------------------- EMBEDDING --------------------

async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small", // 1536 dims
    input: text,
  });

  return res.data[0].embedding;
}

// -------------------- INGEST --------------------

async function ingest() {
  console.log("🚀 Starting ingestion process (OPENAI EMBEDDINGS)");

  try {
    await ensureSchema();
    console.log("✅ Database schema verified.");

    const documents = await loadPdfDocuments();
    console.log(`📄 Loaded ${documents.length} document(s).`);

    let totalChunks = 0;

    for (const doc of documents) {
      const filename = path.basename(doc.metadata.source);
      console.log(`\n📋 Processing ${filename}`);

      const { rows } = await pool.query(
        `INSERT INTO documents (source, year, page_count, file_size)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          doc.metadata.source,
          doc.metadata.year,
          doc.metadata.pageCount || 0,
          doc.metadata.size || 0,
        ]
      );

      const documentId = rows[0].id;

      const chunks = chunkText(
        doc.content,
        CHUNK_CONFIG.chunkSize,
        CHUNK_CONFIG.overlap
      );

      console.log(`✂️  ${chunks.length} chunks created`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk.length < 20) continue;

        console.log(`  → Chunk ${i + 1}/${chunks.length}`);

        const embedding = await getOpenAIEmbedding(chunk);

        // 🔑 IMPORTANT PART
        const vectorLiteral = `[${embedding.join(",")}]`;

        await pool.query(
          `INSERT INTO document_chunks
           (document_id, chunk_index, content, embedding)
           VALUES ($1, $2, $3, $4::vector)`,
          [documentId, i, chunk, vectorLiteral]
        );

        totalChunks++;
      }
    }

    console.log(`🎉 Ingestion complete. Total chunks stored: ${totalChunks}`);
  } catch (err: any) {
    console.error("💥 Ingestion failed:", err.message);
  } finally {
    await pool.end();
    console.log("🔌 DB connection closed.");
  }
}

// -------------------- ENV CHECK --------------------

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL missing");
  process.exit(1);
}

ingest();
