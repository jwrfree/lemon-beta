import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types/models';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { transactionService } from '../services/transaction.service';

export const useMonthTransactions = (date?: Date) => {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Memoize the target date to avoid recreating it on every render if not provided
    const targetDate = useMemo(() => date || new Date(), [date ? date.getTime() : null]);

    const fetchMonthTransactions = useCallback(async () => {
        if (!user) return;

        const start = format(startOfMonth(targetDate), 'yyyy-MM-dd');
        const end = format(endOfMonth(targetDate), 'yyyy-MM-dd');

        try {
            // migrated from direct supabase call
            const mappedTransactions = await transactionService.getTransactionsForMonth(user.id, start, end);
            setTransactions(mappedTransactions);
        } catch (err) {
            console.error("Error fetching month transactions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, targetDate, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions(prev => prev.length > 0 ? [] : prev);
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
