import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import { categories } from '@/lib/categories';
import type { Transaction, TransactionRow } from '@/types/models';

const mapTransactionFromDb = (t: TransactionRow): Transaction => ({
    id: t.id,
    amount: t.amount,
    category: t.category,
    date: t.date,
    description: t.description,
    type: t.type,
    walletId: t.wallet_id,
    userId: t.user_id,
    createdAt: t.created_at,
    updatedAt: t.updated_at
});

export const useTransactions = () => {
    const { user, isLoading: appLoading } = useApp();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        const { data: txData, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            console.error("Error fetching transactions:", error);
            setIsLoading(false);
            return;
        }

        if (txData) {
            setTransactions(txData.map(mapTransactionFromDb));
        }
        setIsLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchTransactions();
        
        const channel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => fetchTransactions()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user, supabase, fetchTransactions]);

    return {
        transactions,
        expenseCategories: categories.expense,
        incomeCategories: categories.income,
        isLoading: isLoading || appLoading,
    };
};
