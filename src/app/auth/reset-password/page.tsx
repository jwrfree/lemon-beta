'use client';

import React from 'react';
import { ResetPasswordPage } from '@/features/auth/components/reset-password-page';

export default function ResetPasswordRoute() {
    return (
        <div className="w-full min-h-dvh flex items-center justify-center p-4 bg-muted/30">
            <div className="w-full max-w-md bg-card border text-card-foreground shadow-xl rounded-card overflow-hidden">
                 <ResetPasswordPage />
            </div>
        </div>
    );
}
