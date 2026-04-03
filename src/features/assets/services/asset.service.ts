import { createClient } from '@/lib/supabase/client';
import type {
    Asset,
    AssetLiabilityInput,
    AssetPayload,
    AssetRow,
    Liability,
    LiabilityPayload,
    LiabilityRow,
} from '@/types/models';

export const mapAssetFromDb = (asset: AssetRow): Asset => ({
    id: asset.id,
    name: asset.name,
    value: Number(asset.value),
    notes: asset.notes || undefined,
    categoryKey: asset.category,
    quantity: asset.quantity ? Number(asset.quantity) : undefined,
    userId: asset.user_id,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
});

export const mapLiabilityFromDb = (liability: LiabilityRow): Liability => ({
    id: liability.id,
    name: liability.name,
    value: Number(liability.value),
    notes: liability.notes || undefined,
    categoryKey: liability.category,
    userId: liability.user_id,
    createdAt: liability.created_at,
    updatedAt: liability.updated_at,
});

export const assetService = {
    async getAssetLiabilities(userId: string): Promise<{ assets: Asset[]; liabilities: Liability[] }> {
        const supabase = createClient();

        const [{ data: assetsData, error: assetsError }, { data: liabilitiesData, error: liabilitiesError }] = await Promise.all([
            supabase
                .from('assets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            supabase
                .from('liabilities')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
        ]);

        if (assetsError) {
            throw assetsError;
        }

        if (liabilitiesError) {
            throw liabilitiesError;
        }

        return {
            assets: (assetsData || []).map(mapAssetFromDb),
            liabilities: (liabilitiesData || []).map(mapLiabilityFromDb),
        };
    },

    async addAssetLiability(userId: string, data: AssetLiabilityInput): Promise<void> {
        const supabase = createClient();
        const { type, ...itemData } = data;
        const tableName = type === 'asset' ? 'assets' : 'liabilities';

        const insertData = type === 'asset'
            ? {
                name: (itemData as AssetPayload).name,
                value: (itemData as AssetPayload).value,
                notes: (itemData as AssetPayload).notes || null,
                category: (itemData as AssetPayload).categoryKey,
                user_id: userId,
                quantity: (itemData as AssetPayload).quantity,
            }
            : {
                name: (itemData as LiabilityPayload).name,
                value: (itemData as LiabilityPayload).value,
                notes: (itemData as LiabilityPayload).notes || null,
                category: (itemData as LiabilityPayload).categoryKey,
                user_id: userId,
            };

        const { error } = await supabase.from(tableName).insert(insertData);
        if (error) {
            throw error;
        }
    },

    async updateAssetLiability(id: string, type: 'asset' | 'liability', data: Partial<Asset> | Partial<Liability>): Promise<void> {
        const supabase = createClient();
        const tableName = type === 'asset' ? 'assets' : 'liabilities';
        const updateData: Record<string, unknown> = {};

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
            throw error;
        }
    },

    async deleteAssetLiability(id: string, type: 'asset' | 'liability'): Promise<void> {
        const supabase = createClient();
        const tableName = type === 'asset' ? 'assets' : 'liabilities';
        const { error } = await supabase.from(tableName).delete().eq('id', id);

        if (error) {
            throw error;
        }
    },
};
