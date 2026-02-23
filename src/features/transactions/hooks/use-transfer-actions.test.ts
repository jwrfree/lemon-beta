import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransferActions } from './use-transfer-actions';

// Mocks
const mockShowToast = vi.fn();
const mockSetIsTransferModalOpen = vi.fn();

vi.mock('@/components/ui-provider', () => ({
  useUI: () => ({
    showToast: mockShowToast,
    setIsTransferModalOpen: mockSetIsTransferModalOpen,
  }),
}));

vi.mock('@/providers/wallet-provider', () => ({
  useWalletData: () => ({
    refreshWallets: vi.fn().mockResolvedValue(undefined),
    updateWalletOptimistically: vi.fn(),
  }),
}));

vi.mock('../services/transaction.service', () => ({
  transactionService: {
    createTransaction: vi.fn().mockResolvedValue({ data: 'Transfer successful', error: null }),
  },
}));

import { User } from '@supabase/supabase-js';
import { transactionService } from '../services/transaction.service';

describe('useTransferActions', () => {
  const mockUser = { id: 'user-123' } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(transactionService.createTransaction).mockResolvedValue({ data: 'Transfer successful', error: null });
  });

  it('should execute a transfer successfully', async () => {
    const { result } = renderHook(() => useTransferActions(mockUser));

    const transferData = {
      fromWalletId: 'w1',
      toWalletId: 'w2',
      amount: 500,
      date: '2024-01-01',
      description: 'Test Transfer'
    };

    await act(async () => {
      await result.current.addTransfer(transferData);
    });

    // Should call transactionService.createTransaction once with type='transfer'
    expect(transactionService.createTransaction).toHaveBeenCalledTimes(1);
    expect(transactionService.createTransaction).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        type: 'transfer',
        fromWalletId: 'w1',
        toWalletId: 'w2',
        amount: 500,
      })
    );

    expect(mockShowToast).toHaveBeenCalledWith("Transfer berhasil dicatat!", 'success');
    expect(mockSetIsTransferModalOpen).toHaveBeenCalledWith(false);
  });
});