'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Wallet } from 'lucide-react';

const features = [
    {
        title: 'Satu pusat kendali keuangan',
        description: 'Satukan semua dompet dan rekening untuk mendapatkan ringkasan real-time setiap hari.',
        icon: Wallet,
    },
    {
        title: 'Anggaran pintar nan adaptif',
        description: 'Tetapkan batas pengeluaran dan pantau rekomendasi otomatis agar rencana tetap on track.',
        icon: BarChart3,
    },
    {
        title: 'Privasi dan keamanan terjamin',
        description: 'Data personal terenkripsi dan hanya kamu yang memegang kendali penuh.',
        icon: ShieldCheck,
    },
];

export const LandingPage = ({ setAuthModal }: { setAuthModal: (modal: string | null) => void; }) => {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <main className="flex-1 w-full">
                <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-6 py-16 text-center lg:flex-row lg:items-start lg:justify-between lg:py-24 lg:text-left">
                    <motion.section
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="flex max-w-xl flex-col items-center gap-6 lg:items-start"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
                            <Sparkles className="h-4 w-4" />
                            Lebih fokus capai tujuan finansialmu
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            Kelola keuanganmu dengan lembut namun tegas.
                        </h1>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            Lemon membantu kamu mengenali pola pemasukan dan pengeluaran, menyusun anggaran yang realistis, serta mengambil keputusan finansial dengan percaya diri.
                        </p>
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                            <Button onClick={() => setAuthModal('signup')} className="h-12 px-6 text-base shadow-md">
                                Daftar gratis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button variant="outline" onClick={() => setAuthModal('login')} className="h-12 px-6 text-base">
                                Sudah punya akun?
                            </Button>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                        className="relative w-full max-w-xl rounded-3xl border border-primary/20 bg-background/80 p-6 shadow-xl backdrop-blur"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-primary">Kenapa Lemon berbeda?</p>
                                <p className="text-base text-muted-foreground">Didesain khusus untuk kebutuhan finansial generasi produktif.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {features.map(({ title, description, icon: Icon }) => (
                                <motion.div
                                    key={title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="group flex flex-col gap-2 rounded-2xl border border-transparent bg-muted/20 p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-background"
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span>{title}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </main>

            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.3 }}
                className="relative border-t border-primary/10 bg-background/80 px-6 py-6 pb-[env(safe-area-inset-bottom)] backdrop-blur"
            >
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Mulai sekarang</p>
                        <p className="text-sm text-muted-foreground sm:text-base">Butuh waktu kurang dari satu menit untuk membuat akun dan mulai memantau cashflow.</p>
                    </div>
                    <Button onClick={() => setAuthModal('signup')} className="h-11 w-full px-6 sm:w-auto">
                        Coba Lemon sekarang
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
