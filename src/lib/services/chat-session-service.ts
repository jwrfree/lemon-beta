import type { UIMessage } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractChatDisplayText } from "@/ai/chat-contract";

type ChatSessionClient = Pick<SupabaseClient, "from">;

export type ChatSessionRecord = {
  session_id: string;
  user_id: string;
  messages: UIMessage[];
  memory_summary: string | null;
  created_at: string;
  updated_at: string;
};

const CHAT_SUMMARY_TRIGGER_MESSAGES = 12;
const CHAT_RECENT_MESSAGE_LIMIT = 8;
const CHAT_SESSION_SEED_LIMIT = 10;
const CHAT_MEMORY_SUMMARY_MAX_LENGTH = 2000;

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

const getMessageText = (message?: UIMessage) =>
  extractChatDisplayText(
    message?.parts
      .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim() ?? "",
  );

const summarizeOlderMessages = (previousSummary: string | null, messages: UIMessage[]) => {
  const summarizedTurns = messages
    .map((message) => {
      const text = normalizeWhitespace(getMessageText(message));
      if (!text) return null;

      const speaker = message.role === "user" ? "User" : "Assistant";
      return `${speaker}: ${truncate(text, 180)}`;
    })
    .filter((value): value is string => Boolean(value));

  if (summarizedTurns.length === 0) {
    return previousSummary;
  }

  const combinedSummary = [
    previousSummary ? `Ringkasan sebelumnya: ${normalizeWhitespace(previousSummary)}` : null,
    "Ringkasan percakapan sebelumnya:",
    ...summarizedTurns,
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");

  return truncate(combinedSummary, CHAT_MEMORY_SUMMARY_MAX_LENGTH);
};

const sanitizeStoredMessages = (messages: UIMessage[]) =>
  messages.slice(-CHAT_SESSION_SEED_LIMIT);

export const getChatSession = async (
  client: ChatSessionClient,
  userId: string,
  sessionId: string,
): Promise<ChatSessionRecord | null> => {
  const { data, error } = await client
    .from("chat_sessions")
    .select("session_id,user_id,messages,memory_summary,created_at,updated_at")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[ChatSession] Failed to load session:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    messages: Array.isArray(data.messages) ? data.messages as UIMessage[] : [],
  } as ChatSessionRecord;
};

export const persistChatSession = async (
  client: ChatSessionClient,
  userId: string,
  sessionId: string,
  messages: UIMessage[],
) => {
  const existingSession = await getChatSession(client, userId, sessionId);

  let storedMessages = messages;
  let memorySummary = existingSession?.memory_summary ?? null;

  if (messages.length > CHAT_SUMMARY_TRIGGER_MESSAGES) {
    const olderMessages = messages.slice(0, -CHAT_RECENT_MESSAGE_LIMIT);
    storedMessages = messages.slice(-CHAT_RECENT_MESSAGE_LIMIT);
    memorySummary = summarizeOlderMessages(memorySummary, olderMessages);
  }

  const sanitizedMessages = sanitizeStoredMessages(storedMessages);

  const { error } = await client
    .from("chat_sessions")
    .upsert({
      session_id: sessionId,
      user_id: userId,
      messages: sanitizedMessages,
      memory_summary: memorySummary,
    });

  if (error) {
    console.error("[ChatSession] Failed to persist session:", error);
  }
};

export const clearChatSession = async (
  client: ChatSessionClient,
  userId: string,
  sessionId: string,
) => {
  const { error } = await client
    .from("chat_sessions")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("[ChatSession] Failed to clear session:", error);
  }
};
