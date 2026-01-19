import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import type { Wallet, WalletRow } from '@/types/models';

const mapWalletFromDb = (w: WalletRow): Wallet => ({
    id: w.id,
    name: w.name,
    balance: w.balance,
    icon: w.icon,
    color: w.color,
    isDefault: w.is_default,
    userId: w.user_id,
    createdAt: w.created_at
});

export const useWallets = () => {
    const app = useApp();
    const { user } = app;
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchWallets = useCallback(async () => {
        if (!user) return;
        const { data: walletsData, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching wallets:", error);
            setIsLoading(false);
            return;
        }

        if (walletsData) {
            setWallets(walletsData.map(mapWalletFromDb));
        }
        setIsLoading(false);
    }, [user, supabase]);

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
        ...app,
        wallets,
        isLoading: isLoading || app.isLoading,
    };
};
