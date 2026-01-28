export type AssetType = 'liquid' | 'appreciating' | 'depreciating';

export interface AssetCategory {
    key: string;
    label: string;
    type: AssetType;
    group: string;
    hidden?: boolean;
    unit?: 'gram' | 'lot' | 'unit'; // Added unit for auto-pricing
}

export const ASSET_CATEGORIES: readonly AssetCategory[] = [
    // Liquid Assets
    { key: 'cash', label: 'Kas & Tabungan', type: 'liquid', group: 'Likuiditas' },
    
    // Appreciating Assets (Real Assets)
    { key: 'gold', label: 'Emas & Logam Mulia', type: 'appreciating', group: 'Aset Produktif', unit: 'gram' },
    { key: 'stock', label: 'Saham & Reksa Dana', type: 'appreciating', group: 'Aset Produktif', unit: 'lot' },
    { key: 'crypto', label: 'Aset Kripto', type: 'appreciating', group: 'Aset Produktif', unit: 'unit' },
    { key: 'land', label: 'Tanah & Properti', type: 'appreciating', group: 'Aset Produktif' },
    { key: 'business', label: 'Bisnis & Usaha', type: 'appreciating', group: 'Aset Produktif' },
    { key: 'investment', label: 'Investasi Lainnya', type: 'appreciating', group: 'Aset Produktif' },
    
    // Legacy mapping
    { key: 'property', label: 'Properti (Legacy)', type: 'appreciating', group: 'Aset Produktif', hidden: true },

    // Depreciating Assets
    { key: 'vehicle', label: 'Kendaraan Pribadi', type: 'depreciating', group: 'Aset Konsumtif' },
    { key: 'electronics', label: 'Elektronik & Gadget', type: 'depreciating', group: 'Aset Konsumtif' },
    { key: 'furniture', label: 'Perabotan & Koleksi', type: 'depreciating', group: 'Aset Konsumtif' },
    { key: 'other', label: 'Aset Lainnya', type: 'depreciating', group: 'Aset Konsumtif' },
];

export const LIABILITY_CATEGORIES = [
    { key: 'loan', label: 'Pinjaman Bank' },
    { key: 'credit-card', label: 'Kartu Kredit' },
    { key: 'mortgage', label: 'KPR / Hipotek' },
    { key: 'vehicle-loan', label: 'Kredit Kendaraan' },
    { key: 'paylater', label: 'Paylater / Cicilan' },
    { key: 'other', label: 'Lainnya' },
] as const;

export const getAssetCategoryInfo = (key: string) => {
    return ASSET_CATEGORIES.find(c => c.key === key) || ASSET_CATEGORIES.find(c => c.key === 'other')!;
};

export const getAssetTypeLabel = (type: AssetType) => {
    switch (type) {
        case 'liquid': return 'Likuiditas';
        case 'appreciating': return 'Aset Produktif';
        case 'depreciating': return 'Aset Konsumtif';
    }
};
