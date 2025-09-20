
'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, LogIn, UserPlus } from 'lucide-react';

export const LandingPage = ({ setAuthModal }: { setAuthModal: (modal: string | null) => void; }) => {
    return (
        <div className="flex flex-col h-dvh bg-background">
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
                    className="relative mb-8"
                >
                    <div className="relative w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
                             <Wallet className="h-20 w-20 text-primary" strokeWidth={1} />
                        </div>
                    </div>
                </motion.div>

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-4xl font-bold tracking-tight text-foreground"
                >
                    Selamat Datang di Lemon
                </motion.h1>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-4 max-w-md text-lg text-muted-foreground"
                >
                    Aplikasi manajer keuangan pribadi yang simpel dan mudah digunakan untuk membantumu mencapai kebebasan finansial.
                </motion.p>
            </main>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.9 }}
                className="p-6 bg-background border-t"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" onClick={() => setAuthModal('login')}>
                        Masuk
                    </Button>
                    <Button size="lg" onClick={() => setAuthModal('signup')} className="gap-2">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Daftar
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
