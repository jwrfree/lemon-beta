import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';
import { format, endOfDay } from 'date-fns';
import { transactionEvents } from '@/lib/transaction-events';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useRangeTransactions = (startDate: Date, endDate: Date) => {
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endOfDay(endDate), 'yyyy-MM-dd HH:mm:ss');

    const {
        data: transactions = [],
        isLoading: isTxLoading,
        refetch
    } = useQuery({
        queryKey: ['transactions', 'range', user?.id, startStr, endStr],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user!.id)
                .gte('date', startStr)
                .lte('date', endStr)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data as TransactionRow[]).map((t) => ({
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
                location: t.location || undefined,
                isNeed: t.is_need,
                merchant: (t as any).merchant || undefined,
                linkedDebtId: (t as any).linked_debt_id || undefined,
            }));
        },
        enabled: !!user && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()),
        staleTime: 1 * 60 * 1000,
    });

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`range-tx-${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'transactions',
                filter: `user_id=eq.${user.id}`
            }, () => {
                queryClient.invalidateQueries({ queryKey: ['transactions', 'range', user.id] });
            })
            .subscribe();

        const handleSync = () => {
            queryClient.invalidateQueries({ queryKey: ['transactions', 'range', user.id] });
        };

        transactionEvents.on('transaction.sync', handleSync);

        return () => {
            supabase.removeChannel(channel);
            transactionEvents.off('transaction.sync', handleSync);
        };
    }, [user, supabase, queryClient]);

    return {
        transactions,
        isLoading: isTxLoading || authLoading
    };
};
