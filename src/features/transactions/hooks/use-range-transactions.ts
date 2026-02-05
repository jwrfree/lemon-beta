import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';
import { format } from 'date-fns';

export const useRangeTransactions = (startDate: Date, endDate: Date) => {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchRange = useCallback(async () => {
        if (!user) return;
        
        const start = format(startDate, 'yyyy-MM-dd');
        const end = format(endDate, 'yyyy-MM-dd');

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
            console.error("Error fetching range transactions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, startDate, endDate, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchRange();

        const channel = supabase
            .channel('range-transactions-changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'transactions', 
                filter: `user_id=eq.${user.id}` 
            }, () => fetchRange())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, fetchRange]);

    return {
        transactions,
        isLoading: isLoading || authLoading
    };
};
