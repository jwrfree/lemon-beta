import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { getOfflineCacheKey, readOfflineSnapshot, writeOfflineSnapshot } from '@/lib/offline-cache';
import type { Wallet } from '@/types/models';
import { walletService } from '@/lib/services/wallet-service';

export const useWallets = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useUI();
    const cacheKey = user ? getOfflineCacheKey('wallets', user.id) : null;
    const cachedWallets = cacheKey ? readOfflineSnapshot<Wallet[]>(cacheKey) : undefined;

    const {
        data: wallets = [],
        isLoading,
        error,
    } = useQuery<Wallet[]>({
        queryKey: ['wallets', user?.id],
        queryFn: async () => {
            if (!user) {
                return [];
            }

            try {
                const fetchedWallets = await walletService.getWallets(user.id);
                writeOfflineSnapshot(getOfflineCacheKey('wallets', user.id), fetchedWallets);
                return fetchedWallets;
            } catch (fetchError) {
                if (cachedWallets !== undefined) {
                    return cachedWallets;
                }

                throw fetchError;
            }
        },
        enabled: !!user,
        staleTime: 2 * 60 * 1000,
        ...(cachedWallets ? { initialData: cachedWallets } : {}),
    });

    useEffect(() => {
        if (!error) {
            return;
        }

        console.error('[useWallets] Fetch Error:', error);
        showToast('Gagal memuat dompet. Periksa koneksi kamu.', 'error');
    }, [error, showToast]);

    return {
        wallets,
        isLoading: isLoading || authLoading,
    };
};
