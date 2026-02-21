'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { transactionEvents } from '@/lib/transaction-events';
import type { Transaction, Wallet } from '@/types/models';
import { walletService } from '@/lib/services/wallet-service';

interface WalletContextType {
    wallets: Wallet[];
    isLoading: boolean;
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
    const { user, isLoading: authLoading } = useAuth();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchWallets = useCallback(async () => {
        if (!user) return;
        try {
            const data = await walletService.getWallets(user.id);
            setWallets(data);
        } catch (err) {
            console.error("[WalletProvider] Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Optimistic Update Function
    const updateWalletOptimistically = useCallback((walletId: string, amount: number, type: 'income' | 'expense') => {
        setWallets(prev => prev.map(w => {
            if (w.id === walletId) {
                const change = type === 'income' ? amount : -amount;
                return { ...w, balance: Number(w.balance) + change };
            }
            return w;
        }));
    }, []);

    useEffect(() => {
        if (!user) {
            setWallets([]);
            setIsLoading(false);
            return;
        }

        fetchWallets();

        // Listen for real database changes to keep in sync
        const channel = supabase
            .channel('wallets-global-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
                () => fetchWallets()
            )
            .subscribe();

        // -----------------------------------------------------
        // TRANSACTION EVENT LISTENER (Optimistic Sync)
        // -----------------------------------------------------
        const handleTxCreated = (tx: Transaction) => {
            updateWalletOptimistically(tx.walletId, tx.amount, tx.type);
        };

        const handleTxUpdated = (tx: Transaction) => {
            // For simplicity, we just refetch wallets to ensure accuracy on updates
            // as we don't know the delta easily here.
            fetchWallets();
        };

        const handleTxDeleted = (txId: string) => {
            // Similarly for delete, we need to know the amount to revert.
            // Refetching is safer.
            fetchWallets();
        };

        transactionEvents.on('transaction.created', handleTxCreated);
        transactionEvents.on('transaction.updated', handleTxUpdated);
        transactionEvents.on('transaction.deleted', handleTxDeleted);

        return () => {
            supabase.removeChannel(channel);
            transactionEvents.off('transaction.created', handleTxCreated);
            transactionEvents.off('transaction.updated', handleTxUpdated);
            transactionEvents.off('transaction.deleted', handleTxDeleted);
        };
    }, [user, supabase, fetchWallets, updateWalletOptimistically]);

    return (
        <WalletContext.Provider value={{
            wallets,
            isLoading: isLoading || authLoading,
            updateWalletOptimistically,
            refreshWallets: fetchWallets
        }}>
            {children}
        </WalletContext.Provider>
    );
};
