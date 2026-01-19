import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUI } from '@/components/ui-provider';

interface TransferPayload {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    description: string;
}

export const useTransferActions = (user: User | null) => {
    const ui = useUI();
    const supabase = createClient();

    const addTransfer = useCallback(async (data: TransferPayload) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { fromWalletId, toWalletId, amount, date, description } = data;

        // Create expense transaction
        const { error: expError } = await supabase.from('transactions').insert({
            type: 'expense',
            amount,
            category: 'Transfer',
            wallet_id: fromWalletId,
            description: `Transfer (Keluar): ${description}`,
            date,
            user_id: user.id,
        });

        if (expError) {
            console.error("Transfer error (expense):", expError);
            const message = expError.message?.includes('Saldo tidak mencukupi') 
                ? "Gagal: Saldo dompet asal tidak mencukupi untuk transfer ini." 
                : "Gagal mencatat pengeluaran transfer.";
            ui.showToast(message, 'error');
            return;
        }

        // Create income transaction
        const { error: incError } = await supabase.from('transactions').insert({
            type: 'income',
            amount,
            category: 'Transfer',
            wallet_id: toWalletId,
            description: `Transfer (Masuk): ${description}`,
            date,
            user_id: user.id,
        });

        if (incError) {
            console.error("Transfer error (income):", incError);
            ui.showToast("Gagal mencatat pemasukan transfer.", 'error');
            return;
        }

        ui.showToast("Transfer berhasil dicatat!", 'success');
        ui.setIsTransferModalOpen(false);

    }, [user, ui, supabase]);

    return {
        addTransfer
    };
};
