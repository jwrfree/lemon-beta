'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, ArrowUpRight, ShieldCheck, Sparkles, WalletCards } from '@/lib/icons';
import { LoginPage } from '@/features/auth/components/login-page';
import { SignUpPage } from '@/features/auth/components/signup-page';
import { ForgotPasswordPage } from '@/features/auth/components/forgot-password-page';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import type { AuthModalView } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type RootAuthView = Exclude<AuthModalView, null>;

const FEATURE_STRIP = [
 {
 title: 'Smart Add yang cepat',
 description: 'Tulis natural, scan struk, atau pakai suara untuk mencatat transaksi tanpa alur yang ribet.',
 icon: Sparkles,
 },
 {
 title: 'Lemon Coach yang relevan',
 description: 'Tanya saldo, cashflow, dan pola pengeluaran dengan jawaban yang grounded ke data keuanganmu.',
 icon: ShieldCheck,
 },
 {
 title: 'Dashboard yang langsung kebaca',
 description: 'Fokus ke saldo, budget, dan pergerakan uang tanpa panel yang saling berebut perhatian.',
 icon: WalletCards,
 },
];

const AUTH_COPY: Record<RootAuthView, { eyebrow: string; title: string; description: string }> = {
 login: {
 eyebrow: 'Masuk ke workspace',
 title: 'Akses semua catatan, insight, dan Lemon Coach dalam satu tempat.',
 description: 'Masuk untuk lanjut memantau saldo, budget, dan ritme cashflow harianmu.',
 },
 signup: {
 eyebrow: 'Mulai gratis',
 title: 'Bangun sistem keuangan pribadi yang lebih tenang sejak hari pertama.',
 description: 'Buat akun Lemon lalu mulai catat, review, dan rapikan alur uangmu dengan lebih cepat.',
 },
 'forgot-password': {
 eyebrow: 'Pulihkan akses',
 title: 'Kembali ke akunmu tanpa kehilangan ritme pencatatan.',
 description: 'Kami bantu kirim tautan reset supaya kamu bisa lanjut lagi tanpa drama.',
 },
};

export default function WelcomePage() {
 const [authView, setAuthView] = useState<RootAuthView>('login');
 const { user, isLoading } = useAuth();
 const router = useRouter();

 const handleSetAuthView: React.Dispatch<React.SetStateAction<AuthModalView>> = (nextValue) => {
 if (typeof nextValue === 'function') {
 setAuthView((current) => {
 const resolved = nextValue(current);
 return resolved ?? 'login';
 });
 return;
 }

 setAuthView(nextValue ?? 'login');
 };

 useEffect(() => {
 if (!isLoading && user) {
 router.replace('/home');
 }
 }, [user, isLoading, router]);

 const authMeta = useMemo(() => AUTH_COPY[authView], [authView]);

 if (isLoading || user) {
 return (
 <div className="flex min-h-dvh items-center justify-center bg-background p-4">
 <LoaderCircle className="h-8 w-8 animate-spin text-primary"/>
 </div>
 );
 }

 return (
 <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsla(var(--volt-500)/0.08),transparent_25%),radial-gradient(circle_at_82%_18%,hsla(var(--volt-500)/0.05),transparent_20%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.3)_100%)] text-foreground">
 <div className="pointer-events-none fixed inset-0">
 <div className="absolute left-[-6rem] top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50"/>
 <div className="absolute bottom-[-4rem] right-[-2rem] h-72 w-72 rounded-full bg-primary/5 blur-3xl opacity-30"/>
 <motion.div
 aria-hidden
 className="absolute right-[12%] top-[14%] h-24 w-24 rounded-full border border-white/40 bg-white/25 backdrop-blur-xl"
 animate={{ y: [0, -10, 0] }}
 transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut'}}
 />
 </div>

 <div className="relative mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5 sm:gap-3">
 <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevation-3">
 <span className="text-body-lg sm:text-title-lg ">L</span>
 </div>
 <div>
 <p className="text-body-md sm:text-body-lg tracking-tight">Lemon</p>
 <p className="hidden xs:block text-label-sm sm:text-label-md text-muted-foreground">Personal finance tracker yang lebih tenang dipakai.</p>
 </div>
 </div>

 <Button
 variant="ghost"
 className="hidden rounded-full border border-border/20 bg-white/60 px-4 text-body-md text-muted-foreground shadow-sm backdrop-blur md:inline-flex"
 onClick={() => setAuthView(authView === 'signup'? 'login': 'signup')}
 >
 {authView === 'signup'? 'Sudah punya akun?': 'Belum punya akun?'}
 </Button>
 </div>

 <div className="grid flex-1 items-center gap-8 py-6 sm:gap-10 sm:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-12">
 <motion.section
 initial={{ opacity: 0, y: 18 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.45, ease: 'easeOut'}}
 className="flex flex-col justify-center"
 >
 <div className="max-w-[620px] space-y-6 sm:space-y-7">
 <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-3 py-1.5 text-label-sm sm:text-label text-primary shadow-sm backdrop-blur">
 <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5"/>
 Lemon Beta
 </div>

 <div className="space-y-3 sm:space-y-4">
 <h1 className="text-display-lg leading-tight tracking-tight text-foreground xs:text-display-lg sm:text-display-lg lg:text-6xl lg:leading-none lg:max-w-[12ch]">
 Keuangan pribadi yang terasa ringan, bukan ribet.
 </h1>
 <p className="max-w-[52ch] text-body-md leading-7 text-muted-foreground sm:text-body-lg">
 Catat transaksi lebih cepat, pantau cashflow tanpa noise, dan gunakan Lemon Coach untuk memahami angka yang paling penting hari ini.
 </p>
 </div>

 <div className="grid grid-cols-2 gap-3 border-y border-border/20 py-5 sm:grid-cols-3 sm:gap-4">
 <div className="space-y-0.5">
 <p className="text-label-sm sm:text-label text-muted-foreground/60">Fokus utama</p>
 <p className="text-label-md sm:text-body-md font-medium text-foreground">Saldo, budget, cashflow</p>
 </div>
 <div className="space-y-0.5">
 <p className="text-label-sm sm:text-label text-muted-foreground/60">Input cepat</p>
 <p className="text-label-md sm:text-body-md font-medium text-foreground">Ketik, suara, scan</p>
 </div>
 <div className="col-span-2 sm:col-span-1 space-y-0.5">
 <p className="text-label-sm sm:text-label text-muted-foreground/60">AI context</p>
 <p className="text-label-md sm:text-body-md font-medium text-foreground">Jawaban berbasis data pribadi</p>
 </div>
 </div>

 <div className="space-y-4">
 {FEATURE_STRIP.map((feature, index) => {
 const Icon = feature.icon;

 return (
 <motion.div
 key={feature.title}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.08 * index, duration: 0.35, ease: 'easeOut'}}
 className="grid grid-cols-[auto_1fr] gap-3 border-b border-slate-200/70 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:items-start"
 >
 <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-muted/30 text-primary shadow-sm ring-1 ring-border/50">
 <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5"/>
 </div>
 <div className="space-y-1">
 <p className="text-body-md text-foreground">{feature.title}</p>
 <p className="text-label-md sm:text-body-md leading-5 sm:leading-6 text-muted-foreground">{feature.description}</p>
 </div>
 <ArrowUpRight className="mt-1 hidden h-4 w-4 text-muted-foreground/40 sm:block"/>
 </motion.div>
 );
 })}
 </div>
 </div>
 </motion.section>

 <motion.section
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut'}}
 className="relative w-full"
 >
 <div className="absolute inset-4 sm:inset-6 rounded-card-premium bg-white/40 blur-2xl"/>
 <div className="relative overflow-hidden rounded-3xl sm:rounded-card-premium border border-border/15 bg-card/60 p-2 sm:p-3 shadow-elevation-4 backdrop-blur-xl sm:p-4">
 <div className="rounded-2xl sm:rounded-3xl border border-border/15 bg-card/80 p-3 sm:p-4 md:p-5">
 <div className="space-y-4 border-b border-border/15 pb-5">
 <div className="inline-flex w-fit rounded-full border border-border/20 bg-muted/50 px-3 py-1 text-label-sm sm:text-label text-muted-foreground">
 {authMeta.eyebrow}
 </div>
 <div className="space-y-2">
 <h2 className="text-title-lg text-foreground sm:text-display-lg">
 {authMeta.title}
 </h2>
 <p className="text-label-md sm:text-body-md leading-5 sm:leading-6 text-muted-foreground">
 {authMeta.description}
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 {(['login', 'signup', 'forgot-password'] as RootAuthView[]).map((view) => (
 <Button
 key={view}
 type="button"
 variant="ghost"
 className={cn(
 'h-8 sm:h-9 rounded-full px-3 sm:px-4 text-label-md sm:text-body-md',
 authView === view
 ? 'bg-primary text-black hover:bg-primary/95 shadow-sm'
 : 'bg-muted text-muted-foreground hover:bg-muted/80'
 )}
 onClick={() => setAuthView(view)}
 >
 {view === 'login'&& 'Masuk'}
 {view === 'signup'&& 'Daftar'}
 {view === 'forgot-password'&& 'Reset'}
 </Button>
 ))}
 </div>
 </div>

 <div className="pt-4 sm:pt-5">
 <AnimatePresence mode="wait">
 {authView === 'login'&& <LoginPage onClose={() => {}} setAuthModal={handleSetAuthView} isPage />}
 {authView === 'signup'&& (
 <SignUpPage onClose={() => setAuthView('login')} setAuthModal={handleSetAuthView} isPage />
 )}
 {authView === 'forgot-password'&& (
 <ForgotPasswordPage onClose={() => setAuthView('login')} setAuthModal={handleSetAuthView} isPage />
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 </motion.section>
 </div>
 </div>
 </main>
 );
}


