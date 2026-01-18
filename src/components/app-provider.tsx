
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter as useNextRouter } from 'next/navigation';
import { useUI } from './ui-provider';
import { logActivity } from '@/lib/audit';
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

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useNextRouter();
    const ui = useUI();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };
        
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        if (!user) {
            setUserData(null);
            return;
        }

        // Fetch user profile from 'profiles' table (assuming it exists) or just use user metadata
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (data) {
                setUserData(data as UserProfile);
            } else {
                // Fallback to auth metadata if profile doesn't exist yet
                setUserData({ 
                    id: user.id,
                    email: user.email,
                    displayName: user.user_metadata?.full_name,
                    photoURL: user.user_metadata?.avatar_url
                } as UserProfile);
            }
        };

        fetchProfile();
    }, [user, supabase]);
    
    const updateUserBiometricStatus = useCallback(async (isBiometricEnabled: boolean) => {
        if (!user) throw new Error("User not authenticated.");
        // Update in profiles table
        await supabase.from('profiles').upsert({ id: user.id, is_biometric_enabled: isBiometricEnabled });
    }, [user, supabase]);

    const handleSignOut = async () => {
        try {
            await logActivity({ action: 'LOGOUT', entity: 'USER' });
            await supabase.auth.signOut();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lemon_biometric_user');
            }
            ui.showToast("Kamu berhasil keluar.", 'info');
            router.push('/');
        } catch (error) {
            ui.showToast("Gagal keluar.", 'error');
            console.error("Sign out error:", error);
        }
    };
    
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
            ui.showToast("Gagal menambahkan transaksi.", 'error');
            return;
        }

        // Trigger wallet balance update (simplification: assume trigger or manual update)
        // For MVP without triggers: fetch wallet, calculate new balance, update wallet.
        // Or better: use RPC.
        // For now, let's rely on realtime or manual refresh. 
        // We really should update the wallet balance here to keep UI consistent if not using realtime for balance.
        
        const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', data.walletId).single();
        if (wallet) {
            const newBalance = data.type === 'income' ? wallet.balance + data.amount : wallet.balance - data.amount;
            await supabase.from('wallets').update({ balance: newBalance }).eq('id', data.walletId);
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
            ui.showToast("Gagal memperbarui transaksi.", 'error');
            return;
        }

        // Handle Wallet Balance Updates (Complex logic)
        // 1. Revert old transaction effect on old wallet
        const { data: oldWallet } = await supabase.from('wallets').select('balance').eq('id', oldData.walletId).single();
        if (oldWallet) {
            const oldAmountEffect = oldData.type === 'income' ? -oldData.amount : +oldData.amount;
             await supabase.from('wallets').update({ balance: oldWallet.balance + oldAmountEffect }).eq('id', oldData.walletId);
        }

        // 2. Apply new transaction effect on new wallet
        // Note: if walletId is same, we need to fetch the *updated* balance from step 1 (if we did it strictly sequentially).
        // Actually, if walletId is same, we can combine.
        
        if (oldData.walletId === newData.walletId) {
             // We already reverted the old amount. Now apply new amount.
             // But we need the FRESH balance.
             const { data: currentWallet } = await supabase.from('wallets').select('balance').eq('id', newData.walletId).single();
             if (currentWallet) {
                 const newAmountEffect = newData.type === 'income' ? +newData.amount : -newData.amount;
                 await supabase.from('wallets').update({ balance: currentWallet.balance + newAmountEffect }).eq('id', newData.walletId);
             }
        } else {
            // Different wallet
             const { data: newWallet } = await supabase.from('wallets').select('balance').eq('id', newData.walletId).single();
             if (newWallet) {
                 const newAmountEffect = newData.type === 'income' ? +newData.amount : -newData.amount;
                 await supabase.from('wallets').update({ balance: newWallet.balance + newAmountEffect }).eq('id', newData.walletId);
             }
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

        // Revert balance
        const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', transaction.walletId).single();
        if (wallet) {
            const newBalance = transaction.type === 'income' ? wallet.balance - transaction.amount : wallet.balance + transaction.amount;
            await supabase.from('wallets').update({ balance: newBalance }).eq('id', transaction.walletId);
        }
        
        await logActivity({ 
            action: 'DELETE_TRANSACTION', 
            entity: 'TRANSACTION', 
            entityId: transaction.id 
        });

        ui.showToast("Transaksi berhasil dihapus!", 'success');
    }, [user, ui, supabase]);

    const addWallet = useCallback(async (walletData: WalletInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('wallets').insert({
            name: walletData.name,
            balance: walletData.balance || 0,
            icon: walletData.icon,
            color: walletData.color,
            is_default: walletData.isDefault || false,
            user_id: user.id
        });

        if (error) {
             ui.showToast("Gagal membuat dompet.", 'error');
             return;
        }

        ui.showToast("Dompet berhasil dibuat!", 'success');
        ui.setIsWalletModalOpen(false);
    }, [user, ui, supabase]);

     const updateWallet = useCallback(async (walletId: string, walletData: Partial<Wallet>) => {
        if (!user) throw new Error("User not authenticated.");

        if (walletData.isDefault === true) {
            // Unset other defaults
            await supabase.from('wallets').update({ is_default: false }).eq('user_id', user.id);
        }
        
        const updateData: any = { ...walletData };
        if (walletData.isDefault !== undefined) updateData.is_default = walletData.isDefault;
        delete updateData.isDefault;

        const { error } = await supabase.from('wallets').update(updateData).eq('id', walletId);

        if (error) {
            ui.showToast("Gagal memperbarui dompet.", 'error');
            return;
        }
        
        ui.showToast("Dompet berhasil diperbarui!", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, ui, supabase]);

    const deleteWallet = useCallback(async (walletId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Check transactions
        const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('wallet_id', walletId);

        if (count && count > 0) {
            ui.showToast("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
            return;
        }

        const { error } = await supabase.from('wallets').delete().eq('id', walletId);
        if (error) {
            ui.showToast("Gagal menghapus dompet.", 'error');
            return;
        }

        ui.showToast("Dompet berhasil dihapus.", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, ui, supabase]);

    const addTransfer = useCallback(async (data: TransferPayload) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { fromWalletId, toWalletId, amount, date, description } = data;

        // Fetch wallets to get names and current balances
        const { data: fromWallet } = await supabase.from('wallets').select('*').eq('id', fromWalletId).single();
        const { data: toWallet } = await supabase.from('wallets').select('*').eq('id', toWalletId).single();

        if (!fromWallet || !toWallet) {
             ui.showToast("Dompet asal atau tujuan tidak ditemukan.", 'error');
            return;
        }
        
        // Create expense transaction
        await supabase.from('transactions').insert({
            type: 'expense',
            amount,
            category: 'Transfer',
            wallet_id: fromWalletId,
            description: `Transfer ke ${toWallet.name}: ${description}`,
            date,
            user_id: user.id,
        });

        // Create income transaction
        await supabase.from('transactions').insert({
            type: 'income',
            amount,
            category: 'Transfer',
            wallet_id: toWalletId,
            description: `Transfer dari ${fromWallet.name}: ${description}`,
            date,
            user_id: user.id,
        });

        // Update balances
        await supabase.from('wallets').update({ balance: fromWallet.balance - amount }).eq('id', fromWalletId);
        await supabase.from('wallets').update({ balance: toWallet.balance + amount }).eq('id', toWalletId);

        ui.showToast("Transfer berhasil dicatat!", 'success');
        ui.setIsTransferModalOpen(false);

    }, [user, ui, supabase]);


    const contextValue: AppContextType = {
        user,
        userData,
        isLoading,
        handleSignOut,
        updateUserBiometricStatus,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        addTransfer,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
