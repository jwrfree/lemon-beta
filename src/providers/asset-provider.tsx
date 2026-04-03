'use client';

import React from 'react';

export const useAssetData = () => {
    throw new Error('useAssetData has been replaced by useAssets from @/features/assets/hooks/use-assets.');
};

export const AssetProvider = ({ children }: { children: React.ReactNode }) => children;
