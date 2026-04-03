import type { UIMessage } from "ai";

import {
  createAssistantTextMessage,
  createTextMessageResponse,
} from "@/ai/actions/message-response";
import { type ChatIntent, tryBuildDeterministicChatReply } from "@/ai/flows/chat-flow";
import { persistChatSession } from "@/lib/services/chat-session-service";
import { financialContextService } from "@/lib/services/financial-context-service";
import type { SupabaseClient } from "@supabase/supabase-js";

type DeterministicActionClient = Pick<SupabaseClient, "from" | "rpc">;

type HandleDeterministicActionParams = {
  userId: string;
  supabase: DeterministicActionClient;
  messages: UIMessage[];
  question: string;
  intent: ChatIntent;
  sessionId?: string | null;
};

export const handleDeterministicContextAction = async ({
  userId,
  supabase,
  messages,
  question,
  intent,
  sessionId,
}: HandleDeterministicActionParams): Promise<Response | null> => {
  const context = await financialContextService.getUnifiedContext(userId, supabase);
  const deterministicReply = tryBuildDeterministicChatReply(question, context, intent);

  if (!deterministicReply) {
    return null;
  }

  const assistantMessage = createAssistantTextMessage(deterministicReply);

  if (sessionId) {
    await persistChatSession(supabase, userId, sessionId, [...messages, assistantMessage]);
  }

  return createTextMessageResponse(messages, deterministicReply, assistantMessage.id);
};
