
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, addDoc, updateDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';
import { categories } from '@/lib/categories';
import { useRouter as useNextRouter } from 'next/navigation';

interface AppContextType {
    user: User | null;
    wallets: any[];
    transactions: any[];
    budgets: any[];
    expenseCategories: any[];
    incomeCategories: any[];
    addTransaction: (data: any) => Promise<void>;
    deleteTransaction: (transaction: any) => Promise<void>;
    addWallet: (walletData: any) => Promise<void>;
    addBudget: (budgetData: any) => Promise<void>;
    isLoading: boolean;
    handleSignOut: () => void;
    isTxModalOpen: boolean;
    setIsTxModalOpen: (isOpen: boolean) => void;
    isWalletModalOpen: boolean;
    setIsWalletModalOpen: (isOpen: boolean) => void;
    isBudgetModalOpen: boolean;
    setIsBudgetModalOpen: (isOpen: boolean) => void;
    isDeleteModalOpen: boolean;
    transactionToDelete: any | null;
    openDeleteModal: (transaction: any) => void;
    closeDeleteModal: () => void;
    handleConfirmDelete: () => Promise<void>;
    handleEdit: (transaction: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ user, children }: { user: User, children: React.ReactNode }) => {
    const router = useNextRouter();
    const [wallets, setWallets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);

    const getWalletCollection = useCallback(() => collection(db, `users/${user.uid}/wallets`), [user]);
    const getTransactionCollection = useCallback(() => collection(db, `users/${user.uid}/transactions`), [user]);
    const getBudgetCollection = useCallback(() => collection(db, `users/${user.uid}/budgets`), [user]);

    useEffect(() => {
        if (!user) {
            setWallets([]);
            setTransactions([]);
            setBudgets([]);
            return;
        }

        const walletsQuery = query(getWalletCollection(), orderBy("createdAt", "desc"));
        const transactionsQuery = query(getTransactionCollection(), orderBy("date", "desc"));
        const budgetsQuery = query(getBudgetCollection(), orderBy("createdAt", "desc"));

        const unsubWallets = onSnapshot(walletsQuery, (snapshot) => {
            const walletsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWallets(walletsData);
            setIsLoading(false);
        });

        const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionsData);
        });

        const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
            const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(budgetsData);
        });

        return () => {
            unsubWallets();
            unsubTransactions();
            unsubBudgets();
        };
    }, [user, getWalletCollection, getTransactionCollection, getBudgetCollection]);
    
    const addTransaction = useCallback(async (data: any) => {
        if (!user) return;
        const walletRef = doc(db, getWalletCollection().path, data.walletId);
        await addDoc(getTransactionCollection(), data);
        const walletDoc = await getDoc(walletRef);
        if (walletDoc.exists()) {
            const currentBalance = walletDoc.data().balance;
            const newBalance = data.type === 'income' ? currentBalance + data.amount : currentBalance - data.amount;
            await updateDoc(walletRef, { balance: newBalance });
        }
        setIsTxModalOpen(false);
    }, [user, getTransactionCollection, getWalletCollection]);

    const addWallet = useCallback(async (walletData: any) => {
        if (!user) throw new Error("User not authenticated.");
        await addDoc(getWalletCollection(), { ...walletData, balance: 0, createdAt: new Date().toISOString() });
        toast.success("Dompet berhasil dibuat!");
        setIsWalletModalOpen(false);
    }, [user, getWalletCollection]);

    const addBudget = useCallback(async (budgetData: any) => {
        if (!user) throw new Error("User not authenticated.");
        await addDoc(getBudgetCollection(), { ...budgetData, spent: 0, createdAt: new Date().toISOString() });
        toast.success("Anggaran berhasil dibuat!");
        setIsBudgetModalOpen(false);
    }, [user, getBudgetCollection]);

    const deleteTransaction = useCallback(async (transaction: any) => {
        if (!user || !transaction) return;
        const transactionRef = doc(db, getTransactionCollection().path, transaction.id);
        const walletRef = doc(db, getWalletCollection().path, transaction.walletId);

        const originalTransaction = { ...transaction };
        delete originalTransaction.id;

        const batch = writeBatch(db);
        batch.delete(transactionRef);

        const walletDoc = await getDoc(walletRef);
        if (walletDoc.exists()) {
            const currentBalance = walletDoc.data().balance;
            const newBalance = transaction.type === 'income' ? currentBalance - transaction.amount : currentBalance + transaction.amount;
            batch.update(walletRef, { balance: newBalance });
        }

        await batch.commit();
        toast.success("Transaksi berhasil dihapus!", {
            action: {
                label: "Urungkan",
                onClick: async () => {
                    const undoBatch = writeBatch(db);
                    const newTransactionRef = doc(getTransactionCollection());
                    undoBatch.set(newTransactionRef, originalTransaction);

                    const walletDoc = await getDoc(walletRef);
                    if (walletDoc.exists()) {
                        const currentBalance = walletDoc.data().balance;
                        const revertedBalance = originalTransaction.type === 'income' ? currentBalance + originalTransaction.amount : currentBalance - originalTransaction.amount;
                        undoBatch.update(walletRef, { balance: revertedBalance });
                    }
                    await undoBatch.commit();
                    toast.success("Penghapusan berhasil diurungkan.");
                }
            }
        });
    }, [user, getTransactionCollection, getWalletCollection]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success("Anda telah berhasil keluar.");
            router.push('/');
        } catch (error) {
            toast.error("Gagal keluar.");
            console.error("Sign out error:", error);
        }
    };
    
    const openDeleteModal = (transaction: any) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await deleteTransaction(transactionToDelete);
        } catch (error) {
            console.error("Gagal menghapus transaksi:", error);
            toast.error("Gagal menghapus transaksi.");
        } finally {
            closeDeleteModal();
        }
    };

    const handleEdit = (transaction: any) => {
        toast.info("Fitur edit akan segera hadir!");
        console.log("Edit transaction:", transaction);
    };

    const contextValue = {
        user,
        wallets,
        transactions,
        budgets,
        expenseCategories: categories.expense,
        incomeCategories: categories.income,
        addTransaction,
        deleteTransaction,
        addWallet,
        addBudget,
        isLoading,
        handleSignOut,
        isTxModalOpen,
        setIsTxModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isDeleteModalOpen,
        transactionToDelete,
        openDeleteModal,
        closeDeleteModal,
        handleConfirmDelete,
        handleEdit,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
