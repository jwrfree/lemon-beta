import { afterEach, describe, expect, it, vi } from 'vitest';
import { financialContextService } from './financial-context-service';
import { createFinancialTools } from '@/ai/tools';

describe('financialContextService.getUnifiedContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers the unified-context RPC when it succeeds', async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          wealth: { cash: 1000, assets: 0, liabilities: 0, net_worth: 1000 },
          monthly: { income: 2000, expense: 500, cashflow: 1500, velocity: 1 },
        },
        error: null,
      }),
      from: vi.fn(),
    };

    const fallbackSpy = vi.spyOn(financialContextService as any, 'getFallbackContext');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const result = await financialContextService.getUnifiedContext('user-1', client as any);

    expect(client.rpc).toHaveBeenCalledWith('get_unified_context', { p_user_id: 'user-1' });
    expect(fallbackSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(result?.wealth.cash).toBe(1000);
    expect(result?.monthly.cashflow).toBe(1500);
  });

  it('falls back to direct queries when the RPC fails', async () => {
    const rpcError = { message: 'function not found', code: '42883' };
    const client = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: rpcError,
      }),
      from: vi.fn(),
    };

    const fallbackContext = {
      wealth: { cash: 2500, assets: 0, liabilities: 0, net_worth: 2500 },
      budgets: [],
      goals: [],
      risk: { level: 'Low' as const, score: 0, burn_rate: 0, velocity: 1, balance: 2500, survival_days: 999 },
      monthly: { income: 3000, expense: 500, cashflow: 2500, velocity: 1 },
      top_categories: [],
      largest_expense: null,
      budget_alerts: [],
      previous_month: { income: 0, expense: 0, cashflow: 0, top_categories: [] },
      spending_pattern: { busiest_day: 'Senin', average_daily_spend: 0, weekly_expense: 0, last_expense_date: null },
      last_transaction: null,
      expense_transaction_count: 0,
      timestamp: new Date().toISOString(),
    };

    const fallbackSpy = vi
      .spyOn(financialContextService as any, 'getFallbackContext')
      .mockResolvedValue(fallbackContext);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await financialContextService.getUnifiedContext('user-1', client as any);

    expect(client.rpc).toHaveBeenCalledWith('get_unified_context', { p_user_id: 'user-1' });
    expect(fallbackSpy).toHaveBeenCalledWith('user-1', client);
    expect(warnSpy).toHaveBeenCalled();
    expect(result).toEqual(fallbackContext);
  });
});

describe('financialContextService transaction helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns stable ids for searched and recent transactions', async () => {
    const rows = [
      {
        id: 'tx-123',
        amount: 25000,
        category: 'Konsumsi & F&B',
        sub_category: 'Jajanan & Kopi',
        merchant: 'Kapal Api',
        type: 'expense',
        description: 'Kopi sore',
        date: '2026-04-03T09:00:00.000Z',
        created_at: '2026-04-03T09:00:00.000Z',
      },
    ];
    const searchBuilder: any = {};
    searchBuilder.eq = vi.fn().mockReturnValue(searchBuilder);
    searchBuilder.order = vi.fn().mockReturnValue(searchBuilder);
    searchBuilder.limit = vi.fn().mockReturnValue(searchBuilder);
    searchBuilder.or = vi.fn().mockResolvedValue({ data: rows, error: null });

    const recentBuilder: any = {};
    recentBuilder.eq = vi.fn().mockReturnValue(recentBuilder);
    recentBuilder.order = vi.fn().mockReturnValue(recentBuilder);
    recentBuilder.limit = vi.fn().mockResolvedValue({ data: rows, error: null });

    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue(searchBuilder),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue(recentBuilder),
        }),
    };

    const searchResults = await financialContextService.findTransactionsByQuery('user-1', 'kopi', client as any, 1);
    const recentResults = await financialContextService.getRecentTransactions('user-1', client as any, 1);

    expect(searchResults[0]).toMatchObject({
      transaction_id: 'tx-123',
      id: 'tx-123',
    });
    expect(recentResults[0]).toMatchObject({
      transaction_id: 'tx-123',
      id: 'tx-123',
    });
  });

  it('lets the update tool consume a transaction_id returned by find_transactions', async () => {
    const toolSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
    };
    const tools = createFinancialTools('user-1', toolSupabase as any);
    const transactionId = '550e8400-e29b-41d4-a716-446655440000';

    vi.spyOn(financialContextService, 'findTransactionsByQuery').mockResolvedValue([
      {
        transaction_id: transactionId,
        id: transactionId,
        description: 'Kopi sore',
        category: 'Konsumsi & F&B',
        sub_category: 'Jajanan & Kopi',
        merchant: 'Kapal Api',
        amount: 25000,
        type: 'expense',
        date: '2026-04-03T09:00:00.000Z',
      },
    ]);

    const existingTransaction = {
      id: transactionId,
      user_id: 'user-1',
      wallet_id: 'wallet-1',
      amount: 25000,
      category: 'Konsumsi & F&B',
      sub_category: 'Jajanan & Kopi',
      description: 'Kopi sore',
      date: '2026-04-03T09:00:00.000Z',
      type: 'expense',
      location: null,
      is_need: true,
    };

    toolSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: existingTransaction,
              error: null,
            }),
          }),
        }),
      }),
    });
    toolSupabase.rpc.mockResolvedValue({ error: null });

    const found = await (tools.find_transactions as any).execute({ query: 'kopi', limit: 1 });
    const result = await (tools.update_transaction as any).execute({
      transaction_id: found[0].transaction_id,
      updates: { amount: 30000 },
    });

    expect(found[0].transaction_id).toBe(transactionId);
    expect(result).toEqual({ success: true });
    expect(toolSupabase.rpc).toHaveBeenCalledWith('update_transaction_v1', expect.objectContaining({
      p_transaction_id: transactionId,
      p_user_id: 'user-1',
      p_new_amount: 30000,
    }));
  });
});

describe('financialContextService anomaly helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps anomaly RPC rows into normalized anomaly objects', async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            anomaly_type: 'spike',
            category: 'Makanan',
            description: 'Pengeluaran makan naik tajam.',
            severity: 'high',
            current_value: 450000,
            reference_value: 250000,
            metadata: {
              ratio: 1.8,
              target_action: { type: 'highlight', target: 'widget-financial-pulse' },
            },
          },
        ],
        error: null,
      }),
    };

    const anomalies = await financialContextService.getSpendingAnomalies('user-1', client as any);

    expect(client.rpc).toHaveBeenCalledWith('detect_spending_anomalies', { p_user_id: 'user-1' });
    expect(anomalies).toEqual([
      {
        anomaly_type: 'spike',
        category: 'Makanan',
        description: 'Pengeluaran makan naik tajam.',
        severity: 'high',
        current_value: 450000,
        reference_value: 250000,
        metadata: {
          ratio: 1.8,
          target_action: { type: 'highlight', target: 'widget-financial-pulse' },
        },
      },
    ]);
  });

  it('lets the anomalies tool return the RPC-backed anomaly payload', async () => {
    const toolSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
    };
    const tools = createFinancialTools('user-1', toolSupabase as any);
    const anomalies = [
      {
        anomaly_type: 'budget_trajectory' as const,
        category: 'Transportasi',
        description: 'Laju pengeluaran transportasi berpotensi menembus budget.',
        severity: 'medium' as const,
        current_value: 320000,
        reference_value: 250000,
        metadata: {
          projected_total: 480000,
          target_action: { type: 'highlight', target: 'widget-budget-status' },
        },
      },
    ];

    vi.spyOn(financialContextService, 'getSpendingAnomalies').mockResolvedValue(anomalies);

    const result = await (tools.get_spending_anomalies as any).execute({});

    expect(result).toEqual(anomalies);
    expect(financialContextService.getSpendingAnomalies).toHaveBeenCalledWith('user-1', toolSupabase);
  });
});
