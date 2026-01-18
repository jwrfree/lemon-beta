
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, HandCoins } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { categoryDetails } from '@/lib/categories';
import { cn, formatCurrency } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { useUI } from '@/components/ui-provider';

const BudgetCard = ({ budget }: { budget: any }) => {
    const { transactions } = useData();
    const router = useRouter();

    const spent = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions
            .filter(t => 
                t.type === 'expense' && 
                budget.categories.includes(t.category) &&
                new Date(t.date) >= startOfMonth
            )
            .reduce((acc, t) => acc + t.amount, 0);
    }, [transactions, budget.categories]);

    const remaining = budget.targetAmount - spent;
    const progress = (spent / budget.targetAmount) * 100;

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - now.getDate();

    let progressBarColor = 'bg-primary';
    if (progress > 80 && progress <= 100) {
        progressBarColor = 'bg-yellow-500';
    } else if (progress > 100) {
        progressBarColor = 'bg-destructive';
    }
    
    const firstCategory = budget.categories[0];
    const { icon: CategoryIcon, color, bgColor } = categoryDetails(firstCategory);


    return (
         <motion.button
            type="button"
            onClick={() => router.push(`/budgeting/${budget.id}`)}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40'
            )}
            aria-label={`Buka detail anggaran ${budget.name}`}
        >
            <Card className="p-4 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className={cn("flex-shrink-0 p-2 rounded-full", bgColor)}>
                            <CategoryIcon className={cn("h-5 w-5", color)} />
                        </div>
                        <h3 className="font-semibold">{budget.name}</h3>
                    </div>
                    <span className="text-sm text-muted-foreground">{daysLeft} hari lagi</span>
                </div>
                
                <div>
                     <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={cn("h-2.5 rounded-full", progressBarColor)} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                     <div className="flex justify-between items-center mt-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                            {progress > 100 ? `Terlampaui ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} tersisa`}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(budget.targetAmount)}</span>
                    </div>
                </div>
            </Card>
        </motion.button>
    );
};

export default function BudgetingPage() {
    const router = useRouter();
    const { transactions } = useData();
    const { budgets } = useBudgets();
    const { setIsBudgetModalOpen } = useUI();

    const overview = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalBudget = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
        
        const relevantCategories = Array.from(new Set(budgets.flatMap(b => b.categories)));

        const totalSpent = transactions
            .filter(t => 
                t.type === 'expense' && 
                relevantCategories.includes(t.category) &&
                new Date(t.date) >= startOfMonth
            )
            .reduce((acc, t) => acc + t.amount, 0);

        const totalRemaining = totalBudget - totalSpent;
        
        const chartData = [
            { name: 'Terpakai', value: totalSpent, fill: 'hsl(var(--destructive))' },
            { name: 'Sisa', value: Math.max(0, totalRemaining), fill: 'hsl(var(--primary))' },
        ];
        
        return { totalBudget, totalSpent, totalRemaining, chartData };
    }, [budgets, transactions]);
    

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <h1 className="text-xl font-bold text-center w-full">Anggaran</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4"
                    onClick={() => setIsBudgetModalOpen(true)}
                    aria-label="Tambah anggaran"
                >
                    <PlusCircle className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Tambah anggaran</span>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto">
                {budgets.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center p-4">
                        <div className="p-3 bg-primary/10 rounded-full mb-3">
                            <HandCoins className="h-8 w-8 text-primary" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold">Belum Ada Anggaran</h2>
                        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Mulai lacak pengeluaranmu dengan membuat anggaran pertama.</p>
                        <Button onClick={() => setIsBudgetModalOpen(true)}>
                            <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                            Buat Anggaran Baru
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Bulan Ini</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-full sm:w-1/2 h-32 flex justify-center">
                                        <ChartContainer config={{}} className="aspect-square h-full">
                                        <PieChart>
                                                <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                                />
                                            <Pie
                                                data={overview.chartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={30}
                                                strokeWidth={2}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                                <div className="w-full sm:w-1/2 space-y-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Anggaran</p>
                                        <p className="text-lg font-bold">{formatCurrency(overview.totalBudget)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground text-destructive">Terpakai</p>
                                        <p className="text-lg font-bold text-destructive">{formatCurrency(overview.totalSpent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground text-primary">Sisa</p>
                                        <p className={cn("text-lg font-bold", overview.totalRemaining < 0 ? 'text-destructive' : 'text-primary')}>
                                            {formatCurrency(overview.totalRemaining)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Rincian Anggaran</h2>
                            {budgets.map(budget => (
                                <BudgetCard key={budget.id} budget={budget} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
