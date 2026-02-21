'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Asset, Liability, AssetLiabilityInput, AssetRow, LiabilityRow, AssetPayload, LiabilityPayload } from '@/types/models';

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

const mapAssetFromDb = (a: AssetRow): Asset => ({
    id: a.id,
    name: a.name,
    value: Number(a.value),
    notes: a.notes || undefined,
    categoryKey: a.category,
    quantity: a.quantity ? Number(a.quantity) : undefined,
    userId: a.user_id,
    createdAt: a.created_at,
    updatedAt: a.updated_at
});

const mapLiabilityFromDb = (l: LiabilityRow): Liability => ({
    id: l.id,
    name: l.name,
    value: Number(l.value),
    notes: l.notes || undefined,
    categoryKey: l.category,
    userId: l.user_id,
    createdAt: l.created_at,
    updatedAt: l.updated_at
});

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
            // Fetch Assets
            const { data: assetsData, error: assetsError } = await supabase
                .from('assets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!assetsError && assetsData) {
                setAssets(assetsData.map(mapAssetFromDb));
            }

            // Fetch Liabilities
            const { data: liabilitiesData, error: liabilitiesError } = await supabase
                .from('liabilities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!liabilitiesError && liabilitiesData) {
                setLiabilities(liabilitiesData.map(mapLiabilityFromDb));
            }
        } catch (err) {
            console.error("[AssetProvider] Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase]);

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
        const tableName = type === 'asset' ? 'assets' : 'liabilities';

        let insertData: any;

        if (type === 'asset') {
            const assetInput = itemData as AssetPayload;
            insertData = {
                name: assetInput.name,
                value: assetInput.value,
                notes: assetInput.notes || null,
                category: assetInput.categoryKey,
                user_id: user.id,
                quantity: assetInput.quantity
            };
        } else {
            const liabilityInput = itemData as LiabilityPayload;
            insertData = {
                name: liabilityInput.name,
                value: liabilityInput.value,
                notes: liabilityInput.notes || null,
                category: liabilityInput.categoryKey,
                user_id: user.id
            };
        }

        const { error } = await supabase.from(tableName).insert(insertData);

        if (error) {
            console.error(`[AssetProvider] Add Error:`, error);
            showToast(`Gagal menambahkan ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw error;
        }

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
        await fetchData();
    }, [user, supabase, showToast, fetchData]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => {
        if (!user) throw new Error("User not authenticated.");
        const tableName = type === 'asset' ? 'assets' : 'liabilities';

        const updateData: Record<string, any> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.value !== undefined) updateData.value = data.value;
        if (data.notes !== undefined) updateData.notes = data.notes;

        if ('categoryKey' in data && data.categoryKey !== undefined) {
            updateData.category = data.categoryKey;
        }

        if (type === 'asset' && 'quantity' in data) {
            updateData.quantity = (data as Partial<Asset>).quantity;
        }

        const { error } = await supabase.from(tableName).update(updateData).eq('id', id);

        if (error) {
            console.error(`[AssetProvider] Update Error:`, error);
            showToast(`Gagal memperbarui ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw error;
        }

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');
        await fetchData();
    }, [user, supabase, showToast, fetchData]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");
        const tableName = type === 'asset' ? 'assets' : 'liabilities';

        const { error } = await supabase.from(tableName).delete().eq('id', id);

        if (error) {
            console.error(`[AssetProvider] Delete Error:`, error);
            showToast(`Gagal menghapus ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
            throw error;
        }

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');
        await fetchData();
    }, [user, supabase, showToast, fetchData]);

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
