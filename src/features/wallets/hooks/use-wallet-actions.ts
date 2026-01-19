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
        
        const updateData: any = { ...walletData };
        if (walletData.isDefault !== undefined) updateData.is_default = walletData.isDefault;
        delete updateData.isDefault;

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
        
        // Check transactions
        const { count, error: countError } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('wallet_id', walletId);

        if (countError) {
            console.error("Error checking transactions before wallet deletion:", countError);
            ui.showToast("Gagal memeriksa riwayat transaksi.", 'error');
            return;
        }

        if (count && count > 0) {
            ui.showToast("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
            return;
        }

        const { error } = await supabase.from('wallets').delete().eq('id', walletId);
        if (error) {
            ui.showToast("Gagal menghapus dompet.", 'error');
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
