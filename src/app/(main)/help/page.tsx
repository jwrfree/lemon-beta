'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    MagnifyingGlass, 
    BookOpen, 
    ShieldCheck, 
    Wallet, 
    ArrowsLeftRight, 
    CaretRight,
    Question
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { cn, triggerHaptic } from '@/lib/utils';

const FAQS = [
    {
        category: 'Umum',
        icon: Question,
        questions: [
            { q: 'Apa itu Lemon Finance?', a: 'Lemon adalah sistem operasi keuangan pribadi yang membantu Anda mencatat, memantau, dan merencanakan keuangan dengan bantuan AI.' },
            { q: 'Apakah data saya aman?', a: 'Sangat aman. Kami menggunakan enkripsi standar industri dan tidak pernah membagikan data Anda ke pihak ketiga.' }
        ]
    },
    {
        category: 'Transaksi & Dompet',
        icon: Wallet,
        questions: [
            { q: 'Bagaimana cara menambah dompet?', a: 'Buka menu Dompet, lalu klik tombol "Tambah Dompet" di pojok kanan atas atau gunakan tombol tambah universal (+).' },
            { q: 'Bagaimana cara mencatat transfer?', a: 'Gunakan tombol (+), pilih "Transfer", lalu pilih dompet asal dan tujuan.' }
        ]
    }
];

export default function HelpPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    return (
        <AppPageShell>
            <AppPageHeaderChrome>
                <div className="flex h-16 items-center gap-3 px-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft weight="regular" />
                    </Button>
                    <h1 className="text-title-lg font-semibold">Pusat Bantuan</h1>
                </div>
            </AppPageHeaderChrome>

            <AppPageBody className="space-y-8 pb-10">
                <div className="relative px-1">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                    <Input 
                        placeholder="Cari bantuan..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-border/15 bg-card"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-border/10 bg-accent/5 transition-all active:scale-95 cursor-pointer">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <BookOpen weight="fill" />
                            </div>
                            <span className="text-label-md font-medium">Panduan</span>
                        </CardContent>
                    </Card>
                    <Card className="border-border/10 bg-primary/5 transition-all active:scale-95 cursor-pointer">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck weight="fill" />
                            </div>
                            <span className="text-label-md font-medium">Keamanan</span>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {FAQS.map((section) => (
                        <div key={section.category} className="space-y-3">
                            <h2 className="text-label-lg font-semibold text-muted-foreground/70 px-1 uppercase tracking-wider">
                                {section.category}
                            </h2>
                            <div className="overflow-hidden rounded-3xl border border-border/15 bg-card">
                                {section.questions.map((faq, idx) => (
                                    <button
                                        key={faq.q}
                                        onClick={() => triggerHaptic('light')}
                                        className={cn(
                                            "flex w-full flex-col gap-1 p-5 text-left transition-colors hover:bg-muted/30",
                                            idx !== section.questions.length - 1 && "border-b border-border/10"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-title-md font-medium leading-tight">{faq.q}</span>
                                            <CaretRight size={16} className="text-muted-foreground/40 shrink-0" />
                                        </div>
                                        <p className="text-body-sm text-muted-foreground line-clamp-2 mt-1">
                                            {faq.a}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl bg-muted/30 p-6 text-center border border-dashed border-border/20">
                    <p className="text-body-md text-muted-foreground mb-4">
                        Masih butuh bantuan lebih lanjut?
                    </p>
                    <Button variant="outline" onClick={() => router.push('/feedback')} className="rounded-full px-8">
                        Hubungi Dukungan
                    </Button>
                </div>
            </AppPageBody>
        </AppPageShell>
    );
}
