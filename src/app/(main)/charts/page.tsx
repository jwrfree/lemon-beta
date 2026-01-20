'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extracted Components
import { MonthlySummary } from '@/features/charts/components/monthly-summary';
import { NetCashflowChart } from '@/features/charts/components/net-cashflow-chart';
import { CategoryAnalysis } from '@/features/charts/components/category-analysis';
import { MonthlyTrendChart } from '@/features/charts/components/monthly-trend-chart';
import { ExpenseShortTermTrend } from '@/features/charts/components/expense-short-term-trend';

type TabValue = 'expense' | 'income' | 'net';

const tabs: { value: TabValue; label: string }[] = [
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'net', label: 'Arus Kas' },
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
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

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
        <div className="flex flex-col h-full bg-muted/30">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-center border-b bg-background/95 px-4 shadow-sm backdrop-blur">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Statistik & Insight</h1>
            </header>

            <main className="flex-1 overflow-y-auto" {...handlers}>
                <div className="sticky top-0 z-20 border-b bg-background/95 p-4 md:py-2 backdrop-blur">
                    <div className="max-w-6xl mx-auto w-full">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 rounded-full bg-muted/80 p-1">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="rounded-full text-sm font-semibold capitalize data-[state=active]:shadow-sm"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {!isClient ? (
                    <div className="flex h-full w-full items-center justify-center p-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto w-full">
                        {/* DESKTOP BENTO GRID */}
                        <div className="hidden md:grid grid-cols-12 gap-6 p-8">
                            <div className="col-span-12 lg:col-span-5 space-y-6">
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Ringkasan</h2>
                                <MonthlySummary type={activeTab} />
                            </div>

                            <div className="col-span-12 lg:col-span-7 space-y-6">
                                {activeTab === 'net' ? (
                                    <div className="space-y-6">
                                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Arus Kas 12 Bulan</h2>
                                        <NetCashflowChart />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-6">
                                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Analisis Kategori</h2>
                                            <CategoryAnalysis type={activeTab} />
                                        </div>
                                        <div className="space-y-6">
                                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Tren Bulanan</h2>
                                            <MonthlyTrendChart type={activeTab} />
                                        </div>
                                        {activeTab === 'expense' && (
                                            <div className="space-y-6">
                                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">Tren Harian</h2>
                                                <ExpenseShortTermTrend />
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                            Ringkasan bulan ini
                                        </h2>
                                        <MonthlySummary type={activeTab} />
                                    </div>

                                    {activeTab === 'net' ? (
                                        <div className="space-y-3">
                                            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                Arus kas 12 bulan
                                            </h2>
                                            <NetCashflowChart />
                                        </div>
                                    ) : (
                                        <>
                                            {activeTab === 'expense' ? (
                                                <div className="space-y-3">
                                                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                        Tren pengeluaran harian
                                                    </h2>
                                                    <ExpenseShortTermTrend />
                                                </div>
                                            ) : null}

                                            <div className="space-y-3">
                                                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                    Tren bulanan
                                                </h2>
                                                <MonthlyTrendChart type={activeTab} />
                                            </div>

                                            <div className="space-y-3">
                                                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                    Distribusi kategori
                                                </h2>
                                                <CategoryAnalysis type={activeTab} />
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}