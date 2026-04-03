import { describe, expect, it } from 'vitest';

import {
  ensureChatResponseText,
  extractChatDisplayText,
  parseChatResponseText,
} from './chat-contract';

describe('chat-contract', () => {
  it('wraps legacy rich replies into the typed response envelope', () => {
    const wrapped = ensureChatResponseText('Ringkas. [RENDER_COMPONENT:BudgetStatus] [SUGGESTION:Cek budget lain]');
    const parsed = parseChatResponseText(wrapped);

    expect(parsed).toEqual({
      text: 'Ringkas.',
      components: [{ type: 'BudgetStatus' }],
      suggestions: ['Cek budget lain'],
    });
  });

  it('extracts readable text from structured responses for summaries and follow-ups', () => {
    expect(
      extractChatDisplayText('<response>{"text":"Halo lagi","components":[{"type":"WealthSummary"}]}</response>')
    ).toBe('Halo lagi');
  });
});
