import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types/models';
import { resolveCategoryVisuals } from '@/lib/category-utils';
import { transactionService } from '@/lib/services/transaction-service';

export const useCategories = () => {
    const { user } = useApp();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchCategories = useCallback(async () => {
        if (!user) return;
        try {
            const data = await transactionService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCategories();
        const channel = supabase
            .channel('categories-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchCategories]);

    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
    const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);

    const getCategoryVisuals = useCallback((name: string) => {
        return resolveCategoryVisuals(name, categories);
    }, [categories]);

    return {
        categories,
        expenseCategories,
        incomeCategories,
        getCategoryVisuals,
        isLoading
    };
};

export const useTransactions = () => {
    const { user, isLoading: appLoading } = useApp();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { categories, getCategoryVisuals, isLoading: isCatLoading } = useCategories();
    const supabase = createClient();

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        try {
            const data = await transactionService.getTransactions(user.id);
            setTransactions(data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchTransactions();
        
        const txChannel = supabase
            .channel('transactions-changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'transactions', 
                filter: `user_id=eq.${user.id}` 
            }, () => fetchTransactions())
            .subscribe();

        return () => {
            supabase.removeChannel(txChannel);
        };
    }, [user, supabase, fetchTransactions]);

    return {
        transactions,
        getCategoryVisuals,
        isLoading: isLoading || appLoading || isCatLoading,
    };
};
