'use client';

import React from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { ActionProvider } from '@/providers/action-provider';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <ActionProvider>
                {children}
            </ActionProvider>
        </AuthProvider>
    );
};