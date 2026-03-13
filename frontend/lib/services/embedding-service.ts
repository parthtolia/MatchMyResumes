import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
}

export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: config.geminiEmbeddingModel,
    });
    const truncated = text.slice(0, 8000);
    const result = await model.embedContent({
      content: { parts: [{ text: truncated }], role: "user" },
      taskType: "RETRIEVAL_DOCUMENT" as any,
    });
    return result.embedding.values;
  } catch (e: any) {
    console.warn(
      `[embedding-service] WARNING: Embedding failed (${e.constructor?.name}): ${e.message}`
    );
    return null;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0.0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (normA * normB);
}
