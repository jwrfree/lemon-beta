
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { useApp } from '@/components/app-provider';
import { useRouter } from 'next/navigation';

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);


export default function WelcomePage() {
    const [authModal, setAuthModal] = useState<string | null>(null);
    const closeModal = () => setAuthModal(null);
    const { user, isLoading } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);


    if (isLoading || user) {
        return <LoadingSpinner />;
    }

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
