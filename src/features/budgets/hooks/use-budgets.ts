'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import type { Budget, BudgetInput, Transaction } from '@/types/models';
import { transactionEvents } from '@/lib/transaction-events';
import { isSameMonth, parseISO } from 'date-fns';
import { budgetService } from '../services/budget.service';

export const useBudgets = () => {
    const { user } = useAuth();
    const { showToast, setIsBudgetModalOpen, setIsEditBudgetModalOpen } = useUI();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch Initial Data
    useEffect(() => {
        if (!user) {
            setBudgets([]);
            setIsLoading(false);
            return;
        }

        const fetchBudgets = async () => {
            try {
                // migrated from direct supabase call
                const data = await budgetService.getBudgets(user.id);
                setBudgets(data);
            } catch (error) {
                console.error("Error fetching budgets:", error);
                showToast("Gagal memuat anggaran.", 'error');
            }
            setIsLoading(false);
        };

        fetchBudgets();

    }, [user, showToast]);

    // 2. Real-time Transaction Listener (Optimistic Budget Updates)
    useEffect(() => {
        if (!user) return;

        const handleTransactionCreated = (tx: Transaction) => {
            if (tx.type !== 'expense') return;
            const txDate = parseISO(tx.date);
            const isCurrentMonth = isSameMonth(txDate, new Date());

            if (!isCurrentMonth) return; // Only update if tx is in current month (assuming monthly budgets)

            setBudgets(prev => prev.map(b => {
                const categoryMatches = b.categories.includes(tx.category);
                const subCategoryMatches = !b.subCategory || b.subCategory === tx.subCategory;
                
                if (categoryMatches && subCategoryMatches) {
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
        // migrated from direct supabase call
        const data = await budgetService.getBudgets(user.id);
        setBudgets(data);
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
            subCategory: budgetData.subCategory,
            period: budgetData.period || 'monthly',
            userId: user.id,
            createdAt: new Date().toISOString()
        };

        setBudgets(prev => [newBudget, ...prev]);
        setIsBudgetModalOpen(false); // Close UI immediately

        try {
            // migrated from direct supabase call
            const createdBudget = await budgetService.addBudget(user.id, budgetData);
            setBudgets(prev => prev.map(b => b.id === tempId ? createdBudget : b));
            showToast("Anggaran berhasil dibuat!", 'success');
        } catch (error) {
            setBudgets(prev => prev.filter(b => b.id !== tempId)); // Revert
            showToast("Gagal membuat anggaran.", 'error');
        }
    }, [user, showToast, setIsBudgetModalOpen]);

    const updateBudget = useCallback(async (budgetId: string, budgetData: Partial<Budget>) => {
        if (!user) throw new Error("User not authenticated.");

        // Optimistic Update
        setBudgets(prev => prev.map(b => {
            if (b.id === budgetId) {
                return {
                    ...b,
                    ...budgetData,
                    categories: budgetData.categories || b.categories,
                    subCategory: budgetData.subCategory !== undefined ? budgetData.subCategory : b.subCategory
                };
            }
            return b;
        }));
        setIsEditBudgetModalOpen(false);

        try {
            // migrated from direct supabase call
            await budgetService.updateBudget(budgetId, budgetData);
            showToast("Anggaran berhasil diperbarui!", 'success');
        } catch (error) {
            showToast("Gagal memperbarui anggaran.", 'error');
            refreshBudgets(); // Revert by fetching
        }
    }, [user, showToast, setIsEditBudgetModalOpen]);

    const deleteBudget = useCallback(async (budgetId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Delete
        const previousBudgets = [...budgets];
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
        setIsEditBudgetModalOpen(false);
        // router.back(); // Don't force back navigation, let UI handle it or context

        try {
            // migrated from direct supabase call
            await budgetService.deleteBudget(budgetId);
            showToast("Anggaran berhasil dihapus.", 'success');
        } catch (error) {
            setBudgets(previousBudgets); // Revert
            showToast("Gagal menghapus anggaran.", 'error');
        }
    }, [user, budgets, showToast, setIsEditBudgetModalOpen]);

    return {
        budgets,
        isLoading,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
