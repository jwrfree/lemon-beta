import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UIMessage } from 'ai';

import { config } from '@/lib/config';

const { authGetUser, from, generateObject } = vi.hoisted(() => ({
    authGetUser: vi.fn(),
    from: vi.fn(),
    generateObject: vi.fn(),
}));

vi.mock('@ai-sdk/openai', () => ({
    createOpenAI: () => vi.fn(),
}));

vi.mock('ai', async () => {
    const actual = await vi.importActual<typeof import('ai')>('ai');
    return {
        ...actual,
        generateObject,
    };
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: {
            getUser: authGetUser,
        },
        from,
    })),
}));

import { POST } from './route';

const buildRequest = (messages: UIMessage[]) =>
    new Request('http://localhost:3000/api/chat/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionId: 'session-1',
            messages,
        }),
    });

describe('POST /api/chat/update-profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        config.ai.deepseek.apiKey = 'test-deepseek-key';
        authGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        from.mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: null }),
        });
    });

    it('skips short sessions without enough assistant turns', async () => {
        const response = await POST(buildRequest([
            { id: 'welcome', role: 'assistant', parts: [{ type: 'text', text: 'Halo!' }] },
            { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Halo' }] },
            { id: 'assistant-1', role: 'assistant', parts: [{ type: 'text', text: 'Ada yang bisa saya bantu?' }] },
        ]));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            skipped: true,
            reason: 'not_enough_assistant_messages',
        });
        expect(generateObject).not.toHaveBeenCalled();
    });

    it('summarizes substantive sessions and upserts the coaching profile', async () => {
        generateObject.mockResolvedValue({
            object: {
                spending_patterns: { food: 'naik', subscriptions: 'stabil' },
                coaching_notes: 'Kurangi pengeluaran makan impulsif.',
            },
        });
        const upsert = vi.fn().mockResolvedValue({ error: null });
        from.mockReturnValue({ upsert });

        const response = await POST(buildRequest([
            { id: 'welcome', role: 'assistant', parts: [{ type: 'text', text: 'Halo!' }] },
            { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Tolong cek kondisi keuanganku.' }] },
            { id: 'assistant-1', role: 'assistant', parts: [{ type: 'text', text: 'Pengeluaran makanmu naik bulan ini.' }] },
            { id: 'user-2', role: 'user', parts: [{ type: 'text', text: 'Apa yang harus aku lakukan?' }] },
            { id: 'assistant-2', role: 'assistant', parts: [{ type: 'text', text: 'Mulai dari budget makan mingguan.' }] },
            { id: 'user-3', role: 'user', parts: [{ type: 'text', text: 'Ada goal yang terpengaruh?' }] },
            { id: 'assistant-3', role: 'assistant', parts: [{ type: 'text', text: 'Dana daruratmu ikut tertekan.' }] },
        ]));

        expect(response.status).toBe(200);
        expect(generateObject).toHaveBeenCalled();
        expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'user-1',
            spending_patterns: { food: 'naik', subscriptions: 'stabil' },
            coaching_notes: 'Kurangi pengeluaran makan impulsif.',
        }));
    });
});
