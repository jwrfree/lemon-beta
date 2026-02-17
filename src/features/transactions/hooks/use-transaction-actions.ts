import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useUI } from '@/components/ui-provider';
import { logActivity } from '@/lib/audit';
import type { Transaction, TransactionInput, TransactionUpdate } from '@/types/models';
import { transactionService } from '../services/transaction.service';
import { UnifiedTransactionFormValues } from '../schemas/transaction-schema';
import { useWalletData } from '@/providers/wallet-provider';
import { transactionEvents } from '@/lib/transaction-events';

export const useTransactionActions = (user: User | null) => {
    const ui = useUI();
    const { updateWalletOptimistically } = useWalletData();

    const addTransaction = useCallback(async (data: TransactionInput) => {
        if (!user) return;

        // 1. Optimistic Update (UI reacts instantly)
        updateWalletOptimistically(data.walletId, data.amount, data.type as 'expense' | 'income');

        // Optimistic UI for List
        const optimisticTransaction: Transaction = {
            id: `temp-${Date.now()}`,
            amount: data.amount,
            category: data.category,
            subCategory: data.subCategory || undefined,
            date: new Date(data.date).toISOString(),
            description: data.description,
            walletId: data.walletId,
            userId: user.id,
            type: data.type as 'expense' | 'income',
            createdAt: new Date().toISOString(),
            location: data.location || undefined,
            isNeed: data.isNeed,
        };
        transactionEvents.emit('transaction.created', optimisticTransaction);


        // 2. Prepare mapped data
        const mappedData: UnifiedTransactionFormValues = {
            type: data.type as 'expense' | 'income',
            amount: data.amount,
            category: data.category,
            subCategory: data.subCategory || '',
            date: new Date(data.date),
            description: data.description,
            walletId: data.walletId,
            location: data.location || '',
            isNeed: data.isNeed,
        };

        const result = await transactionService.createTransaction(user.id, mappedData);

        if (result.error) {
            ui.showToast(result.error, 'error');
            // Rollback is tricky here without undoing the event, but for now we rely on revalidation or refresh
            // Ideally we'd emit a 'transaction.deleted' for the temp ID if it failed
            transactionEvents.emit('transaction.deleted', optimisticTransaction.id);
            return;
        }

        // Replace temp ID with real ID in the list if possible, or just let the next fetch handle it
        // For simple optimistic UI, we often just let the real data eventually replace it via revalidation
        // But since we don't automatic revalidate here, we might want to update the ID
        // For now, let's keep it simple: the optimistic one stays until a refresh happens

        await logActivity({
            action: 'CREATE_TRANSACTION',
            entity: 'TRANSACTION',
            details: { amount: data.amount, type: data.type, category: data.category }
        });

        ui.setIsTxModalOpen(false);
        ui.showToast("Transaksi berhasil ditambahkan!", 'success');
    }, [user, ui, updateWalletOptimistically]);

    const updateTransaction = useCallback(async (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => {
        if (!user) throw new Error("User not authenticated.");

        // 1. Optimistic Rollback Old + Apply New
        // First revert the old transaction's impact
        updateWalletOptimistically(oldData.walletId, oldData.amount, oldData.type === 'income' ? 'expense' : 'income');
        // Then apply the new transaction's impact
        updateWalletOptimistically(newData.walletId, newData.amount, newData.type as 'income' | 'expense');

        // Optimistic UI Update
        const optimisticTransaction: Transaction = {
            ...oldData,
            ...newData,
            date: new Date(newData.date).toISOString(),
            // Ensure types match
            subCategory: newData.subCategory || undefined,
            location: newData.location || undefined,
        };
        transactionEvents.emit('transaction.updated', optimisticTransaction);


        const mappedData: UnifiedTransactionFormValues = {
            type: newData.type as 'expense' | 'income',
            amount: newData.amount,
            category: newData.category,
            subCategory: newData.subCategory || '',
            date: new Date(newData.date),
            description: newData.description,
            walletId: newData.walletId,
            location: newData.location || '',
            isNeed: newData.isNeed,
        };

        const result = await transactionService.updateTransaction(user.id, transactionId, mappedData);

        if (result.error) {
            ui.showToast(result.error, 'error');
            // Rollback optimistic update
            transactionEvents.emit('transaction.updated', oldData);
            return;
        }

        ui.showToast("Transaksi berhasil diperbarui!", 'success');
        ui.setIsTxModalOpen(false);
        ui.setTransactionToEdit(null);

    }, [user, ui, updateWalletOptimistically]);

    const deleteTransaction = useCallback(async (transaction: Transaction) => {
        if (!user || !transaction) return;

        // 1. Optimistic Revert (if we delete expense, we ADD back to wallet)
        updateWalletOptimistically(transaction.walletId, transaction.amount, transaction.type === 'income' ? 'expense' : 'income');

        // Optimistic UI Update
        transactionEvents.emit('transaction.deleted', transaction.id);

        const result = await transactionService.deleteTransaction(user.id, transaction.id);

        if (result.error) {
            ui.showToast(result.error, 'error');
            // Rollback: Re-add the transaction
            transactionEvents.emit('transaction.created', transaction);
            return;
        }

        await logActivity({
            action: 'DELETE_TRANSACTION',
            entity: 'TRANSACTION',
            entityId: transaction.id
        });

        ui.showToast("Transaksi berhasil dihapus!", 'success');
    }, [user, ui, updateWalletOptimistically]);

    return {
        addTransaction,
        updateTransaction,
        deleteTransaction
    };
};
