import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse, type Message } from "ai";
import { financialContextService } from "@/lib/services/financial-context-service";
import { buildChatSystemPrompt } from "@/ai/flows/chat-flow";

export const maxDuration = 30;

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const toProviderMessages = (messages: Message[], systemPrompt: string) => {
  const normalizedMessages = messages
    .filter(
      message =>
        (message.role === "user" || message.role === "assistant" || message.role === "system") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    )
    .map(message => ({
      role: message.role,
      content: message.content,
    }));

  return [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    ...normalizedMessages,
  ];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages.slice(-12) as Message[]) : null;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "Payload chat tidak valid." }, { status: 400 });
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

    const context = await financialContextService.getUnifiedContext(user.id, supabase);
    const systemPrompt = context
      ? buildChatSystemPrompt(context)
      : "Anda adalah Lemon Coach, asisten keuangan pribadi. Maaf, saya sedang tidak bisa mengakses data keuangan Anda saat ini.";

    const response = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages: toProviderMessages(messages, systemPrompt),
      stream: true,
      temperature: 0.7,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("[AI Chat] Request failed:", error);
    return Response.json(
      { error: "Lemon Coach sedang tidak tersedia. Coba lagi sebentar." },
      { status: 500 }
    );
  }
}
