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
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { parseISO, isAfter, isBefore, startOfDay, endOfDay, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
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
const NetCashflowChart = dynamic(() => import('@/features/charts/components/net-cashflow-chart').then(mod => mod.NetCashflowChart), {
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
    
    // Get date range from URL or defaults
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    const { fetchStartDate, fetchEndDate, viewStartDate, viewEndDate, twelveMonthsAgo, sixtyDaysAgo } = useMemo(() => {
        const now = new Date();
        const vStartStr = from || format(startOfMonth(now), 'yyyy-MM-dd');
        const vEndStr = to || format(endOfMonth(now), 'yyyy-MM-dd');
        
        const vStart = startOfDay(parseISO(vStartStr));
        const vEnd = endOfDay(parseISO(vEndStr));
        
        // Always fetch at least 12 months back for the trend charts, 
        // or further back if the user selected an older range
        const twelveMonthsAgo = startOfMonth(subMonths(now, 11));
        const sixtyDaysAgo = startOfDay(dateFns.subDays(now, 59));

        const fStart = vStart < twelveMonthsAgo ? vStart : twelveMonthsAgo;
        const fEnd = vEnd > now ? vEnd : now;
        
        return {
            fetchStartDate: fStart,
            fetchEndDate: fEnd,
            viewStartDate: vStart,
            viewEndDate: vEnd,
            twelveMonthsAgo,
            sixtyDaysAgo
        };
    }, [from, to]);

    const { transactions, isLoading: isDataLoading } = useRangeTransactions(fetchStartDate, fetchEndDate);
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Filter transactions based on date range for current view
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = parseISO(t.date);
            return (date >= viewStartDate && date <= viewEndDate);
        });
    }, [transactions, viewStartDate, viewEndDate]);

    // Transactions for trend charts (last 12 months)
    const trendTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = parseISO(t.date);
            return date >= twelveMonthsAgo;
        });
    }, [transactions, twelveMonthsAgo]);

    // Transactions for short-term trend (last 60 days)
    const shortTermTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = parseISO(t.date);
            return date >= sixtyDaysAgo;
        });
    }, [transactions, sixtyDaysAgo]);

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
                                        <MonthlySummary type="expense" transactions={filteredTransactions} isLoading={isDataLoading} />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <CategoryAnalysis type="expense" transactions={filteredTransactions} isLoading={isDataLoading} />
                                            <ExpenseShortTermTrend transactions={shortTermTransactions} isLoading={isDataLoading} />
                                        </div>
                                        <MonthlyTrendChart type="expense" transactions={trendTransactions} isLoading={isDataLoading} />
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                            <NetCashflowChart transactions={trendTransactions} isLoading={isDataLoading} />
                                        </div>
                                        <SubscriptionAuditCard transactions={filteredTransactions} />
                                    </>
                                ) : (
                                    <>
                                        <MonthlySummary type="income" transactions={filteredTransactions} isLoading={isDataLoading} />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <CategoryAnalysis type="income" transactions={filteredTransactions} isLoading={isDataLoading} />
                                            <MonthlyTrendChart type="income" transactions={trendTransactions} isLoading={isDataLoading} />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                            <NetCashflowChart transactions={trendTransactions} isLoading={isDataLoading} />
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