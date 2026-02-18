
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Wrench, Target, Landmark, LogOut,
    BellRing, Calculator, Moon, Sun, User as UserIcon,
    ShieldCheck, Smartphone, Monitor, ChevronRight,
    Download, Sparkles
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { cn, triggerHaptic } from '@/lib/utils';
import { PageHeader } from "@/components/page-header";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DeepSeekUsageCard } from '@/features/settings/components/deepseek-usage-card';

// --- VISI SAYA: BENTO GRID COMMAND CENTER ---

function BentoItem({
    className,
    children,
    onClick,
    delay = 0
}: {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group select-none",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

function SettingsContent() {
    const router = useRouter();
    const { user, userData, handleSignOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const { deferredPrompt, setDeferredPrompt } = useUI();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        triggerHaptic('light');
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        triggerHaptic('medium');

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-32">

            {/* Header Bersih */}
            <PageHeader
                title="Profil"
                showBackButton={true}
                extraActions={
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border-2 border-zinc-100 dark:border-zinc-700">
                        {userData?.photoURL ? (
                            <Image src={userData.photoURL} alt="User" width={40} height={40} className="object-cover" />
                        ) : (
                            <UserIcon className="w-full h-full p-2 text-zinc-400" />
                        )}
                    </div>
                }
            />

            {/* BENTO GRID LAYOUT */}
            <div className="px-4 md:px-6 w-full max-w-5xl mx-auto space-y-4 mt-4">

                {/* BARIS 1: Identity Card (Besar) + Theme Switcher (Kecil) */}
                <div className="grid grid-cols-12 gap-4 h-auto md:h-64">
                    {/* Identity Card */}
                    <BentoItem className="col-span-12 md:col-span-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-none p-6 md:p-8 flex flex-col justify-between" delay={0.05}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Digital ID</p>
                                <h2 className="text-2xl md:text-4xl font-medium tracking-tight">{userData?.displayName || 'Guest User'}</h2>
                                <p className="text-white/80 font-medium">{user?.email}</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-white/50" />
                        </div>
                        <div className="mt-8 flex items-end justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/10 shadow-lg">PRO MEMBER</span>
                                <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-medium border border-white/5">LEVEL 4</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-white/60 font-medium">Bergabung sejak</p>
                                <p className="text-sm font-medium">2024</p>
                            </div>
                        </div>

                        {/* Abstract Decor */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 blur-3xl rounded-full" />
                    </BentoItem>

                    {/* Theme Switcher - Visual */}
                    <BentoItem
                        onClick={toggleTheme}
                        className="col-span-12 md:col-span-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black p-6 flex flex-col justify-center items-center relative gap-4"
                        delay={0.1}
                    >
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {mounted && theme === 'dark' ? (
                                    <motion.div
                                        key="moon"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Moon className="w-16 h-16" strokeWidth={1} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="sun"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Sun className="w-16 h-16" strokeWidth={1} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <p className="font-medium text-sm tracking-widest uppercase mt-4">
                            {mounted && theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-[10px] opacity-60">Tap to switch</p>
                    </BentoItem>
                </div>

                {/* BARIS 2: Core Actions (Grid 2) */}
                <div className="grid grid-cols-2 gap-4">
                    <BentoItem onClick={() => router.push('/wallets')} delay={0.15} className="h-32 flex flex-col items-center justify-center p-6 gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm text-center">Dompet</span>
                    </BentoItem>

                    <BentoItem onClick={() => router.push('/goals')} delay={0.2} className="h-32 flex flex-col items-center justify-center p-6 gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <Target className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm text-center">Target</span>
                    </BentoItem>
                </div>

                {/* AI Usage Tracker */}
                <DeepSeekUsageCard />

                {/* BARIS 3: List Menu (Settings Detail) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* App Installation - Premium CTA */}
                    <AnimatePresence>
                        {deferredPrompt && (
                            <BentoItem
                                onClick={handleInstallClick}
                                className="col-span-1 md:col-span-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none p-6 flex items-center justify-between group overflow-hidden relative"
                                delay={0.32}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                        <Download className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium tracking-tight flex items-center gap-2">
                                            Instal Lemon
                                            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                                        </h3>
                                        <p className="text-white/70 text-sm font-medium">Akses lebih cepat & mode luring penuh</p>
                                    </div>
                                </div>
                                <div className="relative z-10 bg-white text-teal-700 font-medium text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-lg group-hover:bg-teal-50 transition-colors">
                                    Pasang Sekarang
                                </div>

                                {/* Decor */}
                                <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/10 blur-3xl rounded-full" />
                            </BentoItem>
                        )}
                    </AnimatePresence>

                    <BentoItem delay={0.35} className="md:col-span-2 p-2 flex flex-col gap-1">
                        <div className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-400">Pengaturan Lanjutan</div>
                        {[
                            { name: 'Pengingat & Notifikasi', icon: BellRing, path: '/reminders' },
                            { name: 'Hutang & Piutang', icon: Smartphone, path: '/debts' },
                            { name: 'Aset & Liabilitas', icon: Landmark, path: '/assets-liabilities' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => router.push(item.path)}
                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 dark:text-zinc-700 dark:group-hover:text-zinc-400" />
                            </div>
                        ))}
                    </BentoItem>

                    <BentoItem delay={0.4} className="p-6 flex flex-col justify-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2">
                        <div className="flex items-center gap-3 opacity-50">
                            <Monitor className="w-5 h-5" />
                            <span className="text-sm font-medium">Versi Web Desktop (Beta)</span>
                        </div>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className="flex items-center gap-3 text-red-500 cursor-pointer hover:opacity-80 transition-opacity p-2 -ml-2 rounded-lg">
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium text-sm">Keluar dari Akun</span>
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Logout</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah Anda yakin ingin keluar? Sesi Anda akan berakhir.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSignOut} className="bg-red-500 hover:bg-red-600">Keluar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </BentoItem>
                </div>

                <div className="pt-8 pb-12 text-center">
                    <p className="text-[10px] font-medium tracking-[0.3em] uppercase opacity-30">Designed by Lemon AI</p>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SettingsContent />
        </Suspense>
    );
}
