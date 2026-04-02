import type { UIMessage } from "ai";

import { createTextMessageResponse } from "@/ai/actions/message-response";
import { extractTransaction, parseSimpleTransactionInput } from "@/ai/flows/extract-transaction-flow";
import type { ChatIntent } from "@/ai/flows/chat-flow";
import { categories } from "@/lib/categories";
import { financialContextService } from "@/lib/services/financial-context-service";
import { formatCurrency } from "@/lib/utils";
import { normalizeTransactionTimestamp } from "@/lib/utils/transaction-timestamp";
import { createTransactionWithClient } from "@/features/transactions/services/transaction.service";
import type { SupabaseClient } from "@supabase/supabase-js";

type TransactionActionClient = Pick<SupabaseClient, "from" | "rpc">;

type WalletOption = {
  id: string;
  name: string;
  is_default: boolean | null;
};

const findPreferredCashWallet = (wallets: WalletOption[]) =>
  wallets.find((wallet) => ["tunai", "dompet", "cash", "kas"].includes(wallet.name.trim().toLowerCase())) ||
  wallets.find((wallet) => ["tunai", "dompet", "cash", "kas"].some((alias) => wallet.name.trim().toLowerCase().includes(alias))) ||
  null;

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

type HandleTransactionSearchActionParams = {
  userId: string;
  supabase: TransactionActionClient;
  messages: UIMessage[];
  intent: Extract<ChatIntent, { kind: "transaction-search" }>;
};

export const handleTransactionSearchAction = async ({
  userId,
  supabase,
  messages,
  intent,
}: HandleTransactionSearchActionParams) => {
  const matchedTransaction = await financialContextService.findLatestTransactionByQuery(
    userId,
    intent.query,
    supabase
  );

  const specificReply = matchedTransaction
    ? `Terakhir ada transaksi yang cocok dengan **${intent.query}** pada **${new Date(matchedTransaction.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}**, yaitu **${matchedTransaction.description}** sebesar **${formatCurrency(matchedTransaction.amount)}**.${matchedTransaction.merchant ? ` Merchant-nya **${matchedTransaction.merchant}**.` : ""}`
    : `Saya belum menemukan transaksi yang cocok dengan **${intent.query}** di data kamu. Kalau nama merchant atau deskripsinya sedikit beda, coba sebut kata kunci lain ya.`;

  return createTextMessageResponse(messages, specificReply);
};

type HandleAddTransactionActionParams = {
  userId: string;
  supabase: TransactionActionClient;
  messages: UIMessage[];
  rawText: string;
};

export const handleAddTransactionAction = async ({
  userId,
  supabase,
  messages,
  rawText,
}: HandleAddTransactionActionParams) => {
  const [{ data: wallets, error: walletsError }, recentTransactions] = await Promise.all([
    supabase
      .from("wallets")
      .select("id,name,is_default")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
    financialContextService.getRecentTransactions(userId, supabase, 5),
  ]);

  if (walletsError) {
    console.error("[AI Chat] Failed to load wallets for transaction capture:", walletsError);
    return createTextMessageResponse(messages, "Saya belum bisa mencatat transaksi sekarang karena daftar dompet kamu gagal dimuat. Coba lagi sebentar.");
  }

  const availableWallets = (wallets ?? []) as WalletOption[];
  if (availableWallets.length === 0) {
    return createTextMessageResponse(messages, "Sebelum mencatat transaksi via chat, kamu perlu punya minimal satu dompet dulu di Lemon.");
  }

  const availableCategories = [
    ...categories.expense.map((category) => category.name),
    ...categories.income.map((category) => category.name),
  ];

  const extraction = await parseSimpleTransactionInput(rawText, {
    wallets: availableWallets.map((wallet) => wallet.name),
  }) ?? await extractTransaction(rawText, {
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
    return createTextMessageResponse(messages, "Saya belum berhasil menangkap detail transaksinya. Coba tulis seperti: `catat makan 25rb pakai BCA`.");
  }

  const savedTransactions: string[] = [];

  for (const transaction of extraction.transactions) {
    if (!transaction.amount || transaction.amount <= 0) {
      return createTextMessageResponse(messages, "Nominal transaksinya belum jelas. Coba sebut nominalnya, misalnya `catat makan 25rb`.");
    }

    const walletId = resolveWalletId(availableWallets, transaction.wallet);
    if (!walletId) {
      return createTextMessageResponse(messages, "Saya belum bisa menentukan dompet untuk transaksi ini. Coba sebut dompetnya, misalnya `pakai BCA` atau `pakai GoPay`.");
    }

    const result = await createTransactionWithClient(supabase, userId, {
      type: transaction.type || "expense",
      amount: transaction.amount,
      category: transaction.category || "Biaya Lain-lain",
      subCategory: transaction.subCategory || "",
      date: new Date(normalizeTransactionTimestamp(transaction.date)),
      description: transaction.description || "Transaksi Baru",
      walletId,
      location: "",
      isNeed: transaction.isNeed ?? true,
    });

    if (result.error) {
      return createTextMessageResponse(messages, "Saya paham detail transaksinya, tapi gagal menyimpannya. Coba lagi sebentar ya.");
    }

    const walletName = availableWallets.find((wallet) => wallet.id === walletId)?.name ?? "dompet utama";
    savedTransactions.push(`**${transaction.description || transaction.category || "Transaksi"}** sebesar **${formatCurrency(transaction.amount)}** ke **${walletName}**`);
  }

  const addReply = savedTransactions.length === 1
    ? `Siap, transaksi berhasil dicatat: ${savedTransactions[0]}.`
    : `Siap, saya sudah mencatat ${savedTransactions.length} transaksi:\n${savedTransactions.map((item, index) => `${index + 1}. ${item}`).join("\n")}`;

  return createTextMessageResponse(messages, addReply);
};

type HandleRecentTransactionsActionParams = {
  userId: string;
  supabase: TransactionActionClient;
  messages: UIMessage[];
};

export const handleRecentTransactionsAction = async ({
  userId,
  supabase,
  messages,
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

  return createTextMessageResponse(messages, recentReply);
};
