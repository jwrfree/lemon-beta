'use client';

import React, { createContext, useContext } from 'react';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ActionProvider, useActions } from '@/providers/action-provider';

// Reuse the interface from previous implementation
import { User } from '@supabase/supabase-js';
import type { UserProfile, Wallet, WalletInput, Transaction, TransactionInput, TransactionUpdate } from '@/types/models';

interface TransferPayload {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    description: string;
}

interface AppContextType {
    user: User | null;
    userData: UserProfile | null;
    isLoading: boolean;
    handleSignOut: () => void;
    updateUserBiometricStatus: (isBiometricEnabled: boolean) => Promise<void>;
    addTransaction: (data: TransactionInput) => Promise<void>;
    updateTransaction: (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => Promise<void>;
    deleteTransaction: (transaction: Transaction) => Promise<void>;
    addWallet: (walletData: WalletInput) => Promise<void>;
    updateWallet: (walletId: string, walletData: Partial<Wallet>) => Promise<void>;
    deleteWallet: (walletId: string) => Promise<void>;
    addTransfer: (data: TransferPayload) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

/**
 * @deprecated Use useAuth() or useActions() directly for better performance.
 * This hook is kept for backward compatibility.
 */
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        // Fallback: If not within AppProvider but within Auth/Action providers, 
        // we can still reconstruct it, but AppProvider should be the root.
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

const AppContextBridge = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuth();
    const actions = useActions();

    const value: AppContextType = {
        ...auth,
        ...actions,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <ActionProvider>
                <AppContextBridge>
                    {children}
                </AppContextBridge>
            </ActionProvider>
        </AuthProvider>
    );
};