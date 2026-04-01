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

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

export const maxDuration = 30;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const consumeRateLimit = (userId: string) => {
  const now = Date.now();
  const existing = rateLimitStore.get(userId);

  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(userId, next);
    return { allowed: true as const };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false as const, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateLimitStore.set(userId, existing);
  return { allowed: true as const };
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
    console.log('[AI Chat] Received request:', messages?.length || 0, 'messages');
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Payload chat tidak valid." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = consumeRateLimit(user.id);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Terlalu banyak permintaan. Tunggu sebentar." },
        { status: 429 }
      );
    }

    const lastUserMessage = getMessageText(
      [...messages].reverse().find((message) => message.role === "user")
    );

    if (typeof lastUserMessage === "string") {
      const intent = classifyChatIntent(lastUserMessage);
      const staticReply = buildStaticChatReply(intent);

      if (staticReply) {
        console.log('[AI Chat] Returning static reply directly for intent:', intent.kind);
        return createTextMessageResponse(messages, staticReply);
      }

      if (intent.kind === "transaction-search") {
        console.log('[AI Chat] Checking specific transaction query for:', intent.query);
        const matchedTransaction = await financialContextService.findLatestTransactionByQuery(
          user.id,
          intent.query,
          supabase
        );

        const specificReply = matchedTransaction
          ? `Terakhir ada transaksi yang cocok dengan **${intent.query}** pada **${new Date(matchedTransaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}**, yaitu **${matchedTransaction.description}** sebesar **${formatCurrency(matchedTransaction.amount)}**.${matchedTransaction.merchant ? ` Merchant-nya **${matchedTransaction.merchant}**.` : ''}`
          : `Saya belum menemukan transaksi yang cocok dengan **${intent.query}** di data kamu. Kalau nama merchant atau deskripsinya sedikit beda, coba sebut kata kunci lain ya.`;

        console.log('[AI Chat] Returning specific transaction reply directly.');
        return createTextMessageResponse(messages, specificReply);
      }

      if (intent.kind === "add-transaction") {
        console.log('[AI Chat] Parsing transaction capture request.');

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

          const { error: createError } = await supabase.rpc('create_transaction_v1', {
            p_user_id: user.id,
            p_wallet_id: walletId,
            p_amount: transaction.amount,
            p_category: transaction.category || 'Biaya Lain-lain',
            p_sub_category: transaction.subCategory || null,
            p_date: normalizeTransactionTimestamp(transaction.date),
            p_description: transaction.description || 'Transaksi Baru',
            p_type: transaction.type || 'expense',
            p_is_need: transaction.isNeed ?? true,
          });

          if (createError) {
            console.error('[AI Chat] Failed to create transaction from chat:', createError);
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
        console.log('[AI Chat] Fetching recent transactions directly.');
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
        
        console.log('[AI Chat] No recent transactions found directly, falling back to LLM for smarter response.');
      }

      if (intentNeedsUnifiedContext(intent)) {
        console.log('[AI Chat] Fetching unified context for deterministic intent:', intent.kind);
        const startContext = Date.now();
        const context = await financialContextService.getUnifiedContext(user.id, supabase);
        console.log('[AI Chat] Context fetched in', Date.now() - startContext, 'ms');

        const deterministicReply = tryBuildDeterministicChatReply(lastUserMessage, context, intent);
        if (deterministicReply) {
          console.log('[AI Chat] Returning deterministic reply directly.');
          return createTextMessageResponse(messages, deterministicReply);
        }
      }
    }

    console.log('[AI Chat] Proceeding to standard streamText...');

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: buildChatSystemPrompt(),
      messages: await convertToModelMessages(messages),
      tools: createFinancialTools(user.id, supabase),
      stopWhen: stepCountIs(5),
      onFinish: ({ usage }) => {
        console.log('[AI Chat] Token Usage:', usage);
      }
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
