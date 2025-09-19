

'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, AreaChart, Area } from "recharts"
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Scale, TrendingDown, Landmark, ReceiptText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import { isSameMonth, startOfMonth, parseISO, endOfMonth, subDays, format, eachDayOfInterval, startOfDay } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { id as dateFnsLocaleId } from 'date-fns/locale';

type TabValue = 'expense' | 'income' | 'net';
type TimeRange = 'last7d' | 'last30d' | 'this_month';


const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
    { value: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft },
    { value: 'income', label: 'Pemasukan', icon: ArrowUpRight },
    { value: 'net', label: 'Net Income', icon: Scale },
];

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
                        <TrendingDown className="h-5 w-5" /> Ringkasan Pengeluaran Bulan Ini
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

const SpendingTrendChart = () => {
    const { transactions } = useApp();
    const [timeRange, setTimeRange] = useState<TimeRange>('this_month');

    const trendData = useMemo(() => {
        const now = new Date();
        let startDate, endDate;

        if (timeRange === 'last7d') {
            startDate = startOfDay(subDays(now, 6));
            endDate = startOfDay(now);
        } else if (timeRange === 'last30d') {
            startDate = startOfDay(subDays(now, 29));
            endDate = startOfDay(now);
        } else { // 'this_month'
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        }

        const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
        
        const dailyExpenses: { [key: string]: number } = {};
        dateInterval.forEach(day => {
            dailyExpenses[format(day, 'yyyy-MM-dd')] = 0;
        });

        transactions
            .filter(t => {
                const tDate = parseISO(t.date);
                return t.type === 'expense' && tDate >= startDate && tDate <= endDate;
            })
            .forEach(t => {
                const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
                if (dailyExpenses[dateKey] !== undefined) {
                    dailyExpenses[dateKey] += t.amount;
                }
            });

        return Object.entries(dailyExpenses).map(([date, total]) => ({
            date,
            total,
            formattedDate: format(parseISO(date), 'd MMM', { locale: dateFnsLocaleId }),
        }));
    }, [transactions, timeRange]);
    
    const formatTick = (value: number) => {
        const numValue = Number(value);
        if (numValue >= 1000000) return `Rp${(numValue / 1000000).toFixed(1)}Jt`;
        if (numValue >= 1000) return `Rp${(numValue / 1000).toFixed(0)}k`;
        return `Rp${numValue}`;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle>Tren Pengeluaran</CardTitle>
                    <div className="p-1 bg-muted rounded-full flex items-center gap-1 border w-fit">
                        <Button onClick={() => setTimeRange('last7d')} variant={timeRange === 'last7d' ? 'secondary' : 'ghost'} size="sm" className="rounded-full h-7 text-xs px-2">7 Hari</Button>
                        <Button onClick={() => setTimeRange('last30d')} variant={timeRange === 'last30d' ? 'secondary' : 'ghost'} size="sm" className="rounded-full h-7 text-xs px-2">30 Hari</Button>
                        <Button onClick={() => setTimeRange('this_month')} variant={timeRange === 'this_month' ? 'secondary' : 'ghost'} size="sm" className="rounded-full h-7 text-xs px-2">Bulan Ini</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-80 w-full">
                    <AreaChart accessibilityLayer data={trendData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval="preserveStartEnd"
                        />
                         <YAxis 
                            tickFormatter={formatTick} 
                            axisLine={false} 
                            tickLine={false}
                            width={50}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent 
                                            labelFormatter={(value, payload) => {
                                                if (payload && payload.length > 0 && payload[0].payload) {
                                                    return format(parseISO(payload[0].payload.date), 'eeee, d MMM yyyy', { locale: dateFnsLocaleId });
                                                }
                                                return value;
                                            }}
                                            formatter={(value) => formatCurrency(Number(value))} 
                                            indicator="dot" 
                                        />}
                        />
                         <defs>
                            <linearGradient id="fill-destructive" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--destructive))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--destructive))"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="total"
                            type="monotone"
                            stroke="hsl(var(--destructive))"
                            fill="url(#fill-destructive)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

const ExpenseAnalysis = () => {
    const { transactions } = useApp();
    
    const { categoryExpenseData, chartConfig } = useMemo(() => {
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

        const sortedBreakdown = Object.entries(categoryMap)
            .map(([name, value]) => {
                const details = categoryDetails(name);
                const colorVarName = details.color.match(/text-([\w-]+)-/)?.[1];
                const fill = colorVarName ? `hsl(var(--${colorVarName}-500))` : 'hsl(var(--primary))';
                return {
                    name,
                    value,
                    icon: details.icon,
                    fill: fill,
                    percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
                };
            })
            .sort((a, b) => b.value - a.value);
        
        const finalChartConfig = Object.fromEntries(
             sortedBreakdown.map((item) => [
                item.name,
                {
                    label: item.name,
                    color: item.fill,
                    icon: item.icon,
                },
            ])
        ) as ChartConfig;

        return {
            categoryExpenseData: sortedBreakdown,
            chartConfig: finalChartConfig,
        };

    }, [transactions]);

    return (
        <div className="space-y-6">
            <SpendingTrendChart />

             <Card>
                <CardHeader>
                    <CardTitle>Pengeluaran per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="aspect-square h-80">
                         <PieChart>
                            <ChartTooltip 
                                cursor={false}
                                content={<ChartTooltipContent 
                                    formatter={(value, name, props) => {
                                        const config = chartConfig[name as keyof typeof chartConfig];
                                        if (!config) return null;
                                        
                                        return (
                                            <div className="flex items-center gap-2">
                                                {config.icon && React.createElement(config.icon, { className: "h-4 w-4" })}
                                                <div className="flex flex-col">
                                                     <span className="font-semibold">{config.label}</span>
                                                     <span className="text-muted-foreground">{formatCurrency(Number(value))}</span>
                                                </div>
                                            </div>
                                        )
                                    }}
                                    hideLabel
                                />}
                            />
                            <Pie
                                data={categoryExpenseData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                                >
                                {categoryExpenseData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                                </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Rincian Kategori</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {categoryExpenseData.slice(0, 5).map((item) => (
                        <div key={item.name} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <item.icon className={cn("h-4 w-4")} style={{color: item.fill}} />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(item.value)}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full">
                                <div className={cn("h-2 rounded-full")} style={{ width: `${item.percentage}%`, backgroundColor: item.fill }}></div>
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
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Analisis Keuangan</h1>
            </header>
            <main className="overflow-y-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm p-1 h-auto mt-4 sticky top-16 z-10">
                       {tabs.map(tab => (
                           <TabsTrigger key={tab.value} value={tab.value}>
                               {tab.label}
                            </TabsTrigger>
                       ))}
                    </TabsList>
                    <div {...handlers}>
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={activeTab}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="p-4 pb-20"
                            >
                                <div className="space-y-6">
                                    <SummaryCard tab={activeTab} />
                                    {activeTab === 'expense' && <ExpenseAnalysis />}
                                    {activeTab === 'income' && <PlaceholderContent label="Analisis Pemasukan" icon={ArrowUpRight} />}
                                    {activeTab === 'net' && <PlaceholderContent label="Analisis Net Income" icon={Scale} />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};
