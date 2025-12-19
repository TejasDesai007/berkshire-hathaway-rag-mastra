import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateAnswer(
  question: string,
  context: string
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          `You are a financial analyst answering STRICTLY and EXCLUSIVELY from the provided context from Berkshire Hathaway shareholder letters.

CRITICAL RULES:
1. You MUST ONLY use information from the provided context below
2. DO NOT use any knowledge from your training data
3. If the context doesn't contain enough information to answer the question, say "The provided context does not contain sufficient information to answer this question."
4. Always cite which chunk(s) you used by referencing the chunk numbers [Chunk 1], [Chunk 2], etc.
5. If you cannot answer from the context, explicitly state that the information is not available in the provided Berkshire Hathaway letters.`,
      },
      {
        role: "user",
        content: `
IMPORTANT: Answer the question ONLY using the context provided below. Do not use any external knowledge.

Context from Berkshire Hathaway Shareholder Letters:
${context}

Question:
${question}

Remember: Only use information from the context above. If the context doesn't contain the answer, explicitly state that.`,
      },
    ],
  });

  return response.choices[0].message.content;
}
