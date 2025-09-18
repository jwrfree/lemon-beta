
'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TransactionList } from '@/components/transaction-list';
import { cn, formatCurrency } from '@/lib/utils';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, parseISO } from 'date-fns';

const BudgetDetailSkeleton = () => (
    <div className="p-4 space-y-6">
        <Card>
            <CardHeader className="items-center text-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-3 gap-4 w-full text-center">
                    <div>
                        <Skeleton className="h-4 w-16 mx-auto mb-1" />
                        <Skeleton className="h-5 w-24 mx-auto" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-16 mx-auto mb-1" />
                        <Skeleton className="h-5 w-24 mx-auto" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-16 mx-auto mb-1" />
                        <Skeleton className="h-5 w-24 mx-auto" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-2">
                 <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-1/4" />
                </div>
            </div>
        </div>
    </div>
);

export default function BudgetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { budgets, transactions, isLoading } = useApp();

    const budgetId = params.id as string;
    const budget = useMemo(() => budgets.find(b => b.id === budgetId), [budgets, budgetId]);

    const budgetDetails = useMemo(() => {
        if (!budget) return null;

        const now = new Date();
        const start = startOfMonth(now);

        const budgetTransactions = transactions.filter(t => 
            t.type === 'expense' && 
            budget.categories.includes(t.category) &&
            parseISO(t.date) >= start
        );

        const spent = budgetTransactions.reduce((acc, t) => acc + t.amount, 0);
        const remaining = budget.targetAmount - spent;
        const progress = budget.targetAmount > 0 ? (spent / budget.targetAmount) * 100 : 0;

        return { budgetTransactions, spent, remaining, progress };
    }, [budget, transactions]);

    if (isLoading) {
        return (
             <div className="flex flex-col h-full bg-muted">
                 <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
                    <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                    <Skeleton className="h-6 w-40 mx-auto" />
                </header>
                <main className="flex-1 overflow-y-auto">
                    <BudgetDetailSkeleton />
                </main>
             </div>
        );
    }
    
    if (!budget) {
        return (
             <div className="flex flex-col h-full bg-muted">
                <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
                    <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                    <h1 className="text-xl font-bold text-center w-full">Detail Anggaran</h1>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
                     <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                     <h2 className="text-xl font-bold">Anggaran Tidak Ditemukan</h2>
                     <p className="text-muted-foreground mt-2">Anggaran yang kamu cari tidak ada atau mungkin sudah dihapus.</p>
                </main>
            </div>
        );
    }

    const { budgetTransactions, spent, remaining, progress } = budgetDetails!;
    
    let progressBarColor = 'bg-primary';
    if (progress > 80 && progress <= 100) progressBarColor = 'bg-yellow-500';
    else if (progress > 100) progressBarColor = 'bg-destructive';

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Detail Anggaran</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-16">
                 <Card>
                    <CardHeader className="items-center text-center pb-2">
                        <CardTitle className="text-2xl">{budget.name}</CardTitle>
                         <p className="text-sm text-muted-foreground">
                            {progress > 100 
                                ? `Terlampaui ${formatCurrency(Math.abs(remaining))}`
                                : `${formatCurrency(remaining)} tersisa dari ${formatCurrency(budget.targetAmount)}`
                            }
                        </p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Progress value={progress} indicatorClassName={progressBarColor} />
                        <div className="grid grid-cols-3 gap-4 w-full text-center pt-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Target</p>
                                <p className="font-semibold">{formatCurrency(budget.targetAmount)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-muted-foreground">Terpakai</p>
                                <p className="font-semibold text-destructive">{formatCurrency(spent)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-muted-foreground">Sisa</p>
                                <p className={cn("font-semibold", remaining < 0 ? 'text-destructive' : 'text-primary' )}>
                                    {formatCurrency(remaining)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Riwayat Transaksi Anggaran Ini</h2>
                    <TransactionList transactions={budgetTransactions} />
                </div>
            </main>
        </div>
    )
}
