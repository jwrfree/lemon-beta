
'use client';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HomePageContent = dynamic(() => import('@/components/home-page-content').then(mod => mod.HomePageContent), { 
    ssr: false,
    loading: () => (
        <div className="flex flex-col h-full">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <h1 className="text-2xl font-bold text-primary">Lemon</h1>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <main className="flex-1 p-4 space-y-6">
                <Skeleton className="h-36 w-full rounded-lg" />
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 rounded-lg" />
                        <Skeleton className="h-24 rounded-lg" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
});

export default function HomePage() {
    return <HomePageContent />;
}
