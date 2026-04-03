import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

export const createAssistantTextMessage = (
  text: string,
  textId = crypto.randomUUID(),
): UIMessage => ({
  id: textId,
  role: "assistant",
  parts: [
    {
      type: "text",
      text,
    },
  ],
});

export const createTextMessageResponse = (
  messages: UIMessage[],
  text: string,
  textId = crypto.randomUUID(),
) => {

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

export const getMessageText = (message?: UIMessage) =>
  message?.parts
    .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim() ?? "";

export const getLastUserMessageText = (messages: UIMessage[]) =>
  getMessageText(
    [...messages].reverse().find((message) => message.role === "user")
  );
