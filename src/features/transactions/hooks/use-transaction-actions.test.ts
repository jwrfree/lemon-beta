import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionActions } from './use-transaction-actions';

// Define independent mocks for clarity
const mockShowToast = vi.fn();
const mockSetIsTxModalOpen = vi.fn();
const mockLogActivity = vi.fn();

vi.mock('@/components/ui-provider', () => ({
  useUI: () => ({
    showToast: mockShowToast,
    setIsTxModalOpen: mockSetIsTxModalOpen,
    setTransactionToEdit: vi.fn(),
  }),
}));

vi.mock('@/providers/wallet-provider', () => ({
  useWalletData: () => ({
    refreshWallets: vi.fn().mockResolvedValue(undefined),
    updateWalletOptimistically: vi.fn(),
  }),
}));

vi.mock('@/lib/audit', () => ({
  logActivity: (args: { action: string; entity: string; entityId?: string; details?: Record<string, unknown> }) => mockLogActivity(args),
}));

vi.mock('../services/transaction.service', () => ({
  transactionService: {
    createTransaction: vi.fn().mockResolvedValue({ data: 'tx-1', error: null }),
    updateTransaction: vi.fn().mockResolvedValue({ data: true, error: null }),
    deleteTransaction: vi.fn().mockResolvedValue({ data: true, error: null }),
  },
}));

import { User } from '@supabase/supabase-js';
import { transactionService } from '../services/transaction.service';

describe('useTransactionActions', () => {
  const mockUser = { id: 'user-123' } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(transactionService.createTransaction).mockResolvedValue({ data: 'tx-1', error: null });
  });

  it('should add an expense transaction successfully', async () => {
    const { result } = renderHook(() => useTransactionActions(mockUser));

    const newTransaction = {
      amount: 50000,
      category: 'Food',
      date: '2024-01-01',
      description: 'Lunch',
      type: 'expense' as const,
      walletId: 'wallet-1',
    };

    await act(async () => {
      await result.current.addTransaction(newTransaction);
    });

    expect(transactionService.createTransaction).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith("Transaksi berhasil ditambahkan!", 'success');
    expect(mockSetIsTxModalOpen).toHaveBeenCalledWith(false);
  });

  it('should add an income transaction successfully', async () => {
    const { result } = renderHook(() => useTransactionActions(mockUser));

    const newTransaction = {
      amount: 1000000,
      category: 'Gaji',
      date: '2024-01-01',
      description: 'Monthly Salary',
      type: 'income' as const,
      walletId: 'wallet-1',
    };

    await act(async () => {
      await result.current.addTransaction(newTransaction);
    });

    expect(transactionService.createTransaction).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith("Transaksi berhasil ditambahkan!", 'success');
  });

  it('should handle errors when adding transaction', async () => {
    vi.mocked(transactionService.createTransaction).mockResolvedValue({ data: null, error: "Gagal menambahkan transaksi." });
    const { result } = renderHook(() => useTransactionActions(mockUser));

    await act(async () => {
      await result.current.addTransaction({
        amount: 50000,
        category: 'Food',
        date: '2024-01-01',
        description: 'Lunch',
        type: 'expense',
        walletId: 'wallet-1',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith("Gagal menambahkan transaksi.", 'error');
  });
});
