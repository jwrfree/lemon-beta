'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Goal, GoalInput, GoalRow } from '@/types/models';

const mapGoalFromDb = (g: GoalRow): Goal => ({
    id: g.id,
    name: g.name,
    targetAmount: g.target_amount,
    currentAmount: g.current_amount,
    targetDate: g.target_date,
    icon: g.icon,
    userId: g.user_id,
    createdAt: g.created_at
});

export const useGoals = () => {
    const { user } = useAuth();
    const { showToast, setIsGoalModalOpen } = useUI();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setIsLoading(false);
            return;
        }

        const fetchGoals = async () => {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('target_date', { ascending: true });

            if (error) {
                console.error("Error fetching goals:", error);
                showToast("Gagal memuat target keuangan.", 'error');
            } else if (data) {
                setGoals(data.map(mapGoalFromDb));
            }
            setIsLoading(false);
        };

        fetchGoals();
    }, [user, supabase, showToast]);

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

        const { data, error } = await supabase.from('goals').insert({
            name: goalData.name,
            target_amount: goalData.targetAmount,
            current_amount: goalData.currentAmount || 0,
            target_date: goalData.targetDate,
            icon: goalData.icon,
            user_id: user.id
        }).select().single();

        if (error) {
             setGoals(prev => prev.filter(g => g.id !== tempId)); // Revert
             showToast("Gagal membuat target.", 'error');
             return;
        }

        // Replace temp with real
        setGoals(prev => prev.map(g => g.id === tempId ? mapGoalFromDb(data) : g));
        showToast("Target berhasil dibuat!", 'success');
    }, [user, supabase, showToast, setIsGoalModalOpen]);

    const updateGoal = useCallback(async (goalId: string, goalData: Partial<Goal>) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Update
        const previousGoals = [...goals];
        setGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return { ...g, ...goalData };
            }
            return g;
        }));
        setIsGoalModalOpen(false); // Assuming reuse of modal state or dedicated edit modal logic

        const dbPayload: Partial<GoalRow> = {};
        if (goalData.name) dbPayload.name = goalData.name;
        if (goalData.targetAmount !== undefined) dbPayload.target_amount = goalData.targetAmount;
        if (goalData.currentAmount !== undefined) dbPayload.current_amount = goalData.currentAmount;
        if (goalData.targetDate) dbPayload.target_date = goalData.targetDate;
        if (goalData.icon) dbPayload.icon = goalData.icon;

        const { error } = await supabase.from('goals').update(dbPayload).eq('id', goalId);

        if (error) {
             setGoals(previousGoals); // Revert
             showToast("Gagal memperbarui target.", 'error');
             return;
        }

        showToast("Target berhasil diperbarui!", 'success');
    }, [user, goals, supabase, showToast, setIsGoalModalOpen]);

    const deleteGoal = useCallback(async (goalId: string) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Delete
        const previousGoals = [...goals];
        setGoals(prev => prev.filter(g => g.id !== goalId));
        setIsGoalModalOpen(false);

        const { error } = await supabase.from('goals').delete().eq('id', goalId);

        if (error) {
             setGoals(previousGoals); // Revert
             showToast("Gagal menghapus target.", 'error');
             return;
        }

        showToast("Target berhasil dihapus.", 'success');
    }, [user, goals, supabase, showToast, setIsGoalModalOpen]);

    return {
        goals,
        isLoading,
        addGoal,
        updateGoal,
        deleteGoal,
    };
};
