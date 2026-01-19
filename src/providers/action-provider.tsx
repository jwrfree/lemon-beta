'use client';

import React, { createContext, useContext } from 'react';
import type { Wallet, WalletInput, Transaction, TransactionInput, TransactionUpdate } from '@/types/models';
import { useTransactionActions } from '@/features/transactions/hooks/use-transaction-actions';
import { useWalletActions } from '@/features/wallets/hooks/use-wallet-actions';
import { useTransferActions } from '@/features/transactions/hooks/use-transfer-actions';
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
    const { addWallet, updateWallet, deleteWallet } = useWalletActions(user);
    const { addTransfer } = useTransferActions(user);

    return (
        <ActionContext.Provider value={{ 
            addTransaction, 
            updateTransaction, 
            deleteTransaction, 
            addWallet, 
            updateWallet, 
            deleteWallet, 
            addTransfer 
        }}>
            {children}
        </ActionContext.Provider>
    );
};
