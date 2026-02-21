import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUI } from '@/components/ui-provider';
import type { Wallet, WalletInput } from '@/types/models';

export const useWalletActions = (user: User | null) => {
    const ui = useUI();
    const supabase = createClient();

    const addWallet = useCallback(async (walletData: WalletInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('wallets').insert({
            name: walletData.name,
            balance: walletData.balance || 0,
            icon: walletData.icon,
            color: walletData.color,
            is_default: walletData.isDefault || false,
            user_id: user.id
        });

        if (error) {
             ui.showToast("Gagal membuat dompet.", 'error');
             return;
        }

        ui.showToast("Dompet berhasil dibuat!", 'success');
        ui.setIsWalletModalOpen(false);
    }, [user, ui, supabase]);

     const updateWallet = useCallback(async (walletId: string, walletData: Partial<Wallet>) => {
        if (!user) throw new Error("User not authenticated.");

        if (walletData.isDefault === true) {
            // Unset other defaults
            const { error: unsetError } = await supabase.from('wallets').update({ is_default: false }).eq('user_id', user.id);
            if (unsetError) {
                console.error("Error unsetting other default wallets:", unsetError);
                ui.showToast("Gagal mengubah dompet utama.", 'error');
                return;
            }
        }
        
        const { isDefault, ...rest } = walletData;
        const updateData: Record<string, unknown> = { ...rest };
        if (isDefault !== undefined) updateData.is_default = isDefault;

        const { error } = await supabase.from('wallets').update(updateData).eq('id', walletId);

        if (error) {
            ui.showToast("Gagal memperbarui dompet.", 'error');
            return;
        }
        
        ui.showToast("Dompet berhasil diperbarui!", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, ui, supabase]);

    const deleteWallet = useCallback(async (walletId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // 1. Check for Transactions
        const { count: txCount, error: txError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('wallet_id', walletId);

        if (txError) {
            console.error("[useWalletActions] Error checking transactions:", txError);
            ui.showToast("Gagal memeriksa riwayat transaksi.", 'error');
            return;
        }

        if (txCount && txCount > 0) {
            ui.showToast("Dompet tidak bisa dihapus karena memiliki riwayat transaksi.", 'error');
            return;
        }

        // 2. Check for Debt Payments (Normalisasi Baru)
        const { count: paymentCount, error: paymentError } = await supabase
            .from('debt_payments')
            .select('*', { count: 'exact', head: true })
            .eq('wallet_id', walletId);

        if (!paymentError && paymentCount && paymentCount > 0) {
            ui.showToast("Dompet tidak bisa dihapus karena terkait dengan pembayaran hutang.", 'error');
            return;
        }

        // 3. Final Delete Call
        const { error } = await supabase
            .from('wallets')
            .delete()
            .eq('id', walletId)
            .eq('user_id', user.id); // Guard with user_id

        if (error) {
            console.error("[useWalletActions] Delete Error:", error);
            ui.showToast(`Gagal menghapus dompet: ${error.message}`, 'error');
            return;
        }

        ui.showToast("Dompet berhasil dihapus.", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, ui, supabase]);

    return {
        addWallet,
        updateWallet,
        deleteWallet
    };
};
