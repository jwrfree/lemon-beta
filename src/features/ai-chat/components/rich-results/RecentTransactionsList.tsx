'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { useFinancialContext } from '@/hooks/use-financial-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt } from '@phosphor-icons/react';

export const RecentTransactionsList = () => {
    const { context, isLoading } = useFinancialContext();
    
    if (isLoading) {
        return <Skeleton className="h-32 w-full rounded-2xl" />;
    }

    if (!context?.last_transaction) return null;

    const transactions = context.last_transaction ? [context.last_transaction] : [];

    return (
        <Card className="mt-4 bg-background border border-border/40 shadow-soft rounded-card overflow-hidden motion-surface">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Recent Transactions</span>
                    <Receipt size={12} weight="regular" className="text-muted-foreground/30" />
                </div>
                
                <div className="space-y-2">
                    {transactions.map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold truncate text-foreground/80">{tx.description}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{tx.category} • {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <span className={cn(
                                "text-xs font-semibold shrink-0 ml-2",
                                tx.type === 'income' ? "text-success" : "text-foreground"
                            )}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
