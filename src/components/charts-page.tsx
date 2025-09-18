
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Scale, TrendingDown, Landmark, ReceiptText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import { isSameMonth, startOfMonth, parseISO, endOfMonth } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { Skeleton } from './ui/skeleton';

type TabValue = 'expense' | 'income' | 'net';

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
    { value: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft },
    { value: 'income', label: 'Pemasukan', icon: ArrowUpRight },
    { value: 'net', label: 'Net Income', icon: Scale },
];

const ChartsSkeleton = () => (
    <div className="p-4 space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="h-96">
                 <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
            </CardHeader>
             <CardContent className="space-y-2">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);


const SummaryCard = ({ tab }: { tab: TabValue }) => {
    const { transactions } = useApp();

    const summaryData = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        
        const monthlyTransactions = transactions.filter(t => {
            const tDate = parseISO(t.date);
            return tDate >= start && tDate <= end;
        });

        const expenseTransactions = monthlyTransactions.filter(t => t.type === 'expense');
        const incomeTransactions = monthlyTransactions.filter(t => t.type === 'income');

        const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
        const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);

        const categoryMap: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const biggestCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        const biggestTransaction = expenseTransactions.sort((a, b) => b.amount - a.amount)[0];

        return {
            totalExpense,
            biggestCategory: biggestCategory ? { name: biggestCategory[0], amount: biggestCategory[1] } : null,
            biggestTransaction: biggestTransaction ? { description: biggestTransaction.description, amount: biggestTransaction.amount } : null,
            totalIncome
        };
    }, [transactions]);
    
    if (tab === 'expense') {
        const { icon: CategoryIcon } = summaryData.biggestCategory ? categoryDetails(summaryData.biggestCategory.name) : { icon: TrendingDown };

        return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" /> Ringkasan Pengeluaran
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-destructive">{formatCurrency(summaryData.totalExpense)}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Kategori Terbesar</p>
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                           <CategoryIcon className="h-4 w-4" />
                           <span className="truncate">{summaryData.biggestCategory?.name || '-'}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Transaksi Terbesar</p>
                        <p className="text-sm font-bold truncate">{summaryData.biggestTransaction?.description || '-'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (tab === 'income') {
        return <PlaceholderContent label="Ringkasan Pemasukan" icon={ArrowUpRight} text="Ringkasan data pemasukanmu akan muncul di sini." />;
    }
    
    if (tab === 'net') {
        return <PlaceholderContent label="Ringkasan Net Income" icon={Scale} text="Ringkasan selisih pemasukan dan pengeluaranmu akan muncul di sini." />;
    }

    return null;
}

const ExpenseAnalysis = () => {
    const { transactions } = useApp();

    const categoryExpenseData = useMemo(() => {
        const now = new Date();
        const categoryMap: { [key: string]: number } = {};

        const expenseTransactions = transactions
            .filter(t => {
                const tDate = parseISO(t.date);
                return t.type === 'expense' && isSameMonth(tDate, now);
            });
            
        const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

        expenseTransactions.forEach(t => {
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = 0;
            }
            categoryMap[t.category] += t.amount;
        });
        
        return {
            totalExpense,
            breakdown: Object.entries(categoryMap)
                .map(([name, value], index) => {
                    const { icon: Icon } = categoryDetails(name);
                    return { 
                        name, 
                        value, 
                        icon: Icon,
                        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
                        percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
                    };
                })
                .sort((a, b) => b.value - a.value)
        };

    }, [transactions]);
    
    const formatTick = (value: number) => {
        const numValue = Number(value);
        if (numValue >= 1000000) {
            return `Rp${(numValue / 1000000).toFixed(numValue % 1000000 !== 0 ? 1 : 0)}Jt`;
        }
        if (numValue >= 1000) {
            return `Rp${(numValue / 1000).toFixed(0)}Rb`;
        }
        return `Rp${numValue}`;
    };


    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Pengeluaran per Kategori (Bulan Ini)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="aspect-video h-96">
                         <BarChart data={categoryExpenseData.breakdown} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} minTickGap={1} width={80} className="truncate" />
                            <XAxis dataKey="value" type="number" tickFormatter={formatTick} axisLine={false} tickLine={false}/>
                            <ChartTooltip 
                                cursor={false}
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} 
                            />
                            <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Rincian Kategori</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {categoryExpenseData.breakdown.slice(0, 5).map((item) => (
                        <div key={item.name} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(item.value)}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full">
                                <div className="h-2 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.fill }}></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};


const PlaceholderContent = ({ label, icon: Icon, text }: { label: string, icon: React.ElementType, text?: string }) => (
    <div className="flex flex-col h-full items-center justify-center text-center p-4">
        <div className="p-3 bg-primary/10 rounded-full mb-3">
            <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold">{label}</h2>
        <p className="text-muted-foreground mt-2 mb-6">{text || `Grafik dan data untuk ${label.toLowerCase()} akan segera hadir.`}</p>
    </div>
);


export const ChartsPage = () => {
    const router = useRouter();
    const { isLoading } = useApp();
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    const handleTabChange = (value: string) => {
        const newIndex = tabs.findIndex(tab => tab.value === value);
        const oldIndex = tabs.findIndex(tab => tab.value === activeTab);
        setDirection(newIndex > oldIndex ? 1 : -1);
        setActiveTab(value as TabValue);
    }
    
    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
            if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1].value);
            }
        },
        onSwipedRight: () => {
            const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
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
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Analisis Keuangan</h1>
            </header>
            <main className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full bg-background flex flex-col flex-1">
                    <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm p-1 h-auto mt-0 sticky top-0">
                       {tabs.map(tab => (
                           <TabsTrigger key={tab.value} value={tab.value} className="flex gap-2 items-center">
                               <tab.icon className="h-4 w-4" />
                               {tab.label}
                            </TabsTrigger>
                       ))}
                    </TabsList>
                    <div {...handlers} className="flex-1 bg-muted">
                        <AnimatePresence initial={false} custom={direction}>
                             {isLoading ? (
                                <ChartsSkeleton />
                             ) : (
                                <motion.div
                                    key={activeTab}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="space-y-6 p-4"
                                >
                                    <SummaryCard tab={activeTab} />
                                    {activeTab === 'expense' && <ExpenseAnalysis />}
                                    {activeTab === 'income' && <PlaceholderContent label="Analisis Pemasukan" icon={ArrowUpRight} />}
                                    {activeTab === 'net' && <PlaceholderContent label="Analisis Net Income" icon={Scale} />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};
