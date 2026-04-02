import type { UIMessage } from "ai";

import { createTextMessageResponse } from "@/ai/actions/message-response";
import { type ChatIntent, tryBuildDeterministicChatReply } from "@/ai/flows/chat-flow";
import { financialContextService } from "@/lib/services/financial-context-service";
import type { SupabaseClient } from "@supabase/supabase-js";

type DeterministicActionClient = Pick<SupabaseClient, "from" | "rpc">;

type HandleDeterministicActionParams = {
  userId: string;
  supabase: DeterministicActionClient;
  messages: UIMessage[];
  question: string;
  intent: ChatIntent;
};

export const handleDeterministicContextAction = async ({
  userId,
  supabase,
  messages,
  question,
  intent,
}: HandleDeterministicActionParams): Promise<Response | null> => {
  const context = await financialContextService.getUnifiedContext(userId, supabase);
  const deterministicReply = tryBuildDeterministicChatReply(question, context, intent);

  if (!deterministicReply) {
    return null;
  }

  return createTextMessageResponse(messages, deterministicReply);
};
