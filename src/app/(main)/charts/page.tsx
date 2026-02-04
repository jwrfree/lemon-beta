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
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
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
    const { transactions, isLoading: isDataLoading } = useTransactions();
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setIsClient(true);
    }, []);

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

    const handleTabChange = (value: TabValue) => {
        const currentIndex = tabs.findIndex(t => t.value === activeTab);
        const newIndex = tabs.findIndex(t => t.value === value);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(value);
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = tabs.findIndex(t => t.value === activeTab);
            if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1].value);
            }
        },
        onSwipedRight: () => {
            const currentIndex = tabs.findIndex(t => t.value === activeTab);
            if (currentIndex > 0) {
                handleTabChange(tabs[currentIndex - 1].value);
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    if (!isClient) return null;

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-zinc-50/50 dark:bg-zinc-950/50">
            <GlobalFinanceHeader 
                transactions={filteredTransactions} 
                label={from && to ? `${format(parseISO(from), 'd MMM')} - ${format(parseISO(to), 'd MMM yyyy')}` : undefined}
            />
            
            <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabValue)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-6 sm:mb-8 h-11 sm:h-12">
                        {tabs.map((tab) => (
                            <TabsTrigger 
                                key={tab.value} 
                                value={tab.value}
                                className="rounded-lg text-xs sm:text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div {...handlers} className="relative overflow-hidden min-h-[600px]">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={activeTab}
                                custom={direction}
                                variants={slideVariants as unknown as Variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="w-full space-y-4 sm:space-y-6"
                            >
                                {activeTab === 'expense' ? (
                                    <>
                                        <MonthlySummary type="expense" transactions={filteredTransactions} />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <CategoryAnalysis type="expense" transactions={filteredTransactions} />
                                            <ExpenseShortTermTrend transactions={filteredTransactions} />
                                        </div>
                                        <MonthlyTrendChart type="expense" transactions={filteredTransactions} />
                                        <SubscriptionAuditCard transactions={filteredTransactions} />
                                    </>
                                ) : (
                                    <>
                                        <MonthlySummary type="income" transactions={filteredTransactions} />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <CategoryAnalysis type="income" transactions={filteredTransactions} />
                                            <MonthlyTrendChart type="income" transactions={filteredTransactions} />
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}