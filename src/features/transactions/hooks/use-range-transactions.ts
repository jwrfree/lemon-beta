import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, TransactionRow } from '@/types/models';
import { format, parseISO, endOfDay } from 'date-fns';
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

        const fetchWithRetry = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const start = format(startDate, 'yyyy-MM-dd');
                    // Fix: Ensure we capture the entire end day by setting time to end of day
                    const end = format(endOfDay(endDate), 'yyyy-MM-dd HH:mm:ss');

                    console.log(`Fetching transactions (attempt ${i + 1}) for user:`, user.id, "range:", start, "to", end);

                    const { data, error } = await supabase
                        .from('transactions')
                        .select('*')
                        .eq('user_id', user.id)
                        .gte('date', start)
                        .lte('date', end)
                        .order('date', { ascending: false })
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.error(`Supabase error (attempt ${i + 1}):`, error.message, error.details || '', error.hint || '');
                        if (i === retries - 1) throw error; // Last attempt, throw error
                        continue; // Retry
                    }

                    console.log("Transactions fetched successfully, count:", data?.length || 0);
                    return data;
                } catch (err: any) {
                    console.error(`Fetch attempt ${i + 1} failed:`, err.message);
                    if (i === retries - 1) throw err; // Last attempt, throw error

                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                }
            }
        };

        try {
            const data = await fetchWithRetry();

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
            console.error("Error type:", err.constructor.name);
            console.error("Error stack:", err.stack);

            // Check if it's a network error
            if (err.message?.includes('Failed to fetch')) {
                console.error("Network error detected - possible causes:");
                console.error("1. CORS issues with Supabase");
                console.error("2. Network connectivity problems");
                console.error("3. Supabase service down");
                console.error("4. Invalid Supabase URL or key");
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, startDate, endDate, supabase]);

    useEffect(() => {
        if (!user) {
            setTransactions(prev => prev.length > 0 ? [] : prev);
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
            // Check if within range using timestamps for stable comparison
            if (txDate.getTime() >= startDate.getTime() && txDate.getTime() <= endDate.getTime()) {
                setTransactions(prev => {
                    const exists = prev.find(t => t.id === newTx.id);
                    if (exists) return prev;
                    return [newTx, ...prev].sort((a, b) => {
                        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                        if (dateDiff !== 0) return dateDiff;
                        // Secondary sort by created_at (fallback to ID if created_at missing in optimistic)
                        const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return bCreated - aCreated;
                    });
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
    }, [user, supabase, fetchRange, startDate.getTime(), endDate.getTime()]);

    return {
        transactions,
        isLoading: isLoading || authLoading
    };
};
