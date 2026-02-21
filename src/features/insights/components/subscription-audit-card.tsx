import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    TrendingUp,
    AlertCircle,
    CreditCard,
    CheckCircle2,
    Sparkles,
    Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { analyzeSubscriptions } from '@/lib/subscription-analysis';
import type { Transaction } from '@/types/models';
import { auditSubscriptionsFlow } from '@/ai/flows/audit-subscriptions-flow';

interface SubscriptionAuditCardProps {
    transactions: Transaction[];
}

export const SubscriptionAuditCard = ({ transactions }: SubscriptionAuditCardProps) => {
    const summary = useMemo(() => analyzeSubscriptions(transactions), [transactions]);
    const { totalMonthlyBurn, activeSubscriptions, anomalies } = summary;

    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (activeSubscriptions > 0 && !aiInsight && !isAiLoading) {
            setIsAiLoading(true);
            auditSubscriptionsFlow(summary).then(text => {
                setAiInsight(text);
                setIsAiLoading(false);
            });
        }
    }, [activeSubscriptions, summary, aiInsight, isAiLoading]);

    if (activeSubscriptions === 0 && anomalies.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            {/* AI Auditor Insight Pill */}
            {(aiInsight || isAiLoading) && (
                <div className="bg-primary/5 rounded-3xl p-4 flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all">
                    <div className="bg-primary/10 p-2 rounded-2xl shrink-0">
                        {isAiLoading ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                            AI Subscription Auditor
                        </p>
                        {isAiLoading ? (
                            <div className="h-3 w-3/4 bg-primary/10 animate-pulse rounded-full mt-1" />
                        ) : (
                            <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                                {aiInsight}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Monthly Burn Rate Card */}
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-card rounded-[32px] overflow-hidden">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                            Biaya Langganan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-semibold tracking-tighter text-foreground tabular-nums">
                                {formatCurrency(totalMonthlyBurn)}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">/ bln</span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {activeSubscriptions} Layanan
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Silent Inflation Alerts */}
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-card relative overflow-hidden rounded-[32px]">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            Status Harga
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative z-10 px-6 pb-6">
                        {anomalies.length > 0 ? (
                            <div className="space-y-2">
                                {anomalies.map((anomaly, idx) => (
                                    <div
                                        key={`${anomaly.merchantName}-${idx}`}
                                        className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-3 flex items-start gap-3"
                                    >
                                        <div className="bg-rose-500/10 p-1.5 rounded-full shrink-0 mt-0.5">
                                            <TrendingUp className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-rose-600 dark:text-rose-200 leading-tight uppercase tracking-tight">
                                                {anomaly.merchantName} naik!
                                            </p>
                                            <p className="text-[10px] text-rose-500/80 mt-0.5 font-bold tracking-tighter tabular-nums">
                                                +{formatCurrency(anomaly.difference)} <span className="opacity-50 text-[8px] font-medium tracking-normal">vs BLN LALU</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center py-2">
                                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 opacity-80" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest">Normal</p>
                                        <p className="text-[10px] font-medium opacity-70">
                                            Biaya bulanan stabil.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
