
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from '@/features/auth/components/login-page';
import { SignUpPage } from '@/features/auth/components/signup-page';
import { ForgotPasswordPage } from '@/features/auth/components/forgot-password-page';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import type { AuthModalView } from '@/types/auth';
import { LoaderCircle } from 'lucide-react';

export default function WelcomePage() {
    const [authView, setAuthView] = useState<AuthModalView>('login');
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);


    if (isLoading || user) {
        return (
             <div className="w-full h-dvh flex items-center justify-center p-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
