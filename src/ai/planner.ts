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
};

export const executeChatPlanner = async ({
  userId,
  supabase,
  messages,
}: ExecuteChatPlannerParams) => {
  const lastUserMessage = getLastUserMessageText(messages);

  if (typeof lastUserMessage !== "string") {
    return handleLlmChatAction({ userId, supabase, messages });
  }

  const decision = routeChatIntent(lastUserMessage);

  switch (decision.kind) {
    case "static-reply":
      return handleStaticReplyAction({ messages, reply: decision.reply });
    case "transaction-search":
      return handleTransactionSearchAction({ userId, supabase, messages, intent: decision.intent });
    case "transaction-add":
      return handleAddTransactionAction({ userId, supabase, messages, rawText: lastUserMessage });
    case "recent-transactions": {
      const response = await handleRecentTransactionsAction({ userId, supabase, messages });
      return response ?? handleLlmChatAction({ userId, supabase, messages });
    }
    case "deterministic-context": {
      const response = await handleDeterministicContextAction({
        userId,
        supabase,
        messages,
        question: lastUserMessage,
        intent: decision.intent,
      });
      return response ?? handleLlmChatAction({ userId, supabase, messages });
    }
    case "llm":
    default:
      return handleLlmChatAction({ userId, supabase, messages });
  }
};
