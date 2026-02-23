'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import { assetService } from '@/lib/services/asset-service';
import type { Asset, Liability, AssetLiabilityInput, AssetPayload, LiabilityPayload } from '@/types/models';

interface AssetContextType {
    assets: Asset[];
    liabilities: Liability[];
    isLoading: boolean;
    goldPrice: number | null;
    addAssetLiability: (data: AssetLiabilityInput) => Promise<void>;
    updateAssetLiability: (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => Promise<void>;
    deleteAssetLiability: (id: string, type: 'asset' | 'liability') => Promise<void>;
    refreshData: () => Promise<void>;
}

const AssetContext = createContext<AssetContextType | null>(null);

export const useAssetData = () => {
    const context = useContext(AssetContext);
    if (!context) throw new Error('useAssetData must be used within an AssetProvider');
    return context;
};

export const AssetProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [goldPrice, setGoldPrice] = useState<number | null>(null);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            const [assetsData, liabilitiesData] = await Promise.all([
                assetService.getAssets(user.id),
                assetService.getLiabilities(user.id)
            ]);
            setAssets(assetsData);
            setLiabilities(liabilitiesData);
        } catch (err) {
            console.error("[AssetProvider] Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const fetchGoldPrice = useCallback(async () => {
        try {
            // Simplified proxy or mock for gold price
            // real price is around 1.2M - 1.3M IDR/gram
            const mockPricePerGram = 1250000 + (Math.random() * 50000);
            setGoldPrice(mockPricePerGram);
        } catch (err) {
            console.error("Failed to fetch gold price:", err);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            setAssets([]);
            setLiabilities([]);
            setIsLoading(false);
            return;
        }

        fetchData();
        fetchGoldPrice();

        // Optional: Realtime subscription
        const assetsChannel = supabase
            .channel('assets-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${user.id}` }, () => fetchData())
            .subscribe();

        const liabilitiesChannel = supabase
            .channel('liabilities-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'liabilities', filter: `user_id=eq.${user.id}` }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(assetsChannel);
            supabase.removeChannel(liabilitiesChannel);
        };
    }, [user, supabase, fetchData, fetchGoldPrice]);

    const addAssetLiability = useCallback(async (data: AssetLiabilityInput) => {
        if (!user) throw new Error("User not authenticated.");
        const { type, ...itemData } = data;

        try {
            if (type === 'asset') {
                await assetService.addAsset(user.id, itemData as AssetPayload);
            } else {
                await assetService.addLiability(user.id, itemData as LiabilityPayload);
            }
            showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
            await fetchData();
        } catch (err) {
            console.error(`[AssetProvider] Add Error:`, err);
            showToast(`Gagal menambahkan ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw err;
        }
    }, [user, showToast, fetchData]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => {
        if (!user) throw new Error("User not authenticated.");

        try {
            if (type === 'asset') {
                await assetService.updateAsset(id, data as Partial<Asset>);
            } else {
                await assetService.updateLiability(id, data as Partial<Liability>);
            }
            showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
            await fetchData();
        } catch (err) {
            console.error(`[AssetProvider] Update Error:`, err);
            showToast(`Gagal memperbarui ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw err;
        }
    }, [user, showToast, fetchData]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");

        try {
            if (type === 'asset') {
                await assetService.deleteAsset(id);
            } else {
                await assetService.deleteLiability(id);
            }
            showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
            await fetchData();
        } catch (err) {
            console.error(`[AssetProvider] Delete Error:`, err);
            showToast(`Gagal menghapus ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw err;
        }
    }, [user, showToast, fetchData]);

    return (
        <AssetContext.Provider value={{
            assets,
            liabilities,
            isLoading,
            goldPrice,
            addAssetLiability,
            updateAssetLiability,
            deleteAssetLiability,
            refreshData: fetchData
        }}>
            {children}
        </AssetContext.Provider>
    );
};
