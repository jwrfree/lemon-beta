import type { UIMessage } from "ai";

import { createTextMessageResponse } from "@/ai/actions/message-response";

type HandleStaticReplyActionParams = {
  messages: UIMessage[];
  reply: string;
};

export const handleStaticReplyAction = ({
  messages,
  reply,
}: HandleStaticReplyActionParams) => createTextMessageResponse(messages, reply);
