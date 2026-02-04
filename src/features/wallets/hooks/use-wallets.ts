import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useActions } from '@/providers/action-provider';
import { createClient } from '@/lib/supabase/client';
import type { Wallet } from '@/types/models';
import { walletService } from '@/lib/services/wallet-service';

export const useWallets = () => {
    const auth = useAuth();
    const actions = useActions();
    const { user } = auth;
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchWallets = useCallback(async () => {
        if (!user) return;
        try {
            const data = await walletService.getWallets(user.id);
            setWallets(data);
        } catch (err) {
            console.error("Error fetching wallets:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setWallets([]);
            setIsLoading(false);
            return;
        }

        fetchWallets();
        
        const channel = supabase
            .channel('wallets-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallets',
                    filter: `user_id=eq.${user.id}`,
                },
                () => fetchWallets()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user, supabase, fetchWallets]);

    return {
        ...auth,
        ...actions,
        wallets,
        isLoading: isLoading || auth.isLoading,
    };
};
