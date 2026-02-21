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
    const { updateWalletOptimistically, refreshWallets } = useWalletData();

    const addTransaction = useCallback(async (data: TransactionInput) => {
        if (!user) return;

        // 1. Optimistic Update
        updateWalletOptimistically(data.walletId, data.amount, data.type as 'expense' | 'income');

        const optimisticTransaction: Transaction = {
            id: `temp-${Date.now()}`,
            amount: Number(data.amount),
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
            // Authoritative Refresh: Sync UI back with server state immediately
            await refreshWallets();
            transactionEvents.emit('transaction.deleted', optimisticTransaction.id);
            return;
        }

        await logActivity({
            action: 'CREATE_TRANSACTION',
            entity: 'TRANSACTION',
            details: { amount: data.amount, type: data.type, category: data.category }
        });

        ui.setIsTxModalOpen(false);
        ui.showToast("Transaksi berhasil ditambahkan!", 'success');
    }, [user, ui, updateWalletOptimistically, refreshWallets]);

    const updateTransaction = useCallback(async (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => {
        if (!user) throw new Error("User not authenticated.");

        // 1. Optimistic Revert Old + Apply New
        updateWalletOptimistically(oldData.walletId, oldData.amount, oldData.type === 'income' ? 'expense' : 'income');
        updateWalletOptimistically(newData.walletId, newData.amount, newData.type as 'income' | 'expense');

        const optimisticTransaction: Transaction = {
            ...oldData,
            ...newData,
            date: new Date(newData.date).toISOString(),
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
            // Authority Sync: Revert client local state with real data
            await refreshWallets();
            transactionEvents.emit('transaction.updated', oldData);
            return;
        }

        ui.showToast("Transaksi berhasil diperbarui!", 'success');
        ui.setIsTxModalOpen(false);
        ui.setTransactionToEdit(null);

    }, [user, ui, updateWalletOptimistically, refreshWallets]);

    const deleteTransaction = useCallback(async (transaction: Transaction) => {
        if (!user || !transaction) return;

        // 1. Optimistic Revert
        updateWalletOptimistically(transaction.walletId, transaction.amount, transaction.type === 'income' ? 'expense' : 'income');
        transactionEvents.emit('transaction.deleted', transaction.id);

        const result = await transactionService.deleteTransaction(user.id, transaction.id);

        if (result.error) {
            ui.showToast(result.error, 'error');
            // Conflict Resolution: Fetch real balance if delete fails
            await refreshWallets();
            transactionEvents.emit('transaction.created', transaction);
            return;
        }

        await logActivity({
            action: 'DELETE_TRANSACTION',
            entity: 'TRANSACTION',
            entityId: transaction.id
        });

        ui.showToast("Transaksi berhasil dihapus!", 'success');
    }, [user, ui, updateWalletOptimistically, refreshWallets]);

    return {
        addTransaction,
        updateTransaction,
        deleteTransaction
    };
};
