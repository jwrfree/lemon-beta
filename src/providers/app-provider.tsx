'use client';

import React from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { ActionProvider } from '@/providers/action-provider';
import { WalletProvider } from '@/providers/wallet-provider';
import { AssetProvider } from '@/providers/asset-provider';
import { QueryProvider } from '@/providers/query-provider';


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryProvider>
            <AuthProvider>
                <AssetProvider>
                    <WalletProvider>
                        <ActionProvider>
                            {children}
                        </ActionProvider>
                    </WalletProvider>
                </AssetProvider>
            </AuthProvider>
        </QueryProvider>
    );
};