import { createClient } from '@/lib/supabase/client';
import type {
    Asset,
    Liability,
    AssetRow,
    LiabilityRow,
    AssetPayload,
    LiabilityPayload
} from '@/types/models';

export const mapAssetFromDb = (a: AssetRow): Asset => ({
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

export const mapLiabilityFromDb = (l: LiabilityRow): Liability => ({
    id: l.id,
    name: l.name,
    value: Number(l.value),
    notes: l.notes || undefined,
    categoryKey: l.category,
    userId: l.user_id,
    createdAt: l.created_at,
    updatedAt: l.updated_at
});

export const assetService = {
    async getAssets(userId: string): Promise<Asset[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapAssetFromDb);
    },

    async getLiabilities(userId: string): Promise<Liability[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('liabilities')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapLiabilityFromDb);
    },

    async addAsset(userId: string, data: AssetPayload): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('assets').insert({
            name: data.name,
            value: data.value,
            notes: data.notes || null,
            category: data.categoryKey,
            user_id: userId,
            quantity: data.quantity
        });
        if (error) throw error;
    },

    async addLiability(userId: string, data: LiabilityPayload): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('liabilities').insert({
            name: data.name,
            value: data.value,
            notes: data.notes || null,
            category: data.categoryKey,
            user_id: userId
        });
        if (error) throw error;
    },

    async updateAsset(id: string, data: Partial<Asset>): Promise<void> {
        const supabase = createClient();
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.value !== undefined) updateData.value = data.value;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.categoryKey !== undefined) updateData.category = data.categoryKey;
        if (data.quantity !== undefined) updateData.quantity = data.quantity;

        const { error } = await supabase.from('assets').update(updateData).eq('id', id);
        if (error) throw error;
    },

    async updateLiability(id: string, data: Partial<Liability>): Promise<void> {
        const supabase = createClient();
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.value !== undefined) updateData.value = data.value;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.categoryKey !== undefined) updateData.category = data.categoryKey;

        const { error } = await supabase.from('liabilities').update(updateData).eq('id', id);
        if (error) throw error;
    },

    async deleteAsset(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (error) throw error;
    },

    async deleteLiability(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('liabilities').delete().eq('id', id);
        if (error) throw error;
    }
};
