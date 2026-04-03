import { z } from 'zod';

export const RichComponentTypeSchema = z.enum([
  'BudgetStatus',
  'WealthSummary',
  'RecentTransactions',
  'ScenarioSimulation',
  'SubscriptionAnalysis',
  'FinancialHealth',
]);

export const RichComponentSchema = z.object({
  type: RichComponentTypeSchema,
  data: z.unknown().optional(),
});

export const AppActionSchema = z.object({
  type: z.enum(['navigate', 'open_form', 'highlight']),
  target: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

export const ChatResponseSchema = z.object({
  text: z.string(),
  components: z.array(RichComponentSchema).optional(),
  actions: z.array(AppActionSchema).optional(),
  suggestions: z.array(z.string().min(1)).optional(),
});

export type RichComponent = z.infer<typeof RichComponentSchema>;
export type AppAction = z.infer<typeof AppActionSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

const RESPONSE_BLOCK_REGEX = /<response>([\s\S]*?)<\/response>/i;

const dedupeStrings = (values: string[]) => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const dedupeObjects = <T>(values: T[]) => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const parseRichMessageParts = (text: string): string[] => {
  if (!text) return [];

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const matchIndex = remaining.indexOf('[RENDER_COMPONENT:');
    if (matchIndex === -1) {
      parts.push(remaining);
      break;
    }

    if (matchIndex > 0) {
      parts.push(remaining.substring(0, matchIndex));
    }

    const tagStart = matchIndex;
    let tagEnd = -1;
    let bracketCount = 0;

    for (let i = tagStart; i < remaining.length; i += 1) {
      if (remaining[i] === '[') bracketCount += 1;
      else if (remaining[i] === ']') {
        bracketCount -= 1;
        if (bracketCount === 0) {
          tagEnd = i;
          break;
        }
      }
    }

    if (tagEnd !== -1) {
      parts.push(remaining.substring(tagStart, tagEnd + 1));
      remaining = remaining.substring(tagEnd + 1);
    } else {
      parts.push(remaining.substring(tagStart));
      break;
    }
  }

  return parts;
};

export const extractLegacyRichComponents = (text: string): RichComponent[] => {
  return parseRichMessageParts(text)
    .flatMap((part) => {
      if (!part.startsWith('[RENDER_COMPONENT:') || !part.endsWith(']')) {
        return [];
      }

      const content = part.substring(18, part.length - 1);
      const separatorIdx = content.indexOf('|');
      const componentType = separatorIdx !== -1 ? content.substring(0, separatorIdx) : content;
      const componentDataRaw = separatorIdx !== -1 ? content.substring(separatorIdx + 1) : null;
      const parsedType = RichComponentTypeSchema.safeParse(componentType);

      if (!parsedType.success) {
        return [];
      }

      let data: unknown = undefined;
      if (componentDataRaw) {
        try {
          data = JSON.parse(componentDataRaw);
        } catch {
          data = undefined;
        }
      }

      return [{ type: parsedType.data, data }];
    });
};

export const extractLegacySuggestions = (text: string): string[] => {
  const suggestions: string[] = [];
  const dynamicRegex = /\[SUGGESTION:([^\]]+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = dynamicRegex.exec(text)) !== null) {
    if (match[1]?.trim()) {
      suggestions.push(match[1].trim());
    }
  }

  return dedupeStrings(suggestions);
};

export const stripLegacyControlTags = (text: string) => {
  if (!text) return '';

  const cleanParts = parseRichMessageParts(text)
    .map((part) => {
      if (part.startsWith('[RENDER_COMPONENT:') && part.endsWith(']')) {
        return '';
      }

      return part.replace(/\[SUGGESTION:[^\]]+\]/g, '');
    })
    .join('');

  return cleanParts.replace(RESPONSE_BLOCK_REGEX, '').trim();
};

export const normalizeChatResponse = (response: Partial<ChatResponse>): ChatResponse => ({
  text: response.text?.trim() ?? '',
  components: response.components?.length ? dedupeObjects(response.components) : undefined,
  actions: response.actions?.length ? dedupeObjects(response.actions) : undefined,
  suggestions: response.suggestions?.length ? dedupeStrings(response.suggestions) : undefined,
});

export const buildChatResponseText = (response: Partial<ChatResponse>) => {
  const normalized = normalizeChatResponse(response);
  return `<response>${JSON.stringify(normalized)}</response>`;
};

export const parseChatResponseText = (text: string): ChatResponse | null => {
  if (!text) return null;

  const match = text.match(RESPONSE_BLOCK_REGEX);
  if (!match?.[1]) {
    return null;
  }

  try {
    const parsedJson = JSON.parse(match[1]);
    const parsedResponse = ChatResponseSchema.safeParse(parsedJson);
    if (!parsedResponse.success) {
      return null;
    }

    return normalizeChatResponse(parsedResponse.data);
  } catch {
    return null;
  }
};

export const hasPartialChatResponseBlock = (text: string) =>
  text.includes('<response>') && !text.includes('</response>');

export const ensureChatResponseText = (text: string) => {
  if (parseChatResponseText(text)) {
    return text;
  }

  return buildChatResponseText({
    text: stripLegacyControlTags(text),
    components: extractLegacyRichComponents(text),
    suggestions: extractLegacySuggestions(text),
  });
};

export const extractChatDisplayText = (text: string) => {
  const parsed = parseChatResponseText(text);
  if (parsed) {
    return parsed.text;
  }

  return stripLegacyControlTags(text);
};
