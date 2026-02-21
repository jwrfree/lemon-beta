'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Budget, BudgetInput, BudgetRow, Transaction } from '@/types/models';
import { transactionEvents } from '@/lib/transaction-events';
import { isSameMonth, parseISO } from 'date-fns';

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
    const { user } = useAuth();
    const router = useNextRouter();
    const { showToast, setIsBudgetModalOpen, setIsEditBudgetModalOpen } = useUI();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // 1. Fetch Initial Data
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

    // 2. Real-time Transaction Listener (Optimistic Budget Updates)
    useEffect(() => {
        if (!user) return;

        const handleTransactionCreated = (tx: Transaction) => {
            if (tx.type !== 'expense') return;
            const txDate = parseISO(tx.date);
            const isCurrentMonth = isSameMonth(txDate, new Date());

            if (!isCurrentMonth) return; // Only update if tx is in current month (assuming monthly budgets)

            setBudgets(prev => prev.map(b => {
                if (b.categories.includes(tx.category)) {
                    return { ...b, spent: (b.spent || 0) + tx.amount };
                }
                return b;
            }));
        };

        const handleTransactionUpdated = (tx: Transaction) => {
            // Complex logic: We need the OLD transaction to revert, but we don't have it here easily.
            // For now, we will perform a "Refetch Strategy" for updates to ensure accuracy,
            // OR we can implement a smarter delta if we passed oldData in the event.
            // Current limitation: 'transaction.updated' only passes the NEW transaction.
            // Strategy: Re-fetch budgets to ensure accuracy.
            refreshBudgets();
        };

        const handleTransactionDeleted = (txId: string) => {
             // We need to know the amount/category of the deleted tx to revert.
             // Since we only get ID, we can't optimistically revert without looking it up.
             // Strategy: Re-fetch budgets.
             refreshBudgets();
        };

        transactionEvents.on('transaction.created', handleTransactionCreated);
        transactionEvents.on('transaction.updated', handleTransactionUpdated);
        transactionEvents.on('transaction.deleted', handleTransactionDeleted);

        return () => {
            transactionEvents.off('transaction.created', handleTransactionCreated);
            transactionEvents.off('transaction.updated', handleTransactionUpdated);
            transactionEvents.off('transaction.deleted', handleTransactionDeleted);
        };
    }, [user]);

    const refreshBudgets = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (data) setBudgets(data.map(mapBudgetFromDb));
    };

    const addBudget = useCallback(async (budgetData: BudgetInput) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Add
        const tempId = `temp-${Date.now()}`;
        const newBudget: Budget = {
            id: tempId,
            name: budgetData.name,
            targetAmount: budgetData.targetAmount,
            spent: 0,
            categories: budgetData.categories || [],
            period: budgetData.period || 'monthly',
            userId: user.id,
            createdAt: new Date().toISOString()
        };

        setBudgets(prev => [newBudget, ...prev]);
        setIsBudgetModalOpen(false); // Close UI immediately

        const { data, error } = await supabase.from('budgets').insert({
            name: budgetData.name,
            amount: budgetData.targetAmount,
            spent: 0,
            category: budgetData.categories?.[0] || '',
            period: budgetData.period,
            user_id: user.id
        }).select().single();

        if (error) {
             setBudgets(prev => prev.filter(b => b.id !== tempId)); // Revert
             showToast("Gagal membuat anggaran.", 'error');
             return;
        }

        // Replace temp with real
        setBudgets(prev => prev.map(b => b.id === tempId ? mapBudgetFromDb(data) : b));
        showToast("Anggaran berhasil dibuat!", 'success');
    }, [user, supabase, showToast, setIsBudgetModalOpen]);

    const updateBudget = useCallback(async (budgetId: string, budgetData: Partial<Budget>) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Update
        setBudgets(prev => prev.map(b => {
            if (b.id === budgetId) {
                return {
                    ...b,
                    ...budgetData,
                    categories: budgetData.categories || b.categories
                };
            }
            return b;
        }));
        setIsEditBudgetModalOpen(false);

        const updateData: Partial<BudgetRow> = {};
        if (budgetData.name) updateData.name = budgetData.name;
        if (budgetData.targetAmount !== undefined) updateData.amount = budgetData.targetAmount;
        if (budgetData.categories !== undefined) updateData.category = budgetData.categories[0];
        if (budgetData.period) updateData.period = budgetData.period;

        const { error } = await supabase.from('budgets').update(updateData).eq('id', budgetId);

        if (error) {
             showToast("Gagal memperbarui anggaran.", 'error');
             refreshBudgets(); // Revert by fetching
             return;
        }
        
        showToast("Anggaran berhasil diperbarui!", 'success');
    }, [user, supabase, showToast, setIsEditBudgetModalOpen]);

    const deleteBudget = useCallback(async (budgetId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Delete
        const previousBudgets = [...budgets];
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
        setIsEditBudgetModalOpen(false);
        // router.back(); // Don't force back navigation, let UI handle it or context

        const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
        
        if (error) {
             setBudgets(previousBudgets); // Revert
             showToast("Gagal menghapus anggaran.", 'error');
             return;
        }

        showToast("Anggaran berhasil dihapus.", 'success');
    }, [user, budgets, supabase, showToast, setIsEditBudgetModalOpen]);

    return {
        budgets,
        isLoading,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
