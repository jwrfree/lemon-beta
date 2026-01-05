
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
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { db } from '@/lib/firebase';
import type { Goal, GoalInput } from '@/types/models';

export const useGoals = () => {
    const { user } = useApp();
    const { showToast, setIsGoalModalOpen } = useUI();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getGoalsCollectionRef = useCallback(() => {
        if (!user) return null;
        return collection(db, `users/${user.uid}/goals`);
    }, [user]);

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setIsLoading(false);
            return;
        }

        const goalsCollectionRef = getGoalsCollectionRef();
        if (!goalsCollectionRef) return;

        const q = query(goalsCollectionRef, orderBy('targetDate', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const goalsData = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Goal, 'id'>),
            })) as Goal[];
            setGoals(goalsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching goals:", error);
            showToast("Gagal memuat target keuangan.", 'error');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, getGoalsCollectionRef, showToast]);

    const addGoal = useCallback(async (goalData: GoalInput) => {
        if (!user) throw new Error("User not authenticated.");
        const goalsCollection = getGoalsCollectionRef();
        if (!goalsCollection) return;

        await addDoc(goalsCollection, {
            ...goalData,
            createdAt: new Date().toISOString(),
            userId: user.uid,
        });
        showToast("Target berhasil dibuat!", 'success');
        setIsGoalModalOpen(false);
    }, [user, getGoalsCollectionRef, showToast, setIsGoalModalOpen]);

    const updateGoal = useCallback(async (goalId: string, goalData: Partial<Goal>) => {
        if (!user) throw new Error("User not authenticated.");
        const goalsCollection = getGoalsCollectionRef();
        if (!goalsCollection) return;

        const goalRef = doc(goalsCollection, goalId);
        await updateDoc(goalRef, goalData);
        showToast("Target berhasil diperbarui!", 'success');
        setIsGoalModalOpen(false);
    }, [user, getGoalsCollectionRef, showToast, setIsGoalModalOpen]);

    const deleteGoal = useCallback(async (goalId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const goalsCollection = getGoalsCollectionRef();
        if (!goalsCollection) return;

        const goalRef = doc(goalsCollection, goalId);
        await deleteDoc(goalRef);
        showToast("Target berhasil dihapus.", 'success');
        setIsGoalModalOpen(false);
    }, [user, getGoalsCollectionRef, showToast, setIsGoalModalOpen]);

    return {
        goals,
        isLoading,
        addGoal,
        updateGoal,
        deleteGoal,
    };
};
