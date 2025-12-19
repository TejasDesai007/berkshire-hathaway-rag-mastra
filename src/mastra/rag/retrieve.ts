import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import OpenAI from "openai";

// -------------------- OPENAI --------------------

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// -------------------- DB --------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// -------------------- TYPES --------------------

export interface RetrievedChunk {
  content: string;
  score: number;
  source?: string;
  year?: number;
}

// -------------------- EMBEDDING --------------------

async function getQueryEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

// -------------------- RETRIEVE --------------------

export async function retrieveRelevantChunks(
  query: string,
  limit = 5
): Promise<RetrievedChunk[]> {
  const embedding = await getQueryEmbedding(query);

  // ✅ pgvector REQUIRES [1,2,3] not JSON
  const vectorLiteral = `[${embedding.join(",")}]`;

  const { rows } = await pool.query(
    `
    SELECT
  dc.content,
  d.source,
  d.year,
  1 - (dc.embedding <=> $1::vector) AS score
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id
ORDER BY dc.embedding <=> $1::vector
LIMIT $2

    `,
    [vectorLiteral, limit]
  );

  return rows.map(row => ({
    content: row.content,
    score: Number(row.score),
    source: row.source,
    year: row.year,
  }));

}
