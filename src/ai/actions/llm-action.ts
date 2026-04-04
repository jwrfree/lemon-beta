import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { createFinancialTools } from "@/ai/tools";
import { buildChatSystemPrompt, type ChatUserFinancialProfile } from "@/ai/flows/chat-flow";
import { config } from "@/lib/config";
import { persistChatSession } from "@/lib/services/chat-session-service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TokenBudgeter } from "@/lib/ai/token-budgeter";

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

type LlmActionClient = Pick<SupabaseClient, "from" | "rpc">;

type HandleLlmActionParams = {
  userId: string;
  supabase: LlmActionClient;
  messages: UIMessage[];
  memorySummary?: string | null;
  userProfile?: ChatUserFinancialProfile | null;
  supplementalContext?: Record<string, unknown> | null;
  sessionId?: string | null;
};

export const handleLlmChatAction = async ({
  userId,
  supabase,
  messages,
  memorySummary,
  userProfile,
  supplementalContext,
  sessionId,
}: HandleLlmActionParams) => {
  const MAX_HISTORY_MESSAGES = 10;
  const BUDGET_LIMIT = 4500; // DeepSeek/Gemini limits are higher, but 4.5k is a lean target

  let contextToUse = supplementalContext;
  let messagesToUse = messages.length > MAX_HISTORY_MESSAGES
    ? messages.slice(-MAX_HISTORY_MESSAGES)
    : messages;

  const getSystem = () => buildChatSystemPrompt({ memorySummary, userProfile, supplementalContext: contextToUse });

  // Intelligent Context Management & Telemetry
  let log = '';
  const initialBreakdown = TokenBudgeter.analyzePromptStructure({ system: getSystem(), history: messagesToUse });
  const startTokens = initialBreakdown.total;

  // Level 1 Truncation: Smart Message Filtering
  if (initialBreakdown.total > BUDGET_LIMIT) {
    const beforeHistory = TokenBudgeter.countTokens(JSON.stringify(messagesToUse));
    // Keep high value messages or latest 3
    const filtered = TokenBudgeter.filterHighValueMessages(messagesToUse);
    messagesToUse = messagesToUse.length > 5 
      ? [...filtered, ...messagesToUse.slice(-2)].slice(-5) 
      : messagesToUse;
    
    const afterHistory = TokenBudgeter.countTokens(JSON.stringify(messagesToUse));
    log += TokenBudgeter.logTransformation('Smart History', beforeHistory, afterHistory);
  }

  // Level 2 Truncation: Strip Supplemental
  let currentTotal = TokenBudgeter.analyzePromptStructure({ system: getSystem(), history: messagesToUse }).total;
  if (currentTotal > BUDGET_LIMIT && contextToUse) {
    const beforeContext = TokenBudgeter.countTokens(JSON.stringify(contextToUse));
    contextToUse = null; 
    const afterContext = 0;
    log += TokenBudgeter.logTransformation('Context Strip', beforeContext, afterContext);
  }

  // Level 3: Natural Fallback Persona (Production Mode)
  let systemFinal = getSystem();
  currentTotal = TokenBudgeter.analyzePromptStructure({ system: systemFinal, history: messagesToUse }).total;
  if (currentTotal > BUDGET_LIMIT) {
    log += `[AI Chat] CRITICAL: Fallback to Natural Minimal Mode (${currentTotal} tokens)\n`;
    systemFinal = `Kamu adalah Lemon Coach. Context sedang sangat penuh.
STRATEGI RESPON:
- Gunakan hanya pesan terbaru user sbg acuan.
- Berikan jawaban singkat & padat berdasarkan data yang terlihat saja.
- Jika data kurang, jawab jujur dan minta user menyebutkan kategori/periode spesifik.
- JANGAN mengarang data.
- Gaya: "Dari data terbaru, [jawaban]. Kalau mau cek [kategori] lebih detail, boleh sebutkan ya!"`;
  }

  const finalTotal = TokenBudgeter.analyzePromptStructure({ system: systemFinal, history: messagesToUse }).total;
  if (log) console.info(`${log}[AI Chat] FINAL: ${finalTotal} tokens (Saved ${startTokens - finalTotal})`);
  else console.info(`[AI Chat] Request within budget: ${finalTotal} tokens`);

  const modelMessages = await convertToModelMessages(messagesToUse);

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemFinal,
    messages: modelMessages,
    tools: createFinancialTools(userId, supabase),
    stopWhen: stepCountIs(5),
    temperature: 0.4,
    maxOutputTokens: 800,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: persistedMessages, isAborted }) => {
      if (sessionId && !isAborted) {
        await persistChatSession(supabase, userId, sessionId, persistedMessages);
      }
    },
  });
};
