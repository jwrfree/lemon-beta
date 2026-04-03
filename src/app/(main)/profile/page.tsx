
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
    Download, Sparkles, Camera, Mail, Phone, MapPin,
    CreditCard, Bell, Lock, Palette, Eye, EyeOff, Trash2
} from '@/lib/icons';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { cn, triggerHaptic } from '@/lib/utils';
import { PageHeader } from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
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
import { UserAvatar } from '@/components/user-avatar';
import { EditProfileSheet } from '@/features/profile/components/edit-profile-sheet';

// --- BENTO GRID COMPONENT ---
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
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 0.995 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-[32px] bg-card shadow-soft transition-all cursor-pointer group select-none border border-border/40",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

function ProfileContent() {
    const router = useRouter();
    const { user, userData, handleSignOut, updateOnboardingStatus, deleteUserData } = useAuth();
    const { theme, setTheme } = useTheme();
    const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();
    const { deferredPrompt, setDeferredPrompt, showToast } = useUI();
    const [mounted, setMounted] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    };

    const openEditSheet = () => {
        triggerHaptic('light');
        setIsEditSheetOpen(true);
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            triggerHaptic('heavy');
            await deleteUserData();
            showToast("Semua data Anda telah dihapus.", "success");
        } catch (error) {
            showToast("Gagal menghapus data.", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AppPageShell className="bg-background">
            <PageHeader
                title="Profil & Akun"
                showBackButton={false}
                width="compact"
            />

            <AppPageBody width="compact" className="space-y-8 pb-24 md:pb-12">
                
                {/* HERO SECTION: Centered Avatar & Identity */}
                <section className="flex flex-col items-center justify-center pt-4 pb-2">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                    >
                        <div className="h-32 w-32 rounded-full p-1.5 bg-gradient-to-tr from-accent via-accent/20 to-transparent shadow-2xl relative">
                             <UserAvatar 
                                name={userData?.displayName} 
                                src={userData?.photoURL} 
                                className="h-full w-full border-4 border-background shadow-inner" 
                                fallbackClassName="text-3xl"
                            />
                            <button 
                                onClick={openEditSheet}
                                className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center border-4 border-background shadow-lg hover:scale-110 active:scale-95 transition-all"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mt-6 space-y-1"
                        onClick={openEditSheet}
                    >
                        <h1 className="text-3xl font-bold tracking-tighter text-foreground cursor-pointer hover:text-accent transition-colors">
                            {userData?.displayName || 'Setia Lemon'}
                        </h1>
                        <p className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/40 tabular-nums">
                            {user?.email}
                        </p>
                    </motion.div>
                </section>

                {/* PERSONAL INFO GROUP: Bento List */}
                <section className="space-y-3">
                    <h2 className="px-6 text-label-sm font-bold uppercase tracking-widest text-muted-foreground/40">Informasi Personal</h2>
                    <BentoItem className="p-2 space-y-1 bg-card/40 border-none shadow-none">
                        {[
                            { label: 'Nama Lengkap', value: userData?.displayName || '-', icon: UserIcon, editable: true },
                            { label: 'E-mail Aktif', value: user?.email || '-', icon: Mail, editable: false },
                        ].map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={item.editable ? openEditSheet : undefined}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl transition-colors group",
                                    item.editable ? "hover:bg-muted/30 cursor-pointer active:scale-[0.98]" : "opacity-90"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground transition-all",
                                        item.editable && "group-hover:bg-accent/10 group-hover:text-accent"
                                    )}>
                                        <item.icon className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/30 leading-none mb-1">{item.label}</span>
                                        <span className="text-sm font-bold tracking-tight text-foreground/80">{item.value}</span>
                                    </div>
                                </div>
                                {item.editable && (
                                    <span className="text-label-sm font-bold uppercase tracking-wider text-muted-foreground/50 group-hover:text-accent transition-colors">
                                        Edit
                                    </span>
                                )}
                            </div>
                        ))}
                    </BentoItem>
                </section>

                {/* CORE FEATURES GROUP */}
                <section className="space-y-3">
                    <h2 className="px-6 text-label-sm font-bold uppercase tracking-widest text-muted-foreground/40">Aktivitas & Modul</h2>
                    <BentoItem className="p-2 space-y-1 bg-card/40 border-none shadow-none">
                        {[
                            { name: 'Hutang & Piutang', icon: Smartphone, path: '/debts', desc: 'Kelola kewajiban finansial' },
                            { name: 'Aset & Liabilitas', icon: Landmark, path: '/assets-liabilities', desc: 'Pantau kekayaan bersih' },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => router.push(item.path)}
                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-colors cursor-pointer group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-all">
                                        <item.icon className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                        <span className="text-label-sm font-bold uppercase tracking-wider text-muted-foreground/30">{item.desc}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted/30 group-hover:text-muted-foreground transition-colors" />
                            </div>
                        ))}
                    </BentoItem>
                </section>

                {/* APP SETTINGS GROUP: Bento Grid */}
                <section className="space-y-4">
                    <h2 className="px-6 text-label-sm font-bold uppercase tracking-widest text-muted-foreground/40">Pengaturan Aplikasi</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <BentoItem onClick={toggleTheme} className="p-6 flex flex-col gap-4 aspect-square justify-between group">
                            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-all">
                                {mounted && theme === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Tampilan</p>
                                <p className="text-base font-bold tracking-tighter text-foreground">{mounted && theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</p>
                            </div>
                        </BentoItem>

                        <BentoItem onClick={toggleBalanceVisibility} className="p-6 flex flex-col gap-4 aspect-square justify-between group">
                            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-all">
                                {isBalanceVisible ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Privasi</p>
                                <p className="text-base font-bold tracking-tighter text-foreground">{isBalanceVisible ? 'Saldo Terlihat' : 'Saldo Tersembunyi'}</p>
                            </div>
                        </BentoItem>
                    </div>

                    <BentoItem className="p-2 space-y-1">
                        {[
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
                                },
                                desc: 'Tampilkan kembali panduan awal'
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                onClick={item.onClick}
                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-secondary/80 group-hover:bg-accent/10 group-hover:text-accent transition-all">
                                        <item.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                        <span className="text-label-sm font-bold uppercase tracking-wider text-muted-foreground/30">{item.desc}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted/20 group-hover:text-muted-foreground" />
                            </div>
                        ))}
                    </BentoItem>
                </section>

                {/* AI USAGE TRACKER */}
                <DeepSeekUsageCard />

                {/* APP INSTALLATION */}
                {mounted && (
                    <BentoItem
                        onClick={deferredPrompt ? handleInstallClick : undefined}
                        className={cn(
                            "text-accent-foreground shadow-xl p-6 flex items-center justify-between group overflow-hidden relative border-none",
                            isStandalone
                                ? "bg-success select-none shadow-success/20"
                                : deferredPrompt
                                    ? "bg-accent shadow-accent/20"
                                    : "bg-muted text-foreground border border-border/40"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-30" />
                        <div className="relative z-10 flex items-center gap-5">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                (isStandalone || deferredPrompt) ? "bg-white/10 backdrop-blur-md border-white/20" : "bg-card border-border/40"
                            )}>
                                <Download className={cn("h-7 w-7", (isStandalone || deferredPrompt) ? "text-accent-foreground" : "text-muted-foreground")} />
                            </div>
                            <div>
                                <h3 className={cn("text-xl font-bold tracking-tighter flex items-center gap-2 leading-none", (isStandalone || deferredPrompt) ? "text-accent-foreground" : "text-foreground")}>
                                    {isStandalone ? 'Mode PWA Native' : 'Pasang Lemon'}
                                    <Sparkles className="h-4 w-4 text-warning animate-pulse" />
                                </h3>
                                <p className={cn("text-label-sm font-bold uppercase tracking-widest mt-2", (isStandalone || deferredPrompt) ? "text-accent-foreground/60" : "text-muted-foreground/60")}>
                                    {isStandalone ? 'Aplikasi Berjalan Mandiri' : 'Akses Lebih Cepat & Ringan'}
                                </p>
                            </div>
                        </div>
                        {!isStandalone && deferredPrompt && (
                            <div className="relative z-10 font-bold text-label-sm tracking-widest bg-foreground text-background px-5 py-2.5 rounded-full shadow-lg group-hover:scale-105 transition-all active:scale-95">
                                PASANG
                            </div>
                        )}
                    </BentoItem>
                )}

                {/* LOGOUT ACTION */}
                <div className="pt-4 pb-8 space-y-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full h-16 bg-destructive/5 text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-[32px] font-bold tracking-widest uppercase text-xs gap-3 justify-center transition-all active:scale-95 group"
                                onClick={() => triggerHaptic('medium')}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Keluar dari Akun</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-card-premium border-none shadow-2xl bg-popover/95 backdrop-blur-xl max-w-[calc(100%-2rem)]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold tracking-tight">Konfirmasi Logout</AlertDialogTitle>
                                <AlertDialogDescription className="text-label text-muted-foreground/60 leading-relaxed">
                                    Apakah Anda yakin ingin keluar? Sesi aktif Anda akan segera diakhiri.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 flex flex-col gap-3">
                                <AlertDialogAction asChild>
                                    <Button 
                                        onClick={handleSignOut} 
                                        variant="destructive" 
                                        className="w-full h-14 rounded-2xl font-bold active:scale-95 transition-all bg-destructive text-destructive-foreground"
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

                    {/* DANGER ZONE: Account Deletion */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full h-12 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-2xl font-bold tracking-widest uppercase text-label-sm gap-2 justify-center transition-all opacity-50 hover:opacity-100"
                                onClick={() => triggerHaptic('light')}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Semua Data</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-card-premium border-none shadow-2xl bg-popover/95 backdrop-blur-xl max-w-[calc(100%-2rem)] border-t-4 border-t-destructive">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold tracking-tight text-destructive">Hapus Semua Data?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground/80 leading-relaxed">
                                    Tindakan ini **tidak dapat dibatalkan**. Semua riwayat transaksi, dompet, hutang, dan pengaturan Anda akan dihapus permanen dari server kami.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 flex flex-col gap-3">
                                <AlertDialogAction asChild>
                                    <Button 
                                        onClick={handleDeleteAccount} 
                                        disabled={isDeleting}
                                        variant="destructive" 
                                        className="w-full h-14 rounded-2xl font-bold active:scale-95 transition-all bg-destructive text-destructive-foreground"
                                    >
                                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
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

                    <div className="mt-8 text-center">
                        <p className="text-label-sm font-bold tracking-widest opacity-10 uppercase">Lemon Finance OS • v2.0</p>
                    </div>
                </div>

                {/* EDIT PROFILE DRAWER */}
                <EditProfileSheet 
                    isOpen={isEditSheetOpen} 
                    onClose={() => setIsEditSheetOpen(false)} 
                />

            </AppPageBody>
        </AppPageShell>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ProfileContent />
        </Suspense>
    );
}


