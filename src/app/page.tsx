
'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/landing-page';
import { LoginPage } from '@/components/login-page';
import { SignUpPage } from '@/components/signup-page';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';

export default function AppPage() {
  const { user, isLoading } = useApp();
  const [authModal, setAuthModal] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

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

  // User is logged in, but content is handled by the layout and page in the (main) group.
  // This page just ensures the redirect happens and avoids showing a blank page.
  return <div className="flex h-dvh w-full items-center justify-center bg-background">Loading...</div>;
}
