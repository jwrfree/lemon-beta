import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransferActions } from './use-transfer-actions';

// Mocks
const mockShowToast = vi.fn();
const mockSetIsTransferModalOpen = vi.fn();

// Supabase Mocks
const mockFrom = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/components/ui-provider', () => ({
  useUI: () => ({
    showToast: mockShowToast,
    setIsTransferModalOpen: mockSetIsTransferModalOpen,
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe('useTransferActions', () => {
  const mockUser = { id: 'user-123' } as { id: string };

  beforeEach(() => {
    vi.clearAllMocks();

    // -- Chain Setup --
    mockInsert.mockResolvedValue({ error: null });
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'transactions') return { insert: mockInsert };
      return {};
    });
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

    // 1. Should create 2 transactions (expense & income)
    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        type: 'expense',
        amount: 500,
        wallet_id: 'w1'
    }));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        type: 'income',
        amount: 500,
        wallet_id: 'w2'
    }));

    expect(mockShowToast).toHaveBeenCalledWith("Transfer berhasil dicatat!", 'success');
    expect(mockSetIsTransferModalOpen).toHaveBeenCalledWith(false);
  });
});