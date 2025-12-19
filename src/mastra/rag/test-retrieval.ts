import dotenv from "dotenv";
dotenv.config();

import { retrieveRelevantChunks } from "./retrieve";

async function testRetrieval() {
  const results = await retrieveRelevantChunks(
    "What does Warren Buffett say about long term investing?",
    5
  );

  console.log("\n🔍 Top Retrieved Chunks:\n");

  results.forEach((r, i) => {
    console.log(`--- ${i + 1} (score: ${r.score.toFixed(3)}) ---`);
    console.log(r.content.slice(0, 300));
    console.log();
  });
}

testRetrieval();
