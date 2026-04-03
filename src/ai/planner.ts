import type { UIMessage } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getLastUserMessageText } from "@/ai/actions/message-response";
import { handleDeterministicContextAction } from "@/ai/actions/deterministic-actions";
import { handleLlmChatAction } from "@/ai/actions/llm-action";
import { handleStaticReplyAction } from "@/ai/actions/static-actions";
import {
  handleAddTransactionAction,
  handleRecentTransactionsAction,
  handleTransactionSearchAction,
} from "@/ai/actions/transaction-actions";
import { routeChatIntent } from "@/ai/router";

type ChatPlannerClient = Pick<SupabaseClient, "from" | "rpc">;

type ExecuteChatPlannerParams = {
  userId: string;
  supabase: ChatPlannerClient;
  messages: UIMessage[];
  memorySummary?: string | null;
  sessionId?: string | null;
};

export const executeChatPlanner = async ({
  userId,
  supabase,
  messages,
  memorySummary,
  sessionId,
}: ExecuteChatPlannerParams) => {
  const lastUserMessage = getLastUserMessageText(messages);

  if (typeof lastUserMessage !== "string") {
    return handleLlmChatAction({ userId, supabase, messages, memorySummary, sessionId });
  }

  const decision = routeChatIntent(lastUserMessage);

  switch (decision.kind) {
    case "static-reply":
      return handleStaticReplyAction({ userId, supabase, messages, reply: decision.reply, sessionId });
    case "transaction-search":
      return handleTransactionSearchAction({ userId, supabase, messages, intent: decision.intent, sessionId });
    case "transaction-add":
      return handleAddTransactionAction({ userId, supabase, messages, rawText: lastUserMessage, sessionId });
    case "recent-transactions": {
      const response = await handleRecentTransactionsAction({ userId, supabase, messages, sessionId });
      return response ?? handleLlmChatAction({ userId, supabase, messages, memorySummary, sessionId });
    }
    case "deterministic-context": {
      const response = await handleDeterministicContextAction({
        userId,
        supabase,
        messages,
        question: lastUserMessage,
        intent: decision.intent,
        sessionId,
      });
      return response ?? handleLlmChatAction({ userId, supabase, messages, memorySummary, sessionId });
    }
    case "llm":
    default:
      return handleLlmChatAction({ userId, supabase, messages, memorySummary, sessionId });
  }
};
