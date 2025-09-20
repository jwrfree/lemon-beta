
'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserPlus, Wallet, PieChart, TrendingUp } from 'lucide-react';
import Image from "next/image";

const AppMockup = () => (
    <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        className="relative w-72 h-auto"
    >
        <div className="relative aspect-[9/19] w-full rounded-3xl shadow-2xl bg-gray-900/80 ring-4 ring-gray-700/50 p-2">
            <div className="absolute inset-0.5 rounded-[1.4rem] bg-background/90 backdrop-blur-sm overflow-hidden p-3">
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-primary">Lemon</span>
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                           <UserPlus className="h-3 w-3 text-primary"/>
                        </div>
                    </div>
                     <div className="p-3 rounded-lg bg-primary/10">
                        <div className="text-xs text-primary/80">Total Saldo</div>
                        <div className="text-xl font-bold text-primary">Rp12.345.678</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div className="p-2 rounded-lg bg-muted flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Dompet</span>
                        </div>
                        <div className="p-2 rounded-lg bg-muted flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Anggaran</span>
                        </div>
                    </div>
                     <div className="p-3 rounded-lg bg-muted flex flex-col gap-2">
                         <div className="text-xs text-muted-foreground">Pemasukan Bulan Ini</div>
                         <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-semibold">Rp5.000.000</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted opacity-50 flex flex-col gap-2">
                         <div className="text-xs text-muted-foreground">Pengeluaran</div>
                         <div className="w-full h-2 rounded-full bg-primary/20"></div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);


export const LandingPage = ({ setAuthModal }: { setAuthModal: (modal: string | null) => void; }) => {
    return (
        <div className="flex flex-col h-dvh bg-background">
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center -mt-8">
                <AppMockup />

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-10 text-3xl md:text-4xl font-bold tracking-tight text-foreground"
                >
                    Kelola keuanganmu, bukan sebaliknya.
                </motion.h1>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-4 max-w-md text-base text-muted-foreground"
                >
                    Lemon adalah cara termudah untuk melacak pengeluaran, mengatur anggaran, dan melihat gambaran lengkap kesehatan finansialmu.
                </motion.p>
            </main>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.9 }}
                className="p-6 bg-background border-t"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => setAuthModal('login')}>
                        Masuk
                    </Button>
                    <Button onClick={() => setAuthModal('signup')} className="gap-2">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Daftar Gratis
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
