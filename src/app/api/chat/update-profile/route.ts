import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, type UIMessage } from 'ai';
import { z } from 'zod';

import { extractChatDisplayText } from '@/ai/chat-contract';
import { config } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { upsertUserFinancialProfile } from '@/lib/services/user-financial-profile-service';

const deepseek = createOpenAI({
    apiKey: config.ai.deepseek.apiKey,
    baseURL: config.ai.deepseek.baseURL,
});

const ProfileSummarySchema = z.object({
    spending_patterns: z.record(z.string(), z.unknown()),
    coaching_notes: z.string(),
});

const getMessageText = (message: UIMessage) =>
    extractChatDisplayText(
        message.parts
            .filter((part): part is Extract<UIMessage['parts'][number], { type: 'text' }> => part.type === 'text')
            .map((part) => part.text)
            .join(' ')
    );

export async function POST(request: Request) {
    try {
        if (!config.ai.deepseek.apiKey) {
            return Response.json(
                { error: 'DeepSeek API key not found. Profile coaching memory tidak tersedia.' },
                { status: 500 }
            );
        }

        const body = await request.json() as { sessionId?: string; messages?: UIMessage[] };
        if (!Array.isArray(body.messages)) {
            return Response.json({ error: 'Payload update profile tidak valid.' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const assistantMessages = body.messages.filter((message) => message.role === 'assistant' && message.id !== 'welcome');
        if (assistantMessages.length < 3) {
            return Response.json({ skipped: true, reason: 'not_enough_assistant_messages' });
        }

        const transcript = body.messages
            .map((message) => {
                const text = getMessageText(message).trim();
                if (!text) return null;
                const speaker = message.role === 'assistant' ? 'Assistant' : 'User';
                return `${speaker}: ${text}`;
            })
            .filter((value): value is string => Boolean(value))
            .join('\n');

        const { object } = await generateObject({
            model: deepseek('deepseek-chat'),
            schema: ProfileSummarySchema,
            system: `Given this conversation, extract:
1. Key spending patterns observed (max 5 bullet points)
2. Coaching notes: what does this user need to work on? (max 3 sentences)
Return JSON only: { "spending_patterns": {}, "coaching_notes": "" }`,
            prompt: transcript,
            temperature: 0,
        });

        await upsertUserFinancialProfile(supabase, user.id, {
            spending_patterns: object.spending_patterns,
            coaching_notes: object.coaching_notes,
        });

        return Response.json({ success: true, sessionId: body.sessionId ?? null });
    } catch (error) {
        console.error('[AI Chat] Failed to update coaching profile:', error);
        return Response.json({ error: 'Gagal memperbarui coaching profile.' }, { status: 500 });
    }
}
