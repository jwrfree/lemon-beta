
'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TransactionList } from '@/components/transaction-list';
import { cn, formatCurrency } from '@/lib/utils';
import { ChevronLeft, AlertTriangle, Pencil } from 'lucide-react';
import { startOfMonth, parseISO } from 'date-fns';

export default function BudgetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { budgets, transactions, isLoading, showToast } = useApp();

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
        return null;
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

    const handleEditClick = () => {
        showToast("Fitur edit anggaran sedang dalam pengembangan.", 'info');
    }

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Detail Anggaran</h1>
                <Button variant="ghost" size="icon" className="absolute right-4" onClick={handleEditClick}>
                    <Pencil className="h-5 w-5" strokeWidth={1.75} />
                </Button>
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
