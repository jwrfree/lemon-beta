'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FinancialPulseSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 text-white p-8 md:p-10 shadow-2xl mx-4 mt-4 border border-zinc-800">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-32 bg-white/10" />
                        <Skeleton className="h-5 w-16 bg-white/10" />
                    </div>
                    <Skeleton className="h-16 md:h-20 w-3/4 bg-white/20" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
                {/* Right Side Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 bg-white/10 rounded-full" />
                                <Skeleton className="h-3 w-16 bg-white/10" />
                            </div>
                            <Skeleton className="h-6 w-24 bg-white/20" />
                            <Skeleton className="h-1 w-full bg-white/10 rounded-full" />
                            <Skeleton className="h-3 w-20 bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Background Chart Placeholder */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/5 to-transparent opacity-20" />
        </div>
    );
}

export function TrendAnalyticsSkeleton() {
    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="relative h-[250px] w-full mt-4">
                {/* Bar skeletons */}
                <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton 
                            key={i} 
                            className={cn(
                                "w-full bg-muted/50",
                                i % 3 === 0 ? "h-3/4" : i % 2 === 0 ? "h-1/2" : "h-2/3"
                            )} 
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
}

export function MetricCardSkeleton() {
    return (
        <Card className="p-5 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-28" />
                </div>
                <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            <Skeleton className="h-3 w-24" />
        </Card>
    );
}

export function CategoryPieSkeleton() {
    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
                <div className="relative h-48 w-48">
                    <Skeleton className="h-48 w-48 rounded-full" />
                    <div className="absolute inset-6 bg-white dark:bg-zinc-900 rounded-full flex flex-col items-center justify-center space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
                <div className="w-full space-y-3 pt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

export function AnalyticsPageSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pb-40">
            {/* Header Skeleton */}
            <div className="pt-safe-top px-6 pb-2 sticky top-0 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl z-30 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex justify-between items-center py-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                </div>
            </div>

            <FinancialPulseSkeleton />

            <div className="px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="p-6 h-full flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <Skeleton className="h-32 w-32 rounded-full mb-4" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </Card>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <MetricCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            <div className="px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TrendAnalyticsSkeleton />
                </div>
                <div className="lg:col-span-1">
                    <Card className="p-6 h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <Skeleton className="h-6 w-32 mb-6" />
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-3 w-8" />
                                    <Skeleton className="h-3 flex-1" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
