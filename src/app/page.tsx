
'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { AppProvider } from '@/components/app-provider';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { AnimatePresence } from 'framer-motion';
import { redirect } from 'next/navigation';

export default function AppPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModal, setAuthModal] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
      if(user) {
        setAuthModal(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex h-dvh w-full items-center justify-center bg-background">Loading...</div>;
  }
  
  if (!user) {
     return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-gray-50 flex flex-col items-center p-0 md:p-8 font-sans">
            <div className="w-full max-w-md h-dvh md:h-auto md:min-h-[700px] bg-background border-border md:border md:rounded-lg md:shadow-2xl relative flex flex-col overflow-hidden">
                <LandingPage setAuthModal={setAuthModal} />
                 <AnimatePresence>
                    {authModal === 'login' && <LoginPage onClose={() => setAuthModal(null)} setAuthModal={setAuthModal} />}
                    {authModal === 'signup' && <SignUpPage onClose={() => setAuthModal(null)} setAuthModal={setAuthModal} />}
                </AnimatePresence>
            </div>
        </div>
    );
  }

  // If user is logged in, redirect to the main app dashboard
  return redirect('/');
}
