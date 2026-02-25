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
        <Card className="p-6 border-none rounded-lg bg-card shadow-card">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-medium tracking-tight flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-primary" />
                        Biaya Berulang
                    </h3>
                    <p className="text-sm text-muted-foreground">Total langganan & biaya tetap bulanan</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-medium tracking-tighter tabular-nums">
                        {formatCurrency(totalMonthly)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Per Bulan</p>
                </div>
            </div>

            <div className="space-y-3">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-all",
                                item.isDueSoon
                                    ? "bg-warning/5 border-warning/20"
                                    : "bg-secondary border-border"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center",
                                    item.isDueSoon ? "bg-warning/10" : "bg-muted"
                                )}>
                                    <Bell className={cn("h-5 w-5", item.isDueSoon ? "text-warning" : "text-muted-foreground")} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{item.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium tabular-nums">{formatCurrency(item.amount)}</p>
                                {item.isDueSoon && (
                                    <Badge variant="outline" className="text-xs h-4 border-warning/30 text-warning bg-warning/5">
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

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-primary leading-snug">
                    Tips: Mengurangi satu biaya langganan yang jarang terpakai bisa menghemat <span className="font-medium">{(totalMonthly * 12).toLocaleString()}</span> per tahun.
                </p>
            </div>
        </Card>
    );
}

