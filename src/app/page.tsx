
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

const LoadingSpinner = () => (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

export default function WelcomePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authModal, setAuthModal] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/home');
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (isLoading) {
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
