
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/app-provider';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';

export default function WelcomePage() {
    const { user, isLoading } = useApp();
    const router = useRouter();
    const [authModal, setAuthModal] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);

    if (isLoading || user) {
        // Show a global loader or a blank screen while redirecting
        return (
             <div className="flex h-dvh w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
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
