import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types/models';
import { transactionService } from '../services/transaction.service';
import { useCategories } from './use-categories';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export { useCategories };

export const useTransactions = () => {
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const { getCategoryVisuals, isLoading: isCatLoading } = useCategories();
    const supabase = createClient();

    const {
        data: transactions = [],
        isLoading: isTxLoading,
        refetch
    } = useQuery({
        queryKey: ['transactions', user?.id],
        queryFn: () => transactionService.getTransactions(user!.id),
        enabled: !!user,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    useEffect(() => {
        if (!user) return;

        const txChannel = supabase
            .channel('transactions-global-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'transactions',
                filter: `user_id=eq.${user.id}`
            }, () => {
                queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(txChannel);
        };
    }, [user, supabase, queryClient]);

    return {
        transactions,
        getCategoryVisuals,
        isLoading: isTxLoading || authLoading || isCatLoading,
    };
};
