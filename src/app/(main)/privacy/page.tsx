'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    ShieldCheck, 
    Lock, 
    Eye, 
    FileText,
    Key,
    UserCheck,
    CloudArrowUp
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
    const router = useRouter();

    const sections = [
        {
            icon: Lock,
            title: 'Keamanan Data',
            content: 'Kami menggunakan enkripsi end-to-end untuk memastikan data keuangan Anda hanya dapat diakses oleh Anda sendiri. Tim kami tidak dapat melihat detail transaksi spesifik Anda tanpa izin eksplisit.'
        },
        {
            icon: Eye,
            title: 'Transparansi AI',
            content: 'Fitur AI kami memproses data Anda untuk memberikan wawasan keuangan. Data ini digunakan secara anonim untuk melatih model lokal kami tanpa membagikan identitas Anda ke penyedia model pihak ketiga.'
        },
        {
            icon: CloudArrowUp,
            title: 'Penyimpanan Awan',
            content: 'Semua data disinkronkan dengan aman ke Supabase. Anda memiliki kendali penuh untuk menghapus seluruh data kapan saja melalui menu Profil > Hapus Semua Data.'
        }
    ];

    return (
        <AppPageShell>
            <AppPageHeaderChrome>
                <div className="flex h-16 items-center gap-3 px-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft weight="regular" />
                    </Button>
                    <h1 className="text-title-lg font-semibold">Kebijakan Privasi</h1>
                </div>
            </AppPageHeaderChrome>

            <AppPageBody className="space-y-8 pb-12">
                <section className="text-center py-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <ShieldCheck size={32} weight="fill" />
                    </div>
                    <h2 className="text-display-sm tracking-tight mb-2">Privasi Anda, Prioritas Kami</h2>
                    <p className="text-body-md text-muted-foreground px-4">
                        Lemon dirancang dengan prinsip privasi sejak awal. Berikut adalah cara kami menjaga data Anda tetap aman.
                    </p>
                </section>

                <div className="space-y-4">
                    {sections.map((item) => (
                        <Card key={item.title} className="border-border/15 bg-card">
                            <CardContent className="p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                        <item.icon size={18} weight="regular" />
                                    </div>
                                    <h3 className="text-title-md font-semibold">{item.title}</h3>
                                </div>
                                <p className="text-body-md text-muted-foreground leading-relaxed">
                                    {item.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4 px-1">
                    <h3 className="text-label-lg font-semibold text-muted-foreground uppercase tracking-wider">Detail Tambahan</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <UserCheck className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="text-body-md font-medium mb-1">Kontrol Pengguna</h4>
                                <p className="text-body-sm text-muted-foreground">Anda dapat mengedit, mengekspor, atau menghapus data Anda secara permanen kapan saja.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Key className="h-5 w-5 text-primary shrink-0" />
                            <div>
                                <h4 className="text-body-md font-medium mb-1">Akses Pihak Ketiga</h4>
                                <p className="text-body-sm text-muted-foreground">Kami tidak pernah menjual data Anda atau membagikannya dengan pengiklan pihak ketiga manapun.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 text-center">
                    <p className="text-label-sm text-muted-foreground/50 italic">
                        Terakhir diperbarui: 4 April 2026
                    </p>
                </div>
            </AppPageBody>
        </AppPageShell>
    );
}
