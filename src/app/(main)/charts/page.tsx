'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { GlobalFinanceHeader } from "@/features/charts/components/global-finance-header";
import { useSearchParams } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { parseISO, isAfter, isBefore, startOfDay, endOfDay, format } from 'date-fns';
import * as dateFns from 'date-fns';
import { SubscriptionAuditCard } from "@/features/insights/components/subscription-audit-card";

// Extracted Components (Lazy Loaded)
const MonthlySummary = dynamic(() => import('@/features/charts/components/monthly-summary').then(mod => mod.MonthlySummary), {
    ssr: false,
    loading: () => <div className="h-40 w-full animate-pulse rounded-3xl bg-muted" />
});
const CategoryAnalysis = dynamic(() => import('@/features/charts/components/category-analysis').then(mod => mod.CategoryAnalysis), {
    ssr: false,
    loading: () => <div className="h-96 w-full animate-pulse rounded-3xl bg-muted" />
});
const MonthlyTrendChart = dynamic(() => import('@/features/charts/components/monthly-trend-chart').then(mod => mod.MonthlyTrendChart), {
    ssr: false,
    loading: () => <div className="h-80 w-full animate-pulse rounded-3xl bg-muted" />
});
const ExpenseShortTermTrend = dynamic(() => import('@/features/charts/components/expense-short-term-trend').then(mod => mod.ExpenseShortTermTrend), {
    ssr: false,
    loading: () => <div className="h-96 w-full animate-pulse rounded-3xl bg-muted" />
});

type TabValue = 'expense' | 'income';

const tabs: { value: TabValue; label: string }[] = [
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'income', label: 'Pemasukan' },
];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        position: 'absolute',
    }),
    center: {
        x: 0,
        opacity: 1,
        position: 'relative',
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        position: 'absolute',
    }),
} as const;

export default function ChartsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-full pb-24">
                <div className="flex h-full w-full items-center justify-center p-8">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        }>
            <ChartsPageContent />
        </Suspense>
    );
}

function ChartsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { transactions, isLoading: isDataLoading } = useData();
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    // Get date range from URL
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Filter transactions based on date range
    const filteredTransactions = useMemo(() => {
        // Use defaults if not in URL to match DateRangeFilter UI
        const startDateStr = from || dateFns.format(dateFns.startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDateStr = to || dateFns.format(dateFns.endOfMonth(new Date()), 'yyyy-MM-dd');
        
        const startDate = startOfDay(parseISO(startDateStr));
        const endDate = endOfDay(parseISO(endDateStr));
        
        return transactions.filter(t => {
            const date = parseISO(t.date);
            return (date >= startDate && date <= endDate);
        });
    }, [transactions, from, to]);

    const headerLabel = useMemo(() => {
        const startDateStr = from || dateFns.format(dateFns.startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDateStr = to || dateFns.format(dateFns.endOfMonth(new Date()), 'yyyy-MM-dd');
        return `${format(parseISO(startDateStr), 'd MMM yyyy')} - ${format(parseISO(endDateStr), 'd MMM yyyy')}`;
    }, [from, to]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleTabChange = (value: string) => {
        const newIndex = tabs.findIndex((tab) => tab.value === value);
        const oldIndex = tabs.findIndex((tab) => tab.value === activeTab);
        setDirection(newIndex > oldIndex ? 1 : -1);
        setActiveTab(value as TabValue);
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);
            if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1].value);
            }
        },
        onSwipedRight: () => {
            const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);
            if (currentIndex > 0) {
                handleTabChange(tabs[currentIndex - 1].value);
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <div className="flex flex-col h-full pb-24">
            <GlobalFinanceHeader 
                transactions={from && to ? filteredTransactions : undefined} 
                label={headerLabel}
            />

            <main className="flex-1 overflow-x-hidden relative" {...handlers}>
                <div className="sticky top-0 z-30 bg-background border-b">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 p-1 bg-muted rounded-2xl">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="h-full rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {!isClient || isDataLoading ? (
                    <div className="flex h-full w-full items-center justify-center p-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto w-full">
                        {/* DESKTOP BENTO GRID */}
                        <div className="hidden md:grid grid-cols-12 gap-6 p-8">
                            <div className="col-span-12 lg:col-span-5 space-y-6">
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Ringkasan</h2>
                                <MonthlySummary type={activeTab} transactions={filteredTransactions} />
                                
                                {activeTab === 'expense' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Audit Langganan</h2>
                                        <SubscriptionAuditCard transactions={filteredTransactions} />
                                    </div>
                                )}
                            </div>

                            <div className="col-span-12 lg:col-span-7 space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-6">
                                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Analisis Kategori</h2>
                                        <CategoryAnalysis type={activeTab} transactions={filteredTransactions} />
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Tren Bulanan</h2>
                                        <MonthlyTrendChart type={activeTab} transactions={filteredTransactions} />
                                    </div>
                                    {activeTab === 'expense' && (
                                        <div className="space-y-6">
                                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Tren Harian</h2>
                                            <ExpenseShortTermTrend transactions={filteredTransactions} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MOBILE SLIDE VIEW */}
                        <div className="md:hidden relative overflow-hidden">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={activeTab}
                                    custom={direction}
                                    variants={slideVariants as unknown as Variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className="w-full space-y-6 p-4"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                            Ringkasan {from && to ? 'periode ini' : 'bulan ini'}
                                        </h2>
                                        <MonthlySummary type={activeTab} transactions={filteredTransactions} />
                                    </div>

                                    {activeTab === 'expense' && (
                                        <div className="space-y-3">
                                            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                Audit Langganan
                                            </h2>
                                            <SubscriptionAuditCard transactions={filteredTransactions} />
                                        </div>
                                    )}

                                    {activeTab === 'expense' ? (
                                        <div className="space-y-3">
                                            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                Tren pengeluaran harian
                                            </h2>
                                            <ExpenseShortTermTrend transactions={filteredTransactions} />
                                        </div>
                                    ) : null}

                                    <div className="space-y-3">
                                        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                            Tren bulanan
                                        </h2>
                                        <MonthlyTrendChart type={activeTab} transactions={filteredTransactions} />
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                            Distribusi kategori
                                        </h2>
                                        <CategoryAnalysis type={activeTab} transactions={filteredTransactions} />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}