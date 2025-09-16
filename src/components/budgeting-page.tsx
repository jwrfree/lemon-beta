
'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandCoins, PlusCircle, ChevronLeft } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { categoryDetails } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

export const BudgetingPage = ({ onAddBudget }: { onAddBudget: () => void }) => {
    const router = useRouter();
    const { budgets } = useApp();

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Anggaran</h1>
                <Button variant="ghost" size="icon" className="absolute right-4" onClick={onAddBudget}>
                    <PlusCircle className="h-6 w-6" strokeWidth={1.75} />
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 pb-16">
                {budgets.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center">
                        <div className="p-3 bg-destructive/10 rounded-full mb-3">
                            <HandCoins className="h-8 w-8 text-destructive" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold">Tidak ada Anggaran</h2>
                        <p className="text-muted-foreground mt-2 mb-6">Buat anggaran pertama Anda untuk mengelola keuangan.</p>
                        <Button onClick={onAddBudget}>
                            <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                            Buat Anggaran Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        {budgets.map(budget => (
                            <Card key={budget.id} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">{budget.name}</h3>
                                    <span className="text-sm text-muted-foreground">{formatCurrency(budget.spent)} / {formatCurrency(budget.targetAmount)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-700">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(budget.spent / budget.targetAmount) * 100}%` }}></div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {budget.categories.map((catName:string) => {
                                        const { icon: CategoryIcon } = categoryDetails(catName);
                                        return (
                                            <span key={catName} className="text-xs flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                                <CategoryIcon className="h-3 w-3" strokeWidth={2} />
                                                {catName}
                                            </span>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
