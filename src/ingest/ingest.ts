// src/mastra/rag/ingest.ts — LOCAL HASH EMBEDDINGS (NO AI, NO API)

import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import path from "path";

import { loadPdfDocuments } from "../mastra/rag/documentLoader";
import { CHUNK_CONFIG } from "../mastra/rag/chunking.config";
import { getLocalEmbedding } from "../mastra/rag/localEmbeddings";

// -------------------- UTILS --------------------

function chunkText(text: string, size: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = start + size;
        const chunk = text.slice(start, Math.min(end, text.length)).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }
        start += size - overlap;
    }

    return chunks;
}

// 🔥 IMPORTANT: convert number[] → pgvector string
function toPgVector(embedding: number[]): string {
    return `[${embedding.join(",")}]`;
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
            embedding VECTOR(384),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

// -------------------- INGEST --------------------

async function ingest() {
    console.log("🚀 Starting ingestion process (NO API, LOCAL EMBEDDINGS)");

    try {
        await ensureSchema();
        console.log("✅ Database schema verified.");

        const documents = await loadPdfDocuments();
        console.log(`📄 Loaded ${documents.length} document(s).`);

        if (documents.length === 0) return;

        for (const [docIndex, doc] of documents.entries()) {
            const filename = path.basename(doc.metadata.source);
            console.log(`\n📋 Processing ${docIndex + 1}/${documents.length}: ${filename}`);

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

            console.log(`✂️ Created ${chunks.length} chunks`);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                if (chunk.length < 10) continue;

                try {
                    console.log(`  🧩 Chunk ${i + 1}/${chunks.length}`);

                    const embeddingArray = getLocalEmbedding(chunk);
                    const embeddingVector = toPgVector(embeddingArray); // 🔥 FIX

                    await pool.query(
                        `INSERT INTO document_chunks
                         (document_id, chunk_index, content, embedding)
                         VALUES ($1, $2, $3, $4)`,
                        [documentId, i, chunk, embeddingVector]
                    );

                } catch (err: any) {
                    console.error(`❌ Chunk ${i + 1} failed: ${err.message}`);
                }
            }

            console.log(`✅ Finished ${filename}`);
        }

        console.log("\n🎉 Ingestion completed successfully!");

    } catch (err: any) {
        console.error("💥 Ingestion failed:", err.message);
    } finally {
        await pool.end();
        console.log("🔌 DB connection closed.");
    }
}

// -------------------- ENV CHECK --------------------

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is required");
    process.exit(1);
}

ingest();
