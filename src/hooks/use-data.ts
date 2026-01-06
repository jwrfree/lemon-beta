
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    writeBatch,
    query,
    orderBy,
    deleteDoc,
    getDoc,
    getDocs,
    where,
    type CollectionReference,
    type DocumentData,
    type OrderByDirection,
} from 'firebase/firestore';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { db } from '@/lib/firebase';
import { categories } from '@/lib/categories';
import type {
    Wallet,
    WalletInput,
    Budget,
    BudgetInput,
    Transaction,
    TransactionInput,
    TransactionUpdate,
} from '@/types/models';
import { useReminders } from './use-reminders';

interface TransferPayload {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    description: string;
}

export const useData = () => {
    const { user } = useApp();
    const router = useNextRouter();
    const ui = useUI();
    const { reminders } = useReminders();

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getCollectionRef = useCallback((collectionName: string) => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/${collectionName}`);
    }, [user]);

     useEffect(() => {
        if (!user) {
            setWallets([]);
            setTransactions([]);
            setBudgets([]);
            setIsLoading(false);
            return;
        }

        type CollectionConfig<T> = {
            setter: React.Dispatch<React.SetStateAction<T[]>>;
            ref: CollectionReference<DocumentData> | null;
            orderByField?: string;
            orderDirection?: OrderByDirection;
            logName: string;
        };

        const subscribeToCollection = <T extends { id: string }>(config: CollectionConfig<T>) => {
            const {
                setter,
                ref,
                orderByField = 'createdAt',
                orderDirection = 'desc',
                logName,
            } = config;

            if (!ref) {
                return () => undefined;
            }

            const q = query(ref, orderBy(orderByField, orderDirection));
            return onSnapshot(
                q,
                snapshot => {
                    const items = snapshot.docs.map(docSnap => ({
                        id: docSnap.id,
                        ...(docSnap.data() as Record<string, unknown>),
                    }) as T);
                    setter(items);
                    setIsLoading(false);
                },
                error => {
                    console.error(`Error fetching ${logName}:`, error);
                    setIsLoading(false);
                }
            );
        };

        const unsubscribers = [
            subscribeToCollection<Wallet>({
                setter: setWallets,
                ref: getCollectionRef('wallets'),
                orderByField: 'createdAt',
                orderDirection: 'desc',
                logName: 'wallets',
            }),
            subscribeToCollection<Transaction>({
                setter: setTransactions,
                ref: getCollectionRef('transactions'),
                orderByField: 'date',
                orderDirection: 'desc',
                logName: 'transactions',
            }),
            subscribeToCollection<Budget>({
                setter: setBudgets,
                ref: getCollectionRef('budgets'),
                orderByField: 'createdAt',
                orderDirection: 'desc',
                logName: 'budgets',
            }),
        ].filter((unsubscribe): unsubscribe is () => void => Boolean(unsubscribe));

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user, getCollectionRef]);

    const addTransaction = useCallback(async (data: TransactionInput) => {
        if (!user) return;
        const walletCollection = getCollectionRef('wallets');
        const transactionCollection = getCollectionRef('transactions');
        if (!walletCollection || !transactionCollection) return;

        const walletRef = doc(db, walletCollection.path, data.walletId);
        await addDoc(transactionCollection, { ...data, userId: user.uid });
        const walletDoc = await getDoc(walletRef);
        if (walletDoc.exists()) {
            const currentBalance = walletDoc.data().balance;
            const newBalance = data.type === 'income' ? currentBalance + data.amount : currentBalance - data.amount;
            await updateDoc(walletRef, { balance: newBalance });
        }
        ui.setIsTxModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const updateTransaction = useCallback(async (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => {
        if (!user) throw new Error("User not authenticated.");
        const transactionCollection = getCollectionRef('transactions');
        const walletCollection = getCollectionRef('wallets');
        if (!transactionCollection || !walletCollection) return;

        const batch = writeBatch(db);
        const transactionRef = doc(transactionCollection, transactionId);

        batch.update(transactionRef, { ...newData, userId: user.uid });

        const oldWalletRef = doc(walletCollection, oldData.walletId);
        const newWalletRef = doc(walletCollection, newData.walletId);
        
        const oldWalletDoc = await getDoc(oldWalletRef);
        const newWalletDoc = await getDoc(newWalletRef);

        if (!oldWalletDoc.exists() || (oldData.walletId !== newData.walletId && !newWalletDoc.exists())) {
            throw new Error("Dompet tidak ditemukan.");
        }
        
        if (oldData.walletId === newData.walletId) {
            const currentBalance = oldWalletDoc.data()!.balance;
            const oldAmountEffect = oldData.type === 'income' ? -oldData.amount : +oldData.amount;
            const newAmountEffect = newData.type === 'income' ? +newData.amount : -newData.amount;
            const newBalance = currentBalance + oldAmountEffect + newAmountEffect;
            batch.update(oldWalletRef, { balance: newBalance });

        } else {
            // Revert old transaction from old wallet
            const oldWalletBalanceReverted = oldWalletDoc.data()!.balance + (oldData.type === 'income' ? -oldData.amount : oldData.amount);
            batch.update(oldWalletRef, { balance: oldWalletBalanceReverted });

            // Apply new transaction to new wallet
            const newWalletBalanceUpdated = newWalletDoc.data()!.balance + (newData.type === 'income' ? newData.amount : -newData.amount);
            batch.update(newWalletRef, { balance: newWalletBalanceUpdated });
        }
        
        await batch.commit();
        ui.showToast("Transaksi berhasil diperbarui!", 'success');
        ui.setIsTxModalOpen(false);
        ui.setTransactionToEdit(null);

    }, [user, getCollectionRef, ui]);

    const addTransfer = useCallback(async (data: TransferPayload) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getCollectionRef('wallets');
        const transactionCollection = getCollectionRef('transactions');
        if (!walletCollection || !transactionCollection) return;

        const { fromWalletId, toWalletId, amount, date, description } = data;
        const fromWalletRef = doc(walletCollection, fromWalletId);
        const toWalletRef = doc(walletCollection, toWalletId);

        const batch = writeBatch(db);

        // Create expense transaction
        batch.set(doc(transactionCollection), {
            type: 'expense',
            amount,
            category: 'Transfer',
            walletId: fromWalletId,
            description: `Transfer ke ${wallets.find(w => w.id === toWalletId)?.name}: ${description}`,
            date,
            userId: user.uid,
        });

        // Create income transaction
        batch.set(doc(transactionCollection), {
            type: 'income',
            amount,
            category: 'Transfer',
            walletId: toWalletId,
            description: `Transfer dari ${wallets.find(w => w.id === fromWalletId)?.name}: ${description}`,
            date,
            userId: user.uid,
        });

        const fromWalletDoc = await getDoc(fromWalletRef);
        if (fromWalletDoc.exists()) {
            const newBalance = fromWalletDoc.data().balance - amount;
            batch.update(fromWalletRef, { balance: newBalance });
        }

        const toWalletDoc = await getDoc(toWalletRef);
        if (toWalletDoc.exists()) {
            const newBalance = toWalletDoc.data().balance + amount;
            batch.update(toWalletRef, { balance: newBalance });
        }

        await batch.commit();
        ui.showToast("Transfer berhasil dicatat!", 'success');
        ui.setIsTransferModalOpen(false);

    }, [user, getCollectionRef, ui, wallets]);

    const deleteTransaction = useCallback(async (transaction: Transaction) => {
        if (!user || !transaction) return;
        if (transaction.category === 'Transfer') {
            ui.showToast("Menghapus transaksi transfer belum didukung.", 'error');
            return;
        }

        const walletCollection = getCollectionRef('wallets');
        const transactionCollection = getCollectionRef('transactions');
        if (!walletCollection || !transactionCollection) return;

        const transactionRef = doc(db, transactionCollection.path, transaction.id);
        const walletRef = doc(db, walletCollection.path, transaction.walletId);
        
        await deleteDoc(transactionRef);

        const walletDoc = await getDoc(walletRef);
        if (walletDoc.exists()) {
            const currentBalance = walletDoc.data().balance;
            const newBalance = transaction.type === 'income' ? currentBalance - transaction.amount : currentBalance + transaction.amount;
            await updateDoc(walletRef, { balance: newBalance });
        }
        
        ui.showToast("Transaksi berhasil dihapus!", 'success');
    }, [user, getCollectionRef, ui]);

    const addWallet = useCallback(async (walletData: WalletInput) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getCollectionRef('wallets');
        if (!walletCollection) return;
        await addDoc(walletCollection, {
            ...walletData,
            balance: walletData.balance || 0,
            createdAt: new Date().toISOString(),
            isDefault: walletData.isDefault || false,
            userId: user.uid,
        });
        ui.showToast("Dompet berhasil dibuat!", 'success');
        ui.setIsWalletModalOpen(false);
    }, [user, getCollectionRef, ui]);

     const updateWallet = useCallback(async (walletId: string, walletData: Partial<Wallet>) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getCollectionRef('wallets');
        if (!walletCollection) return;

        const batch = writeBatch(db);
        const walletRef = doc(walletCollection, walletId);

        if (walletData.isDefault === true) {
            const walletsSnapshot = await getDocs(query(walletCollection, where('isDefault', '==', true)));
            walletsSnapshot.forEach((doc) => {
                if (doc.id !== walletId) {
                    batch.update(doc.ref, { isDefault: false });
                }
            });
        }
        
        batch.update(walletRef, walletData);
        await batch.commit();
        
        ui.showToast("Dompet berhasil diperbarui!", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const deleteWallet = useCallback(async (walletId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const walletHasTransactions = transactions.some(t => t.walletId === walletId);
        if (walletHasTransactions) {
            ui.showToast("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
            return;
        }

        const walletCollection = getCollectionRef('wallets');
        if (!walletCollection) return;

        const walletRef = doc(walletCollection, walletId);
        await deleteDoc(walletRef);
        ui.showToast("Dompet berhasil dihapus.", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, getCollectionRef, transactions, ui]);

    const addBudget = useCallback(async (budgetData: BudgetInput) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getCollectionRef('budgets');
        if (!budgetCollection) return;
        await addDoc(budgetCollection, { ...budgetData, spent: 0, createdAt: new Date().toISOString(), userId: user.uid });
        ui.showToast("Anggaran berhasil dibuat!", 'success');
        ui.setIsBudgetModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const updateBudget = useCallback(async (budgetId: string, budgetData: Partial<Budget>) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getCollectionRef('budgets');
        if (!budgetCollection) return;

        const budgetRef = doc(budgetCollection, budgetId);
        await updateDoc(budgetRef, budgetData);
        ui.showToast("Anggaran berhasil diperbarui!", 'success');
        ui.setIsEditBudgetModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const deleteBudget = useCallback(async (budgetId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getCollectionRef('budgets');
        if (!budgetCollection) return;
        
        const budgetRef = doc(budgetCollection, budgetId);
        await deleteDoc(budgetRef);
        ui.showToast("Anggaran berhasil dihapus.", 'success');
        ui.setIsEditBudgetModalOpen(false);
        router.back();
    }, [user, getCollectionRef, ui, router]);

    return {
        wallets,
        transactions,
        budgets,
        reminders,
        expenseCategories: categories.expense,
        incomeCategories: categories.income,
        isLoading,
        addTransaction,
        updateTransaction,
        addTransfer,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
