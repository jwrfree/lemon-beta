'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/providers/app-provider';
import { useUI } from '@/components/ui-provider';
import { createClient } from '@/lib/supabase/client';
import type { Asset, Liability, AssetLiabilityInput, AssetRow, LiabilityRow } from '@/types/models';

const mapAssetFromDb = (a: AssetRow): Asset => ({
    id: a.id,
    name: a.name,
    value: a.value,
    notes: a.notes || undefined,
    categoryKey: a.category,
    userId: a.user_id,
    createdAt: a.created_at,
    updatedAt: a.updated_at
});

const mapLiabilityFromDb = (l: LiabilityRow): Liability => ({
    id: l.id,
    name: l.name,
    value: l.value,
    notes: l.notes || undefined,
    categoryKey: l.category,
    userId: l.user_id,
    createdAt: l.created_at,
    updatedAt: l.updated_at
});

export const useAssets = () => {
    const { user } = useApp();
    const { showToast } = useUI();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setAssets([]);
            setLiabilities([]);
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            // Fetch Assets
            const { data: assetsData, error: assetsError } = await supabase
                .from('assets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (assetsError) {
                // Silently fail or handle error
            } else if (assetsData) {
                setAssets(assetsData.map(mapAssetFromDb));
            }

            // Fetch Liabilities
            const { data: liabilitiesData, error: liabilitiesError } = await supabase
                .from('liabilities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (liabilitiesError) {
                // Silently fail or handle error
            } else if (liabilitiesData) {
                setLiabilities(liabilitiesData.map(mapLiabilityFromDb));
            }

            setIsLoading(false);
        };

        fetchData();
    }, [user, supabase]);

    const addAssetLiability = useCallback(async (data: AssetLiabilityInput) => {
        if (!user) throw new Error("User not authenticated.");
        const { type, ...itemData } = data;
        const tableName = type === 'asset' ? 'assets' : 'liabilities';

        const { error } = await supabase.from(tableName).insert({
            name: itemData.name,
            value: itemData.value,
            notes: itemData.notes,
            category: itemData.categoryKey,
            user_id: user.id
        });

        if (error) {
             showToast(`Gagal menambahkan ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
             return;
        }

        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil ditambahkan!`, 'success');
        
        // Optimistic update or refetch could be added here
        // For now, let's just trigger a re-fetch logic or update state locally if needed
        // But since we don't have the full object from insert response here without selecting it back,
        // we might want to just reload the page or add real-time subscription.
        // For simplicity in this refactor, I'll leave it as is, but ideally we should update state.
        
        // Simple state update for immediate feedback (approximate)
        if (type === 'asset') {
            // Re-fetch is safer
            const { data, error } = await supabase.from('assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (error) {
                // Silently fail or handle error
            } else if (data) {
                setAssets(data.map(mapAssetFromDb));
            }
        } else {
             const { data, error } = await supabase.from('liabilities').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
             if (error) {
                // Silently fail or handle error
             } else if (data) {
                setLiabilities(data.map(mapLiabilityFromDb));
             }
        }

    }, [user, supabase, showToast]);

    const updateAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>) => {
        if (!user) throw new Error("User not authenticated.");
        const tableName = type === 'asset' ? 'assets' : 'liabilities';
        
        const updateData: any = { ...data };
        delete updateData.userId; // Remove non-db fields if any
        
        const { error } = await supabase.from(tableName).update(updateData).eq('id', id);

        if (error) {
             showToast(`Gagal memperbarui ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
             return;
        }
        
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil diperbarui!`, 'success');

        // Refresh state
        if (type === 'asset') {
             const { data, error } = await supabase.from('assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (error) {
                // Silently fail or handle error
            } else if (data) {
                setAssets(data.map(mapAssetFromDb));
            }
        } else {
             const { data, error } = await supabase.from('liabilities').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
             if (error) {
                // Silently fail or handle error
             } else if (data) {
                setLiabilities(data.map(mapLiabilityFromDb));
             }
        }

    }, [user, supabase, showToast]);

    const deleteAssetLiability = useCallback(async (id: string, type: 'asset' | 'liability') => {
        if (!user) throw new Error("User not authenticated.");
        const tableName = type === 'asset' ? 'assets' : 'liabilities';

        const { error } = await supabase.from(tableName).delete().eq('id', id);

        if (error) {
             showToast(`Gagal menghapus ${type === 'asset' ? 'aset' : 'liabilitas'}.`, 'error');
             return;
        }
        
        showToast(`${type === 'asset' ? 'Aset' : 'Liabilitas'} berhasil dihapus.`, 'success');

        if (type === 'asset') {
            setAssets(prev => prev.filter(item => item.id !== id));
        } else {
            setLiabilities(prev => prev.filter(item => item.id !== id));
        }
    }, [user, supabase, showToast]);

    return {
        assets,
        liabilities,
        isLoading,
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability
    };
};
