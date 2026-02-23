'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { goalService } from '@/lib/services/goal-service';
import type { Goal, GoalInput } from '@/types/models';

export const useGoals = () => {
    const { user } = useAuth();
    const { showToast, setIsGoalModalOpen } = useUI();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setIsLoading(false);
            return;
        }

        goalService.getGoals(user.id)
            .then(data => setGoals(data))
            .catch(error => {
                console.error("Error fetching goals:", error);
                showToast("Gagal memuat target keuangan.", 'error');
            })
            .finally(() => setIsLoading(false));
    }, [user, showToast]);

    const addGoal = useCallback(async (goalData: GoalInput) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Add
        const tempId = `temp-${Date.now()}`;
        const newGoal: Goal = {
            id: tempId,
            name: goalData.name,
            targetAmount: goalData.targetAmount,
            currentAmount: goalData.currentAmount || 0,
            targetDate: goalData.targetDate ? new Date(goalData.targetDate).toISOString() : undefined,
            icon: goalData.icon,
            userId: user.id,
            createdAt: new Date().toISOString()
        };

        setGoals(prev => [...prev, newGoal]);
        setIsGoalModalOpen(false);

        try {
            const savedGoal = await goalService.addGoal(user.id, goalData);
            setGoals(prev => prev.map(g => g.id === tempId ? savedGoal : g));
            showToast("Target berhasil dibuat!", 'success');
        } catch {
            setGoals(prev => prev.filter(g => g.id !== tempId)); // Revert
            showToast("Gagal membuat target.", 'error');
        }
    }, [user, showToast, setIsGoalModalOpen]);

    const updateGoal = useCallback(async (goalId: string, goalData: Partial<Goal>) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Update
        const previousGoals = [...goals];
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...goalData } : g));
        setIsGoalModalOpen(false);

        try {
            await goalService.updateGoal(goalId, goalData);
            showToast("Target berhasil diperbarui!", 'success');
        } catch {
            setGoals(previousGoals); // Revert
            showToast("Gagal memperbarui target.", 'error');
        }
    }, [user, goals, showToast, setIsGoalModalOpen]);

    const deleteGoal = useCallback(async (goalId: string) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Delete
        const previousGoals = [...goals];
        setGoals(prev => prev.filter(g => g.id !== goalId));
        setIsGoalModalOpen(false);

        try {
            await goalService.deleteGoal(goalId);
            showToast("Target berhasil dihapus.", 'success');
        } catch {
            setGoals(previousGoals); // Revert
            showToast("Gagal menghapus target.", 'error');
        }
    }, [user, goals, showToast, setIsGoalModalOpen]);

    return {
        goals,
        isLoading,
        addGoal,
        updateGoal,
        deleteGoal,
    };
};
