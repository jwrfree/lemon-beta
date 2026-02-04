import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types/models';
import { transactionService } from '@/lib/services/transaction-service';
import { useCategories } from './use-categories';

export { useCategories };

export const useTransactions = () => {
    const { user, isLoading: appLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { categories, getCategoryVisuals, isLoading: isCatLoading } = useCategories();
    const supabase = createClient();

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        try {
            const data = await transactionService.getTransactions(user.id);
            setTransactions(data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchTransactions();
        
        const txChannel = supabase
            .channel('transactions-changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'transactions', 
                filter: `user_id=eq.${user.id}` 
            }, () => fetchTransactions())
            .subscribe();

        return () => {
            supabase.removeChannel(txChannel);
        };
    }, [user, supabase, fetchTransactions]);

    return {
        transactions,
        getCategoryVisuals,
        isLoading: isLoading || appLoading || isCatLoading,
    };
};
