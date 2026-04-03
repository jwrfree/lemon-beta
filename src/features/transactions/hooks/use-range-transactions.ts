import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { getOfflineCacheKey, readOfflineSnapshot, writeOfflineSnapshot } from '@/lib/offline-cache';
import type { Transaction } from '@/types/models';
import { format, endOfDay } from 'date-fns';
import { transactionEvents } from '@/lib/transaction-events';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';

export const useRangeTransactions = (startDate: Date, endDate: Date) => {
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endOfDay(endDate), 'yyyy-MM-dd HH:mm:ss');
    const cacheKey = user ? getOfflineCacheKey('transactions-range', user.id, startStr, endStr) : null;
    const cachedTransactions = cacheKey
        ? readOfflineSnapshot<Transaction[]>(cacheKey)
        : undefined;
    const queryKey = ['transactions', 'range', user?.id, startStr, endStr] as const;

    const {
        data: transactions = [],
        isLoading: isTxLoading,
    } = useQuery<Transaction[]>({
        queryKey,
        queryFn: async (): Promise<Transaction[]> => {
            // migrated from direct supabase call
            const mappedTransactions = await transactionService.getTransactionsInRange(user!.id, startStr, endStr);

            if (cacheKey) {
                writeOfflineSnapshot(cacheKey, mappedTransactions);
            }

            return mappedTransactions;
        },
        enabled: !!user && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()),
        staleTime: 1 * 60 * 1000,
        ...(cachedTransactions ? { initialData: cachedTransactions } : {}),
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
