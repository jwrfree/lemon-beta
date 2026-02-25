'use client';

import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ReferenceLine
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { AlertCircle, BrainCircuit } from 'lucide-react';
import { generateForecast, DataPoint } from '@/lib/prediction-engine';
import { Transaction } from '@/types/models';
import { Scatter } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface ProphetChartProps {
    transactions: Transaction[];
    historyStart: Date;
    historyEnd: Date;
    forecastDays?: number;
}

const chartConfig = {
    actual: {
        label: "Actual",
        color: "var(--success)",
    },
    forecast: {
        label: "Forecast",
        color: "var(--primary)",
    },
    upperBound: {
        label: "Upper Bound",
        color: "var(--primary)",
    },
    lowerBound: {
        label: "Lower Bound",
        color: "var(--primary)",
    },
} satisfies ChartConfig;

export function ProphetChart({ transactions, historyStart, historyEnd, forecastDays = 30 }: ProphetChartProps) {
    const data = useMemo(() => {
        return generateForecast(transactions, historyStart, historyEnd, forecastDays);
    }, [transactions, historyStart, historyEnd, forecastDays]);

    if (data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-card-glass bg-zinc-50/50 dark:bg-zinc-900/50">
                Butuh minimal 3 hari data untuk prediksi.
            </div>
        );
    }

    const lastActual = data.findLast(d => d.actual !== undefined);
    const finalPrediction = data[data.length - 1];
    const predictedChange = finalPrediction && lastActual ? finalPrediction.forecast! - lastActual.actual! : 0;
    const isPositive = predictedChange >= 0;

    const anomalies = useMemo(() => data.filter(d => d.anomaly && d.actual !== undefined), [data]);

    return (
        <div className="w-full bg-white dark:bg-zinc-900 rounded-card-premium p-6 shadow-card border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
            {/* Decorative AI Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-500" />
                        Prophet Engine (Beta)
                    </h3>
                    <p className="text-sm text-zinc-500">Forecasting Cashflow 30 Hari ke Depan</p>
                </div>

                {finalPrediction && (
                    <div className="text-right">
                        <p className="text-xs text-zinc-400">Proyeksi Akhir</p>
                        <p className={cn("text-lg font-mono font-medium", isPositive ? "text-emerald-500" : "text-rose-500")}>
                            {formatCurrency(finalPrediction.forecast || 0)}
                        </p>
                    </div>
                )}
            </div>

            <div className="h-[350px] w-full text-xs relative z-10">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <defs>
                            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-forecast)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--color-forecast)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => {
                                const date = parseISO(str);
                                return format(date, 'd MMM');
                            }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            tickFormatter={(value) => `${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <ChartTooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    const isPrediction = item.actual === undefined;

                                    return (
                                        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-4 rounded-md shadow-xl border border-zinc-200 dark:border-zinc-800 text-sm ring-1 ring-purple-500/20">
                                            <p className="font-medium mb-2 flex items-center justify-between">
                                                {format(parseISO(label), 'EEEE, d MMM')}
                                                {isPrediction && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase font-medium tracking-wider">Forecast</span>}
                                            </p>

                                            <div className="space-y-1">
                                                {item.actual !== undefined && (
                                                    <div className="flex justify-between gap-8 text-zinc-600 dark:text-zinc-300">
                                                        <span>Actual:</span>
                                                        <span className="font-mono font-medium">
                                                            {formatCurrency(item.actual)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between gap-8 text-purple-500">
                                                    <span>Model Projection:</span>
                                                    <span className="font-mono font-medium">
                                                        {formatCurrency(item.forecast)}
                                                    </span>
                                                </div>

                                                {isPrediction && (
                                                    <div className="pt-2 mt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                        <p className="text-xs text-zinc-400 mb-1">Confidence Interval (95%)</p>
                                                        <div className="flex justify-between gap-4 text-xs font-mono text-zinc-500">
                                                            <span>L: {formatCurrency(item.lowerBound)}</span>
                                                            <span>H: {formatCurrency(item.upperBound)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />

                        {/* Reference Line for "Today" */}
                        {lastActual && (
                            <ReferenceLine x={lastActual.date} stroke="var(--color-forecast)" strokeDasharray="3 3" label={{ value: 'Today', position: 'top', fill: 'var(--color-forecast)', fontSize: 10 }} />
                        )}

                        <Area
                            type="monotone"
                            dataKey="upperBound"
                            data={data}
                            stroke="none"
                            fill="url(#confidenceGradient)"
                            fillOpacity={1}
                        />
                        <Line
                            type="monotone"
                            dataKey="upperBound"
                            stroke="var(--color-upperBound)"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            dot={false}
                            strokeOpacity={0.3}
                            activeDot={false}
                            name="Upside Risk"
                        />
                        <Line
                            type="monotone"
                            dataKey="lowerBound"
                            stroke="var(--color-lowerBound)"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            dot={false}
                            strokeOpacity={0.3}
                            activeDot={false}
                            name="Downside Risk"
                        />

                        {/* Main Forecast Line */}
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke="var(--color-forecast)"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                            name="AI Prediction"
                            animationDuration={2000}
                        />

                        {/* Historical Trend Line (Overlay) */}
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="var(--color-actual)"
                            strokeWidth={3}
                            dot={{ r: 3, fill: 'var(--color-actual)' }}
                            name="Historical Data"
                        />

                        {/* Anomaly Points */}
                        <Scatter
                            data={anomalies}
                            fill="#ef4444"
                            shape="star"
                            r={6}
                            name="Anomaly"
                            animationBegin={1000}
                        />
                    </ComposedChart>
                </ChartContainer>
            </div>

            <div className="flex items-start gap-2 mt-4 p-3 bg-primary/5 rounded-card text-xs text-primary border border-primary/10">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                    Model menggunakan <strong>Holt-Winters (Triple Exponential Smoothing)</strong> untuk mendeteksi tren dan pola musiman (seasonality) dari kebiasaan belanja Anda. Titik merah menandakan anomali pengeluaran historis.
                </p>
            </div>
        </div>
    );
}

