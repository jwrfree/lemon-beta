'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, LoaderCircle, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

interface AIInsightProps {
    transactions: any[];
}

interface ForecastItem {
    category: string;
    current: number;
    projected: number;
    status: 'safe' | 'warning' | 'critical';
    insight: string;
}

interface AnalysisResult {
    forecasts: ForecastItem[];
    overall_comment: string;
}

export function AIInsights({ transactions }: AIInsightProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (transactions.length === 0) {
            toast.error("Belum ada data transaksi untuk dianalisis.");
            return;
        }

        try {
            setIsLoading(true);
            const now = new Date();
            const start = startOfMonth(now);
            const end = endOfMonth(now);
            const daysElapsed = differenceInDays(now, start) + 1;
            const daysInMonth = differenceInDays(end, start) + 1;

            const res = await fetch('/api/ai/analyze-finances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactions,
                    daysElapsed,
                    daysInMonth
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Gagal menganalisis');
            }

            const data = await res.json();
            setAnalysis(data);
            toast.success("Analisis AI selesai!");

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white border-indigo-500/30 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                            DeepSeek Forecast
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">Prediksi cerdas berbasis pola transaksi Anda.</p>
                    </div>
                    {!analysis && (
                        <Button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20"
                        >
                            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                            {isLoading ? 'Menganalisis...' : 'Mulai Analisis'}
                        </Button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Overall Insight */}
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                <p className="text-indigo-200 italic font-medium">"{analysis.overall_comment}"</p>
                            </div>

                            {/* Forecast Table */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                                    <div className="col-span-4">Kategori</div>
                                    <div className="col-span-3 text-right">Saat Ini</div>
                                    <div className="col-span-3 text-right">Proyeksi</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>

                                {analysis.forecasts.map((item) => (
                                    <motion.div
                                        key={item.category}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-12 items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="col-span-4">
                                            <p className="font-bold text-sm">{item.category}</p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{item.insight}</p>
                                        </div>
                                        <div className="col-span-3 text-right font-medium tabular-nums text-sm">
                                            {formatCurrency(item.current)}
                                        </div>
                                        <div className="col-span-3 text-right font-bold tabular-nums text-sm text-indigo-300">
                                            {formatCurrency(item.projected)}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <StatusBadge status={item.status} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAnalysis(null)}
                                className="w-full text-zinc-500 hover:text-white"
                            >
                                Reset Analisis
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}

function StatusBadge({ status }: { status: 'safe' | 'warning' | 'critical' }) {
    if (status === 'safe') {
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-0"><CheckCircle className="w-3 h-3" /></Badge>;
    }
    if (status === 'warning') {
        return <Badge className="bg-amber-500/20 text-amber-400 border-0"><AlertCircle className="w-3 h-3" /></Badge>;
    }
    return <Badge className="bg-rose-500/20 text-rose-400 border-0"><AlertTriangle className="w-3 h-3" /></Badge>;
}
