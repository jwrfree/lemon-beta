'use client';

import React from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { ActionProvider } from '@/providers/action-provider';
import { WalletProvider } from '@/providers/wallet-provider';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <WalletProvider>
                <ActionProvider>
                    {children}
                </ActionProvider>
            </WalletProvider>
        </AuthProvider>
    );
};