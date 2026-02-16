'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BrainCircuit, Lightbulb, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/models';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardSmartInsightProps {
    transactions: Transaction[];
    income: number;
    expense: number;
    net: number;
    hasTransactions: boolean;
}

interface AIAnalysisResult {
    summary: string;
    categoryForecast: { category: string; predictedAmount: number; reason: string }[];
    savingsTip: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
}

export const DashboardSmartInsight = ({
    transactions,
    income,
    expense,
    net,
    hasTransactions
}: DashboardSmartInsightProps) => {
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const performAnalysis = async () => {
        if (!hasTransactions || transactions.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            // Check cache first (optional, prevents spamming refresh)
            const cacheKey = `ai-insight-${new Date().toDateString()}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                // If cached data is "fresh enough" (e.g. valid for session). 
                // For now, let's always fetch on mount or we can implement basic caching.
                // Let's rely on fresh fetch for "Real time" feel as requested.
            }

            // Limit transactions sent to AI to save tokens context
            const recentTx = transactions.slice(0, 50);

            // Format for AI
            const txData = recentTx.map(t => ({
                date: t.date,
                amount: t.amount,
                category: t.category,
                type: t.type,
                desc: t.description
            }));

            const response = await fetch('/api/ai/analyze-finances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions: txData, view: 'dashboard_summary' }),
            });

            if (!response.ok) throw new Error('AI Overload');

            const result = await response.json();
            setAnalysis(result);

            // simple cache
            localStorage.setItem(cacheKey, JSON.stringify(result));

        } catch (err) {
            console.error(err);
            setError("AI sedang istirahat. Coba lagi nanti.");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-Trigger on Mount
    useEffect(() => {
        if (hasTransactions && !analysis) {
            performAnalysis();
        }
    }, [hasTransactions]);

    if (!hasTransactions) {
        return (
            <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="h-4 w-4" />
                        AI Financial Consultant
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Data belum cukup untuk analisis. Mulai catat transaksimu!
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative">
                {/* Shimmer Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer" />

                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <BrainCircuit className="h-4 w-4 animate-pulse" />
                        Analyzing Finances...
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-3/4 bg-indigo-200/20" />
                    <Skeleton className="h-4 w-full bg-indigo-200/20" />
                    <Skeleton className="h-16 w-full rounded-xl bg-indigo-200/20" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="overflow-hidden border-none shadow-sm bg-rose-50 dark:bg-rose-900/10">
                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-rose-500" />
                    <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                    <button onClick={performAnalysis} className="text-xs underline text-rose-500">Coba Lagi</button>
                </CardContent>
            </Card>
        );
    }

    if (!analysis) return null;

    const sentimentColor = {
        positive: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        neutral: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        negative: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
        critical: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    }[analysis.sentiment || 'neutral'];

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-white to-indigo-50/50 dark:from-zinc-900 dark:to-indigo-950/20 border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-4 w-4 text-purple-500 fill-purple-500 animate-pulse" />
                    AI Insight
                </CardTitle>
                <button onClick={performAnalysis} className="text-zinc-400 hover:text-indigo-500 transition-colors">
                    <RefreshCw className="h-3 w-3" />
                </button>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="relative">
                    <span className="absolute -left-3 top-0 text-2xl text-indigo-200 dark:text-indigo-800">“</span>
                    <p className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-200 italic pl-2">
                        {analysis.summary}
                    </p>
                </div>

                {/* Savings Tip */}
                <div className={cn("p-3 rounded-xl border border-transparent text-xs", sentimentColor)}>
                    <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">Wejangan Hari Ini:</p>
                            <p className="leading-snug opacity-90">{analysis.savingsTip}</p>
                        </div>
                    </div>
                </div>

                {/* Forecast / Warning */}
                {analysis.categoryForecast && analysis.categoryForecast.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Warning Zone</p>
                        {analysis.categoryForecast.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className="font-medium text-zinc-600 dark:text-zinc-300">{item.category}</span>
                                <span className="text-rose-500 font-mono">
                                    Prediksi: ~20% naik
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
