
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { app } from '@/lib/firebase';
import { AppProvider, useApp } from '@/components/app-provider';

const auth = getAuth(app);

const LoadingSpinner = () => (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

const WelcomePageContent = () => {
    const router = useRouter();
    const { user, isLoading } = useApp();
    const [authModal, setAuthModal] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);


    if (isLoading || (!isLoading && user)) {
        return <LoadingSpinner />;
    }
    
    const closeModal = () => setAuthModal(null);

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

export default function WelcomePage() {
    return (
        <AppProvider>
            <WelcomePageContent />
        </AppProvider>
    );
}
