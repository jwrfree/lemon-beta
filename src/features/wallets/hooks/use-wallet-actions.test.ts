import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalletActions } from './use-wallet-actions';

// Define independent mocks
const mockShowToast = vi.fn();
const mockSetIsWalletModalOpen = vi.fn();
const mockSetIsEditWalletModalOpen = vi.fn();

vi.mock('@/components/ui-provider', () => ({
  useUI: () => ({
    showToast: mockShowToast,
    setIsWalletModalOpen: mockSetIsWalletModalOpen,
    setIsEditWalletModalOpen: mockSetIsEditWalletModalOpen,
  }),
}));

vi.mock('@/lib/services/wallet-service', () => ({
  walletService: {
    addWallet: vi.fn().mockResolvedValue(undefined),
    updateWallet: vi.fn().mockResolvedValue(undefined),
    deleteWallet: vi.fn().mockResolvedValue({ blocked: null }),
    reconcileWallet: vi.fn().mockResolvedValue(undefined),
  },
}));

import { User } from '@supabase/supabase-js';
import { walletService } from '@/lib/services/wallet-service';

describe('useWalletActions', () => {
  const mockUser = { id: 'user-123' } as unknown as User;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(walletService.addWallet).mockResolvedValue(undefined);
    vi.mocked(walletService.updateWallet).mockResolvedValue(undefined);
    vi.mocked(walletService.deleteWallet).mockResolvedValue({ blocked: null });
    vi.mocked(walletService.reconcileWallet).mockResolvedValue(undefined);
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

      expect(walletService.addWallet).toHaveBeenCalledWith(mockUser.id, newWallet);
      expect(mockShowToast).toHaveBeenCalledWith("Dompet berhasil dibuat!", 'success');
      expect(mockSetIsWalletModalOpen).toHaveBeenCalledWith(false);
    });

    it('should handle errors when adding wallet', async () => {
      vi.mocked(walletService.addWallet).mockRejectedValue(new Error('DB Error'));
      const { result } = renderHook(() => useWalletActions(mockUser));

      await act(async () => {
        await result.current.addWallet({ name: 'Test', balance: 0, color: 'red', icon: 'test' });
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

      expect(walletService.updateWallet).toHaveBeenCalledWith(mockUser.id, 'wallet-1', updateData);
      expect(mockShowToast).toHaveBeenCalledWith("Dompet berhasil diperbarui!", 'success');
      expect(mockSetIsEditWalletModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet if no transactions exist', async () => {
      const { result } = renderHook(() => useWalletActions(mockUser));

      await act(async () => {
        await result.current.deleteWallet('wallet-1');
      });

      expect(walletService.deleteWallet).toHaveBeenCalledWith(mockUser.id, 'wallet-1');
      expect(mockShowToast).toHaveBeenCalledWith("Dompet berhasil dihapus.", 'success');
    });

    it('should prevent deletion if transactions exist', async () => {
      vi.mocked(walletService.deleteWallet).mockResolvedValue({
        blocked: 'Gagal menghapus: Dompet masih memiliki riwayat transaksi.'
      });

      const { result } = renderHook(() => useWalletActions(mockUser));

      await act(async () => {
        await result.current.deleteWallet('wallet-1');
      });

      expect(mockShowToast).toHaveBeenCalledWith("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
    });
  });
});
