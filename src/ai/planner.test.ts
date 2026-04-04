import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UIMessage } from 'ai';

const {
  routeChatIntent,
  handleLlmChatAction,
  handleDeterministicContextAction,
  handleStaticReplyAction,
  handleTransactionSearchAction,
  handleAddTransactionAction,
  handleRecentTransactionsAction,
  getUnifiedContext,
  getSpendingAnomalies,
} = vi.hoisted(() => ({
  routeChatIntent: vi.fn(),
  handleLlmChatAction: vi.fn(),
  handleDeterministicContextAction: vi.fn(),
  handleStaticReplyAction: vi.fn(),
  handleTransactionSearchAction: vi.fn(),
  handleAddTransactionAction: vi.fn(),
  handleRecentTransactionsAction: vi.fn(),
  getUnifiedContext: vi.fn(),
  getSpendingAnomalies: vi.fn(),
}));

vi.mock('@/ai/router', () => ({
  routeChatIntent,
}));

vi.mock('@/ai/actions/llm-action', () => ({
  handleLlmChatAction,
}));

vi.mock('@/ai/actions/deterministic-actions', () => ({
  handleDeterministicContextAction,
}));

vi.mock('@/ai/actions/static-actions', () => ({
  handleStaticReplyAction,
}));

vi.mock('@/ai/actions/transaction-actions', () => ({
  handleTransactionSearchAction,
  handleAddTransactionAction,
  handleRecentTransactionsAction,
}));

vi.mock('@/lib/services/financial-context-service', () => ({
  financialContextService: {
    getUnifiedContext,
    getSpendingAnomalies,
  },
}));

import { executeChatPlanner } from './planner';

const baseMessages: UIMessage[] = [
  {
    id: 'user-1',
    role: 'user',
    parts: [{ type: 'text', text: 'Budget makan masih aman?' }],
  },
];

describe('executeChatPlanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleLlmChatAction.mockResolvedValue(new Response('llm'));
    handleDeterministicContextAction.mockResolvedValue(new Response('deterministic'));
    handleStaticReplyAction.mockResolvedValue(new Response('static'));
    handleTransactionSearchAction.mockResolvedValue(new Response('search'));
    handleAddTransactionAction.mockResolvedValue(new Response('add'));
    handleRecentTransactionsAction.mockResolvedValue(new Response('recent'));
  });

  it('pre-chains budgets, goals, and risk server-side for budget-risk prompts', async () => {
    routeChatIntent.mockReturnValue({
      kind: 'deterministic-context',
      intent: { kind: 'budget-risk' },
    });
    getUnifiedContext.mockResolvedValue({
      budgets: [{ name: 'Makan', limit: 600000, spent: 520000, percent: 86 }],
      goals: [{ name: 'Dana Darurat', target: 12000000, current: 4500000, percent: 37.5 }],
      risk: { level: 'Moderate', score: 58, burn_rate: 175000, velocity: 1.1, balance: 3000000, survival_days: 17 },
      monthly: { income: 8000000, expense: 6100000, cashflow: 1900000, velocity: 1.1 },
    });

    await executeChatPlanner({
      userId: 'user-1',
      supabase: { from: vi.fn(), rpc: vi.fn() } as any,
      messages: baseMessages,
      sessionId: 'session-1',
    });

    expect(handleDeterministicContextAction).not.toHaveBeenCalled();
    expect(getUnifiedContext).toHaveBeenCalledWith('user-1', expect.any(Object), ['budgets', 'risk', 'goals', 'monthly']);
    expect(handleLlmChatAction).toHaveBeenCalledWith(expect.objectContaining({
      supplementalContext: {
        budget_review: expect.objectContaining({
          budgets: [{ name: 'Makan', limit: 600000, spent: 520000, percent: 86 }],
          goals: [{ name: 'Dana Darurat', target: 12000000, current: 4500000, percent: 37.5 }],
          risk: expect.objectContaining({ score: 58 }),
        }),
      },
    }));
  });

  it('pre-chains goals with budget health for goal-oriented llm prompts', async () => {
    routeChatIntent.mockReturnValue({
      kind: 'llm',
      intent: { kind: 'llm' },
    });
    getUnifiedContext.mockResolvedValue({
      budgets: [{ name: 'Liburan', limit: 1500000, spent: 300000, percent: 20 }],
      goals: [{ name: 'Laptop Baru', target: 15000000, current: 5000000, percent: 33.3 }],
      risk: { level: 'Low', score: 18, burn_rate: 90000, velocity: 0.8, balance: 6000000, survival_days: 66 },
      monthly: { income: 9000000, expense: 4500000, cashflow: 4500000, velocity: 0.8 },
    });

    await executeChatPlanner({
      userId: 'user-1',
      supabase: { from: vi.fn(), rpc: vi.fn() } as any,
      messages: [
        {
          id: 'user-goal',
          role: 'user',
          parts: [{ type: 'text', text: 'Apakah goal laptop baru saya masih on track?' }],
        },
      ],
      sessionId: 'session-2',
    });

    expect(getUnifiedContext).toHaveBeenCalledWith('user-1', expect.any(Object), ['goals', 'budgets', 'risk', 'monthly']);
    expect(handleLlmChatAction).toHaveBeenCalledWith(expect.objectContaining({
      supplementalContext: {
        goal_review: expect.objectContaining({
          goals: [{ name: 'Laptop Baru', target: 15000000, current: 5000000, percent: 33.3 }],
          budgets: [{ name: 'Liburan', limit: 1500000, spent: 300000, percent: 20 }],
          risk: expect.objectContaining({ level: 'Low' }),
        }),
      },
    }));
  });
});
