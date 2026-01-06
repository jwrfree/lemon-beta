
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    query,
    where,
    getDocs,
    collection,
    type CollectionReference,
    type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter as useNextRouter } from 'next/navigation';
import { useUI } from './ui-provider';
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
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setUserData(null);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userDocRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.data() as Partial<UserProfile>;
                setUserData({ id: snapshot.id, ...data } as UserProfile);
            } else {
                setUserData({ id: user.uid } as UserProfile);
            }
            setIsLoading(false);
        }, error => {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
        });

        return () => {
            unsubUser();
        };
    }, [user]);
    
    const updateUserBiometricStatus = useCallback(async (isBiometricEnabled: boolean) => {
        if (!user) throw new Error("User not authenticated.");
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { isBiometricEnabled }, { merge: true });
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
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
    
    const getCollectionRef = useCallback((collectionName: string): CollectionReference<DocumentData> | null => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/${collectionName}`);
    }, [user]);

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
        
        const transactionCollection = getCollectionRef('transactions');
        if(!transactionCollection) return;
        
        const q = query(transactionCollection, where("walletId", "==", walletId));
        const walletTransactions = await getDocs(q);

        if (!walletTransactions.empty) {
            ui.showToast("Gagal menghapus: Dompet masih memiliki riwayat transaksi.", 'error');
            return;
        }

        const walletCollection = getCollectionRef('wallets');
        if (!walletCollection) return;

        const walletRef = doc(walletCollection, walletId);
        await deleteDoc(walletRef);
        ui.showToast("Dompet berhasil dihapus.", 'success');
        ui.setIsEditWalletModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const addTransfer = useCallback(async (data: TransferPayload) => {
        if (!user) throw new Error("User not authenticated.");
        const walletCollection = getCollectionRef('wallets');
        const transactionCollection = getCollectionRef('transactions');
        if (!walletCollection || !transactionCollection) return;

        const { fromWalletId, toWalletId, amount, date, description } = data;
        const fromWalletRef = doc(walletCollection, fromWalletId);
        const toWalletRef = doc(walletCollection, toWalletId);

        const fromWalletDoc = await getDoc(fromWalletRef);
        const toWalletDoc = await getDoc(toWalletRef);

        if (!fromWalletDoc.exists() || !toWalletDoc.exists()) {
             ui.showToast("Dompet asal atau tujuan tidak ditemukan.", 'error');
            return;
        }
        
        const fromWalletName = fromWalletDoc.data().name;
        const toWalletName = toWalletDoc.data().name;

        const batch = writeBatch(db);

        // Create expense transaction
        batch.set(doc(transactionCollection), {
            type: 'expense',
            amount,
            category: 'Transfer',
            walletId: fromWalletId,
            description: `Transfer ke ${toWalletName}: ${description}`,
            date,
            userId: user.uid,
        });

        // Create income transaction
        batch.set(doc(transactionCollection), {
            type: 'income',
            amount,
            category: 'Transfer',
            walletId: toWalletId,
            description: `Transfer dari ${fromWalletName}: ${description}`,
            date,
            userId: user.uid,
        });

        const newFromBalance = fromWalletDoc.data().balance - amount;
        batch.update(fromWalletRef, { balance: newFromBalance });

        const newToBalance = toWalletDoc.data().balance + amount;
        batch.update(toWalletRef, { balance: newToBalance });

        await batch.commit();
        ui.showToast("Transfer berhasil dicatat!", 'success');
        ui.setIsTransferModalOpen(false);

    }, [user, getCollectionRef, ui]);


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
