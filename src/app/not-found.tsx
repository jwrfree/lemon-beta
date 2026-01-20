
'use client';

import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <SearchX aria-hidden className="h-10 w-10" strokeWidth={1.5} />
            </span>
            <div className="max-w-xl space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">404 - Halaman Tidak Ditemukan</h1>
                <p className="text-base text-muted-foreground">
                    Oops! Halaman yang kamu cari tidak ada. Mungkin URL-nya salah atau halaman tersebut telah dipindahkan.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => router.push('/home')}>
                    Kembali ke Beranda
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                    Kembali ke Halaman Sebelumnya
                </Button>
            </div>
        </main>
    );
}
