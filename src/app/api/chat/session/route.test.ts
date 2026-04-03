import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authGetUser, getChatSessionMock, clearChatSessionMock } = vi.hoisted(() => ({
  authGetUser: vi.fn(),
  getChatSessionMock: vi.fn(),
  clearChatSessionMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: authGetUser,
    },
    from: vi.fn(),
  })),
}));

vi.mock('@/lib/services/chat-session-service', () => ({
  getChatSession: getChatSessionMock,
  clearChatSession: clearChatSessionMock,
}));

import { DELETE, GET } from './route';

describe('/api/chat/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('loads the stored messages for an authenticated session request', async () => {
    getChatSessionMock.mockResolvedValue({
      session_id: 'session-1',
      messages: [{ id: 'm1', role: 'assistant', parts: [{ type: 'text', text: 'Halo lagi' }] }],
      memory_summary: 'Ringkasan lama',
    });

    const response = await GET(new Request('http://localhost:3000/api/chat/session?sessionId=session-1'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      sessionId: 'session-1',
      messages: [{ id: 'm1', role: 'assistant', parts: [{ type: 'text', text: 'Halo lagi' }] }],
      memorySummary: 'Ringkasan lama',
    });
  });

  it('returns 401 when the session endpoint is called without auth', async () => {
    authGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(new Request('http://localhost:3000/api/chat/session?sessionId=session-1'));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: 'Unauthorized' });
  });

  it('clears the stored session for an authenticated delete request', async () => {
    clearChatSessionMock.mockResolvedValue(undefined);

    const response = await DELETE(new Request('http://localhost:3000/api/chat/session?sessionId=session-1'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(clearChatSessionMock).toHaveBeenCalledWith(expect.anything(), 'user-1', 'session-1');
    expect(payload).toEqual({ success: true });
  });
});
