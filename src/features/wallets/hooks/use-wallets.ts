import { useState, useEffect } from 'react';
import { useApp } from '@/components/app-provider';
import { createClient } from '@/lib/supabase/client';
import type { Wallet } from '@/types/models';

export const useWallets = () => {
    const app = useApp();
    const { user } = app;
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setWallets([]);
            setIsLoading(false);
            return;
        }

        const fetchWallets = async () => {
            const { data: walletsData } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (walletsData) {
                const mappedWallets = walletsData.map((w: any) => ({
                    id: w.id,
                    name: w.name,
                    balance: w.balance,
                    icon: w.icon,
                    color: w.color,
                    isDefault: w.is_default,
                    userId: w.user_id,
                    createdAt: w.created_at
                }));
                setWallets(mappedWallets);
            }
            setIsLoading(false);
        };

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

    }, [user, supabase]);

    return {
        ...app,
        wallets,
        isLoading: isLoading || app.isLoading,
    };
};
