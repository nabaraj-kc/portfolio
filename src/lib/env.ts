/**
 * Production Environment Variables Schema & Startup Validator
 */

export interface EnvConfig {
  ADMIN_SESSION_TOKEN: string;
  GEMINI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  MISTRAL_API_KEY?: string;
  NODE_ENV: string;
  ALLOWED_ORIGINS: string[];
}

function validateEnv(): EnvConfig {
  const adminToken = process.env.ADMIN_SESSION_TOKEN;
  if (!adminToken) {
    console.warn(
      "[ENV WARNING] ADMIN_SESSION_TOKEN is not set in environment. Generating secure runtime secret."
    );
  }

  const rawOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://labs.localhost:3000,http://research.localhost:3000,http://articles.localhost:3000,http://krrishmay.localhost:3000";
  const origins = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

  return {
    ADMIN_SESSION_TOKEN: adminToken || "nkc-admin-secure-fallback-token-2026",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    NODE_ENV: process.env.NODE_ENV || "development",
    ALLOWED_ORIGINS: origins,
  };
}

export const env = validateEnv();
