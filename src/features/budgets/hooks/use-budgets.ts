'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useApp } from '@/providers/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Budget, BudgetInput, BudgetRow } from '@/types/models';

const mapBudgetFromDb = (b: BudgetRow): Budget => ({
    id: b.id,
    name: b.name,
    targetAmount: b.amount,
    spent: b.spent,
    categories: b.category ? [b.category] : [],
    period: b.period,
    userId: b.user_id,
    createdAt: b.created_at
});

export const useBudgets = () => {
    const { user } = useApp();
    const router = useNextRouter();
    const { showToast, setIsBudgetModalOpen, setIsEditBudgetModalOpen } = useUI();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setBudgets([]);
            setIsLoading(false);
            return;
        }

        const fetchBudgets = async () => {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching budgets:", error);
                showToast("Gagal memuat anggaran.", 'error');
            } else if (data) {
                setBudgets(data.map(mapBudgetFromDb));
            }
            setIsLoading(false);
        };

        fetchBudgets();

    }, [user, supabase, showToast]);

    const addBudget = useCallback(async (budgetData: BudgetInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('budgets').insert({
            name: budgetData.name,
            amount: budgetData.targetAmount,
            spent: 0,
            category: budgetData.categories?.[0] || '',
            period: budgetData.period,
            user_id: user.id
        });

        if (error) {
             showToast("Gagal membuat anggaran.", 'error');
             return;
        }

        showToast("Anggaran berhasil dibuat!", 'success');
        setIsBudgetModalOpen(false);
    }, [user, supabase, showToast, setIsBudgetModalOpen]);

    const updateBudget = useCallback(async (budgetId: string, budgetData: Partial<Budget>) => {
        if (!user) throw new Error("User not authenticated.");

        const updateData: any = { ...budgetData };
        
        if (updateData.targetAmount !== undefined) {
            updateData.amount = updateData.targetAmount;
            delete updateData.targetAmount;
        }
        
        if (updateData.categories !== undefined) {
            updateData.category = updateData.categories[0];
            delete updateData.categories;
        }

        delete updateData.userId;
        delete updateData.createdAt;

        const { error } = await supabase.from('budgets').update(updateData).eq('id', budgetId);

        if (error) {
             showToast("Gagal memperbarui anggaran.", 'error');
             return;
        }
        
        showToast("Anggaran berhasil diperbarui!", 'success');
        setIsEditBudgetModalOpen(false);
    }, [user, supabase, showToast, setIsEditBudgetModalOpen]);

    const deleteBudget = useCallback(async (budgetId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
        
        if (error) {
             showToast("Gagal menghapus anggaran.", 'error');
             return;
        }

        showToast("Anggaran berhasil dihapus.", 'success');
        setIsEditBudgetModalOpen(false);
        router.back();
    }, [user, supabase, showToast, setIsEditBudgetModalOpen, router]);

    return {
        budgets,
        isLoading,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
