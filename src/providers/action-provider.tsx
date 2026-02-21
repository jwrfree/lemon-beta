'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { Wallet, WalletInput, Transaction, TransactionInput, TransactionUpdate } from '@/types/models';
import type { Category } from '@/lib/categories';
import { useTransactionActions } from '@/features/transactions/hooks/use-transaction-actions';
import { useWalletActions } from '@/features/wallets/hooks/use-wallet-actions';
import { useTransferActions } from '@/features/transactions/hooks/use-transfer-actions';
import { useCategoryActions } from '@/features/transactions/hooks/use-category-actions';
import { useAuth } from './auth-provider';

interface TransferPayload {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    description: string;
}

interface ActionContextType {
    addTransaction: (data: TransactionInput) => Promise<void>;
    updateTransaction: (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => Promise<void>;
    deleteTransaction: (transaction: Transaction) => Promise<void>;
    addWallet: (walletData: WalletInput) => Promise<void>;
    updateWallet: (walletId: string, walletData: Partial<Wallet>) => Promise<void>;
    deleteWallet: (walletId: string) => Promise<void>;
    addTransfer: (data: TransferPayload) => Promise<void>;
    reconcileWallet: (walletId: string, currentBalance: number, targetBalance: number) => Promise<void>;
    addCategory: (category: Partial<Category>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const ActionContext = createContext<ActionContextType | null>(null);

export const useActions = () => {
    const context = useContext(ActionContext);
    if (!context) {
        throw new Error('useActions must be used within an ActionProvider');
    }
    return context;
};

export const ActionProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();

    const { addTransaction, updateTransaction, deleteTransaction } = useTransactionActions(user);
    const { addWallet, updateWallet, deleteWallet, reconcileWallet } = useWalletActions(user);
    const { addTransfer } = useTransferActions(user);
    const { addCategory, updateCategory, deleteCategory } = useCategoryActions(user);

    const contextValue = useMemo(() => ({
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        addTransfer,
        addCategory,
        updateCategory,
        deleteCategory,
        reconcileWallet
    }), [
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        addTransfer,
        addCategory,
        updateCategory,
        deleteCategory,
        reconcileWallet
    ]);

    return (
        <ActionContext.Provider value={contextValue}>
            {children}
        </ActionContext.Provider>
    );
};
