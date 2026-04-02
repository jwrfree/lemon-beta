import {
  buildStaticChatReply,
  classifyChatIntent,
  intentNeedsUnifiedContext,
  type ChatIntent,
} from "@/ai/flows/chat-flow";

export type ChatRouteDecision =
  | { kind: "static-reply"; intent: ChatIntent; reply: string }
  | { kind: "transaction-search"; intent: Extract<ChatIntent, { kind: "transaction-search" }> }
  | { kind: "transaction-add"; intent: Extract<ChatIntent, { kind: "add-transaction" }> }
  | { kind: "recent-transactions"; intent: Extract<ChatIntent, { kind: "recent-transactions" }> }
  | { kind: "deterministic-context"; intent: ChatIntent }
  | { kind: "llm"; intent: ChatIntent };

export const routeChatIntent = (question: string): ChatRouteDecision => {
  const intent = classifyChatIntent(question);
  const staticReply = buildStaticChatReply(intent);

  if (staticReply) {
    return {
      kind: "static-reply",
      intent,
      reply: staticReply,
    };
  }

  switch (intent.kind) {
    case "transaction-search":
      return { kind: "transaction-search", intent };
    case "add-transaction":
      return { kind: "transaction-add", intent };
    case "recent-transactions":
      return { kind: "recent-transactions", intent };
    default:
      break;
  }

  if (intentNeedsUnifiedContext(intent)) {
    return { kind: "deterministic-context", intent };
  }

  return { kind: "llm", intent };
};
