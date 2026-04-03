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
import type { ChatUserFinancialProfile } from "@/ai/flows/chat-flow";
import { financialContextService } from "@/lib/services/financial-context-service";
import { routeChatIntent } from "@/ai/router";

type ChatPlannerClient = Pick<SupabaseClient, "from" | "rpc">;

type ExecuteChatPlannerParams = {
  userId: string;
  supabase: ChatPlannerClient;
  messages: UIMessage[];
  memorySummary?: string | null;
  userProfile?: ChatUserFinancialProfile | null;
  sessionId?: string | null;
};

const normalizePlannerQuestion = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasAnyKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

const isGoalQuestion = (question: string) => {
  const normalized = normalizePlannerQuestion(question);
  return hasAnyKeyword(normalized, [
    "goal",
    "target",
    "tabungan",
    "nabung",
    "tujuan",
    "mimpi",
    "progress goal",
    "progres goal",
  ]);
};

const loadBudgetSupportContext = async (userId: string, supabase: ChatPlannerClient) => {
  const context = await financialContextService.getUnifiedContext(userId, supabase);
  if (!context) {
    return null;
  }

  return {
    budgets: context.budgets,
    risk: context.risk,
    goals: context.goals,
    monthly: context.monthly,
    instruction:
      "Gunakan budgets sebagai konteks utama, lalu kaitkan dengan risk score dan progres goal aktif sebelum menyusun jawaban.",
  };
};

const loadGoalSupportContext = async (userId: string, supabase: ChatPlannerClient) => {
  const context = await financialContextService.getUnifiedContext(userId, supabase);
  if (!context) {
    return null;
  }

  return {
    goals: context.goals,
    budgets: context.budgets,
    risk: context.risk,
    monthly: context.monthly,
    instruction:
      "Jawab progres goal dengan dukungan budget health dan risk score agar saran tetap realistis terhadap arus kas user.",
  };
};

export const executeChatPlanner = async ({
  userId,
  supabase,
  messages,
  memorySummary,
  userProfile,
  sessionId,
}: ExecuteChatPlannerParams) => {
  const lastUserMessage = getLastUserMessageText(messages);

  if (typeof lastUserMessage !== "string") {
    return handleLlmChatAction({ userId, supabase, messages, memorySummary, userProfile, sessionId });
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
      return response ?? handleLlmChatAction({ userId, supabase, messages, memorySummary, userProfile, sessionId });
    }
    case "llm-anomaly": {
      const anomalies = await financialContextService.getSpendingAnomalies(userId, supabase);
      return handleLlmChatAction({
        userId,
        supabase,
        messages,
        memorySummary,
        userProfile,
        supplementalContext: {
          anomaly_review: {
            anomalies,
            instruction: "Fokuskan jawaban pada anomali, level severity, angka referensi, dan tindak lanjut yang bisa dilakukan hari ini.",
          },
        },
        sessionId,
      });
    }
    case "deterministic-context": {
      if (decision.intent.kind === "budget-risk") {
        const budgetReview = await loadBudgetSupportContext(userId, supabase);
        return handleLlmChatAction({
          userId,
          supabase,
          messages,
          memorySummary,
          userProfile,
          supplementalContext: budgetReview
            ? { budget_review: budgetReview }
            : undefined,
          sessionId,
        });
      }

      const response = await handleDeterministicContextAction({
        userId,
        supabase,
        messages,
        question: lastUserMessage,
        intent: decision.intent,
        sessionId,
      });
      return response ?? handleLlmChatAction({ userId, supabase, messages, memorySummary, userProfile, sessionId });
    }
    case "llm":
    default:
      if (isGoalQuestion(lastUserMessage)) {
        const goalReview = await loadGoalSupportContext(userId, supabase);
        return handleLlmChatAction({
          userId,
          supabase,
          messages,
          memorySummary,
          userProfile,
          supplementalContext: goalReview
            ? { goal_review: goalReview }
            : undefined,
          sessionId,
        });
      }

      return handleLlmChatAction({ userId, supabase, messages, memorySummary, userProfile, sessionId });
  }
};
