
'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from 'lucide-react';

const LemonIllustration = () => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        className="relative w-48 h-48 md:w-56 md:h-56"
    >
        <div className="absolute inset-0 bg-yellow-300/50 rounded-full blur-2xl" />
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="relative">
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                fill="#FDE047"
                d="M100,20C140,20 180,60 180,100C180,140 140,180 100,180C60,180 20,140 20,100C20,60 60,20 100,20Z"
                transform="rotate(-30 100 100)"
            />
            <motion.path
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 1 }}
                fill="#FBBF24"
                d="M100,40 C120,40 140,60 140,80 C140,100 120,120 100,120 C80,120 60,100 60,80 C60,60 80,40 100,40Z"
                opacity="0.2"
            />
            <motion.path
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
                fill="#84CC16"
                d="M140,20 C150,30 150,50 140,60 C130,70 110,70 100,60"
            />
        </svg>
    </motion.div>
);


export const LandingPage = ({ setAuthModal }: { setAuthModal: (modal: string | null) => void; }) => {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            
            <main className="flex-1 w-full flex flex-col justify-center items-center p-6 text-center">
                <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6">
                    <LemonIllustration />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
                        className="space-y-3"
                    >
                         <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Keuangan jadi lebih segar.
                        </h1>
                        <p className="text-base text-muted-foreground sm:text-lg max-w-sm mx-auto">
                            Lemon membantumu melacak setiap rupiah dan mencapai tujuan finansial dengan mudah.
                        </p>
                    </motion.div>
                </div>
            </main>

            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.6 }}
                className="w-full max-w-md mx-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            >
                <div className="space-y-3">
                    <Button onClick={() => setAuthModal('signup')} className="w-full h-14 text-lg shadow-lg">
                        Mulai
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <div className="text-center">
                        <span className="text-sm text-muted-foreground">Sudah punya akun? </span>
                        <Button variant="link" onClick={() => setAuthModal('login')} className="p-0 h-auto text-sm">
                            Masuk di sini
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
