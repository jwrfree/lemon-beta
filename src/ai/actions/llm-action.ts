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
  const windowedMessages = messages.length > MAX_HISTORY_MESSAGES
    ? messages.slice(-MAX_HISTORY_MESSAGES)
    : messages;

  const systemPrompt = buildChatSystemPrompt({ memorySummary, userProfile, supplementalContext });
  const modelMessages = await convertToModelMessages(windowedMessages);
  
  // Basic budgeting & Telemetry
  const systemTokens = TokenBudgeter.countTokens(systemPrompt);
  const messageTokens = TokenBudgeter.countTokens(JSON.stringify(modelMessages));
  console.info(`[AI Chat] Request Budget: ${systemTokens + messageTokens} tokens (System: ${systemTokens}, History: ${messageTokens})`);

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt,
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
