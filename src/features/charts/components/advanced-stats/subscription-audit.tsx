'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Bell, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface SubscriptionItem {
    id: string;
    name: string;
    amount: number;
    category: string;
    isDueSoon?: boolean;
}

interface SubscriptionAuditProps {
    items: SubscriptionItem[];
    totalMonthly: number;
}

export function SubscriptionAudit({ items, totalMonthly }: SubscriptionAuditProps) {
    return (
        <Card className="p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-medium tracking-tight flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-purple-500" />
                        Biaya Berulang
                    </h3>
                    <p className="text-sm text-muted-foreground">Total langganan & biaya tetap bulanan</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-medium tracking-tighter tabular-nums">
                        {formatCurrency(totalMonthly)}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Per Bulan</p>
                </div>
            </div>

            <div className="space-y-3">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div 
                            key={item.id} 
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                item.isDueSoon 
                                    ? "bg-amber-500/5 border-amber-500/20" 
                                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                    item.isDueSoon ? "bg-amber-100 dark:bg-amber-900/30" : "bg-zinc-200 dark:bg-zinc-800"
                                )}>
                                    <Bell className={cn("h-5 w-5", item.isDueSoon ? "text-amber-600 dark:text-amber-400" : "text-zinc-500")} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{item.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium tabular-nums">{formatCurrency(item.amount)}</p>
                                {item.isDueSoon && (
                                    <Badge variant="outline" className="text-[9px] h-4 border-amber-500/30 text-amber-600 bg-amber-500/5">
                                        Segera Jatuh Tempo
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">Tidak ada biaya berulang terdeteksi</p>
                    </div>
                )}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <p className="text-[11px] font-medium text-purple-700 dark:text-purple-400 leading-snug">
                    Tips: Mengurangi satu biaya langganan yang jarang terpakai bisa menghemat <span className="font-medium">{(totalMonthly * 12).toLocaleString()}</span> per tahun.
                </p>
            </div>
        </Card>
    );
}

