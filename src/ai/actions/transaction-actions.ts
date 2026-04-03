import type { UIMessage } from "ai";

import {
  createAssistantTextMessage,
  createTextMessageResponse,
} from "@/ai/actions/message-response";
import type { ChatIntent } from "@/ai/flows/chat-flow";
import { createTransactionMutationActions } from "@/ai/tools";
import { persistChatSession } from "@/lib/services/chat-session-service";
import { financialContextService } from "@/lib/services/financial-context-service";
import { formatCurrency } from "@/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

type TransactionActionClient = Pick<SupabaseClient, "from" | "rpc">;

type HandleTransactionSearchActionParams = {
  userId: string;
  supabase: TransactionActionClient;
  messages: UIMessage[];
  intent: Extract<ChatIntent, { kind: "transaction-search" }>;
  sessionId?: string | null;
};

export const handleTransactionSearchAction = async ({
  userId,
  supabase,
  messages,
  intent,
  sessionId,
}: HandleTransactionSearchActionParams) => {
  const matchedTransaction = await financialContextService.findLatestTransactionByQuery(
    userId,
    intent.query,
    supabase
  );

  const specificReply = matchedTransaction
    ? `Terakhir ada transaksi yang cocok dengan **${intent.query}** pada **${new Date(matchedTransaction.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}**, yaitu **${matchedTransaction.description}** sebesar **${formatCurrency(matchedTransaction.amount)}**.${matchedTransaction.merchant ? ` Merchant-nya **${matchedTransaction.merchant}**.` : ""}`
    : `Saya belum menemukan transaksi yang cocok dengan **${intent.query}** di data kamu. Kalau nama merchant atau deskripsinya sedikit beda, coba sebut kata kunci lain ya.`;

  const assistantMessage = createAssistantTextMessage(specificReply);

  if (sessionId) {
    await persistChatSession(supabase, userId, sessionId, [...messages, assistantMessage]);
  }

  return createTextMessageResponse(messages, specificReply, assistantMessage.id);
};

type HandleAddTransactionActionParams = {
  userId: string;
  supabase: TransactionActionClient;
  messages: UIMessage[];
  rawText: string;
  sessionId?: string | null;
};

export const handleAddTransactionAction = async ({
  userId,
  supabase,
  messages,
  rawText,
  sessionId,
}: HandleAddTransactionActionParams) => {
  const transactionMutations = createTransactionMutationActions(userId, supabase);
  const result = await transactionMutations.addTransaction(rawText);

  const assistantMessage = createAssistantTextMessage(result.reply);

  if (sessionId) {
    await persistChatSession(supabase, userId, sessionId, [...messages, assistantMessage]);
  }

  return createTextMessageResponse(messages, result.reply, assistantMessage.id);
};

type HandleRecentTransactionsActionParams = {
  userId: string;
  supabase: TransactionActionClient;
  messages: UIMessage[];
  sessionId?: string | null;
};

export const handleRecentTransactionsAction = async ({
  userId,
  supabase,
  messages,
  sessionId,
}: HandleRecentTransactionsActionParams): Promise<Response | null> => {
  const recentTransactions = await financialContextService.getRecentTransactions(userId, supabase, 3);

  if (recentTransactions.length === 0) {
    return null;
  }

  const recentReply = [
    "Ini **3 mutasi terbaru** kamu:",
    ...recentTransactions.map((transaction, index) => {
      const date = new Date(transaction.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
      });
      const direction = transaction.type === "income" ? "masuk" : "keluar";
      return `${index + 1}. **${date}**: ${transaction.description} (${direction}) **${formatCurrency(transaction.amount)}**`;
    }),
  ].join("\n");

  const assistantMessage = createAssistantTextMessage(recentReply);

  if (sessionId) {
    await persistChatSession(supabase, userId, sessionId, [...messages, assistantMessage]);
  }

  return createTextMessageResponse(messages, recentReply, assistantMessage.id);
};
