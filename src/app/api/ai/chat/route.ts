import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { StreamingTextResponse, type Message } from "ai";
import { financialContextService } from "@/lib/services/financial-context-service";
import { buildChatContextMessage, buildChatSystemPrompt, tryBuildDeterministicChatReply } from "@/ai/flows/chat-flow";

export const maxDuration = 30;

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 800;
const MAX_TOTAL_CHARS = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const ALLOWED_CLIENT_ROLES = new Set(["user", "assistant"]);
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

type NormalizedChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const stripControlChars = (value: string) =>
  Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");

const sanitizeAssistantText = (value: string) =>
  stripControlChars(value)
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/^[ \t]*#{1,6}\s*/gm, "")
    .replace(/[ \t]+\n/g, "\n");

const createStaticTextStream = (content: string) =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(sanitizeAssistantText(content)));
      controller.close();
    },
  });

const sanitizeTextStream = (stream: ReadableStream<Uint8Array>) => {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return stream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        if (text) {
          controller.enqueue(encoder.encode(sanitizeAssistantText(text)));
        }
      },
      flush(controller) {
        const tail = decoder.decode();
        if (tail) {
          controller.enqueue(encoder.encode(sanitizeAssistantText(tail)));
        }
      },
    })
  );
};

const createCompletionTextStream = (
  response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
) =>
  new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const chunk of response) {
          const text = chunk.choices
            .map((choice) => choice.delta?.content ?? "")
            .join("");

          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (error) {
        controller.error(error);
        return;
      }

      controller.close();
    },
  });

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const pruneRateLimitStore = (now: number) => {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
};

const consumeRateLimit = (userId: string) => {
  const now = Date.now();
  pruneRateLimitStore(now);
  const existing = rateLimitStore.get(userId);

  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(userId, next);
    return { allowed: true as const, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: next.resetAt };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false as const, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateLimitStore.set(userId, existing);
  return {
    allowed: true as const,
    remaining: RATE_LIMIT_MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
  };
};

const normalizeClientMessages = (messages: Message[]): NormalizedChatMessage[] => {
  const trimmedMessages = messages.slice(-MAX_MESSAGES);
  let totalChars = 0;

  const normalizedMessages = trimmedMessages.map(message => {
    if (!ALLOWED_CLIENT_ROLES.has(message.role)) {
      throw new Error(`Peran pesan tidak diizinkan: ${message.role}`);
    }

    if (typeof message.content !== "string") {
      throw new Error("Isi pesan harus berupa teks.");
    }

    const content = stripControlChars(message.content).replace(/\s+/g, " ").trim();
    if (!content) {
      throw new Error("Isi pesan tidak boleh kosong.");
    }

    if (content.length > MAX_MESSAGE_CHARS) {
      throw new Error(`Panjang satu pesan melebihi batas ${MAX_MESSAGE_CHARS} karakter.`);
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      throw new Error(`Total percakapan melebihi batas ${MAX_TOTAL_CHARS} karakter.`);
    }

    return {
      role: message.role as NormalizedChatMessage["role"],
      content,
    };
  });

  const lastMessage = normalizedMessages.at(-1);
  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("Pesan terakhir harus berasal dari user.");
  }

  return normalizedMessages;
};

const toProviderMessages = (
  messages: Message[],
  systemPrompt: string,
  contextMessage: string | null
) : OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const normalizedMessages = normalizeClientMessages(messages);

  return [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    ...(contextMessage
      ? [
          {
            role: "assistant" as const,
            content: contextMessage,
          },
        ]
      : []),
    ...normalizedMessages,
  ];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as Message[]) : null;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "Payload chat tidak valid." }, { status: 400 });
    }

    try {
      normalizeClientMessages(messages);
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Payload chat ditolak." },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json({ error: "DeepSeek belum dikonfigurasi." }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authError) {
      console.error("[AI Chat] Failed to validate session:", authError);
      return Response.json({ error: "Gagal memvalidasi sesi." }, { status: 500 });
    }

    const rateLimit = consumeRateLimit(user.id);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
          },
        }
      );
    }

    const context = await financialContextService.getUnifiedContext(user.id, supabase);
    const lastUserMessage = messages.at(-1)?.content;

    if (typeof lastUserMessage === "string") {
      const deterministicReply = tryBuildDeterministicChatReply(lastUserMessage, context);

      if (deterministicReply) {
        return new StreamingTextResponse(createStaticTextStream(deterministicReply));
      }
    }

    const systemPrompt = buildChatSystemPrompt();
    const contextMessage = context
      ? buildChatContextMessage(context)
      : "Konteks finansial user sedang tidak tersedia. Jika pertanyaan membutuhkan data spesifik user, katakan akses data sedang tidak tersedia.";

    const response = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages: toProviderMessages(messages, systemPrompt, contextMessage),
      stream: true,
      temperature: 0.7,
    });

    const stream = createCompletionTextStream(response);
    return new StreamingTextResponse(sanitizeTextStream(stream));
  } catch (error) {
    console.error("[AI Chat] Request failed:", error);
    return Response.json(
      { error: "Lemon Coach sedang tidak tersedia. Coba lagi sebentar." },
      { status: 500 }
    );
  }
}
