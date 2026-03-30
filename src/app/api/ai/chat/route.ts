import { createClient } from "@/lib/supabase/server";
import { deepseek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import { financialContextService } from "@/lib/services/financial-context-service";
import { buildChatSystemPrompt } from "@/ai/flows/chat-flow";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch contextual financial data
  const context = await financialContextService.getUnifiedContext(user.id);
  
  // Build the system prompt with the context
  const systemPrompt = context 
    ? buildChatSystemPrompt(context)
    : "Anda adalah Lemon Coach, asisten keuangan pribadi. Maaf, saya sedang tidak bisa mengakses data keuangan Anda saat ini.";

  const result = streamText({
    model: deepseek("deepseek-chat"),
    messages,
    system: systemPrompt,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
