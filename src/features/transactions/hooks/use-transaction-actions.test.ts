import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionActions } from './use-transaction-actions';

// Define independent mocks for clarity
const mockShowToast = vi.fn();
const mockSetIsTxModalOpen = vi.fn();
const mockLogActivity = vi.fn();

// Supabase Chain Mocks
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/components/ui-provider', () => ({
  useUI: () => ({
    showToast: mockShowToast,
    setIsTxModalOpen: mockSetIsTxModalOpen,
    setTransactionToEdit: vi.fn(),
  }),
}));

vi.mock('@/lib/audit', () => ({
  logActivity: (args: { action: string; entity: string; entityId?: string; details?: Record<string, unknown> }) => mockLogActivity(args),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

import { User } from '@supabase/supabase-js';

describe('useTransactionActions', () => {
  const mockUser = { id: 'user-123' } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();

    // -- Chain Setup --
    mockInsert.mockResolvedValue({ error: null });

    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: updateEqMock });

    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: deleteEqMock });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'transactions') {
        return {
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        };
      }
      return {};
    });
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

    const { walletId, ...rest } = newTransaction;
    expect(mockInsert).toHaveBeenCalledWith({
      ...rest,
      wallet_id: walletId,
      user_id: mockUser.id,
    });

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

    const { walletId, ...rest } = newTransaction;
    expect(mockInsert).toHaveBeenCalledWith({
      ...rest,
      wallet_id: walletId,
      user_id: mockUser.id,
    });

    expect(mockShowToast).toHaveBeenCalledWith("Transaksi berhasil ditambahkan!", 'success');
  });

  it('should handle errors when adding transaction', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });
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
