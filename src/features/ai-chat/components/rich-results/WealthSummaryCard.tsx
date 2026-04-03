'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Wallet, Bank, CreditCard, TrendUp } from '@/lib/icons';
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
        <Card className="mt-4 bg-background border border-border/40 shadow-soft rounded-card overflow-hidden motion-surface">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Wealth Summary</span>
                    <TrendUp size={12} weight="regular" className="text-success opacity-50" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                            <Wallet size={12} weight="regular" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Cash</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-foreground/80">{formatCurrency(cash)}</p>
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                            <Bank size={12} weight="regular" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Assets</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-foreground/80">{formatCurrency(assets)}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                            <CreditCard size={12} weight="regular" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Liabilities</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-rose-600/80">{formatCurrency(liabilities)}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-success/70">
                            <TrendUp size={12} weight="regular" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-success/60">Net Worth</span>
                        </div>
                        <p className="text-sm font-semibold tracking-tight text-success">{formatCurrency(net_worth)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

