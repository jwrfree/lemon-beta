import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalletActions } from './use-wallet-actions';

// Define independent mocks
const mockShowToast = vi.fn();
const mockSetIsWalletModalOpen = vi.fn();
const mockSetIsEditWalletModalOpen = vi.fn();

// Supabase Chain Mocks
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

vi.mock('@/components/ui-provider', () => ({
  useUI: () => ({
    showToast: mockShowToast,
    setIsWalletModalOpen: mockSetIsWalletModalOpen,
    setIsEditWalletModalOpen: mockSetIsEditWalletModalOpen,
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe('useWalletActions', () => {
  const mockUser: any = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();

    // -- Chain Setup --
    mockInsert.mockResolvedValue({ error: null });
    
    // update: from('...').update(...).eq(...)
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: updateEqMock });

    // delete: from('...').delete().eq(...)
    const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: deleteEqMock });
    
    // update is_default: from('...').update(...).eq(...) - reused updateEqMock
    
    // select for check: from('transactions').select(...).eq(...)
    const selectEqMock = vi.fn().mockResolvedValue({ count: 0 }); // Default no transactions
    mockSelect.mockReturnValue({ eq: selectEqMock });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'wallets') {
        return {
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        };
      }
      if (table === 'transactions') {
        return {
          select: mockSelect,
        };
      }
      return {};
    });
  });

  describe('addWallet', () => {
    it('should add a wallet successfully', async () => {
      const { result } = renderHook(() => useWalletActions(mockUser));
      const newWallet = {
        name: 'My Wallet',
        balance: 1000,
        icon: 'wallet',
        color: 'blue',
        isDefault: true,
      };

      await act(async () => {
        await result.current.addWallet(newWallet);
      });

      expect(mockInsert).toHaveBeenCalledWith({
        name: newWallet.name,
        balance: newWallet.balance,
        icon: newWallet.icon,
        color: newWallet.color,
        is_default: newWallet.isDefault,
        user_id: mockUser.id,
      });

      expect(mockShowToast).toHaveBeenCalledWith("Dompet berhasil dibuat!", 'success');
      expect(mockSetIsWalletModalOpen).toHaveBeenCalledWith(false);
    });

    it('should handle errors when adding wallet', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });
      const { result } = renderHook(() => useWalletActions(mockUser));

      await act(async () => {
        await result.current.addWallet({ name: 'Test', color: 'red', icon: 'test' });
      });

      expect(mockShowToast).toHaveBeenCalledWith("Gagal membuat dompet.", 'error');
    });
  });

  describe('updateWallet', () => {
    it('should update a wallet successfully', async () => {
      const { result } = renderHook(() => useWalletActions(mockUser));
      const updateData = { name: 'New Name' };

      await act(async () => {
        await result.current.updateWallet('wallet-1', updateData);
      });

      expect(mockUpdate).toHaveBeenCalledWith({ name: 'New Name' });
      expect(mockShowToast).toHaveBeenCalledWith("Dompet berhasil diperbarui!", 'success');
      expect(mockSetIsEditWalletModalOpen).toHaveBeenCalledWith(false);
    });

    it('should reset other defaults if setting as default', async () => {
        const { result } = renderHook(() => useWalletActions(mockUser));
        
        await act(async () => {
            await result.current.updateWallet('wallet-1', { isDefault: true });
        });

        // Should first unset all defaults
        expect(mockUpdate).toHaveBeenCalledWith({ is_default: false });
        // Then set the specific wallet as default
        expect(mockUpdate).toHaveBeenCalledWith({ is_default: true });
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet if no transactions exist', async () => {
       const { result } = renderHook(() => useWalletActions(mockUser));
       
       await act(async () => {
           await result.current.deleteWallet('wallet-1');
       });

       expect(mockDelete).toHaveBeenCalled();
       expect(mockShowToast).toHaveBeenCalledWith("Dompet berhasil dihapus.", 'success');
    });

    it('should prevent deletion if transactions exist', async () => {
        // Mock transaction existence
        mockSelect.mockReturnValue({ 
            eq: vi.fn().mockResolvedValue({ count: 5 }) 
        });

        const { result } = renderHook(() => useWalletActions(mockUser));

        await act(async () => {
            await result.current.deleteWallet('wallet-1');
        });

        expect(mockDelete).not.toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
    });
  });
});
