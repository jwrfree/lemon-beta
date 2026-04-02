'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Wallet, Bank, CreditCard, TrendUp } from '@phosphor-icons/react';
import { useFinancialContext } from '@/hooks/use-financial-context';
import { Skeleton } from '@/components/ui/skeleton';

export const WealthSummaryCard = () => {
    const { context, isLoading } = useFinancialContext();
    
    if (isLoading) {
        return <Skeleton className="h-32 w-full rounded-2xl" />;
    }

    if (!context?.wealth) return null;

    const { cash, assets, liabilities, net_worth } = context.wealth;

    return (
        <Card className="mt-4 border-none bg-muted/40 shadow-none rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-label font-semibold uppercase tracking-widest text-muted-foreground/60">Ringkasan Kekayaan</span>
                    <TrendUp size={12} weight="bold" className="text-success opacity-50" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                            <Wallet size={12} weight="bold" />
                            <span className="text-label font-semibold uppercase tracking-tighter">Kas</span>
                        </div>
                        <p className="text-sm font-semibold tracking-tight">{formatCurrency(cash)}</p>
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                            <Bank size={12} weight="bold" />
                            <span className="text-label font-semibold uppercase tracking-tighter">Aset</span>
                        </div>
                        <p className="text-sm font-semibold tracking-tight">{formatCurrency(assets)}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                            <CreditCard size={12} weight="bold" />
                            <span className="text-label font-semibold uppercase tracking-tighter">Hutang</span>
                        </div>
                        <p className="text-sm font-semibold tracking-tight text-destructive/80">{formatCurrency(liabilities)}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-accent/70">
                            <TrendUp size={12} weight="bold" />
                            <span className="text-label font-semibold uppercase tracking-tighter">Net Worth</span>
                        </div>
                        <p className="text-sm font-semibold tracking-tight text-accent">{formatCurrency(net_worth)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
