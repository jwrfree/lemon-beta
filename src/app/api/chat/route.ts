import { createClient } from "@/lib/supabase/server";
import { type UIMessage } from "ai";
import { config } from "@/lib/config";
import { executeChatPlanner } from "@/ai/planner";
import { getChatSession } from "@/lib/services/chat-session-service";
import { getUserFinancialProfile } from "@/lib/services/user-financial-profile-service";

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

export async function POST(req: Request) {
  try {
    const {
      messages,
      sessionId,
    }: {
      messages: UIMessage[];
      sessionId?: string;
    } = await req.json();
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

    const [chatSession, userProfile] = await Promise.all([
      sessionId
        ? getChatSession(supabase, user.id, sessionId)
        : Promise.resolve(null),
      getUserFinancialProfile(supabase, user.id),
    ]);

    return executeChatPlanner({
      userId: user.id,
      supabase,
      messages,
      memorySummary: chatSession?.memory_summary ?? null,
      userProfile: userProfile
        ? {
          spending_patterns: userProfile.spending_patterns,
          coaching_notes: userProfile.coaching_notes,
        }
        : null,
      sessionId: sessionId ?? null,
    });
  } catch (error: unknown) {
    console.error("[AI Chat] Request failed:", error);
    return Response.json(
      { error: "Lemon Coach sedang tidak tersedia. Coba lagi sebentar." },
      { status: 500 }
    );
  }
}
