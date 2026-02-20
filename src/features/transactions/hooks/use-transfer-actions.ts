import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useUI } from '@/components/ui-provider';
import { useWalletData } from '@/providers/wallet-provider';
import { transactionService } from '../services/transaction.service';
import { UnifiedTransactionFormValues } from '../schemas/transaction-schema';

interface TransferPayload {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    description: string;
}

export const useTransferActions = (user: User | null) => {
    const ui = useUI();
    const { updateWalletOptimistically, refreshWallets } = useWalletData();

    const addTransfer = useCallback(async (data: TransferPayload) => {
        if (!user) throw new Error("User not authenticated.");

        const { fromWalletId, toWalletId, amount, date, description } = data;

        // 1. Optimistic Update (UI reacts instantly)
        updateWalletOptimistically(fromWalletId, amount, 'expense');
        updateWalletOptimistically(toWalletId, amount, 'income');

        // 2. Prepare RPC Payload
        const payload: UnifiedTransactionFormValues = {
            type: 'transfer',
            fromWalletId,
            toWalletId,
            amount,
            date: new Date(date),
            description
        };

        const result = await transactionService.createTransaction(user.id, payload);

        if (result.error) {
            ui.showToast(result.error, 'error');
            // Authority Sync: Recompute balances from server if atomic transfer fails
            await refreshWallets();
            return;
        }

        ui.showToast("Transfer berhasil dicatat!", 'success');
        ui.setIsTransferModalOpen(false);

    }, [user, ui, updateWalletOptimistically, refreshWallets]);

    return {
        addTransfer
    };
};
