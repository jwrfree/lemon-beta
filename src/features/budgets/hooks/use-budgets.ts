'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { budgetService } from '@/lib/services/budget-service';
import type { Budget, BudgetInput, Transaction } from '@/types/models';
import { transactionEvents } from '@/lib/transaction-events';
import { isSameMonth, parseISO } from 'date-fns';

export const useBudgets = () => {
    const { user } = useAuth();
    const { showToast, setIsBudgetModalOpen, setIsEditBudgetModalOpen } = useUI();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshBudgets = useCallback(async () => {
        if (!user) return;
        const data = await budgetService.getBudgets(user.id);
        setBudgets(data);
    }, [user]);

    // 1. Fetch Initial Data
    useEffect(() => {
        if (!user) {
            setBudgets([]);
            setIsLoading(false);
            return;
        }

        budgetService.getBudgets(user.id)
            .then(data => setBudgets(data))
            .catch(error => {
                console.error("Error fetching budgets:", error);
                showToast("Gagal memuat anggaran.", 'error');
            })
            .finally(() => setIsLoading(false));
    }, [user, showToast]);

    // 2. Real-time Transaction Listener (Optimistic Budget Updates)
    useEffect(() => {
        if (!user) return;

        const handleTransactionCreated = (tx: Transaction) => {
            if (tx.type !== 'expense') return;
            const txDate = parseISO(tx.date);
            const isCurrentMonth = isSameMonth(txDate, new Date());

            if (!isCurrentMonth) return;

            setBudgets(prev => prev.map(b => {
                const categoryMatches = b.categories.includes(tx.category);
                const subCategoryMatches = !b.subCategory || b.subCategory === tx.subCategory;
                
                if (categoryMatches && subCategoryMatches) {
                    return { ...b, spent: (b.spent || 0) + tx.amount };
                }
                return b;
            }));
        };

        const handleTransactionUpdated = () => {
            void refreshBudgets().catch(err => console.error("Error refreshing budgets:", err));
        };

        const handleTransactionDeleted = () => {
            void refreshBudgets().catch(err => console.error("Error refreshing budgets:", err));
        };

        transactionEvents.on('transaction.created', handleTransactionCreated);
        transactionEvents.on('transaction.updated', handleTransactionUpdated);
        transactionEvents.on('transaction.deleted', handleTransactionDeleted);

        return () => {
            transactionEvents.off('transaction.created', handleTransactionCreated);
            transactionEvents.off('transaction.updated', handleTransactionUpdated);
            transactionEvents.off('transaction.deleted', handleTransactionDeleted);
        };
    }, [user, refreshBudgets]);

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
        setIsBudgetModalOpen(false);

        try {
            const savedBudget = await budgetService.addBudget(user.id, budgetData);
            setBudgets(prev => prev.map(b => b.id === tempId ? savedBudget : b));
            showToast("Anggaran berhasil dibuat!", 'success');
        } catch {
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
            await budgetService.updateBudget(budgetId, budgetData);
            showToast("Anggaran berhasil diperbarui!", 'success');
        } catch {
            showToast("Gagal memperbarui anggaran.", 'error');
            try {
                await refreshBudgets(); // Revert by fetching
            } catch {
                showToast("Gagal memuat ulang anggaran.", 'error');
            }
        }
    }, [user, showToast, setIsEditBudgetModalOpen, refreshBudgets]);

    const deleteBudget = useCallback(async (budgetId: string) => {
        if (!user) throw new Error("User not authenticated.");
        
        // Optimistic Delete
        const previousBudgets = [...budgets];
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
        setIsEditBudgetModalOpen(false);

        try {
            await budgetService.deleteBudget(budgetId);
            showToast("Anggaran berhasil dihapus.", 'success');
        } catch {
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
