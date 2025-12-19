import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { retrieveRelevantChunks } from "./retrieve";
import { ConversationMemory } from "./memory";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const memory = new ConversationMemory();

async function ask(question: string) {
  // 1️⃣ store user message
  memory.add("user", question);

  // 2️⃣ retrieve context
  const chunks = await retrieveRelevantChunks(question, 5);
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.content}`)
    .join("\n\n---\n\n");

  // 3️⃣ prompt
  const prompt = `
Answer ONLY from the context below.
If not found, say "Not mentioned in the letters".

Context:
${context}

Question:
${question}
`;

  // 4️⃣ OpenAI with memory
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a financial analyst." },
      ...memory.get(),
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const answer = completion.choices[0].message.content!;
  memory.add("assistant", answer);

  console.log("\n🧠 ANSWER:\n");
  console.log(answer);
}

// Conversation
async function testRAG() {
  await ask("What is Warren Buffett's investment philosophy?");
  await ask("How does he think about long term investing?");
  await ask("What does he say about market volatility?");
}

testRAG();
