import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { createFinancialTools } from "@/ai/tools";
import { buildChatSystemPrompt } from "@/ai/flows/chat-flow";
import { config } from "@/lib/config";
import type { SupabaseClient } from "@supabase/supabase-js";

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

type LlmActionClient = Pick<SupabaseClient, "from" | "rpc">;

type HandleLlmActionParams = {
  userId: string;
  supabase: LlmActionClient;
  messages: UIMessage[];
};

export const handleLlmChatAction = async ({
  userId,
  supabase,
  messages,
}: HandleLlmActionParams) => {
  const MAX_HISTORY_MESSAGES = 10;
  const windowedMessages = messages.length > MAX_HISTORY_MESSAGES
    ? messages.slice(-MAX_HISTORY_MESSAGES)
    : messages;

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: buildChatSystemPrompt(),
    messages: await convertToModelMessages(windowedMessages),
    tools: createFinancialTools(userId, supabase),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
};
