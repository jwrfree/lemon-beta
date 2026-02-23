import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useUI } from '@/components/ui-provider';
import type { Wallet, WalletInput } from '@/types/models';
import { walletService } from '@/lib/services/wallet-service';

export const useWalletActions = (user: User | null) => {
    const ui = useUI();

    const addWallet = useCallback(async (walletData: WalletInput) => {
        if (!user) throw new Error("User not authenticated.");

        try {
            await walletService.addWallet(user.id, walletData);
            ui.showToast("Dompet berhasil dibuat!", 'success');
            ui.setIsWalletModalOpen(false);
        } catch (err) {
            console.error("[useWalletActions] Add Error:", err);
            ui.showToast("Gagal membuat dompet.", 'error');
        }
    }, [user, ui]);

    const updateWallet = useCallback(async (walletId: string, walletData: Partial<Wallet>) => {
        if (!user) throw new Error("User not authenticated.");

        try {
            await walletService.updateWallet(user.id, walletId, walletData);
            ui.showToast("Dompet berhasil diperbarui!", 'success');
            ui.setIsEditWalletModalOpen(false);
        } catch (err) {
            console.error("[useWalletActions] Update Error:", err);
            ui.showToast("Gagal memperbarui dompet.", 'error');
        }
    }, [user, ui]);

    const deleteWallet = useCallback(async (walletId: string) => {
        if (!user) throw new Error("User not authenticated.");

        try {
            const result = await walletService.deleteWallet(user.id, walletId);

            if (result.blocked) {
                ui.showToast(result.blocked, 'error');
                return;
            }

            ui.showToast("Dompet berhasil dihapus.", 'success');
            ui.setIsEditWalletModalOpen(false);
        } catch (err: any) {
            console.error("[useWalletActions] Delete Error:", err);
            ui.showToast(`Gagal menghapus dompet: ${err.message}`, 'error');
        }
    }, [user, ui]);

    const reconcileWallet = useCallback(async (walletId: string, currentBalance: number, targetBalance: number) => {
        if (!user) throw new Error("User not authenticated.");

        try {
            await walletService.reconcileWallet(user.id, walletId, currentBalance, targetBalance);
            ui.showToast("Saldo berhasil dikoreksi!", 'success');
            ui.setIsEditWalletModalOpen(false);
        } catch (err: any) {
            console.error("[useWalletActions] Reconcile Error:", err);
            ui.showToast(`Gagal koreksi saldo: ${err.message}`, 'error');
        }
    }, [user, ui]);

    return {
        addWallet,
        updateWallet,
        deleteWallet,
        reconcileWallet
    };
};
