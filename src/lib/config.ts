/**
 * Central configuration for the application.
 * All environment variables should be accessed through this file.
 */

export const config = {
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
  auth: {
    origin: process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
    rpId: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
    rpName: process.env.NEXT_PUBLIC_RP_NAME || 'Lemon App',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
};
