
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
    type CollectionReference,
    type DocumentData,
} from 'firebase/firestore';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { db } from '@/lib/firebase';
import type { Budget, BudgetInput } from '@/types/models';

export const useBudgets = () => {
    const { user } = useApp();
    const router = useNextRouter();
    const { showToast, setIsBudgetModalOpen, setIsEditBudgetModalOpen } = useUI();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getBudgetsCollectionRef = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/budgets`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setBudgets([]);
            setIsLoading(false);
            return;
        }

        const budgetsCollectionRef = getBudgetsCollectionRef();
        if (!budgetsCollectionRef) return;

        const q = query(budgetsCollectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const budgetsData = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Budget, 'id'>),
            })) as Budget[];
            setBudgets(budgetsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching budgets:", error);
            showToast("Gagal memuat anggaran.", 'error');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, getBudgetsCollectionRef, showToast]);

    const addBudget = useCallback(async (budgetData: BudgetInput) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getBudgetsCollectionRef();
        if (!budgetCollection) return;
        await addDoc(budgetCollection, { ...budgetData, spent: 0, createdAt: new Date().toISOString(), userId: user.uid });
        showToast("Anggaran berhasil dibuat!", 'success');
        setIsBudgetModalOpen(false);
    }, [user, getBudgetsCollectionRef, showToast, setIsBudgetModalOpen]);

    const updateBudget = useCallback(async (budgetId: string, budgetData: Partial<Budget>) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getBudgetsCollectionRef();
        if (!budgetCollection) return;

        const budgetRef = doc(budgetCollection, budgetId);
        await updateDoc(budgetRef, budgetData);
        showToast("Anggaran berhasil diperbarui!", 'success');
        setIsEditBudgetModalOpen(false);
    }, [user, getBudgetsCollectionRef, showToast, setIsEditBudgetModalOpen]);

    const deleteBudget = useCallback(async (budgetId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const budgetCollection = getBudgetsCollectionRef();
        if (!budgetCollection) return;
        
        const budgetRef = doc(budgetCollection, budgetId);
        await deleteDoc(budgetRef);
        showToast("Anggaran berhasil dihapus.", 'success');
        setIsEditBudgetModalOpen(false);
        router.back();
    }, [user, getBudgetsCollectionRef, showToast, setIsEditBudgetModalOpen, router]);

    return {
        budgets,
        isLoading,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
