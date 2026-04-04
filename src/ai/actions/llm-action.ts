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
  mode?: 'coach' | 'lightweight';
};

export const handleLlmChatAction = async ({
  userId,
  supabase,
  messages,
  memorySummary,
  userProfile,
  supplementalContext,
  sessionId,
  mode = 'coach',
}: HandleLlmActionParams) => {
  const MAX_HISTORY_MESSAGES = mode === 'lightweight' ? 2 : 10;
  const BUDGET_LIMIT = 4500; // DeepSeek/Gemini limits are higher, but 4.5k is a lean target

  let contextToUse = supplementalContext;
  let memoryToUse = memorySummary;
  let messagesToUse = messages.length > MAX_HISTORY_MESSAGES
    ? messages.slice(-MAX_HISTORY_MESSAGES)
    : messages;

  const getSystem = () => buildChatSystemPrompt({ memorySummary: memoryToUse, userProfile, supplementalContext: contextToUse, mode });

  // Intelligent Context Management & Telemetry
  let log = '';
  const initialBreakdown = TokenBudgeter.analyzePromptStructure({ system: getSystem(), history: messagesToUse });
  const startTokens = initialBreakdown.total;

  if (startTokens > 0) {
    log += `[AI Chat] INITIAL: ${startTokens > 1000 ? (startTokens/1000).toFixed(1) + 'k' : startTokens} tokens\n`;
  }

  // Level 5 Truncation: Smart Message Filtering (Prune small talk)
  let currentTotal = TokenBudgeter.analyzePromptStructure({ system: getSystem(), history: messagesToUse }).total;
  if (currentTotal > BUDGET_LIMIT) {
    const beforeHistory = TokenBudgeter.countTokens(JSON.stringify(messagesToUse));
    const filtered = TokenBudgeter.filterHighValueMessages(messagesToUse);
    // Keep high value or at least the last 2 messages
    messagesToUse = messagesToUse.length > 3 
      ? [...filtered, ...messagesToUse.slice(-2)].slice(-5) 
      : messagesToUse;
    
    const afterHistory = TokenBudgeter.countTokens(JSON.stringify(messagesToUse));
    log += TokenBudgeter.trackTransformation('History', beforeHistory, afterHistory);
  }

  // Level 4 Truncation: Drop History Entirely (Except current message)
  currentTotal = TokenBudgeter.analyzePromptStructure({ system: getSystem(), history: messagesToUse }).total;
  if (currentTotal > BUDGET_LIMIT && messagesToUse.length > 1) {
    const beforeHistory = TokenBudgeter.countTokens(JSON.stringify(messagesToUse));
    messagesToUse = messagesToUse.slice(-1);
    const afterHistory = TokenBudgeter.countTokens(JSON.stringify(messagesToUse));
    log += TokenBudgeter.trackTransformation('History Drop', beforeHistory, afterHistory);
  }

  // Level 3 & 2 Truncation: Strip Supplemental & Memory
  currentTotal = TokenBudgeter.analyzePromptStructure({ system: getSystem(), history: messagesToUse }).total;
  if (currentTotal > BUDGET_LIMIT && (contextToUse || memoryToUse)) {
    const beforeContext = TokenBudgeter.countTokens(JSON.stringify({ contextToUse, memoryToUse }));
    contextToUse = null; 
    memoryToUse = null;
    const afterContext = 0;
    log += TokenBudgeter.trackTransformation('Context', beforeContext, afterContext);
  }

  // Level 1: Natural Fallback Persona (Fail-safe)
  let systemFinal = getSystem();
  currentTotal = TokenBudgeter.analyzePromptStructure({ system: systemFinal, history: messagesToUse }).total;
  if (currentTotal > BUDGET_LIMIT) {
    log += `[AI Chat] CRITICAL: Fallback to Natural Minimal Mode (${currentTotal} tokens)\n`;
    systemFinal = `Kamu adalah Lemon Coach, asisten finansial cerdas.
STRATEGI RESPON:
- Saat ini data konteks sedang sangat besar (melebihi limit token).
- Berikan jawaban natural, singkat, & padat.
- Gunakan HANYA pesan terbaru user sbg acuan.
- Jika kamu tidak bisa melihat riwayat transaksi atau detail spesifik, sampaikan dengan bahasa yang bersahabat: "Untuk sekarang saya hanya bisa melihat data sekilas. Boleh sebutkan kategori atau periode yang ingin dicek lebih detail?"
- JANGAN mengarang data. Hindari pesan error teknis.
- Tawarkan bantuan untuk mengecek bagian lain secara spesifik.`;
  }

  const finalTotal = TokenBudgeter.analyzePromptStructure({ system: systemFinal, history: messagesToUse }).total;
  log += `[AI Chat] FINAL: ${finalTotal > 1000 ? (finalTotal/1000).toFixed(1) + 'k' : finalTotal} tokens (System: ${TokenBudgeter.countTokens(systemFinal)}, History: ${TokenBudgeter.countTokens(JSON.stringify(messagesToUse))})`;
  
  console.info(`\n${log}\n`);

  const modelMessages = await convertToModelMessages(messagesToUse);

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemFinal,
    messages: modelMessages,
    tools: createFinancialTools(userId, supabase),
    stopWhen: stepCountIs(2),
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
