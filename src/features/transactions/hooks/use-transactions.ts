import { useState, useEffect } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import { categories } from '@/lib/categories';
import type { Transaction } from '@/types/models';

export const useTransactions = () => {
    const { user, isLoading: appLoading } = useApp();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        const fetchTransactions = async () => {
            const { data: txData } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (txData) {
                 const mappedTx = txData.map((t: any) => ({
                    id: t.id,
                    amount: t.amount,
                    category: t.category,
                    date: t.date,
                    description: t.description,
                    type: t.type,
                    walletId: t.wallet_id,
                    userId: t.user_id,
                    createdAt: t.created_at,
                    subCategory: t.subCategory, // Assuming DB has this column, if not it will be undefined
                    location: t.location // Assuming DB has this column
                }));
                setTransactions(mappedTx);
            }
            
            setIsLoading(false);
        };

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

    }, [user, supabase]);

    return {
        transactions,
        expenseCategories: categories.expense,
        incomeCategories: categories.income,
        isLoading: isLoading || appLoading,
    };
};
