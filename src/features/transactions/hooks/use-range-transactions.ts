import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';
import { format, parseISO } from 'date-fns';
import { transactionEvents } from '@/lib/transaction-events';

export const useRangeTransactions = (startDate: Date, endDate: Date) => {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchRange = useCallback(async () => {
        if (!user) return;

        // Ensure valid dates
        if (!(startDate instanceof Date) || isNaN(startDate.getTime()) || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
            console.warn("Invalid date range provided to useRangeTransactions", { startDate, endDate });
            setIsLoading(false);
            return;
        }

        try {
            const start = format(startDate, 'yyyy-MM-dd');
            const end = format(endDate, 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', start)
                .lte('date', end)
                .order('date', { ascending: false });

            if (error) {
                console.error("Supabase error fetching transactions:", error.message, error.details || '', error.hint || '');
                throw error;
            }

            if (data) {
                const mapped: Transaction[] = (data as TransactionRow[]).map((t) => ({
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
                    linkedDebtId: (t as any).linked_debt_id || undefined,
                }));
                setTransactions(mapped);
            }
        } catch (err: any) {
            console.error("Error fetching range transactions:", err.message || err);
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

        // Optimistic Updates
        const handleCreated = (newTx: Transaction) => {
            const txDate = new Date(newTx.date);
            // Check if within range
            if (txDate >= startDate && txDate <= endDate) {
                setTransactions(prev => {
                    const exists = prev.find(t => t.id === newTx.id);
                    if (exists) return prev;
                    return [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                });
            }
        };

        const handleUpdated = (updatedTx: Transaction) => {
            setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
        };

        const handleDeleted = (deletedId: string) => {
            setTransactions(prev => prev.filter(t => t.id !== deletedId));
        };

        transactionEvents.on('transaction.created', handleCreated);
        transactionEvents.on('transaction.updated', handleUpdated);
        transactionEvents.on('transaction.deleted', handleDeleted);

        return () => {
            supabase.removeChannel(channel);
            transactionEvents.off('transaction.created', handleCreated);
            transactionEvents.off('transaction.updated', handleUpdated);
            transactionEvents.off('transaction.deleted', handleDeleted);
        };
    }, [user, supabase, fetchRange, startDate, endDate]);

    return {
        transactions,
        isLoading: isLoading || authLoading
    };
};
