import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const useMonthTransactions = (date: Date = new Date()) => {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchMonthTransactions = useCallback(async () => {
        if (!user) return;
        
        const start = format(startOfMonth(date), 'yyyy-MM-dd');
        const end = format(endOfMonth(date), 'yyyy-MM-dd');

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', start)
                .lte('date', end)
                .order('date', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped: Transaction[] = data.map((t: TransactionRow) => ({
                    id: t.id,
                    amount: t.amount,
                    category: t.category,
                    date: t.date,
                    description: t.description,
                    type: t.type,
                    walletId: t.wallet_id,
                    userId: t.user_id,
                    createdAt: t.created_at,
                    subCategory: t.sub_category || undefined,
                    location: t.location || undefined
                }));
                setTransactions(mapped);
            }
        } catch (err) {
            console.error("Error fetching month transactions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, date, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchMonthTransactions();

        const channel = supabase
            .channel('month-transactions-changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'transactions', 
                filter: `user_id=eq.${user.id}` 
            }, () => fetchMonthTransactions())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, fetchMonthTransactions]);

    return {
        transactions,
        isLoading: isLoading || authLoading
    };
};
