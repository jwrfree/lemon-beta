'use client';

import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    CalendarCheck,
    Fingerprint,
    HandCoins,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { AuthModalView } from '@/types/auth';

type Feature = {
    title: string;
    description: string;
    icon: LucideIcon;
};

type TrustPoint = {
    title: string;
    description: string;
    icon: LucideIcon;
};

const features: Feature[] = [
    {
        title: 'Cashflow real-time',
        description: 'Total saldo, pemasukan, dan pengeluaran langsung ter-update setiap kali kamu mencatat transaksi.',
        icon: BarChart3,
    },
    {
        title: 'Pengingat tagihan pintar',
        description: 'Atur pengingat berulang untuk tagihan, cicilan, atau transfer tabungan agar tidak ada yang terlewat.',
        icon: CalendarCheck,
    },
    {
        title: 'Catat cepat bertenaga AI',
        description: 'Gunakan Catat Cepat untuk mengubah chat, nota, atau perintah singkat menjadi transaksi siap simpan.',
        icon: Zap,
    },
    {
        title: 'Pantau hutang & tujuan',
        description: 'Lacak piutang, pembayaran, dan progress tabungan tanpa spreadsheet yang rumit.',
        icon: HandCoins,
    },
];

const trustPoints: TrustPoint[] = [
    {
        title: 'Keamanan bawaan',
        description: 'Akunmu terlindungi oleh Firebase Authentication, enkripsi, dan dukungan login biometrik.',
        icon: ShieldCheck,
    },
    {
        title: 'Sinkron di semua perangkat',
        description: 'Data dompet, transaksi, dan pengingat tersimpan di Firestore sehingga aman saat berpindah perangkat.',
        icon: Sparkles,
    },
    {
        title: 'Fokus pada kenyamanan',
        description: 'Desain mobile-first dengan mode gelap menjaga mata tetap nyaman di setiap situasi pencahayaan.',
        icon: Fingerprint,
    },
];

const LemonIllustration = () => {
    const shouldReduceMotion = useReducedMotion();
    const sharedTransition = shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.24, ease: 'easeOut', delay: 0.12 };

    return (
        <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={sharedTransition}
            className="relative h-48 w-48 md:h-56 md:w-56"
            aria-hidden="true"
        >
            <div className="absolute inset-0 rounded-full bg-yellow-300/50 blur-2xl" />
            <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="relative"
                role="presentation"
            >
                <motion.path
                    initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0.18 }}
                    fill="#FDE047"
                    d="M100,20C140,20 180,60 180,100C180,140 140,180 100,180C60,180 20,140 20,100C20,60 60,20 100,20Z"
                    transform="rotate(-30 100 100)"
                />
                <motion.path
                    initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.36, ease: 'easeOut', delay: 0.32 }}
                    fill="#FBBF24"
                    d="M100,40 C120,40 140,60 140,80 C140,100 120,120 100,120 C80,120 60,100 60,80 C60,60 80,40 100,40Z"
                    opacity="0.2"
                />
                <motion.path
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut', delay: 0.26 }}
                    fill="#84CC16"
                    d="M140,20 C150,30 150,50 140,60 C130,70 110,70 100,60"
                />
            </svg>
        </motion.div>
    );
};

export const LandingPage = ({ setAuthModal }: { setAuthModal: Dispatch<SetStateAction<AuthModalView>>; }) => {
    const shouldReduceMotion = useReducedMotion();
    const currentYear = new Date().getFullYear();
    const baseTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' };
    const withDelay = (delay = 0) => (shouldReduceMotion ? { duration: 0 } : { ...baseTransition, delay });

    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
            <a
                href="#konten-utama"
                className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-primary-foreground focus-visible:shadow-lg"
            >
                Lewati ke konten utama
            </a>

            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-yellow-200/40 via-transparent to-transparent blur-3xl"
                aria-hidden="true"
            />

            <header className="w-full">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 pt-8 sm:px-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200/60">
                            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        Lemon
                    </div>
                    <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground lg:flex" aria-label="Navigasi utama">
                        <a
                            href="#overview"
                            className="rounded-full px-3 py-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Ringkasan
                        </a>
                        <a
                            href="#fitur"
                            className="rounded-full px-3 py-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Fitur
                        </a>
                        <a
                            href="#keamanan"
                            className="rounded-full px-3 py-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Keamanan
                        </a>
                        <a
                            href="#mulai"
                            className="rounded-full px-3 py-2 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Mulai pakai
                        </a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => setAuthModal('login')} className="hidden text-sm font-medium sm:inline-flex">
                            Masuk
                        </Button>
                        <Button onClick={() => setAuthModal('signup')} className="text-sm font-semibold">
                            Coba gratis
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
                <nav className="mt-4 flex gap-2 overflow-x-auto px-4 pb-2 text-sm font-medium text-muted-foreground sm:hidden" aria-label="Navigasi ringkas">
                    <a
                        href="#overview"
                        className="min-w-max rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition-colors hover:text-foreground focus-visible:border-primary focus-visible:text-foreground"
                    >
                        Ringkasan
                    </a>
                    <a
                        href="#fitur"
                        className="min-w-max rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition-colors hover:text-foreground focus-visible:border-primary focus-visible:text-foreground"
                    >
                        Fitur
                    </a>
                    <a
                        href="#keamanan"
                        className="min-w-max rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition-colors hover:text-foreground focus-visible:border-primary focus-visible:text-foreground"
                    >
                        Keamanan
                    </a>
                    <a
                        href="#mulai"
                        className="min-w-max rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition-colors hover:text-foreground focus-visible:border-primary focus-visible:text-foreground"
                    >
                        Mulai pakai
                    </a>
                </nav>
            </header>

            <main id="konten-utama" className="w-full flex-1">
                <section id="overview" aria-labelledby="overview-heading" className="relative w-full px-4 pb-16 pt-10 sm:px-6">
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-[1.05fr_1fr]">
                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={withDelay()}
                            className="space-y-6"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-900">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                                Beta terbuka untuk pekerja digital
                            </span>
                            <h1 id="overview-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Keuanganmu rapi, keputusanmu makin cerdas.
                            </h1>
                            <p className="text-base text-muted-foreground sm:text-lg md:max-w-xl">
                                Lemon menggabungkan pencatatan transaksi, analisis cashflow, pengingat tagihan, dan pemantauan hutang dalam satu aplikasi. Copy, visual, dan motion-nya disetel supaya mudah dibaca, konsisten, dan siap dipakai setiap hari.
                            </p>
                            <ul className="grid gap-2 text-sm text-muted-foreground sm:text-base" aria-label="Keunggulan utama Lemon">
                                <li className="flex items-start gap-2">
                                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                                    <span>Peta alur lengkap dari transaksi cepat sampai pengingat lanjutan, semuanya dalam empat tap.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                                    <span>Standar warna, tipografi, dan radius yang konsisten sehingga informasi mudah discan.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                                    <span>Motion lembut 0.28s dengan dukungan <em>prefers-reduced-motion</em> agar nyaman untuk semua orang.</span>
                                </li>
                            </ul>
                            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                                <Button onClick={() => setAuthModal('signup')} size="lg" className="h-12 gap-2 text-base">
                                    Buat akun gratis
                                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                </Button>
                                <Button variant="outline" size="lg" className="h-12 text-base" onClick={() => setAuthModal('login')}>
                                    Lihat dashboard
                                </Button>
                            </div>
                            <div className="grid gap-4 rounded-2xl border border-yellow-200/50 bg-yellow-50/70 p-6 text-left text-sm text-yellow-900 shadow-sm sm:grid-cols-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-yellow-900">Deteksi kebiasaan belanja</h2>
                                    <p className="mt-1 text-sm text-yellow-900/80">Pantau pemasukan dan pengeluaran terbaru dalam hitungan detik.</p>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-yellow-900">Pengingat jatuh tempo</h2>
                                    <p className="mt-1 text-sm text-yellow-900/80">Notifikasi cerdas untuk tagihan, cicilan, dan pembayaran hutang.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={withDelay(0.12)}
                            className="relative flex items-center justify-center"
                        >
                            <div className="relative flex h-fit w-full max-w-sm flex-col items-center gap-6 rounded-[2rem] border border-white/30 bg-card px-8 py-10 text-center shadow-2xl">
                                <LemonIllustration />
                                <div className="w-full rounded-2xl border border-primary/20 bg-primary/10 p-4 text-left">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contoh insight</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        &ldquo;Pengeluaran langgananmu naik 18% bulan ini. Pertimbangkan untuk memindahkan Netflix ke dompet bersama.&rdquo;
                                    </p>
                                </div>
                                <div className="grid w-full gap-2 rounded-2xl border border-white/30 bg-background/80 p-4 text-left text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between text-foreground">
                                        <span className="font-semibold">Total saldo</span>
                                        <span className="font-semibold">Rp12.450.000</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Pemasukan bulan ini</span>
                                        <span className="text-emerald-600">+Rp6.800.000</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Pengeluaran bulan ini</span>
                                        <span className="text-rose-600">-Rp4.200.000</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section id="fitur" aria-labelledby="fitur-heading" className="relative w-full border-y border-white/20 bg-muted/60">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
                        <div className="space-y-2 text-left sm:text-center">
                            <h2 id="fitur-heading" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Kenapa Lemon bikin keuanganmu hemat waktu?
                            </h2>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                Semua modul saling terhubung sehingga kamu tidak perlu berpindah aplikasi atau spreadsheet.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={withDelay(index * 0.08)}
                                    className="flex h-full flex-col gap-3 rounded-2xl border border-white/40 bg-card p-6 shadow-sm"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="keamanan" aria-labelledby="keamanan-heading" className="w-full px-4 py-16 sm:px-6">
                    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1fr_1fr]">
                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={withDelay()}
                            className="space-y-4"
                        >
                            <h2 id="keamanan-heading" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Tenang, Lemon dirancang aman & adaptif.
                            </h2>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                Kami mengutamakan keamanan akun dan kenyamanan membaca agar kamu bisa fokus pada keputusan finansial yang penting.
                            </p>
                        </motion.div>
                        <motion.ul
                            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={withDelay(0.08)}
                            className="space-y-4"
                        >
                            {trustPoints.map(point => (
                                <li key={point.title} className="flex items-start gap-3 rounded-2xl border border-white/40 bg-card p-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <point.icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-semibold text-foreground">{point.title}</p>
                                        <p className="text-sm text-muted-foreground">{point.description}</p>
                                    </div>
                                </li>
                            ))}
                        </motion.ul>
                    </div>
                </section>

                <section id="mulai" aria-labelledby="mulai-heading" className="w-full px-4 pb-16 sm:px-6">
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={withDelay(0.12)}
                        className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border border-yellow-200/50 bg-yellow-50/80 p-10 text-center shadow-sm"
                    >
                        <h2 id="mulai-heading" className="text-2xl font-semibold text-yellow-900 sm:text-3xl">
                            Siap bikin keputusan finansial yang lebih tenang?
                        </h2>
                        <p className="text-sm text-yellow-900/80 sm:text-base">
                            Mulai gratis sekarang. Kamu bisa selalu menutup akun kapan saja.
                        </p>
                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                            <Button onClick={() => setAuthModal('signup')} size="lg" className="h-12 gap-2 text-base">
                                Daftar gratis
                                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                            </Button>
                            <div className="text-sm text-yellow-900/80">
                                Sudah punya akun?
                                {' '}
                                <Button variant="link" onClick={() => setAuthModal('login')} className="h-auto p-0 text-sm">
                                    Masuk di sini
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <footer className="border-t border-white/20 bg-muted/60">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-6 py-6 text-center text-xs text-muted-foreground sm:text-sm">
                    <p>© {currentYear} Lemon. Dibuat dengan fokus pada pekerja digital Indonesia.</p>
                    <p className="max-w-2xl">Masukan dan saran selalu kami sambut untuk membuat pengalaman finansial yang lebih segar.</p>
                </div>
            </footer>
        </div>
    );
};
