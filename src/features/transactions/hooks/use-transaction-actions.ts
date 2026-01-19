import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUI } from '@/components/ui-provider';
import { logActivity } from '@/lib/audit';
import type { Transaction, TransactionInput, TransactionUpdate } from '@/types/models';

export const useTransactionActions = (user: User | null) => {
    const ui = useUI();
    const supabase = createClient();

    const addTransaction = useCallback(async (data: TransactionInput) => {
        if (!user) return;
        
        const { error } = await supabase.from('transactions').insert({
            amount: data.amount,
            category: data.category,
            date: data.date,
            description: data.description,
            type: data.type,
            wallet_id: data.walletId,
            user_id: user.id
        });

        if (error) {
            console.error("Error adding transaction:", error);
            const message = error.message?.includes('Saldo tidak mencukupi') 
                ? "Gagal: Saldo dompet tidak mencukupi untuk transaksi ini." 
                : "Gagal menambahkan transaksi.";
            ui.showToast(message, 'error');
            return;
        }

        await logActivity({ 
            action: 'CREATE_TRANSACTION', 
            entity: 'TRANSACTION', 
            details: { amount: data.amount, type: data.type, category: data.category } 
        });

        ui.setIsTxModalOpen(false);
        ui.showToast("Transaksi berhasil ditambahkan!", 'success');
    }, [user, ui, supabase]);

    const updateTransaction = useCallback(async (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => {
        if (!user) throw new Error("User not authenticated.");

        const { error } = await supabase.from('transactions').update({
            amount: newData.amount,
            category: newData.category,
            date: newData.date,
            description: newData.description,
            type: newData.type,
            wallet_id: newData.walletId
        }).eq('id', transactionId);

        if (error) {
            const message = error.message?.includes('Saldo tidak mencukupi') 
                ? "Gagal memperbarui: Saldo dompet tidak mencukupi." 
                : "Gagal memperbarui transaksi.";
            ui.showToast(message, 'error');
            return;
        }

        ui.showToast("Transaksi berhasil diperbarui!", 'success');
        ui.setIsTxModalOpen(false);
        ui.setTransactionToEdit(null);

    }, [user, ui, supabase]);

    const deleteTransaction = useCallback(async (transaction: Transaction) => {
        if (!user || !transaction) return;
        if (transaction.category === 'Transfer') {
            ui.showToast("Menghapus transaksi transfer belum didukung.", 'error');
            return;
        }

        const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
        if (error) {
             ui.showToast("Gagal menghapus transaksi.", 'error');
             return;
        }

        await logActivity({ 
            action: 'DELETE_TRANSACTION', 
            entity: 'TRANSACTION', 
            entityId: transaction.id 
        });

        ui.showToast("Transaksi berhasil dihapus!", 'success');
    }, [user, ui, supabase]);

    return {
        addTransaction,
        updateTransaction,
        deleteTransaction
    };
};
