
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { useApp } from '@/components/app-provider';
import { useRouter } from 'next/navigation';

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

    // If already logged in, the useEffect will handle the redirect.
    // We render the landing page immediately to avoid a loading screen.
    if (user) {
        return null; // Or a minimal loader if you prefer, but this avoids showing landing then redirecting.
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
