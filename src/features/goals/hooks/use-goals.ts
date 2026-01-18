'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/components/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Goal, GoalInput } from '@/types/models';

export const useGoals = () => {
    const { user } = useApp();
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
                const mappedGoals = data.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    targetAmount: g.target_amount,
                    currentAmount: g.current_amount,
                    targetDate: g.target_date,
                    icon: g.icon,
                    userId: g.user_id,
                    createdAt: g.created_at
                }));
                setGoals(mappedGoals);
            }
            setIsLoading(false);
        };

        fetchGoals();
    }, [user, supabase, showToast]);

    const addGoal = useCallback(async (goalData: GoalInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('goals').insert({
            name: goalData.name,
            target_amount: goalData.targetAmount,
            current_amount: goalData.currentAmount || 0,
            target_date: goalData.targetDate,
            icon: goalData.icon,
            user_id: user.id
        });

        if (error) {
             showToast("Gagal membuat target.", 'error');
             return;
        }

        showToast("Target berhasil dibuat!", 'success');
        setIsGoalModalOpen(false);
    }, [user, supabase, showToast, setIsGoalModalOpen]);

    const updateGoal = useCallback(async (goalId: string, goalData: Partial<Goal>) => {
        if (!user) throw new Error("User not authenticated.");
        
        const updateData: any = { ...goalData };
        delete updateData.userId;
        
        // Map camelCase to snake_case for DB update if needed manually, 
        // or just ensure we pass correct column names.
        // Since Partial<Goal> has camelCase keys, we need to map them.
        const dbPayload: any = {};
        if (goalData.name) dbPayload.name = goalData.name;
        if (goalData.targetAmount !== undefined) dbPayload.target_amount = goalData.targetAmount;
        if (goalData.currentAmount !== undefined) dbPayload.current_amount = goalData.currentAmount;
        if (goalData.targetDate) dbPayload.target_date = goalData.targetDate;
        if (goalData.icon) dbPayload.icon = goalData.icon;

        const { error } = await supabase.from('goals').update(dbPayload).eq('id', goalId);

        if (error) {
             showToast("Gagal memperbarui target.", 'error');
             return;
        }

        showToast("Target berhasil diperbarui!", 'success');
        setIsGoalModalOpen(false);
    }, [user, supabase, showToast, setIsGoalModalOpen]);

    const deleteGoal = useCallback(async (goalId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('goals').delete().eq('id', goalId);
        
        if (error) {
             showToast("Gagal menghapus target.", 'error');
             return;
        }

        showToast("Target berhasil dihapus.", 'success');
        setIsGoalModalOpen(false);
    }, [user, supabase, showToast, setIsGoalModalOpen]);

    return {
        goals,
        isLoading,
        addGoal,
        updateGoal,
        deleteGoal,
    };
};
