import { afterEach, describe, expect, it, vi } from 'vitest';
import { financialContextService } from './financial-context-service';

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
