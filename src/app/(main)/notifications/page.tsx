
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

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
        <div className="h-full">
            <PageHeader title="Notifikasi" />
            <main className="flex justify-center p-8 text-center pt-16">
                <div className="flex flex-col items-center">
                    <AllCaughtUpIllustration />
                    <h2 className="text-2xl font-medium mt-6">Semua Sudah Beres!</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Tidak ada notifikasi baru untukmu saat ini. Kami akan memberitahumu jika ada pembaruan penting.
                    </p>
                </div>
            </main>
        </div>
    );
};

