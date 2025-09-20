
'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { useApp } from '@/components/app-provider';
import { useRouter } from 'next/navigation';

const LoadingSpinner = () => (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

export default function WelcomePage() {
    const router = useRouter();
    const { user, isLoading } = useApp();
    const [authModal, setAuthModal] = useState<string | null>(null);

    // This effect handles redirecting the user to the home page if they are already logged in.
    React.useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);

    // While loading, or if the user is logged in (and about to be redirected),
    // show a spinner to prevent the landing page from flashing.
    if (isLoading || (!isLoading && user)) {
        return <LoadingSpinner />;
    }
    
    const closeModal = () => setAuthModal(null);

    // If not loading and no user, show the landing page.
    return (
        <>
            <LandingPage setAuthModal={setAuthModal} />

            <AnimatePresence>
                {authModal === 'login' && <LoginPage onClose={closeModal} setAuthModal={setAuthModal} />}
                {authModal === 'signup' && <SignUpPage onClose={closeModal} setAuthModal={setAuthModal} />}
            </AnimatePresence>
        </>
    );
}
