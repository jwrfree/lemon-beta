
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { ForgotPasswordPage } from '@/components/forgot-password-page';
import { useApp } from '@/components/app-provider';
import { useRouter } from 'next/navigation';
import type { AuthModalView } from '@/types/auth';

export default function WelcomePage() {
    // Default view is now 'login', not null. Modals are now full pages.
    const [authView, setAuthView] = useState<AuthModalView>('login');
    const { user, isLoading } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);

    // Render nothing while checking for user, to prevent flicker
    if (isLoading || user) {
        return null;
    }

    // Since landing page is removed, we show the login page by default.
    // The other auth pages are shown conditionally.
    return (
        <div className="w-full h-dvh flex items-center justify-center p-4">
             <AnimatePresence mode="wait">
                {authView === 'login' && <LoginPage onClose={() => {}} setAuthModal={setAuthView} isPage />}
                {authView === 'signup' && <SignUpPage onClose={() => setAuthView('login')} setAuthModal={setAuthView} isPage />}
                {authView === 'forgot-password' && (
                    <ForgotPasswordPage onClose={() => setAuthView('login')} setAuthModal={setAuthView} isPage />
                )}
            </AnimatePresence>
        </div>
    );
}
