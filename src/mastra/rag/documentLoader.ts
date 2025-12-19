import fs from "fs/promises";
import path from "path";
import pdfjs from "pdfjs-dist/legacy/build/pdf";

export interface RawDocument {
  content: string;
  metadata: {
    source: string;
    year: number;
    filename: string;
    pageCount?: number;
    size?: number;
  };
}

const DATA_DIR = path.join(process.cwd(), "src/mastra/rag/data");

function extractYearFromFilename(filename: string): number | null {
  const match = filename.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

async function extractTextFromPdf(buffer: Uint8Array) {
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }

  return { text, pages: pdf.numPages };
}

export async function loadPdfDocuments(): Promise<RawDocument[]> {
  const files = (await fs.readdir(DATA_DIR)).filter(f =>
    f.toLowerCase().endsWith(".pdf")
  );

  const docs: RawDocument[] = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const buffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    const year = extractYearFromFilename(file);
    if (!year) continue;

    const { text, pages } = await extractTextFromPdf(
      new Uint8Array(buffer)
    );

    docs.push({
      content: text.replace(/\s+/g, " ").trim(),
      metadata: {
        source: filePath,
        year,
        filename: file,
        pageCount: pages,
        size: stats.size,
      },
    });

    console.log(`✔ Loaded ${file}`);
  }

  return docs;
}
