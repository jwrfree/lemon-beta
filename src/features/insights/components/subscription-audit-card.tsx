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
        <div className="space-y-4 mb-6">
            {/* AI Auditor Insight Pill */}
            {(aiInsight || isAiLoading) && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-start gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
                        {isAiLoading ? (
                            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5 flex items-center gap-1">
                            AI Subscription Auditor
                        </p>
                        {isAiLoading ? (
                            <div className="h-3 w-3/4 bg-primary/10 animate-pulse rounded mt-1" />
                        ) : (
                            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                                {aiInsight}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Monthly Burn Rate Card */}
                <Card className="border-border shadow-card bg-card rounded-lg">
                    <CardHeader className="pb-2 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-tight">
                            <CreditCard className="h-4 w-4 text-indigo-500" />
                            Biaya Langganan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-medium tracking-tight text-foreground">
                                {formatCurrency(totalMonthlyBurn)}
                            </span>
                            <span className="text-xs text-muted-foreground">/ bln</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-white/50 dark:bg-black/20 border-none text-[10px] px-2 py-0.5 rounded-lg">
                                {activeSubscriptions} Layanan Terdeteksi
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Silent Inflation Alerts */}
                <Card className="border-border shadow-card bg-card relative overflow-hidden rounded-lg">
                    <CardHeader className="pb-2 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-tight">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Status Harga
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative z-10 px-5 pb-5">
                        {anomalies.length > 0 ? (
                            <div className="space-y-2">
                                {anomalies.map((anomaly, idx) => (
                                    <div
                                        key={`${anomaly.merchantName}-${idx}`}
                                        className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-2.5 flex items-start gap-3"
                                    >
                                        <div className="bg-rose-100 dark:bg-rose-800/50 p-1.5 rounded-full shrink-0 mt-0.5">
                                            <TrendingUp className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 leading-tight">
                                                {anomaly.merchantName} naik!
                                            </p>
                                            <p className="text-[10px] text-rose-700 dark:text-rose-300/80 mt-0.5 font-medium">
                                                +{formatCurrency(anomaly.difference)} dari bulan lalu.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-success bg-success/5 p-3 rounded-lg border border-success/10">
                                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium">Semua Normal</p>
                                        <p className="text-[10px] opacity-90">
                                            Harga langgananmu stabil.
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
