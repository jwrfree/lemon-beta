import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';

export const useRecentTransactions = (limit: number = 5) => {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchRecent = useCallback(async () => {
        if (!user) return;
        
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(limit);

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
            console.error("Error fetching recent transactions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, limit, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchRecent();

        const channel = supabase
            .channel('recent-transactions-changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'transactions', 
                filter: `user_id=eq.${user.id}` 
            }, () => fetchRecent())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, fetchRecent]);

    return {
        transactions,
        isLoading: isLoading || authLoading
    };
};
