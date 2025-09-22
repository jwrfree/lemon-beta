
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Briefcase,
    ChevronLeft,
    LoaderCircle,
    ReceiptText,
    Scale,
    Tags,
    TrendingDown,
} from 'lucide-react';
import {
    isSameMonth,
    parseISO,
    startOfMonth,
    format
} from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryDetails } from '@/lib/categories';
import { cn, formatCurrency } from '@/lib/utils';

type TabValue = 'expense' | 'income' | 'net';

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
    { value: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft },
    { value: 'income', label: 'Pemasukan', icon: ArrowUpRight },
    { value: 'net', label: 'Arus Kas', icon: Scale },
];

const PlaceholderContent = ({
    label,
    icon: Icon,
    text,
}: {
    label: string;
    icon: React.ElementType;
    text?: string;
}) => (
    <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">
                    {text ||
                        `Data untuk analisis ${label.toLowerCase()} akan muncul di sini setelah Anda mencatat transaksi.`}
                </p>
            </div>
        </CardContent>
    </Card>
);


const CategoryAnalysis = ({ type, className }: { type: 'expense' | 'income'; className?: string }) => {
    const { transactions } = useApp();
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/transactions?category=${encodeURIComponent(category)}`);
    };

    const { chartData, chartConfig, total } = useMemo(() => {
        const now = new Date();
        const monthlyTransactions = transactions.filter((t) => t.type === type && isSameMonth(parseISO(t.date), now));

        const total = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

        const categoryMap: { [key: string]: number } = {};
        monthlyTransactions.forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const chartData = Object.entries(categoryMap)
            .map(([name, value]) => {
                const details = categoryDetails(name);
                return {
                    name,
                    value,
                    icon: details.icon,
                    fill: `var(--${details.color.match(/text-([\w-]+)/)?.[1]})`, // Simplified color extraction
                    percentage: total > 0 ? (value / total) * 100 : 0,
                };
            })
            .sort((a, b) => b.value - a.value);

        const chartConfig = Object.fromEntries(
            chartData.map((item) => [
                item.name,
                {
                    label: item.name,
                    color: item.fill,
                    icon: item.icon,
                },
            ])
        ) as ChartConfig;

        return { chartData, chartConfig, total };
    }, [transactions, type]);

    if (chartData.length === 0) {
        return (
            <PlaceholderContent
                label={`Analisis ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? TrendingDown : ArrowUpRight}
                text={`Data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'}-mu bulan ini belum cukup untuk dianalisis.`}
            />
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribusi per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="h-48 w-full">
                     <ChartContainer config={chartConfig} className="h-full w-full">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent formatter={(value, name) => `${name}: ${formatCurrency(Number(value))}`} hideLabel />}
                            />
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="60%" strokeWidth={2}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
                 <div className="space-y-2">
                    {chartData.slice(0, 5).map((item) => (
                        <div
                            key={item.name}
                            className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg p-2 text-sm hover:bg-muted"
                            onClick={() => handleCategoryClick(item.name)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span>{item.name}</span>
                            </div>
                            <div className="font-medium">{formatCurrency(item.value)}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


const MonthlySummary = ({ type }: { type: TabValue }) => {
    const { transactions } = useApp();

    const summary = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);

        const monthlyTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now));
        
        const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const net = income - expense;

        if (type === 'expense') {
            const biggestCat = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
            
            const topCategory = Object.entries(biggestCat).sort((a,b) => b[1] - a[1])[0];
            return {
                title: 'Total Pengeluaran',
                value: expense,
                valueColor: 'text-destructive',
                insightLabel: 'Kategori Terbesar',
                insightValue: topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : '-',
            }
        }
        if (type === 'income') {
             const biggestCat = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
            const topCategory = Object.entries(biggestCat).sort((a,b) => b[1] - a[1])[0];
             return {
                title: 'Total Pemasukan',
                value: income,
                valueColor: 'text-green-600',
                insightLabel: 'Sumber Terbesar',
                insightValue: topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : '-',
            }
        }
        // net
        return {
            title: 'Arus Kas Bersih',
            value: net,
            valueColor: net >= 0 ? 'text-green-600' : 'text-destructive',
            insightLabel: 'Pemasukan vs Pengeluaran',
            insightValue: `${formatCurrency(income)} vs ${formatCurrency(expense)}`,
        }

    }, [transactions, type]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium text-muted-foreground">{summary.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn("text-3xl font-bold", summary.valueColor)}>{formatCurrency(summary.value)}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                    <span className='font-medium'>{summary.insightLabel}:</span> {summary.insightValue}
                </div>
            </CardContent>
        </Card>
    )
}

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

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    };
    
    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                 <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Statistik</h1>
            </header>

            <main className="flex-1 overflow-y-auto" {...handlers}>
                <div className="p-4 bg-background border-b sticky top-16 z-10">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            {tabs.map((tab) => (
                                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                 {!isClient ? (
                    <div className="flex h-full w-full items-center justify-center p-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="p-4 space-y-4"
                        >
                            <h2 className="text-lg font-semibold">Ringkasan Bulan Ini</h2>
                             <MonthlySummary type={activeTab} />
                            
                             {activeTab !== 'net' && (
                                <>
                                    <h2 className="text-lg font-semibold pt-4">Analisis Kategori</h2>
                                    <CategoryAnalysis type={activeTab} />
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}

