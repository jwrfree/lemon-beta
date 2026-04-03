import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const HomeSkeleton = () => (
    <div className="bg-teal-950 min-h-screen p-4 space-y-6">
        <header className="px-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded bg-white/10" />
                    <Skeleton className="h-5 w-24 rounded bg-white/10" />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
            </div>
        </header>
        
        <Skeleton className="h-64 rounded-card-premium bg-white/10 mx-1" />
        
        <div className="grid grid-cols-4 gap-4 px-1">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-16 w-16 rounded-full bg-white/10" />
                    <Skeleton className="h-3 w-12 rounded bg-white/10" />
                </div>
            ))}
        </div>

        <div className="space-y-4 px-1">
            <Skeleton className="h-4 w-32 rounded bg-white/10" />
            <div className="flex gap-4 overflow-hidden">
                <Skeleton className="h-32 w-44 rounded-card-premium shrink-0 bg-white/10" />
                <Skeleton className="h-32 w-44 rounded-card-premium shrink-0 bg-white/10" />
            </div>
        </div>
    </div>
);
