import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getRecentTransactions,
  parseSimpleTransactionInput,
  extractTransaction,
  createTransactionWithClient,
} = vi.hoisted(() => ({
  getRecentTransactions: vi.fn(),
  parseSimpleTransactionInput: vi.fn(),
  extractTransaction: vi.fn(),
  createTransactionWithClient: vi.fn(),
}));

vi.mock('@/lib/services/financial-context-service', () => ({
  financialContextService: {
    getUnifiedContext: vi.fn(),
    getRecentTransactions,
    findTransactionsByQuery: vi.fn(),
  },
}));

vi.mock('@/ai/flows/extract-transaction-flow', () => ({
  parseSimpleTransactionInput,
  extractTransaction,
}));

vi.mock('@/features/transactions/services/transaction.service', () => ({
  createTransactionWithClient,
  deleteTransactionWithClient: vi.fn(),
  getTransactionRowById: vi.fn(),
  mapTransactionRowToUnifiedValues: vi.fn(),
  updateTransactionWithClient: vi.fn(),
}));

import { createFinancialTools, createTransactionMutationActions } from './tools';

const createWalletQueryClient = () => {
  const createdAtOrder = vi.fn().mockResolvedValue({
    data: [{ id: 'wallet-1', name: 'BCA', is_default: true }],
    error: null,
  });
  const defaultOrder = vi.fn().mockReturnValue({
    order: createdAtOrder,
  });
  const eq = vi.fn().mockReturnValue({
    order: defaultOrder,
  });
  const select = vi.fn().mockReturnValue({
    eq,
  });

  return {
    from: vi.fn().mockReturnValue({
      select,
    }),
    rpc: vi.fn(),
  };
};

describe('createTransactionMutationActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRecentTransactions.mockResolvedValue([]);
    parseSimpleTransactionInput.mockResolvedValue({
      transactions: [{
        amount: 25000,
        description: 'Makan siang',
        category: 'Konsumsi & F&B',
        subCategory: 'Makan Harian/Warteg',
        wallet: 'BCA',
        date: '2026-04-03T10:00:00.000Z',
        type: 'expense',
        isNeed: true,
      }],
    });
    extractTransaction.mockResolvedValue({
      transactions: [],
    });
    createTransactionWithClient.mockResolvedValue({
      data: 'tx-1',
      error: null,
    });
  });

  it('uses the shared add mutation helper for natural-language transaction capture', async () => {
    const supabase = createWalletQueryClient();
    const actions = createTransactionMutationActions('user-1', supabase as never);

    const result = await actions.addTransaction('catat makan siang 25rb pakai BCA');

    expect(result.success).toBe(true);
    expect(result.reply).toContain('berhasil dicatat');
    expect(createTransactionWithClient).toHaveBeenCalledWith(
      supabase,
      'user-1',
      expect.objectContaining({
        amount: 25000,
        category: 'Konsumsi & F&B',
        walletId: 'wallet-1',
      }),
    );
  });

  it('exposes the same add mutation through the financial tools wrapper', async () => {
    const supabase = createWalletQueryClient();
    const tools = createFinancialTools('user-1', supabase as never);

    const result = await tools.add_transaction.execute({ raw_text: 'catat makan siang 25rb pakai BCA' });

    expect(result).toEqual(expect.objectContaining({
      success: true,
      reply: expect.stringContaining('berhasil dicatat'),
    }));
    expect(createTransactionWithClient).toHaveBeenCalledTimes(1);
  });
});
