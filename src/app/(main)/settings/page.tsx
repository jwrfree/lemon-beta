
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
            whileHover={{ scale: 0.985 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-card-glass bg-card shadow-card transition-all cursor-pointer group select-none border-none",
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
        <div className="min-h-screen bg-background text-foreground pb-24">

            {/* Header Bersih */}
            <PageHeader
                title="Profil"
                showBackButton={true}
                extraActions={
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-background shadow-sm">
                        {userData?.photoURL ? (
                            <Image src={userData.photoURL} alt="User" width={40} height={40} className="object-cover" />
                        ) : (
                            <UserIcon className="w-full h-full p-2 text-muted-foreground" />
                        )}
                    </div>
                }
            />

            {/* BENTO GRID LAYOUT */}
            <div className="px-4 md:px-6 w-full max-w-5xl mx-auto space-y-4 mt-4">

                {/* BARIS 1: Identity Card (Besar) + Theme Switcher (Kecil) */}
                <div className="grid grid-cols-12 gap-4 h-auto md:h-64">
                    {/* Identity Card */}
                    <BentoItem className="col-span-12 md:col-span-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl rounded-card-premium p-8 flex flex-col justify-between" delay={0.05}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Digital ID</p>
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-none">{userData?.displayName || 'Guest User'}</h2>
                                <p className="text-white/80 font-medium text-sm mt-1">{user?.email}</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-white/50" />
                        </div>
                        <div className="mt-8 flex items-end justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-widest border border-white/10 shadow-lg text-white">PRO MEMBER</span>
                                <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-semibold uppercase tracking-widest border border-white/5 text-white/80">LEVEL 4</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-white/60 font-semibold uppercase tracking-widest">Sejak</p>
                                <p className="text-sm font-semibold">2024</p>
                            </div>
                        </div>

                        {/* Abstract Decor */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 blur-3xl rounded-full" />
                    </BentoItem>

                    {/* Theme Switcher - Visual */}
                    <BentoItem
                        onClick={toggleTheme}
                        className="col-span-12 md:col-span-4 bg-foreground text-background dark:bg-foreground dark:text-background p-6 flex flex-col justify-center items-center relative gap-4 rounded-card-premium"
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
                        <p className="font-semibold text-xs tracking-widest uppercase mt-4">
                            {mounted && theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-xs font-semibold opacity-40 uppercase tracking-widest">Tap to switch</p>
                    </BentoItem>
                </div>

                {/* BARIS 2: Core Actions (Grid 2) */}
                <div className="grid grid-cols-2 gap-4">
                    <BentoItem onClick={() => router.push('/wallets')} delay={0.15} className="h-32 flex flex-col items-center justify-center p-6 gap-3 hover:bg-muted/50 rounded-card-glass">
                        <div className="p-3 rounded-full bg-info/10 text-info shadow-sm">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-xs uppercase tracking-widest text-muted-foreground/80">Dompet</span>
                    </BentoItem>

                    <BentoItem onClick={() => router.push('/goals')} delay={0.2} className="h-32 flex flex-col items-center justify-center p-6 gap-3 hover:bg-muted/50 rounded-card-glass">
                        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm">
                            <Target className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-xs uppercase tracking-widest text-muted-foreground/80">Target</span>
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
                                className="col-span-1 md:col-span-3 bg-teal-900 text-white shadow-xl rounded-card-premium p-8 flex items-center justify-between group overflow-hidden relative"
                                delay={0.32}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-teal-900 opacity-50" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-card-glass bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Download className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold tracking-tighter flex items-center gap-2">
                                            Instal Lemon
                                            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                                        </h3>
                                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Akses lebih cepat & mode luring penuh</p>
                                    </div>
                                </div>
                                <div className="relative z-10 bg-white text-teal-900 font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg group-hover:bg-teal-50 transition-colors">
                                    Pasang
                                </div>

                                {/* Decor */}
                                <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/10 blur-3xl rounded-full" />
                            </BentoItem>
                        )}
                    </AnimatePresence>

                    <BentoItem delay={0.35} className="md:col-span-2 p-2 flex flex-col gap-1 rounded-card-premium">
                        <div className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Pengaturan Lanjutan</div>
                        <div className="space-y-1 px-2 pb-2">
                            {[
                                { name: 'Pengingat & Notifikasi', icon: BellRing, path: '/reminders' },
                                { name: 'Hutang & Piutang', icon: Smartphone, path: '/debts' },
                                { name: 'Aset & Liabilitas', icon: Landmark, path: '/assets-liabilities' },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => router.push(item.path)}
                                    className="flex items-center justify-between p-4 rounded-card hover:bg-muted/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-md bg-secondary/50 group-hover:bg-card transition-colors shadow-sm">
                                            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted/30 group-hover:text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </BentoItem>

                    <BentoItem delay={0.4} className="p-8 flex flex-col justify-center gap-6 bg-muted/30 border-dashed border-2 border-border/50 rounded-card-premium">
                        <div className="flex flex-col gap-1 opacity-40">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-widest">Platform</span>
                            </div>
                            <span className="text-sm font-semibold">Web Desktop (Beta)</span>
                        </div>
                        <div className="h-px bg-border/50 w-full" />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className="flex items-center gap-3 text-destructive cursor-pointer hover:opacity-80 transition-opacity p-2 -ml-2 rounded-md">
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-semibold text-xs uppercase tracking-widest">Keluar Akun</span>
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-card-premium border-none shadow-2xl bg-popover/95 backdrop-blur-xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-semibold tracking-tighter">Konfirmasi Logout</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                                        Apakah Anda yakin ingin keluar? Sesi aktif Anda akan segera diakhiri.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 flex-row gap-3">
                                    <AlertDialogCancel className="flex-1 rounded-full h-12 border-border font-semibold text-xs uppercase tracking-widest mt-0">Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSignOut} className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-full h-12 font-semibold text-xs uppercase tracking-widest">Logout</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </BentoItem>
                </div>

                <div className="pt-8 pb-12 text-center">
                    <p className="text-xs font-semibold tracking-widest uppercase opacity-20">Designed by Lemon AI</p>
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
