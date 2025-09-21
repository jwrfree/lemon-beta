
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, addDoc, updateDoc, writeBatch, query, orderBy, deleteDoc, getDocs, where, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { categories } from '@/lib/categories';
import { useRouter as useNextRouter } from 'next/navigation';
import { useUI } from './ui-provider';

interface AppContextType {
    user: User | null;
    wallets: any[];
    transactions: any[];
    budgets: any[];
    assets: any[];
    liabilities: any[];
    goals: any[];
    expenseCategories: any[];
    incomeCategories: any[];
    addTransaction: (data: any) => Promise<void>;
    updateTransaction: (transactionId: string, oldData: any, newData: any) => Promise<void>;
    addTransfer: (data: any) => Promise<void>;
    deleteTransaction: (transaction: any) => Promise<void>;
    addWallet: (walletData: any) => Promise<void>;
    updateWallet: (walletId: string, walletData: any) => Promise<void>;
    deleteWallet: (walletId: string) => Promise<void>;
    addBudget: (budgetData: any) => Promise<void>;
    updateBudget: (budgetId: string, budgetData: any) => Promise<void>;
    deleteBudget: (budgetId: string) => Promise<void>;
    addAssetLiability: (data: any) => Promise<void>;
    updateAssetLiability: (id: string, type: 'asset' | 'liability', data: any) => Promise<void>;
    deleteAssetLiability: (id: string, type: 'asset' | 'liability') => Promise<void>;
    addGoal: (goalData: any) => Promise<void>;
    updateGoal: (goalId: string, goalData: any) => Promise<void>;
    deleteGoal: (goalId: string) => Promise<void>;
    isLoading: boolean;
    handleSignOut: () => void;
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
    const [user, setUser] = useState<User | null>(null);
    const [wallets, setWallets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [liabilities, setLiabilities] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const ui = useUI();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const getCollectionRef = useCallback((collectionName: string) => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/${collectionName}`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setWallets([]);
            setTransactions([]);
            setBudgets([]);
            setAssets([]);
            setLiabilities([]);
            setGoals([]);
            setIsLoading(false);
            return;
        }

        const collections: { [key: string]: any } = {
            wallets: { setter: setWallets, ref: getCollectionRef('wallets') },
            transactions: { setter: setTransactions, ref: getCollectionRef('transactions'), orderByField: 'date' },
            budgets: { setter: setBudgets, ref: getCollectionRef('budgets') },
            assets: { setter: setAssets, ref: getCollectionRef('assets') },
            liabilities: { setter: setLiabilities, ref: getCollectionRef('liabilities') },
            goals: { setter: setGoals, ref: getCollectionRef('goals'), orderByField: 'targetDate' },
        };

        const unsubscribers = Object.values(collections).map(({ setter, ref, orderByField = 'createdAt' }) => {
            if (!ref) return () => {};
            const q = query(ref, orderBy(orderByField, "desc"));
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setter(data);
                setIsLoading(false);
            }, (error) => {
                console.error(`Error fetching ${ref.id}: `, error);
                setIsLoading(false);
            });
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, getCollectionRef]);
    
    const addTransaction = useCallback(async (data: any) => {
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

    const updateTransaction = useCallback(async (transactionId: string, oldData: any, newData: any) => {
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

    const addTransfer = useCallback(async (data: any) => {
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

    const addWallet = useCallback(async (walletData: any) => {
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

     const updateWallet = useCallback(async (walletId: string, walletData: any) => {
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

    const addBudget = useCallback(async (budgetData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getCollectionRef('budgets');
        if (!budgetCollection) return;
        await addDoc(budgetCollection, { ...budgetData, spent: 0, createdAt: new Date().toISOString(), userId: user.uid });
        ui.showToast("Anggaran berhasil dibuat!", 'success');
        ui.setIsBudgetModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const updateBudget = useCallback(async (budgetId: string, budgetData: any) => {
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

    const addAssetLiability = useCallback(async (data: any) => {
        if (!user) throw new Error("User not authenticated.");
        const { type, ...itemData } = data;
        const collection = type === 'asset' ? getCollectionRef('assets') : getCollectionRef('liabilities');
        if (!collection) return;
        
        await addDoc(collection, {
            ...itemData,
            createdAt: new Date().toISOString(),
            userId: user.uid
        });

        ui.showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
    }, [user, getCollectionRef, ui]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: any) => {
        if (!user) throw new Error("User not authenticated.");
        const collection = type === 'asset' ? getCollectionRef('assets') : getCollectionRef('liabilities');
        if (!collection) return;

        const docRef = doc(collection, id);
        await updateDoc(docRef, data);
        ui.showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
    }, [user, getCollectionRef, ui]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");
        const collection = type === 'asset' ? getCollectionRef('assets') : getCollectionRef('liabilities');
        if (!collection) return;
        
        const docRef = doc(collection, id);
        await deleteDoc(docRef);
        ui.showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
    }, [user, getCollectionRef, ui]);

    const deleteTransaction = useCallback(async (transaction: any) => {
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

    const addGoal = useCallback(async (goalData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const goalsCollection = getCollectionRef('goals');
        if (!goalsCollection) return;

        await addDoc(goalsCollection, {
            ...goalData,
            createdAt: new Date().toISOString(),
            userId: user.uid,
        });
        ui.showToast("Target berhasil dibuat!", 'success');
        ui.setIsGoalModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const updateGoal = useCallback(async (goalId: string, goalData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const goalsCollection = getCollectionRef('goals');
        if (!goalsCollection) return;

        const goalRef = doc(goalsCollection, goalId);
        await updateDoc(goalRef, goalData);
        ui.showToast("Target berhasil diperbarui!", 'success');
        ui.setIsGoalModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const deleteGoal = useCallback(async (goalId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const goalsCollection = getCollectionRef('goals');
        if (!goalsCollection) return;

        const goalRef = doc(goalsCollection, goalId);
        await deleteDoc(goalRef);
        ui.showToast("Target berhasil dihapus.", 'success');
        ui.setIsGoalModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            ui.showToast("Kamu berhasil keluar.", 'info');
            router.push('/');
        } catch (error) {
            ui.showToast("Gagal keluar.", 'error');
            console.error("Sign out error:", error);
        }
    };

    const contextValue = {
        user,
        wallets,
        transactions,
        budgets,
        assets,
        liabilities,
        goals,
        expenseCategories: categories.expense,
        incomeCategories: categories.income,
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
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability,
        addGoal,
        updateGoal,
        deleteGoal,
        isLoading,
        handleSignOut,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
