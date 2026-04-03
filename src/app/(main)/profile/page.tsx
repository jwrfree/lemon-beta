'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
 Camera,
 ChevronRight,
 CreditCard,
 Download,
 Eye,
 EyeOff,
 Landmark,
 LogOut,
 Mail,
 Moon,
 Sparkles,
 Sun,
 Trash2,
 User as UserIcon,
} from '@/lib/icons';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { cn, triggerHaptic } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
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
import { Card, CardContent } from '@/components/ui/card';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-label-lg font-bold text-muted-foreground/70 tracking-tight">
      {children}
    </h2>
  );
}

function SurfaceSection({
 children,
 className,
}: {
 children: React.ReactNode;
 className?: string;
}) {
 return (
 <Card
 variant="default"
 className={cn('overflow-hidden', className)}
 >
 <CardContent className="p-0">{children}</CardContent>
 </Card>
 );
}

function Row({
 icon: Icon,
 title,
 description,
 trailing,
 onClick,
 destructive = false,
 hideDivider = false,
}: {
 icon: React.ComponentType<{ className?: string }>;
 title: string;
 description: string;
 trailing?: React.ReactNode;
 onClick?: () => void;
 destructive?: boolean;
 hideDivider?: boolean;
}) {
 const interactive = Boolean(onClick);

 return (
 <button
 type="button"
 onClick={onClick}
 className={cn(
 'group relative flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors',
 interactive ? 'hover:bg-muted/30 active:scale-[0.99]': 'cursor-default',
 destructive && 'hover:bg-destructive/5'
 )}
 >
 <div className="flex min-w-0 items-center gap-4">
 <div
 className={cn(
 'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground transition-colors',
 interactive && !destructive && 'group-hover:bg-accent/10 group-hover:text-accent',
 destructive && 'group-hover:bg-destructive/10 group-hover:text-destructive'
 )}
 >
 <Icon className="h-5 w-5"/>
 </div>
 <div className="min-w-0">
 <p
 className={cn(
 'truncate text-title-md tracking-tight text-foreground',
 destructive && 'group-hover:text-destructive'
 )}
 >
 {title}
 </p>
 <p className="pt-1 text-body-sm text-muted-foreground">{description}</p>
 </div>
 </div>

 {trailing ?? (
 interactive ? (
 <ChevronRight
 className={cn(
 'h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform',
 !destructive && 'group-hover:translate-x-0.5 group-hover:text-foreground',
 destructive && 'group-hover:translate-x-0.5 group-hover:text-destructive'
 )}
 />
 ) : null
 )}

 {/* Inset Divider — Matches Transaction List style */}
 {!hideDivider && (
 <div className="absolute bottom-0 right-0 left-[76px] h-px bg-border"/>
 )}
 </button>
 );
}

function StatusPill({ children }: { children: React.ReactNode }) {
 return (
 <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-label-sm text-muted-foreground">
 {children}
 </span>
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
 (window.navigator as Navigator & { standalone?: boolean }).standalone === true
 );
 }, []);

 const toggleTheme = () => {
 triggerHaptic('light');
 setTheme(theme === 'dark'? 'light': 'dark');
 };

 const handleInstallClick = async () => {
 if (!deferredPrompt) return;
 triggerHaptic('medium');
 deferredPrompt.prompt();
 await deferredPrompt.userChoice;
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
 showToast('Semua data Anda telah dihapus.', 'success');
 } catch {
 showToast('Gagal menghapus data.', 'error');
 } finally {
 setIsDeleting(false);
 }
 };

 return (
 <AppPageShell className="bg-background">
 <PageHeader title="Profil & Akun"showBackButton={false} width="compact"/>

 <AppPageBody width="compact"className="space-y-5 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-12">
 <section className="relative overflow-hidden rounded-card bg-card px-6 pb-6 pt-7 shadow-none">
 <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/8 via-accent/4 to-transparent"/>
 <div className="pointer-events-none absolute -right-8 top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl"/>

 <div className="relative z-10 flex flex-col items-center text-center">
 <button type="button"onClick={openEditSheet} className="relative"aria-label="Ubah Profil">
 <div className="absolute inset-0 rounded-full bg-accent/15 blur-xl"/>
 <div className="relative rounded-full bg-background p-1.5">
 <UserAvatar
 name={userData?.displayName}
 src={userData?.photoURL}
 className="h-28 w-28 shadow-none"
 fallbackClassName="text-display-lg "
 />
 </div>
 <span className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-card bg-foreground text-background">
 <Camera className="h-4 w-4"/>
 </span>
 </button>

 <div className="mt-5 space-y-1.5">
 <p className="text-label-sm text-muted-foreground">
 Profil utama
 </p>
 <h1 className="text-display-md tracking-tight text-foreground">
 {userData?.displayName || 'Setia Lemon'}
 </h1>
 <p className="break-all text-body-md text-muted-foreground">{user?.email}</p>
 </div>

 <Button
 type="button"
 variant="outline"
 onClick={openEditSheet}
 className="mt-5 h-11 rounded-full px-5 text-label-md "
 >
 Edit profil
 </Button>
 </div>
 </section>

 <section className="space-y-3">
 <SectionHeading>Informasi Personal</SectionHeading>
 <SurfaceSection>
 <div className="flex flex-col">
 <Row
 icon={UserIcon}
 title="Nama Lengkap"
 description={userData?.displayName || '-'}
 onClick={openEditSheet}
 trailing={<StatusPill>Edit</StatusPill>}
 />
 <Row
 icon={Mail}
 title="E-mail Aktif"
 description={user?.email || '-'}
 />
 </div>
 </SurfaceSection>
 </section>

 <section className="space-y-3">
 <SectionHeading>Aktivitas & Modul</SectionHeading>
 <SurfaceSection>
 <div className="flex flex-col">
 <Row
 icon={CreditCard}
 title="Hutang & Piutang"
 description="Kelola kewajiban finansial"
 onClick={() => router.push('/debts')}
 />
 <Row
 icon={Landmark}
 title="Aset & Liabilitas"
 description="Pantau kekayaan bersih"
 onClick={() => router.push('/assets-liabilities')}
 hideDivider={true}
 />
 </div>
 </SurfaceSection>
 </section>

 <section className="space-y-3">
 <SectionHeading>Pengaturan Aplikasi</SectionHeading>
 <SurfaceSection>
 <div className="flex flex-col">
 <Row
 icon={mounted && theme === 'dark'? Moon : Sun}
 title="Tampilan"
 description={mounted && theme === 'dark'? 'Mode gelap aktif': 'Mode terang aktif'}
 onClick={toggleTheme}
 trailing={
 <StatusPill>
 {mounted && theme === 'dark'? 'Gelap': 'Terang'}
 </StatusPill>
 }
 />
 <Row
 icon={isBalanceVisible ? Eye : EyeOff}
 title="Privasi"
 description={isBalanceVisible ? 'Saldo sedang terlihat': 'Saldo sedang disembunyikan'}
 onClick={toggleBalanceVisibility}
 trailing={
 <StatusPill>
 {isBalanceVisible ? 'Terlihat': 'Tersembunyi'}
 </StatusPill>
 }
 />
 <Row
 icon={Sparkles}
 title="Atur Ulang Onboarding"
 description="Tampilkan kembali panduan awal"
 onClick={() => {
 triggerHaptic('medium');
 updateOnboardingStatus({
 steps: { wallet: false, transaction: false, goal: false },
 isDismissed: false,
 });
 showToast('Onboarding telah diatur ulang.', 'success');
 }}
 hideDivider={true}
 />
 </div>
 </SurfaceSection>
 </section>

 <DeepSeekUsageCard />

 {mounted ? (
 <SurfaceSection>
 <div className="flex items-center justify-between gap-4 px-5 py-5">
 <div className="flex min-w-0 items-center gap-4">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
 <Download className="h-6 w-6"/>
 </div>
 <div className="min-w-0">
 <p className="text-title-lg tracking-tight text-foreground">
 {isStandalone ? 'Mode PWA Native': 'Pasang Lemon'}
 </p>
 <p className="pt-1 text-body-sm text-muted-foreground">
 {isStandalone
 ? 'Aplikasi berjalan mandiri di perangkat ini'
 : 'Akses lebih cepat dan terasa seperti aplikasi native'}
 </p>
 </div>
 </div>

 {!isStandalone && deferredPrompt ? (
 <Button
 type="button"
 variant="secondary"
 onClick={handleInstallClick}
 className="h-10 rounded-full px-4 text-label-md "
 >
 Pasang
 </Button>
 ) : (
 <StatusPill>{isStandalone ? 'Terpasang': 'Siap'}</StatusPill>
 )}
 </div>
 </SurfaceSection>
 ) : null}

 <section className="space-y-3">
 <SectionHeading>Akun</SectionHeading>
 <SurfaceSection>
 <div className="flex flex-col">
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <div>
 <Row
 icon={LogOut}
 title="Keluar dari Akun"
 description="Akhiri sesi pada perangkat ini"
 destructive={true}
 onClick={() => triggerHaptic('medium')}
 />
 </div>
 </AlertDialogTrigger>
 <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-card-premium border-none bg-popover/95 shadow-elevation-4 backdrop-blur-xl">
 <AlertDialogHeader>
 <AlertDialogTitle className="text-display-sm tracking-tight">
 Konfirmasi Logout
 </AlertDialogTitle>
 <AlertDialogDescription className="text-body-md leading-relaxed text-muted-foreground">
 Apakah Anda yakin ingin keluar? Sesi aktif Anda akan segera diakhiri.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-8 flex flex-col gap-3">
 <AlertDialogAction asChild>
 <Button
 onClick={handleSignOut}
 variant="destructive"
 className="h-14 w-full rounded-2xl text-body-lg "
 >
 Ya, Keluar Sekarang
 </Button>
 </AlertDialogAction>
 <AlertDialogCancel asChild>
 <Button
 variant="ghost"
 className="h-12 w-full rounded-xl text-label-md text-muted-foreground"
 >
 Batal
 </Button>
 </AlertDialogCancel>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 <AlertDialog>
 <AlertDialogTrigger asChild>
 <div>
 <Row
 icon={Trash2}
 title="Hapus Semua Data"
 description="Hapus seluruh data dan pengaturan secara permanen"
 destructive={true}
 onClick={() => triggerHaptic('light')}
 hideDivider={true}
 />
 </div>
 </AlertDialogTrigger>
 <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-card-premium border-t-4 border-t-destructive bg-popover/95 shadow-elevation-4 backdrop-blur-xl">
 <AlertDialogHeader>
 <AlertDialogTitle className="text-display-sm tracking-tight text-destructive">
 Hapus Semua Data?
 </AlertDialogTitle>
 <AlertDialogDescription className="text-body-md leading-relaxed text-muted-foreground">
 Tindakan ini tidak dapat dibatalkan. Semua riwayat transaksi, dompet, hutang, dan pengaturan Anda akan dihapus permanen dari server kami.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-8 flex flex-col gap-3">
 <AlertDialogAction asChild>
 <Button
 onClick={handleDeleteAccount}
 disabled={isDeleting}
 variant="destructive"
 className="h-14 w-full rounded-2xl text-body-lg "
 >
 {isDeleting ? 'Menghapus...': 'Ya, Hapus Permanen'}
 </Button>
 </AlertDialogAction>
 <AlertDialogCancel asChild>
 <Button
 variant="ghost"
 className="h-12 w-full rounded-xl text-label-md text-muted-foreground"
 >
 Batal
 </Button>
 </AlertDialogCancel>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </SurfaceSection>
 </section>

 <div className="pb-6 pt-1 text-center">
 <p className="text-label-sm text-muted-foreground/50">
 Lemon Finance OS • v2.0
 </p>
 </div>

 <EditProfileSheet isOpen={isEditSheetOpen} onClose={() => setIsEditSheetOpen(false)} />
 </AppPageBody>
 </AppPageShell>
 );
}

export default function ProfilePage() {
 return (
 <Suspense fallback={<div className="min-h-screen bg-background"/>}>
 <ProfileContent />
 </Suspense>
 );
}
