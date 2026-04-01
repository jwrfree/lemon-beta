
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
import { Button } from '@/components/ui/button';
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
import { AppPageBody, AppPageShell } from '@/components/app-page-shell';

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
    const { user, userData, handleSignOut, updateOnboardingStatus } = useAuth();
    const { theme, setTheme } = useTheme();
    const { deferredPrompt, setDeferredPrompt, showToast } = useUI();
    const [mounted, setMounted] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsStandalone(
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true
        );
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
        <AppPageShell className="text-foreground">

            {/* Header Bersih */}
            <PageHeader
                title="Pengaturan"
                showBackButton={false}
                width="compact"
                extraActions={
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-background">
                        {userData?.photoURL ? (
                            <Image src={userData.photoURL} alt="User" width={40} height={40} className="object-cover" />
                        ) : (
                            <UserIcon className="w-full h-full p-2 text-muted-foreground" />
                        )}
                    </div>
                }
            />

            <AppPageBody width="compact" className="space-y-4 pb-24 md:pb-12">

                {/* BARIS 1: Identity Card (Besar) + Theme Switcher (Kecil) */}
                <div className="grid grid-cols-12 gap-4 h-auto md:h-64">
                    {/* Identity Card */}
                    <BentoItem className="col-span-12 md:col-span-8 bg-gradient-to-br from-primary/90 via-violet-600/80 to-indigo-600/80 text-white shadow-xl rounded-card p-7 flex flex-col justify-between overflow-hidden relative" delay={0.05}>
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-white/60 text-xs font-bold">Identitas Digital</p>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-none">{userData?.displayName || 'Setia Lemon'}</h1>
                                <p className="text-white/80 text-label mt-1">{user?.email}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="relative z-10 mt-8 flex items-end justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold border border-white/10 text-white">Pro Member</span>
                                <span className="px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-md text-[10px] font-bold border border-white/5 text-white/80">Level 4</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-white/60 font-bold">Bergabung Sejak</p>
                                <p className="text-sm font-bold">2024</p>
                            </div>
                        </div>

                        {/* Abstract Decor */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 blur-3xl rounded-full" />
                    </BentoItem>

                    {/* Theme Switcher - Visual */}
                    <BentoItem
                        onClick={toggleTheme}
                        className="col-span-12 md:col-span-4 bg-muted hover:bg-muted/80 p-6 flex flex-col justify-center items-center relative gap-4 rounded-card border border-border/40"
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
                        <p className="text-label text-foreground font-bold leading-none">
                            {mounted && theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground leading-none">Ketuk untuk ganti</p>
                    </BentoItem>
                </div>

                {/* BARIS 2: Core Actions (Grid 2) */}
                <div className="grid grid-cols-2 gap-4">
                    <BentoItem onClick={() => router.push('/wallets')} delay={0.15} className="h-32 flex flex-col items-center justify-center p-6 gap-3 hover:bg-muted/50 rounded-card border border-border/40">
                        <div className="p-3 rounded-xl bg-info/10 text-info">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-label text-muted-foreground font-bold">Dompet</span>
                    </BentoItem>
 
                    <BentoItem onClick={() => router.push('/goals')} delay={0.2} className="h-32 flex flex-col items-center justify-center p-6 gap-3 hover:bg-muted/50 rounded-card border border-border/40">
                        <div className="p-3 rounded-xl bg-success/10 text-success">
                            <Target className="w-6 h-6" />
                        </div>
                        <span className="text-label text-muted-foreground font-bold">Target</span>
                    </BentoItem>
                </div>

                {/* AI Usage Tracker */}
                <DeepSeekUsageCard />

                {/* BARIS 3: List Menu (Settings Detail) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* App Installation - Always Visible */}
                    {mounted && (
                     <BentoItem
                            onClick={deferredPrompt ? handleInstallClick : undefined}
                            className={cn(
                                "col-span-1 md:col-span-3 text-white shadow-xl rounded-card p-6 flex items-center justify-between group overflow-hidden relative",
                                isStandalone
                                    ? "bg-success select-none"
                                    : deferredPrompt
                                        ? "bg-primary"
                                        : "bg-muted text-foreground border border-border/40"
                            )}
                            delay={0.32}
                        >
                            <div className={cn("absolute inset-0 opacity-20", isStandalone ? "bg-success" : deferredPrompt ? "bg-primary" : "bg-muted")} />
                            <div className="relative z-10 flex items-center gap-5">
                                <div className={cn(
                                    "h-14 w-14 rounded-xl flex items-center justify-center border transition-all duration-500",
                                    (isStandalone || deferredPrompt) ? "bg-white/10 backdrop-blur-md border-white/20" : "bg-card border-border/40"
                                )}>
                                    <Download className={cn("h-7 w-7", (isStandalone || deferredPrompt) ? "text-white" : "text-muted-foreground")} />
                                </div>
                                <div>
                                    <h3 className={cn("text-xl font-bold tracking-tight flex items-center gap-2 leading-none", (isStandalone || deferredPrompt) ? "text-white" : "text-foreground")}>
                                        {isStandalone ? 'Aplikasi Terinstal' : 'Pasang Lemon'}
                                        <Sparkles className="h-4 w-4 text-warning animate-pulse" />
                                    </h3>
                                    <p className={cn("text-[10px] font-bold mt-1.5", (isStandalone || deferredPrompt) ? "text-white/60" : "text-muted-foreground/60")}>
                                        {isStandalone
                                            ? 'Berjalan dalam mode native'
                                            : deferredPrompt
                                                ? 'Akses lebih cepat & luring penuh'
                                                : 'Gunakan browser untuk menambah'}
                                    </p>
                                </div>
                            </div>
                            {!isStandalone && deferredPrompt && (
                                <div className="relative z-10 font-bold text-[10px] bg-white text-primary px-4 py-2 rounded-lg shadow-lg group-hover:bg-white/90 transition-all active:scale-95">
                                    PASANG
                                </div>
                            )}

                            {/* Decor */}
                            <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/10 blur-3xl rounded-full" />
                        </BentoItem>
                    )}


                    <BentoItem delay={0.35} className="md:col-span-2 p-2 flex flex-col gap-1 rounded-card border border-border/40">
                        <div className="px-6 py-4 text-label text-muted-foreground/60 font-bold">Pengaturan Lanjutan</div>
                        <div className="space-y-1 px-2 pb-2">
                            {[
                                { name: 'Pengingat & Notifikasi', icon: BellRing, path: '/reminders' },
                                { name: 'Hutang & Piutang', icon: Smartphone, path: '/debts' },
                                { name: 'Aset & Liabilitas', icon: Landmark, path: '/assets-liabilities' },
                                { 
                                    name: 'Atur Ulang Onboarding', 
                                    icon: Sparkles, 
                                    onClick: () => {
                                        triggerHaptic('medium');
                                        updateOnboardingStatus({ 
                                            steps: { wallet: false, transaction: false, goal: false },
                                            isDismissed: false
                                        });
                                        showToast("Onboarding telah diatur ulang.", "success");
                                    } 
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        if (item.path) router.push(item.path);
                                        if (item.onClick) item.onClick();
                                    }}
                                    className="flex items-center justify-between p-4 rounded-card hover:bg-muted/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-secondary/80 group-hover:bg-card transition-colors shadow-sm">
                                            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted/30 group-hover:text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </BentoItem>

                    <BentoItem delay={0.4} className="p-7 flex flex-col justify-center gap-4 bg-muted/30 border-dashed border-2 border-border/50 rounded-card opacity-40">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                <span className="text-label font-bold uppercase tracking-wide">Platform</span>
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wide">Web Desktop (Beta)</span>
                        </div>
                    </BentoItem>
                </div>

                {/* LOGOUT ACTION - STANDARDIZED MOBILE UI */}
                <div className="pb-6 pt-8 md:pb-12">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full h-16 bg-error/10 text-error hover:bg-error/20 border border-error/20 rounded-card-premium font-bold tracking-tight gap-3 justify-center transition-all active:rotate-1 active:scale-95 group"
                                onClick={() => triggerHaptic('medium')}
                            >
                                <div className="p-2 rounded-lg bg-error/20 group-hover:bg-error/30 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span className="text-base">Keluar dari Akun</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-card border-none shadow-2xl bg-popover/95 backdrop-blur-xl max-w-[calc(100%-2rem)]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold tracking-tight">Konfirmasi Logout</AlertDialogTitle>
                                <AlertDialogDescription className="text-label text-muted-foreground/60 leading-relaxed">
                                    Apakah Anda yakin ingin keluar? Sesi aktif Anda akan segera diakhiri dan draf transaksi yang belum disimpan akan hilang.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 flex flex-col gap-3">
                                <AlertDialogAction asChild>
                                    <Button 
                                        onClick={handleSignOut} 
                                        variant="error" 
                                        className="w-full h-14 rounded-2xl font-bold active:scale-95 transition-all"
                                    >
                                        Ya, Keluar Sekarang
                                    </Button>
                                </AlertDialogAction>
                                <AlertDialogCancel asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full h-12 rounded-xl border-none font-bold text-label text-muted-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        Batal
                                    </Button>
                                </AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold tracking-wide opacity-10 uppercase">Lemon AI Dashboard v2.0</p>
                    </div>
                </div>
            </AppPageBody>
        </AppPageShell>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SettingsContent />
        </Suspense>
    );
}
