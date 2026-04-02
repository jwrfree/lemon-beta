import { createClient } from "@/lib/supabase/server";
import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { config } from "@/lib/config";
import { extractTransaction, parseSimpleTransactionInput } from "@/ai/flows/extract-transaction-flow";
import {
  buildChatSystemPrompt,
  buildStaticChatReply,
  classifyChatIntent,
  intentNeedsUnifiedContext,
  tryBuildDeterministicChatReply,
} from "@/ai/flows/chat-flow";
import { createFinancialTools } from "@/ai/tools";
import { financialContextService } from "@/lib/services/financial-context-service";
import { normalizeTransactionTimestamp } from "@/lib/utils/transaction-timestamp";
import { formatCurrency } from "@/lib/utils";
import { categories } from "@/lib/categories";
import { createTransactionWithClient } from "@/features/transactions/services/transaction.service";

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

export const maxDuration = 30;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

const consumeRateLimit = async (
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) => {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_user_id: userId,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    p_window_ms: RATE_LIMIT_WINDOW_MS,
  });

  if (error) {
    console.error("[AI Chat] Rate limit RPC failed:", error);
    return { allowed: true as const, degraded: true as const };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { allowed: true as const, degraded: true as const };
  }

  return {
    allowed: Boolean(row.allowed) as boolean,
    resetAt: row.reset_at ? new Date(row.reset_at).getTime() : undefined,
  };
};

const getMessageText = (message?: UIMessage) =>
  message?.parts
    .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim() ?? "";

type WalletOption = {
  id: string;
  name: string;
  is_default: boolean | null;
};

const findPreferredCashWallet = (wallets: WalletOption[]) =>
  wallets.find((wallet) => ['tunai', 'dompet', 'cash', 'kas'].includes(wallet.name.trim().toLowerCase())) ||
  wallets.find((wallet) => ['tunai', 'dompet', 'cash', 'kas'].some((alias) => wallet.name.trim().toLowerCase().includes(alias))) ||
  null;

const createTextMessageResponse = (messages: UIMessage[], text: string) => {
  const textId = crypto.randomUUID();

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages: messages,
      execute: ({ writer }) => {
        writer.write({ type: "text-start", id: textId });
        writer.write({ type: "text-delta", id: textId, delta: text });
        writer.write({ type: "text-end", id: textId });
      },
    }),
  });
};

const resolveWalletId = (wallets: WalletOption[], requestedWallet?: string | null) => {
  const normalizedRequested = requestedWallet?.trim().toLowerCase();

  if (normalizedRequested) {
    const exactMatch = wallets.find((wallet) => wallet.name.trim().toLowerCase() === normalizedRequested);
    if (exactMatch) return exactMatch.id;

    const partialMatch = wallets.find((wallet) => {
      const normalizedName = wallet.name.trim().toLowerCase();
      return normalizedName.includes(normalizedRequested) || normalizedRequested.includes(normalizedName);
    });
    if (partialMatch) return partialMatch.id;
  }

  return findPreferredCashWallet(wallets)?.id ?? wallets.find((wallet) => wallet.is_default)?.id ?? wallets[0]?.id ?? null;
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Payload chat tidak valid." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await consumeRateLimit(user.id, supabase);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Terlalu banyak permintaan. Tunggu sebentar." },
        { status: 429 }
      );
    }

    if (!config.ai.deepseek.apiKey) {
      return Response.json(
        { error: "DeepSeek API key not found. Lemon Coach tidak tersedia." },
        { status: 500 }
      );
    }

    const lastUserMessage = getMessageText(
      [...messages].reverse().find((message) => message.role === "user")
    );

    if (typeof lastUserMessage === "string") {
      const intent = classifyChatIntent(lastUserMessage);
      const staticReply = buildStaticChatReply(intent);

      if (staticReply) {
        return createTextMessageResponse(messages, staticReply);
      }

      if (intent.kind === "transaction-search") {
        const matchedTransaction = await financialContextService.findLatestTransactionByQuery(
          user.id,
          intent.query,
          supabase
        );

        const specificReply = matchedTransaction
          ? `Terakhir ada transaksi yang cocok dengan **${intent.query}** pada **${new Date(matchedTransaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}**, yaitu **${matchedTransaction.description}** sebesar **${formatCurrency(matchedTransaction.amount)}**.${matchedTransaction.merchant ? ` Merchant-nya **${matchedTransaction.merchant}**.` : ''}`
          : `Saya belum menemukan transaksi yang cocok dengan **${intent.query}** di data kamu. Kalau nama merchant atau deskripsinya sedikit beda, coba sebut kata kunci lain ya.`;

        return createTextMessageResponse(messages, specificReply);
      }

      if (intent.kind === "add-transaction") {
        const [{ data: wallets, error: walletsError }, recentTransactions] = await Promise.all([
          supabase
            .from('wallets')
            .select('id,name,is_default')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: true }),
          financialContextService.getRecentTransactions(user.id, supabase, 5),
        ]);

        if (walletsError) {
          console.error('[AI Chat] Failed to load wallets for transaction capture:', walletsError);
          return createTextMessageResponse(messages, 'Saya belum bisa mencatat transaksi sekarang karena daftar dompet kamu gagal dimuat. Coba lagi sebentar.');
        }

        const availableWallets = (wallets ?? []) as WalletOption[];
        if (availableWallets.length === 0) {
          return createTextMessageResponse(messages, 'Sebelum mencatat transaksi via chat, kamu perlu punya minimal satu dompet dulu di Lemon.');
        }

        const availableCategories = [
          ...categories.expense.map((category) => category.name),
          ...categories.income.map((category) => category.name),
        ];

        const extraction = await parseSimpleTransactionInput(lastUserMessage, {
          wallets: availableWallets.map((wallet) => wallet.name),
        }) ?? await extractTransaction(lastUserMessage, {
          wallets: availableWallets.map((wallet) => wallet.name),
          categories: availableCategories,
          recentTransactions: recentTransactions.map((transaction) => ({
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            wallet: availableWallets[0].name,
            date: transaction.date,
          })),
        });

        if (extraction.clarificationQuestion) {
          return createTextMessageResponse(messages, extraction.clarificationQuestion);
        }

        if (!extraction.transactions?.length) {
          return createTextMessageResponse(messages, 'Saya belum berhasil menangkap detail transaksinya. Coba tulis seperti: `catat makan 25rb pakai BCA`.');
        }

        const savedTransactions: string[] = [];

        for (const transaction of extraction.transactions) {
          if (!transaction.amount || transaction.amount <= 0) {
            return createTextMessageResponse(messages, 'Nominal transaksinya belum jelas. Coba sebut nominalnya, misalnya `catat makan 25rb`.');
          }

          const walletId = resolveWalletId(availableWallets, transaction.wallet);
          if (!walletId) {
            return createTextMessageResponse(messages, 'Saya belum bisa menentukan dompet untuk transaksi ini. Coba sebut dompetnya, misalnya `pakai BCA` atau `pakai GoPay`.');
          }

          const result = await createTransactionWithClient(supabase, user.id, {
            type: transaction.type || 'expense',
            amount: transaction.amount,
            category: transaction.category || 'Biaya Lain-lain',
            subCategory: transaction.subCategory || '',
            date: new Date(normalizeTransactionTimestamp(transaction.date)),
            description: transaction.description || 'Transaksi Baru',
            walletId,
            location: '',
            isNeed: transaction.isNeed ?? true,
          });

          if (result.error) {
            return createTextMessageResponse(messages, 'Saya paham detail transaksinya, tapi gagal menyimpannya. Coba lagi sebentar ya.');
          }

          const walletName = availableWallets.find((wallet) => wallet.id === walletId)?.name ?? 'dompet utama';
          savedTransactions.push(`**${transaction.description || transaction.category || 'Transaksi'}** sebesar **${formatCurrency(transaction.amount)}** ke **${walletName}**`);
        }

        const addReply = savedTransactions.length === 1
          ? `Siap, transaksi berhasil dicatat: ${savedTransactions[0]}.`
          : `Siap, saya sudah mencatat ${savedTransactions.length} transaksi:\n${savedTransactions.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;

        return createTextMessageResponse(messages, addReply);
      }

      if (intent.kind === "recent-transactions") {
        const recentTransactions = await financialContextService.getRecentTransactions(user.id, supabase, 3);

        if (recentTransactions.length > 0) {
          const recentReply = [
            'Ini **3 mutasi terbaru** kamu:',
            ...recentTransactions.map((transaction, index) => {
              const date = new Date(transaction.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
              });
              const direction = transaction.type === 'income' ? 'masuk' : 'keluar';
              return `${index + 1}. **${date}**: ${transaction.description} (${direction}) **${formatCurrency(transaction.amount)}**`;
            }),
          ].join('\n');
          return createTextMessageResponse(messages, recentReply);
        }
      }

      if (intentNeedsUnifiedContext(intent)) {
        const context = await financialContextService.getUnifiedContext(user.id, supabase);

        const deterministicReply = tryBuildDeterministicChatReply(lastUserMessage, context, intent);
        if (deterministicReply) {
          return createTextMessageResponse(messages, deterministicReply);
        }
      }
    }

    // Sliding Window: Prevent token explosion by only sending the last 10 messages to the LLM
    // We don't slice the client messages array to preserve UI state, only what is sent to the model.
    const MAX_HISTORY_MESSAGES = 10;
    const windowedMessages = messages.length > MAX_HISTORY_MESSAGES 
      ? messages.slice(-MAX_HISTORY_MESSAGES) 
      : messages;

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: buildChatSystemPrompt(),
      messages: await convertToModelMessages(windowedMessages),
      tools: createFinancialTools(user.id, supabase),
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error("[AI Chat] Request failed:", error);
    return Response.json(
      { error: "Lemon Coach sedang tidak tersedia. Coba lagi sebentar." },
      { status: 500 }
    );
  }
}
