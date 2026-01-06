
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    query,
    orderBy,
    deleteDoc,
    getDoc,
    writeBatch,
    type CollectionReference,
    type DocumentData,
} from 'firebase/firestore';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { db } from '@/lib/firebase';
import type { Asset, Liability, AssetLiabilityInput, Debt, DebtInput, DebtPayment, DebtPaymentInput } from '@/types/models';

const normalizeDateInput = (value: string | Date | null | undefined): string | null => {
    if (!value) return null;
    if (typeof value === 'string') {
        return value;
    }
    return value.toISOString();
};


export const useAssetsLiabilities = () => {
    const { user } = useApp();
    const router = useNextRouter();
    const { showToast, setDebtForPayment, setIsDebtPaymentModalOpen, setDebtToEdit, setIsDebtModalOpen } = useUI();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getCollectionRef = useCallback((collectionName: string) => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/${collectionName}`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setAssets([]);
            setLiabilities([]);
            setDebts([]);
            setIsLoading(false);
            return;
        }

        const subscribeToCollection = <T extends { id: string }>(
            ref: CollectionReference<DocumentData> | null,
            setter: React.Dispatch<React.SetStateAction<T[]>>
        ) => {
            if (!ref) return () => {};
            const q = query(ref, orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(docSnap => ({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<T, 'id'>),
                })) as T[];
                setter(items);
                setIsLoading(false);
            }, (error) => {
                console.error(`Error fetching collection:`, error);
                setIsLoading(false);
            });
        };
        
        const unsubAssets = subscribeToCollection<Asset>(getCollectionRef('assets'), setAssets);
        const unsubLiabilities = subscribeToCollection<Liability>(getCollectionRef('liabilities'), setLiabilities);
        const unsubDebts = subscribeToCollection<Debt>(getCollectionRef('debts'), setDebts);

        return () => {
            unsubAssets();
            unsubLiabilities();
            unsubDebts();
        };

    }, [user, getCollectionRef]);

    const addAssetLiability = useCallback(async (data: AssetLiabilityInput) => {
        if (!user) throw new Error("User not authenticated.");
        const { type, ...itemData } = data;
        const collectionRef = getCollectionRef(type === 'asset' ? 'assets' : 'liabilities');
        if (!collectionRef) return;

        await addDoc(collectionRef, {
            ...itemData,
            createdAt: new Date().toISOString(),
            userId: user.uid
        });

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
    }, [user, getCollectionRef, showToast]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => {
        if (!user) throw new Error("User not authenticated.");
        const collectionRef = getCollectionRef(type === 'asset' ? 'assets' : 'liabilities');
        if (!collectionRef) return;

        const docRef = doc(collectionRef, id);
        await updateDoc(docRef, data);
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
    }, [user, getCollectionRef, showToast]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");
        const collectionRef = getCollectionRef(type === 'asset' ? 'assets' : 'liabilities');
        if (!collectionRef) return;
        
        const docRef = doc(collectionRef, id);
        await deleteDoc(docRef);
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
    }, [user, getCollectionRef, showToast]);
    
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
        showToast("Catatan hutang/piutang dibuat!", 'success');
        setDebtToEdit(null);
        setIsDebtModalOpen(false);
    }, [user, getCollectionRef, showToast, setIsDebtModalOpen, setDebtToEdit]);

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
        showToast("Catatan hutang/piutang diperbarui.", 'success');
        setDebtToEdit(null);
        setIsDebtModalOpen(false);
    }, [user, getCollectionRef, showToast, setIsDebtModalOpen, setDebtToEdit]);

    const deleteDebt = useCallback(async (debtId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const debtsCollection = getCollectionRef('debts');
        if (!debtsCollection) return;

        const debtRef = doc(debtsCollection, debtId);
        await deleteDoc(debtRef);
        showToast("Catatan hutang/piutang dihapus.", 'info');
        setDebtToEdit(null);
        setIsDebtModalOpen(false);
        router.back();
    }, [user, getCollectionRef, showToast, setIsDebtModalOpen, setDebtToEdit, router]);

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
        showToast("Hutang/piutang ditandai lunas.", 'success');
    }, [user, getCollectionRef, showToast]);

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

        const batch = writeBatch(db);
        batch.update(debtRef, updates);

        if (paymentData.walletId) {
            const walletCollection = getCollectionRef('wallets');
            const transactionCollection = getCollectionRef('transactions');
            if (walletCollection && transactionCollection) {
                const walletRef = doc(walletCollection, paymentData.walletId);
                const walletSnapshot = await getDoc(walletRef);
                if (walletSnapshot.exists()) {
                    const walletDocData = walletSnapshot.data() as { balance: number };
                    const isOwed = debt.direction === 'owed';
                    const walletBalance = typeof walletDocData.balance === 'number' ? walletDocData.balance : 0;
                    const newBalance = isOwed ? walletBalance - paymentData.amount : walletBalance + paymentData.amount;
                    batch.update(walletRef, { balance: newBalance });
                }

                batch.set(doc(transactionCollection), {
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
        
        await batch.commit();

        showToast("Pembayaran berhasil dicatat!", 'success');
        setDebtForPayment(null);
        setIsDebtPaymentModalOpen(false);
    }, [user, getCollectionRef, showToast, setDebtForPayment, setIsDebtPaymentModalOpen]);

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

        showToast("Pencatatan pembayaran dihapus.", 'info');
    }, [user, getCollectionRef, showToast]);


    return {
        assets,
        liabilities,
        debts,
        isLoading,
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtSettled,
        logDebtPayment,
        deleteDebtPayment,
    };
};
