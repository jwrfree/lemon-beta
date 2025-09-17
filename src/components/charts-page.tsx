'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts"
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/components/app-provider';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';

type TabValue = 'expense' | 'income' | 'net';

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
    { value: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft },
    { value: 'income', label: 'Pemasukan', icon: ArrowUpRight },
    { value: 'net', label: 'Net Income', icon: Scale },
];

const ExpenseAnalysis = () => {
    const { transactions } = useApp();

    const monthlyExpenseData = useMemo(() => {
        const data = Array.from({ length: 6 }).map((_, i) => {
            const month = subMonths(new Date(), 5 - i);
            const start = startOfMonth(month);
            const end = endOfMonth(month);

            const total = transactions
                .filter(t => {
                    const tDate = parseISO(t.date);
                    return t.type === 'expense' && tDate >= start && tDate <= end;
                })
                .reduce((acc, t) => acc + t.amount, 0);

            return {
                name: format(month, 'MMM', { locale: dateFnsLocaleId }),
                total: total,
            };
        });
        return data;
    }, [transactions]);
    
    const categoryExpenseData = useMemo(() => {
        const currentMonthStart = startOfMonth(new Date());
        const categoryMap: { [key: string]: number } = {};

        transactions
            .filter(t => {
                const tDate = parseISO(t.date);
                return t.type === 'expense' && tDate >= currentMonthStart;
            })
            .forEach(t => {
                if (!categoryMap[t.category]) {
                    categoryMap[t.category] = 0;
                }
                categoryMap[t.category] += t.amount;
            });
        
        return Object.entries(categoryMap)
            .map(([name, value], index) => {
                return { 
                    name, 
                    value, 
                    fill: `hsl(var(--chart-${index + 1}))`
                };
            })
            .sort((a, b) => b.value - a.value);

    }, [transactions]);

    const formatTick = (value: number) => {
        if (value >= 1000000) {
            return `Rp${(value / 1000000).toFixed(value % 1000000 !== 0 ? 1 : 0)}Jt`;
        }
        if (value >= 1000) {
            return `Rp${value / 1000}Rb`;
        }
        return `Rp${value}`;
    };


    return (
        <div className="p-4 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Tren Pengeluaran (6 Bulan Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{
                        total: {
                            label: "Pengeluaran",
                            color: "hsl(var(--chart-1))",
                        },
                        }} className="aspect-video">
                            <BarChart data={monthlyExpenseData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatTick(Number(value))} />
                            <ChartTooltip 
                                cursor={false}
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} 
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Rincian Kategori Bulan Ini</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                     <ChartContainer config={{}} className="mx-auto aspect-square h-48">
                        <PieChart>
                            <ChartTooltip
                                cursor={true}
                                content={<ChartTooltipContent
                                    formatter={(value, name) => (
                                         <div className="flex flex-col">
                                            <span>{name}</span>
                                            <span className="font-bold">{formatCurrency(Number(value))}</span>
                                        </div>
                                    )}
                                />}
                            />
                            <Pie data={categoryExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} strokeWidth={2} />
                        </PieChart>
                    </ChartContainer>
                     <div className="mt-4 space-y-2 w-full">
                        {categoryExpenseData.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span>{item.name}</span>
                                </div>
                                <span className="font-medium">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


const PlaceholderContent = ({ label, icon: Icon }: { label: string, icon: React.ElementType }) => (
    <div className="flex flex-col h-full items-center justify-center text-center p-4">
        <div className="p-3 bg-primary/10 rounded-full mb-3">
            <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold">Analisis {label}</h2>
        <p className="text-muted-foreground mt-2 mb-6">Grafik dan data untuk {label} akan segera hadir.</p>
    </div>
);


export const ChartsPage = () => {
    const router = useRouter();
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
            <main className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full bg-background">
                    <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm sticky top-0 p-1 h-auto mt-4">
                       {tabs.map(tab => (
                           <TabsTrigger key={tab.value} value={tab.value} className="flex gap-2 items-center">
                               <tab.icon className="h-4 w-4" />
                               {tab.label}
                            </TabsTrigger>
                       ))}
                    </TabsList>
                </Tabs>
                <div {...handlers} className="flex-1 overflow-y-auto">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {activeTab === 'expense' && <ExpenseAnalysis />}
                            {activeTab === 'income' && <PlaceholderContent label="Pemasukan" icon={ArrowUpRight} />}
                            {activeTab === 'net' && <PlaceholderContent label="Net Income" icon={Scale} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
