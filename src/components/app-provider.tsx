

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, addDoc, updateDoc, writeBatch, query, orderBy, deleteDoc, getDocs, where, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { categories } from '@/lib/categories';
import { useRouter as useNextRouter } from 'next/navigation';

interface PreFilledTransfer {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    description: string;
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
    user: User | null;
    wallets: any[];
    transactions: any[];
    budgets: any[];
    assets: any[];
    liabilities: any[];
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
    addAssetLiability: (data: any) => Promise<void>;
    updateAssetLiability: (id: string, type: 'asset' | 'liability', data: any) => Promise<void>;
    deleteAssetLiability: (id: string, type: 'asset' | 'liability') => Promise<void>;
    isLoading: boolean;
    handleSignOut: () => void;
    
    isTxModalOpen: boolean;
    setIsTxModalOpen: (isOpen: boolean) => void;
    transactionToEdit: any | null;
    setTransactionToEdit: (transaction: any | null) => void;
    openEditTransactionModal: (transaction: any) => void;

    isWalletModalOpen: boolean;
    setIsWalletModalOpen: (isOpen: boolean) => void;
    isBudgetModalOpen: boolean;
    setIsBudgetModalOpen: (isOpen: boolean) => void;
    isTransferModalOpen: boolean;
    setIsTransferModalOpen: (isOpen: boolean) => void;
    preFilledTransfer: PreFilledTransfer | null;
    setPreFilledTransfer: (transfer: PreFilledTransfer | null) => void;
    isDeleteModalOpen: boolean;
    transactionToDelete: any | null;
    openDeleteModal: (transaction: any) => void;
    closeDeleteModal: () => void;
    handleConfirmDelete: () => Promise<void>;
    isEditWalletModalOpen: boolean;
    setIsEditWalletModalOpen: (isOpen: boolean) => void;
    walletToEdit: any | null;
    openEditWalletModal: (wallet: any) => void;
    toastState: ToastState;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
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
    const [isLoading, setIsLoading] = useState(true);
    
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<any | null>(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);
    const [isEditWalletModalOpen, setIsEditWalletModalOpen] = useState(false);
    const [walletToEdit, setWalletToEdit] = useState<any | null>(null);
    const [preFilledTransfer, setPreFilledTransfer] = useState<PreFilledTransfer | null>(null);

    const [toastState, setToastState] = useState<ToastState>({ show: false, message: '', type: 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToastState({ show: true, message, type });
    };

    const hideToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getWalletCollection = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/wallets`);
    }, [user]);

    const getTransactionCollection = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/transactions`);
    }, [user]);
    
    const getBudgetCollection = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/budgets`);
    }, [user]);

    const getAssetCollection = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/assets`);
    }, [user]);

    const getLiabilityCollection = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/liabilities`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setWallets([]);
            setTransactions([]);
            setBudgets([]);
            setAssets([]);
            setLiabilities([]);
            setIsLoading(false);
            return;
        }

        const collections = {
            wallets: getWalletCollection(),
            transactions: getTransactionCollection(),
            budgets: getBudgetCollection(),
            assets: getAssetCollection(),
            liabilities: getLiabilityCollection()
        };

        const unsubscribers = [
            onSnapshot(query(collections.wallets!, orderBy("createdAt", "desc")), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setWallets(data);
            }, (error) => console.error("Error fetching wallets: ", error)),
            
            onSnapshot(query(collections.transactions!, orderBy("date", "desc")), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTransactions(data);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching transactions: ", error);
                setIsLoading(false);
            }),

            onSnapshot(query(collections.budgets!, orderBy("createdAt", "desc")), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBudgets(data);
            }, (error) => console.error("Error fetching budgets: ", error)),

            onSnapshot(query(collections.assets!, orderBy("createdAt", "desc")), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAssets(data);
            }, (error) => console.error("Error fetching assets: ", error)),

            onSnapshot(query(collections.liabilities!, orderBy("createdAt", "desc")), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLiabilities(data);
            }, (error) => console.error("Error fetching liabilities: ", error)),
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, getWalletCollection, getTransactionCollection, getBudgetCollection, getAssetCollection, getLiabilityCollection]);
    
    const addTransaction = useCallback(async (data: any) => {
        if (!user) return;
        const walletCollection = getWalletCollection();
        const transactionCollection = getTransactionCollection();
        if (!walletCollection || !transactionCollection) return;

        const walletRef = doc(db, walletCollection.path, data.walletId);
        await addDoc(transactionCollection, { ...data, userId: user.uid });
        const walletDoc = await getDoc(walletRef);
        if (walletDoc.exists()) {
            const currentBalance = walletDoc.data().balance;
            const newBalance = data.type === 'income' ? currentBalance + data.amount : currentBalance - data.amount;
            await updateDoc(walletRef, { balance: newBalance });
        }
        setIsTxModalOpen(false);
    }, [user, getTransactionCollection, getWalletCollection]);

    const updateTransaction = useCallback(async (transactionId: string, oldData: any, newData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const transactionCollection = getTransactionCollection();
        const walletCollection = getWalletCollection();
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
            // Wallet is the same, just adjust balance
            const balanceAdjustment = (oldData.type === 'income' ? -oldData.amount : oldData.amount) + (newData.type === 'income' ? newData.amount : -newData.amount);
            const newBalance = oldWalletDoc.data()!.balance + balanceAdjustment;
            batch.update(oldWalletRef, { balance: newBalance });
        } else {
            // Wallet changed, revert old wallet and apply to new wallet
            const oldWalletBalanceReverted = oldWalletDoc.data()!.balance + (oldData.type === 'income' ? -oldData.amount : oldData.amount);
            batch.update(oldWalletRef, { balance: oldWalletBalanceReverted });

            const newWalletBalanceUpdated = newWalletDoc.data()!.balance + (newData.type === 'income' ? newData.amount : -newData.amount);
            batch.update(newWalletRef, { balance: newWalletBalanceUpdated });
        }
        
        await batch.commit();
        showToast("Transaksi berhasil diperbarui!", 'success');
        setIsTxModalOpen(false);
        setTransactionToEdit(null);

    }, [user, getTransactionCollection, getWalletCollection]);

    const addTransfer = useCallback(async (data: any) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getWalletCollection();
        const transactionCollection = getTransactionCollection();
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
        showToast("Transfer berhasil dicatat!", 'success');
        setIsTransferModalOpen(false);

    }, [user, getTransactionCollection, getWalletCollection, setIsTransferModalOpen, wallets]);

    const addWallet = useCallback(async (walletData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getWalletCollection();
        if (!walletCollection) return;
        await addDoc(walletCollection, {
            ...walletData,
            balance: walletData.balance || 0,
            createdAt: new Date().toISOString(),
            isDefault: walletData.isDefault || false,
            userId: user.uid,
        });
        showToast("Dompet berhasil dibuat!", 'success');
        setIsWalletModalOpen(false);
    }, [user, getWalletCollection]);

     const updateWallet = useCallback(async (walletId: string, walletData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getWalletCollection();
        if (!walletCollection) return;

        const batch = writeBatch(db);
        const walletRef = doc(walletCollection, walletId);

        // If setting a wallet to default, unset all others
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
        
        showToast("Dompet berhasil diperbarui!", 'success');
        setIsEditWalletModalOpen(false);
    }, [user, getWalletCollection]);

    const deleteWallet = useCallback(async (walletId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const walletHasTransactions = transactions.some(t => t.walletId === walletId);
        if (walletHasTransactions) {
            showToast("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
            return;
        }

        const walletCollection = getWalletCollection();
        if (!walletCollection) return;

        const walletRef = doc(walletCollection, walletId);
        await deleteDoc(walletRef);
        showToast("Dompet berhasil dihapus.", 'success');
        setIsEditWalletModalOpen(false);
    }, [user, getWalletCollection, transactions]);

    const addBudget = useCallback(async (budgetData: any) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getBudgetCollection();
        if (!budgetCollection) return;
        await addDoc(budgetCollection, { ...budgetData, spent: 0, createdAt: new Date().toISOString(), userId: user.uid });
        showToast("Anggaran berhasil dibuat!", 'success');
        setIsBudgetModalOpen(false);
    }, [user, getBudgetCollection]);

    const addAssetLiability = useCallback(async (data: any) => {
        if (!user) throw new Error("User not authenticated.");
        const { type, ...itemData } = data;
        const collection = type === 'asset' ? getAssetCollection() : getLiabilityCollection();
        if (!collection) return;
        
        await addDoc(collection, {
            ...itemData,
            createdAt: new Date().toISOString(),
            userId: user.uid
        });

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
    }, [user, getAssetCollection, getLiabilityCollection]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: any) => {
        if (!user) throw new Error("User not authenticated.");
        const collection = type === 'asset' ? getAssetCollection() : getLiabilityCollection();
        if (!collection) return;

        const docRef = doc(collection, id);
        await updateDoc(docRef, data);
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
    }, [user, getAssetCollection, getLiabilityCollection]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");
        const collection = type === 'asset' ? getAssetCollection() : getLiabilityCollection();
        if (!collection) return;
        
        const docRef = doc(collection, id);
        await deleteDoc(docRef);
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
    }, [user, getAssetCollection, getLiabilityCollection]);

    const deleteTransaction = useCallback(async (transaction: any) => {
        if (!user || !transaction) return;
        if (transaction.category === 'Transfer') {
            showToast("Menghapus transaksi transfer belum didukung.", 'error');
            return;
        }

        const walletCollection = getWalletCollection();
        const transactionCollection = getTransactionCollection();
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
        
        showToast("Transaksi berhasil dihapus!", 'success');
    }, [user, getTransactionCollection, getWalletCollection]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            showToast("Kamu berhasil keluar.", 'info');
            router.push('/');
        } catch (error) {
            showToast("Gagal keluar.", 'error');
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
            showToast("Gagal menghapus transaksi.", 'error');
        } finally {
            closeDeleteModal();
        }
    };
    
    const openEditWalletModal = (wallet: any) => {
        setWalletToEdit(wallet);
        setIsEditWalletModalOpen(true);
    };

    const openEditTransactionModal = (transaction: any) => {
        if (transaction.category === 'Transfer') {
            showToast("Mengedit transaksi transfer belum didukung.", 'error');
            return;
        }
        setTransactionToEdit(transaction);
        setIsTxModalOpen(true);
    };

    const contextValue = {
        user,
        wallets,
        transactions,
        budgets,
        assets,
        liabilities,
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
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability,
        isLoading,
        handleSignOut,
        isTxModalOpen,
        setIsTxModalOpen,
        transactionToEdit,
        setTransactionToEdit,
        openEditTransactionModal,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        preFilledTransfer,
        setPreFilledTransfer,
        isDeleteModalOpen,
        transactionToDelete,
        openDeleteModal,
        closeDeleteModal,
        handleConfirmDelete,
        isEditWalletModalOpen,
        setIsEditWalletModalOpen,
        walletToEdit,
        openEditWalletModal,
        toastState,
        showToast,
        hideToast,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
