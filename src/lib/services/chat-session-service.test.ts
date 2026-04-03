import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { UIMessage } from 'ai';

import {
  clearChatSession,
  getChatSession,
  persistChatSession,
} from './chat-session-service';

const textMessage = (id: string, role: UIMessage['role'], text: string): UIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text }],
});

const createSelectClient = (data: unknown, error: unknown = null) => {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error });
  const eqUser = vi.fn().mockReturnValue({ maybeSingle });
  const eqSession = vi.fn().mockReturnValue({ eq: eqUser });
  const select = vi.fn().mockReturnValue({ eq: eqSession });

  return {
    from: vi.fn().mockReturnValue({ select }),
  };
};

describe('chatSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a persisted chat session for the current user', async () => {
    const client = createSelectClient({
      id: 'session-1',
      user_id: 'user-1',
      messages: [textMessage('m1', 'assistant', 'Halo')],
      memory_summary: 'Ringkasan lama',
      created_at: '2026-04-03T10:00:00.000Z',
      updated_at: '2026-04-03T10:05:00.000Z',
    });

    const session = await getChatSession(client as never, 'user-1', 'session-1');

    expect(session).toEqual(expect.objectContaining({
      id: 'session-1',
      memory_summary: 'Ringkasan lama',
    }));
    expect(session?.messages).toHaveLength(1);
  });

  it('summarizes older turns and keeps only recent turns when the history grows', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'session-1',
        user_id: 'user-1',
        messages: [],
        memory_summary: 'Ringkasan sebelumnya',
        created_at: '2026-04-03T10:00:00.000Z',
        updated_at: '2026-04-03T10:05:00.000Z',
      },
      error: null,
    });
    const eqUser = vi.fn().mockReturnValue({ maybeSingle });
    const eqSession = vi.fn().mockReturnValue({ eq: eqUser });
    const select = vi.fn().mockReturnValue({ eq: eqSession });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn((table: string) => {
        if (table !== 'chat_sessions') throw new Error(`Unexpected table ${table}`);
        return {
          select,
          upsert,
        };
      }),
    };

    const longConversation = Array.from({ length: 14 }, (_, index) =>
      textMessage(`m-${index}`, index % 2 === 0 ? 'user' : 'assistant', `Pesan ke-${index}`)
    );

    await persistChatSession(client as never, 'user-1', 'session-1', longConversation);

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      id: 'session-1',
      user_id: 'user-1',
      messages: longConversation.slice(-8),
      memory_summary: expect.stringContaining('Ringkasan sebelumnya'),
    }));
  });

  it('deletes a persisted session when clear chat is requested', async () => {
    const eqUser = vi.fn().mockResolvedValue({ error: null });
    const eqSession = vi.fn().mockReturnValue({ eq: eqUser });
    const deleteFn = vi.fn().mockReturnValue({ eq: eqSession });
    const client = {
      from: vi.fn().mockReturnValue({
        delete: deleteFn,
      }),
    };

    await clearChatSession(client as never, 'user-1', 'session-1');

    expect(deleteFn).toHaveBeenCalled();
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
