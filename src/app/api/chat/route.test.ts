import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '@/lib/config';

const { authGetUser, rpc } = vi.hoisted(() => ({
    authGetUser: vi.fn(),
    rpc: vi.fn(),
}));

vi.mock('@ai-sdk/deepseek', () => ({
    createDeepSeek: () => vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: {
            getUser: authGetUser,
        },
        rpc,
    })),
}));

import { POST } from './route';

const createChatRequest = (text: string) =>
    new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                {
                    id: 'msg-1',
                    role: 'user',
                    parts: [{ type: 'text', text }],
                },
            ],
        }),
    });

describe('POST /api/chat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        config.ai.deepseek.apiKey = 'test-deepseek-key';
        authGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        rpc.mockResolvedValue({ data: { allowed: true }, error: null });
    });

    it('returns a deterministic static reply for a happy-path prompt', async () => {
        const response = await POST(createChatRequest('qwrtypsdfg'));
        const payload = await response.text();

        expect(response.status).toBe(200);
        expect(payload).toContain('kurang mengerti pesan itu');
    });

    it('returns 429 when the rate limit RPC denies the request', async () => {
        rpc.mockResolvedValue({ data: { allowed: false }, error: null });

        const response = await POST(createChatRequest('halo'));
        const payload = await response.json();

        expect(response.status).toBe(429);
        expect(payload).toEqual({ error: 'Terlalu banyak permintaan. Tunggu sebentar.' });
    });

    it('returns 401 when the user is not authenticated', async () => {
        authGetUser.mockResolvedValue({ data: { user: null } });

        const response = await POST(createChatRequest('halo'));
        const payload = await response.json();

        expect(response.status).toBe(401);
        expect(payload).toEqual({ error: 'Unauthorized' });
        expect(rpc).not.toHaveBeenCalled();
    });
});
