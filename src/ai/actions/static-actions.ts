import type { UIMessage } from "ai";

import {
  createAssistantTextMessage,
  createTextMessageResponse,
} from "@/ai/actions/message-response";
import { persistChatSession } from "@/lib/services/chat-session-service";
import type { SupabaseClient } from "@supabase/supabase-js";

type StaticReplyClient = Pick<SupabaseClient, "from">;
type HandleStaticReplyActionParams = {
  userId: string;
  supabase: StaticReplyClient;
  messages: UIMessage[];
  reply: string;
  sessionId?: string | null;
};

export const handleStaticReplyAction = async ({
  userId,
  supabase,
  messages,
  reply,
  sessionId,
}: HandleStaticReplyActionParams) => {
  const assistantMessage = createAssistantTextMessage(reply);

  if (sessionId) {
    await persistChatSession(supabase, userId, sessionId, [...messages, assistantMessage]);
  }

  return createTextMessageResponse(messages, reply, assistantMessage.id);
};
