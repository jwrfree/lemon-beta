import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types/models';
import { resolveCategoryVisuals } from '@/lib/category-utils';

const mapTransactionFromDb = (t: any): Transaction => ({
    id: t.id,
    amount: t.amount,
    category: t.category,
    date: t.date,
    description: t.description,
    type: t.type,
    walletId: t.wallet_id,
    userId: t.user_id,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    subCategory: t.subCategory || t.sub_category, 
    location: t.location
});

export const useTransactions = () => {
    const { user, isLoading: appLoading } = useApp();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categoriesFromDb, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const getCategoryVisuals = useCallback((name: string) => {
        return resolveCategoryVisuals(name, categoriesFromDb);
    }, [categoriesFromDb]);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (txData) {
            setTransactions(txData.map(mapTransactionFromDb));
        }
    }, [user, supabase]);

    const fetchCategories = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (data) setCategories(data);
    }, [user, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        const loadAll = async () => {
            await Promise.all([fetchTransactions(), fetchCategories()]);
            setIsLoading(false);
        };

        loadAll();
        
        const txChannel = supabase
            .channel('transactions-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => fetchTransactions())
            .subscribe();

        const catChannel = supabase
            .channel('categories-changes-tx')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
            .subscribe();

        return () => {
            supabase.removeChannel(txChannel);
            supabase.removeChannel(catChannel);
        };

    }, [user, supabase, fetchTransactions, fetchCategories]);

    const expenseCategories = categoriesFromDb.filter(c => c.type === 'expense');
    const incomeCategories = categoriesFromDb.filter(c => c.type === 'income');

    return {
        transactions,
        expenseCategories,
        incomeCategories,
        getCategoryVisuals,
        isLoading: isLoading || appLoading,
    };
};
