/**
 * Central configuration for the application.
 * All environment variables should be accessed through this file.
 */

const numberFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

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
  },
  ui: {
    home: {
      walletPreviewLimit: numberFromEnv(process.env.NEXT_PUBLIC_HOME_WALLET_PREVIEW_LIMIT, 5),
      upcomingRemindersForwardDays: numberFromEnv(process.env.NEXT_PUBLIC_UPCOMING_REMINDERS_FORWARD_DAYS, 7),
      upcomingRemindersPastDays: numberFromEnv(process.env.NEXT_PUBLIC_UPCOMING_REMINDERS_PAST_DAYS, 1),
      recentTransactionsLimit: numberFromEnv(process.env.NEXT_PUBLIC_HOME_RECENT_TX_LIMIT, 5),
    },
  }
};
