import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Asset, AssetLiabilityInput, Liability } from '@/types/models';
import { assetService } from '../services/asset.service';

export const useAssets = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useUI();
    const queryClient = useQueryClient();
    const supabase = createClient();
    const [goldPrice, setGoldPrice] = useState<number | null>(null);

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['assets-liabilities', user?.id],
        queryFn: async () => {
            if (!user) {
                return { assets: [], liabilities: [] };
            }

            return assetService.getAssetLiabilities(user.id);
        },
        enabled: !!user,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (!error) {
            return;
        }

        console.error('[useAssets] Fetch Error:', error);
        showToast('Gagal memuat aset dan liabilitas. Periksa koneksi kamu.', 'error');
    }, [error, showToast]);

    useEffect(() => {
        const mockPricePerGram = 1250000 + (Math.random() * 50000);
        setGoldPrice(mockPricePerGram);
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        const invalidateAssets = () => {
            void queryClient.invalidateQueries({ queryKey: ['assets-liabilities', user.id] });
        };

        const assetsChannel = supabase
            .channel('assets-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${user.id}` }, invalidateAssets)
            .subscribe();

        const liabilitiesChannel = supabase
            .channel('liabilities-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'liabilities', filter: `user_id=eq.${user.id}` }, invalidateAssets)
            .subscribe();

        return () => {
            supabase.removeChannel(assetsChannel);
            supabase.removeChannel(liabilitiesChannel);
        };
    }, [user, supabase, queryClient]);

    const addAssetLiability = useCallback(async (assetLiability: AssetLiabilityInput) => {
        if (!user) {
            throw new Error('User not authenticated.');
        }

        try {
            await assetService.addAssetLiability(user.id, assetLiability);
            showToast(`${assetLiability.type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
            await queryClient.invalidateQueries({ queryKey: ['assets-liabilities', user.id] });
        } catch (assetError) {
            console.error('[useAssets] Add Error:', assetError);
            showToast(`Gagal menambahkan ${assetLiability.type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw assetError;
        }
    }, [user, showToast, queryClient]);

    const updateAssetLiability = useCallback(async (
        id: string,
        type: 'asset' | 'liability',
        assetLiability: Partial<Asset> | Partial<Liability>,
    ) => {
        if (!user) {
            throw new Error('User not authenticated.');
        }

        try {
            await assetService.updateAssetLiability(id, type, assetLiability);
            showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
            await queryClient.invalidateQueries({ queryKey: ['assets-liabilities', user.id] });
        } catch (assetError) {
            console.error('[useAssets] Update Error:', assetError);
            showToast(`Gagal memperbarui ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw assetError;
        }
    }, [user, showToast, queryClient]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) {
            throw new Error('User not authenticated.');
        }

        try {
            await assetService.deleteAssetLiability(id, type);
            showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
            await queryClient.invalidateQueries({ queryKey: ['assets-liabilities', user.id] });
        } catch (assetError) {
            console.error('[useAssets] Delete Error:', assetError);
            showToast(`Gagal menghapus ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw assetError;
        }
    }, [user, showToast, queryClient]);

    return {
        assets: data?.assets || [],
        liabilities: data?.liabilities || [],
        isLoading: isLoading || authLoading,
        goldPrice,
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability,
    };
};
