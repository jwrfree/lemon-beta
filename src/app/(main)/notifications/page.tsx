
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const AllCaughtUpIllustration = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-24 w-24 text-primary/20"
    >
        <path
            d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 14.5 3 16.5 3 16.5H21C21 16.5 18 14.5 18 8Z"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22.0001C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15 4L18 7L21 4"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);


export default function NotificationsPage() {
    const router = useRouter();
    return (
        <div className="flex flex-col">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Notifikasi</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="flex flex-col h-full items-center justify-center text-center">
                    <AllCaughtUpIllustration />
                    <h2 className="text-xl font-bold mt-4">Semua sudah beres!</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Tidak ada notifikasi baru untukmu saat ini.</p>
                </div>
            </main>
        </div>
    );
};
