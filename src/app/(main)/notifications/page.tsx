
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MailCheck } from 'lucide-react';

const AllCaughtUpIllustration = () => (
    <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
        <div className="relative w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
            <MailCheck className="h-16 w-16 text-primary" strokeWidth={1} />
        </div>
    </div>
);


export default function NotificationsPage() {
    const router = useRouter();
    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                     <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Notifikasi</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="flex flex-col items-center">
                    <AllCaughtUpIllustration />
                    <h2 className="text-2xl font-bold mt-6">Semua Sudah Beres!</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Tidak ada notifikasi baru untukmu saat ini. Kami akan memberitahumu jika ada pembaruan penting.
                    </p>
                </div>
            </main>
        </div>
    );
};
