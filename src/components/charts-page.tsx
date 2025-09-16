
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, TrendingUp } from 'lucide-react';

export const ChartsPage = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Analisis Keuangan</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                 <div className="flex flex-col h-full items-center justify-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <TrendingUp className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold">Segera Hadir</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Fitur analisis keuangan sedang dalam pengembangan.</p>
                </div>
            </main>
        </div>
    );
};
