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
import {
  buildChatSystemPrompt,
  buildStaticChatReply,
  classifyChatIntent,
  intentNeedsUnifiedContext,
  tryBuildDeterministicChatReply,
} from "@/ai/flows/chat-flow";
import { createFinancialTools } from "@/ai/tools";
import { financialContextService } from "@/lib/services/financial-context-service";
import { formatCurrency } from "@/lib/utils";

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
