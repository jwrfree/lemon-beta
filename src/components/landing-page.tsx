
'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from 'lucide-react';

export const LandingPage = ({ setAuthModal }: { setAuthModal: (modal: string | null) => void; }) => {
    return (
        <div className="flex flex-col h-dvh bg-background overflow-hidden">
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">

                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Sparkles className="h-10 w-10 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-primary">Lemon</span>
                </motion.div>

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-foreground"
                >
                    Kelola keuanganmu, bukan sebaliknya.
                </motion.h1>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-4 max-w-md text-base text-muted-foreground"
                >
                    Lemon adalah cara termudah untuk melacak pengeluaran, mengatur anggaran, dan melihat gambaran lengkap kesehatan finansialmu.
                </motion.p>
            </main>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.8 }}
                className="p-6 bg-background border-t"
            >
                <div className="flex flex-col items-center gap-4">
                    <Button onClick={() => setAuthModal('signup')} className="w-full">
                        Mulai
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Sudah punya akun?{' '}
                        <Button variant="link" onClick={() => setAuthModal('login')} className="p-0 h-auto">
                            Masuk di sini
                        </Button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
