import { useAssetData } from '@/providers/asset-provider';

export const useAssets = () => {
    const {
        assets,
        liabilities,
        isLoading,
        goldPrice,
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability
    } = useAssetData();

    return {
        assets,
        liabilities,
        isLoading,
        goldPrice,
        addAssetLiability,
        updateAssetLiability,
        deleteAssetLiability
    };
};
