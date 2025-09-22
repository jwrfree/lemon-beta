'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    addDoc,
    updateDoc,
    writeBatch,
    query,
    orderBy,
    deleteDoc,
    getDocs,
    where,
    setDoc,
    type CollectionReference,
    type DocumentData,
    type OrderByDirection,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { categories } from '@/lib/categories';
import { useRouter as useNextRouter } from 'next/navigation';
import { useUI } from './ui-provider';
import type {
    Reminder,
    ReminderInput,
    Debt,
    DebtInput,
    DebtPayment,
    DebtPaymentInput,
    Wallet,
    WalletInput,
    Budget,
    BudgetInput,
    Asset,
    Liability,
    AssetLiabilityInput,
    Goal,
    GoalInput,
    Transaction,
    TransactionInput,
    TransactionUpdate,
    UserProfile,
} from '@/types/models';

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
    wallets: Wallet[];
    transactions: Transaction[];
    budgets: Budget[];
    assets: Asset[];
    liabilities: Liability[];
    goals: Goal[];
    reminders: Reminder[];
    debts: Debt[];
    expenseCategories: typeof categories.expense;
    incomeCategories: typeof categories.income;
    addTransaction: (data: TransactionInput) => Promise<void>;
    updateTransaction: (transactionId: string, oldData: Transaction, newData: TransactionUpdate) => Promise<void>;
    addTransfer: (data: TransferPayload) => Promise<void>;
    deleteTransaction: (transaction: Transaction) => Promise<void>;
    addWallet: (walletData: WalletInput) => Promise<void>;
    updateWallet: (walletId: string, walletData: Partial<Wallet>) => Promise<void>;
    deleteWallet: (walletId: string) => Promise<void>;
    addBudget: (budgetData: BudgetInput) => Promise<void>;
    updateBudget: (budgetId: string, budgetData: Partial<Budget>) => Promise<void>;
    deleteBudget: (budgetId: string) => Promise<void>;
    addAssetLiability: (data: AssetLiabilityInput) => Promise<void>;
    updateAssetLiability: (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => Promise<void>;
    deleteAssetLiability: (id: string, type: 'asset' | 'liability') => Promise<void>;
    addGoal: (goalData: GoalInput) => Promise<void>;
    updateGoal: (goalId: string, goalData: Partial<Goal>) => Promise<void>;
    deleteGoal: (goalId: string) => Promise<void>;
    addReminder: (reminderData: ReminderInput) => Promise<void>;
    updateReminder: (reminderId: string, reminderData: ReminderInput) => Promise<void>;
    deleteReminder: (reminderId: string) => Promise<void>;
    markReminderComplete: (reminderId: string) => Promise<void>;
    snoozeReminder: (reminderId: string, nextDueDate: string, currentCount?: number) => Promise<void>;
    addDebt: (debtData: DebtInput) => Promise<void>;
    updateDebt: (debtId: string, debtData: DebtInput) => Promise<void>;
    deleteDebt: (debtId: string) => Promise<void>;
    markDebtSettled: (debtId: string) => Promise<void>;
    logDebtPayment: (debtId: string, paymentData: DebtPaymentInput) => Promise<void>;
    deleteDebtPayment: (debtId: string, paymentId: string) => Promise<void>;
    updateUserBiometricStatus: (isBiometricEnabled: boolean) => Promise<void>;
    isLoading: boolean;
    handleSignOut: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const normalizeDateInput = (value: string | Date | null | undefined): string | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        return value;
    }
    return value.toISOString();
};

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
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
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
            setUserData(null);
            setIsLoading(false);
            return;
        }

        // Fetch user document
        const userDocRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userDocRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.data() as Partial<UserProfile>;
                setUserData({ id: snapshot.id, ...data } as UserProfile);
            } else {
                // Handle case where user doc might not exist yet
                setUserData({ id: user.uid } as UserProfile);
            }
        });

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
            subscribeToCollection<Asset>({
                setter: setAssets,
                ref: getCollectionRef('assets'),
                orderByField: 'createdAt',
                orderDirection: 'desc',
                logName: 'assets',
            }),
            subscribeToCollection<Liability>({
                setter: setLiabilities,
                ref: getCollectionRef('liabilities'),
                orderByField: 'createdAt',
                orderDirection: 'desc',
                logName: 'liabilities',
            }),
            subscribeToCollection<Goal>({
                setter: setGoals,
                ref: getCollectionRef('goals'),
                orderByField: 'targetDate',
                orderDirection: 'asc',
                logName: 'goals',
            }),
            subscribeToCollection<Reminder>({
                setter: setReminders,
                ref: getCollectionRef('reminders'),
                orderByField: 'dueDate',
                orderDirection: 'asc',
                logName: 'reminders',
            }),
            subscribeToCollection<Debt>({
                setter: setDebts,
                ref: getCollectionRef('debts'),
                orderByField: 'createdAt',
                orderDirection: 'desc',
                logName: 'debts',
            }),
        ].filter((unsubscribe): unsubscribe is () => void => Boolean(unsubscribe));

        return () => {
            unsubUser();
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

    const addAssetLiability = useCallback(async (data: AssetLiabilityInput) => {
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

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => {
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

    const addGoal = useCallback(async (goalData: GoalInput) => {
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

    const updateGoal = useCallback(async (goalId: string, goalData: Partial<Goal>) => {
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

    const addReminder = useCallback(async (reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getCollectionRef('reminders');
        if (!remindersCollection) return;

        const nowIso = new Date().toISOString();
        const dueDateValue = normalizeDateInput(reminderData.dueDate);
        const payload: ReminderInput = {
            ...reminderData,
            type: reminderData.type || 'one_time',
            targetType: reminderData.targetType || null,
            targetId: reminderData.targetId ?? null,
            amount: reminderData.amount ?? 0,
            dueDate: dueDateValue,
            repeatRule: reminderData.repeatRule || null,
            status: reminderData.status || 'upcoming',
            snoozeCount: reminderData.snoozeCount ?? 0,
            channels: reminderData.channels?.length ? reminderData.channels : ['push'],
            notes: reminderData.notes || '',
        };

        await addDoc(remindersCollection, {
            ...payload,
            createdAt: nowIso,
            updatedAt: nowIso,
            userId: user.uid,
        });
        ui.showToast("Pengingat berhasil dibuat!", 'success');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const updateReminder = useCallback(async (reminderId: string, reminderData: ReminderInput) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getCollectionRef('reminders');
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        const dueDateValue = normalizeDateInput(reminderData.dueDate);

        const payload: ReminderInput = {
            ...reminderData,
            dueDate: dueDateValue,
            amount: reminderData.amount ?? 0,
            channels: reminderData.channels?.length ? reminderData.channels : ['push'],
            targetId: reminderData.targetId ?? null,
            targetType: reminderData.targetType ?? null,
        };

        await updateDoc(reminderRef, {
            ...payload,
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Pengingat diperbarui.", 'success');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const deleteReminder = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getCollectionRef('reminders');
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        await deleteDoc(reminderRef);
        ui.showToast("Pengingat dihapus.", 'info');
        ui.setReminderToEdit(null);
        ui.setIsReminderModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const markReminderComplete = useCallback(async (reminderId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getCollectionRef('reminders');
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        await updateDoc(reminderRef, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Pengingat ditandai selesai.", 'success');
    }, [user, getCollectionRef, ui]);

    const snoozeReminder = useCallback(async (reminderId: string, nextDueDate: string, currentCount: number = 0) => {
        if (!user) throw new Error("User not authenticated.");
        const remindersCollection = getCollectionRef('reminders');
        if (!remindersCollection) return;

        const reminderRef = doc(remindersCollection, reminderId);
        await updateDoc(reminderRef, {
            dueDate: nextDueDate,
            status: 'snoozed',
            snoozeCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Pengingat ditunda.", 'info');
    }, [user, getCollectionRef, ui]);

    const addDebt = useCallback(async (debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const nowIso = new Date().toISOString();
        const payload: DebtInput = {
            ...debtData,
            direction: debtData.direction || 'owed',
            category: debtData.category || 'personal',
            principal: debtData.principal ?? 0,
            outstandingBalance: debtData.outstandingBalance ?? debtData.principal ?? 0,
            interestRate: debtData.interestRate ?? null,
            paymentFrequency: debtData.paymentFrequency || 'monthly',
            customInterval: debtData.customInterval || null,
            startDate: normalizeDateInput(debtData.startDate),
            dueDate: normalizeDateInput(debtData.dueDate),
            nextPaymentDate: normalizeDateInput(debtData.nextPaymentDate),
            notes: debtData.notes || '',
            status: debtData.status || 'active',
            payments: debtData.payments || [],
        };

        await addDoc(debtsCollection, {
            ...payload,
            createdAt: nowIso,
            updatedAt: nowIso,
            userId: user.uid,
        });
        ui.showToast("Catatan hutang/piutang dibuat!", 'success');
        ui.setDebtToEdit(null);
        ui.setIsDebtModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const updateDebt = useCallback(async (debtId: string, debtData: DebtInput) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const debtRef = doc(debtsCollection, debtId);
        const payload: DebtInput = {
            ...debtData,
            outstandingBalance: debtData.outstandingBalance ?? debtData.principal ?? 0,
            startDate: normalizeDateInput(debtData.startDate),
            dueDate: normalizeDateInput(debtData.dueDate),
            nextPaymentDate: normalizeDateInput(debtData.nextPaymentDate),
        };

        await updateDoc(debtRef, {
            ...payload,
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Catatan hutang/piutang diperbarui.", 'success');
        ui.setDebtToEdit(null);
        ui.setIsDebtModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const deleteDebt = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const debtRef = doc(debtsCollection, debtId);
        await deleteDoc(debtRef);
        ui.showToast("Catatan hutang/piutang dihapus.", 'info');
        ui.setDebtToEdit(null);
        ui.setIsDebtModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const markDebtSettled = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const debtRef = doc(debtsCollection, debtId);
        await updateDoc(debtRef, {
            status: 'settled',
            outstandingBalance: 0,
            updatedAt: new Date().toISOString(),
        });
        ui.showToast("Hutang/piutang ditandai lunas.", 'success');
    }, [user, getCollectionRef, ui]);

    const logDebtPayment = useCallback(async (debtId: string, paymentData: DebtPaymentInput) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const debtRef = doc(debtsCollection, debtId);
        const debtSnapshot = await getDoc(debtRef);
        if (!debtSnapshot.exists()) {
            throw new Error('Debt not found.');
        }

        const debtData = debtSnapshot.data() as Omit<Debt, 'id'>;
        const debt: Debt = { id: debtSnapshot.id, ...debtData } as Debt;
        const paymentId = typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}`;

        const paymentRecord: DebtPayment = {
            id: paymentId,
            amount: paymentData.amount,
            paymentDate: paymentData.paymentDate,
            walletId: paymentData.walletId || null,
            method: paymentData.method || 'manual',
            notes: paymentData.notes || '',
            createdAt: new Date().toISOString(),
        };

        const existingPayments: DebtPayment[] = Array.isArray(debt.payments) ? (debt.payments as DebtPayment[]) : [];
        const updatedPayments = [...existingPayments, paymentRecord];
        const baseOutstanding = typeof debt.outstandingBalance === 'number' ? debt.outstandingBalance : (debt.principal || 0);
        const newOutstanding = Math.max(0, baseOutstanding - paymentData.amount);

        const updates: Partial<Debt> = {
            payments: updatedPayments,
            outstandingBalance: newOutstanding,
            updatedAt: new Date().toISOString(),
        };

        if (paymentData.nextPaymentDate) {
            updates.nextPaymentDate = paymentData.nextPaymentDate;
        }

        if (newOutstanding <= 0) {
            updates.status = 'settled';
        }

        await updateDoc(debtRef, updates);

        if (paymentData.walletId) {
            const walletCollection = getCollectionRef('wallets');
            const transactionCollection = getCollectionRef('transactions');
            if (walletCollection && transactionCollection) {
                const walletRef = doc(walletCollection, paymentData.walletId);
                const walletSnapshot = await getDoc(walletRef);
                if (walletSnapshot.exists()) {
                    const walletDocData = walletSnapshot.data() as WalletInput;
                    const isOwed = debt.direction === 'owed';
                    const walletBalance = typeof walletDocData.balance === 'number' ? walletDocData.balance : 0;
                    const newBalance = isOwed ? walletBalance - paymentData.amount : walletBalance + paymentData.amount;
                    await updateDoc(walletRef, { balance: newBalance });
                }

                await addDoc(transactionCollection, {
                    type: debt.direction === 'owed' ? 'expense' : 'income',
                    amount: paymentData.amount,
                    category: debt.direction === 'owed' ? 'Bayar Hutang' : 'Terima Piutang',
                    walletId: paymentData.walletId,
                    description: paymentData.notes
                        ? `${debt.direction === 'owed' ? 'Pembayaran' : 'Penerimaan'} ${debt.title}: ${paymentData.notes}`
                        : `${debt.direction === 'owed' ? 'Pembayaran' : 'Penerimaan'} ${debt.title}`,
                    date: paymentData.paymentDate,
                    linkedDebtId: debtId,
                    userId: user.uid,
                });
            }
        }

        ui.showToast("Pembayaran berhasil dicatat!", 'success');
        ui.setDebtForPayment(null);
        ui.setIsDebtPaymentModalOpen(false);
    }, [user, getCollectionRef, ui]);

    const deleteDebtPayment = useCallback(async (debtId: string, paymentId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const debtRef = doc(debtsCollection, debtId);
        const debtSnapshot = await getDoc(debtRef);
        if (!debtSnapshot.exists()) {
            throw new Error('Debt not found.');
        }

        const debtData = debtSnapshot.data() as Omit<Debt, 'id'>;
        const debt: Debt = { id: debtSnapshot.id, ...debtData } as Debt;
        const payments: DebtPayment[] = Array.isArray(debt.payments) ? (debt.payments as DebtPayment[]) : [];
        const paymentToRemove = payments.find(payment => payment.id === paymentId);
        const remainingPayments = payments.filter(payment => payment.id !== paymentId);
        const amountToAdjust = paymentToRemove?.amount || 0;
        const baseOutstanding = typeof debt.outstandingBalance === 'number' ? debt.outstandingBalance : (debt.principal || 0);
        const newOutstanding = baseOutstanding + amountToAdjust;

        await updateDoc(debtRef, {
            payments: remainingPayments,
            outstandingBalance: newOutstanding,
            status: 'active',
            updatedAt: new Date().toISOString(),
        });

        ui.showToast("Pencatatan pembayaran dihapus.", 'info');
    }, [user, getCollectionRef, ui]);

    const updateUserBiometricStatus = useCallback(async (isBiometricEnabled: boolean) => {
        if (!user) throw new Error("User not authenticated.");
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { isBiometricEnabled }, { merge: true });
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Clear biometric login info on sign out
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

    const contextValue: AppContextType = {
        user,
        userData,
        wallets,
        transactions,
        budgets,
        assets,
        liabilities,
        goals,
        reminders,
        debts,
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
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderComplete,
        snoozeReminder,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtSettled,
        logDebtPayment,
        deleteDebtPayment,
        updateUserBiometricStatus,
        isLoading,
        handleSignOut,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
