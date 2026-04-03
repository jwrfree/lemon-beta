import { createClient } from "@/lib/supabase/server";
import {
  clearChatSession,
  getChatSession,
} from "@/lib/services/chat-session-service";

const getSessionId = (request: Request) =>
  new URL(request.url).searchParams.get("sessionId");

export async function GET(request: Request) {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return Response.json({ error: "sessionId wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getChatSession(supabase, user.id, sessionId);

  return Response.json({
    sessionId,
    messages: session?.messages ?? [],
    memorySummary: session?.memory_summary ?? null,
  });
}

export async function DELETE(request: Request) {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return Response.json({ error: "sessionId wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearChatSession(supabase, user.id, sessionId);

  return Response.json({ success: true });
}
