// Typed environment variable access (replaces Python Settings class)
// All values read from process.env at runtime (Vercel injects them)

export const config = {
  // App
  appName: process.env.APP_NAME || "MatchMyResumes",
  appEnv: process.env.APP_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // Groq (primary LLM)
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",

  // Gemini (fallback LLM + embeddings)
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || "gemini-1.5-flash",
  geminiEmbeddingModel:
    process.env.GEMINI_EMBEDDING_MODEL || "models/text-embedding-004",

  // Paddle
  paddleApiKey: process.env.PADDLE_API_KEY || "",
  paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET || "",
  paddlePricePro: process.env.PADDLE_PRICE_PRO || "",
  paddlePricePremium: process.env.PADDLE_PRICE_PREMIUM || "",
  paddleEnv: process.env.PADDLE_ENV || "sandbox",
  paddleClientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",

  // Rate Limiting
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || "60", 10),
  aiRateLimitPerMinute: parseInt(
    process.env.AI_RATE_LIMIT_PER_MINUTE || "10",
    10
  ),
} as const;
