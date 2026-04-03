'use client';

import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { transactionEvents } from '@/lib/transaction-events';
import type { Transaction, Wallet } from '@/types/models';

interface WalletContextType {
    updateWalletOptimistically: (walletId: string, amount: number, type: 'income' | 'expense') => void;
    refreshWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWalletData = () => {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWalletData must be used within a WalletProvider');
    return context;
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const refreshWallets = useCallback(async () => {
        if (!user) return;
        await queryClient.invalidateQueries({ queryKey: ['wallets', user.id] });
    }, [user, queryClient]);

    const updateWalletOptimistically = useCallback((walletId: string, amount: number, type: 'income' | 'expense') => {
        if (!user) return;

        queryClient.setQueryData<Wallet[]>(['wallets', user.id], (previousWallets = []) => (
            previousWallets.map((wallet) => {
                if (wallet.id !== walletId) {
                    return wallet;
                }

                const change = type === 'income' ? amount : -amount;
                return {
                    ...wallet,
                    balance: Number(wallet.balance) + change,
                };
            })
        ));
    }, [user, queryClient]);

    useEffect(() => {
        if (!user) {
            return;
        }

        const walletChannel = supabase
            .channel('wallets-global-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
                () => {
                    void refreshWallets();
                }
            )
            .subscribe();

        const handleTxCreated = (transaction: Transaction) => {
            updateWalletOptimistically(transaction.walletId, transaction.amount, transaction.type);
        };

        const handleWalletRefresh = () => {
            void refreshWallets();
        };

        transactionEvents.on('transaction.created', handleTxCreated);
        transactionEvents.on('transaction.updated', handleWalletRefresh);
        transactionEvents.on('transaction.deleted', handleWalletRefresh);
        transactionEvents.on('transaction.sync', handleWalletRefresh);

        return () => {
            supabase.removeChannel(walletChannel);
            transactionEvents.off('transaction.created', handleTxCreated);
            transactionEvents.off('transaction.updated', handleWalletRefresh);
            transactionEvents.off('transaction.deleted', handleWalletRefresh);
            transactionEvents.off('transaction.sync', handleWalletRefresh);
        };
    }, [user, supabase, refreshWallets, updateWalletOptimistically]);

    return (
        <WalletContext.Provider value={{ updateWalletOptimistically, refreshWallets }}>
            {children}
        </WalletContext.Provider>
    );
};
