'use client';

import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { AlertCircle, BrainCircuit } from 'lucide-react';
import { generateForecast } from '@/lib/prediction-engine';
import { Transaction } from '@/types/models';

interface ProphetChartProps {
    transactions: Transaction[];
    historyStart: Date;
    historyEnd: Date;
    forecastDays?: number;
}

export function ProphetChart({ transactions, historyStart, historyEnd, forecastDays = 30 }: ProphetChartProps) {
    const data = useMemo(() => {
        return generateForecast(transactions, historyStart, historyEnd, forecastDays);
    }, [transactions, historyStart, historyEnd, forecastDays]);

    if (data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50">
                Butuh minimal 3 hari data untuk prediksi.
            </div>
        );
    }

    const lastActual = data.findLast(d => d.actual !== undefined);
    const finalPrediction = data[data.length - 1];
    const predictedChange = finalPrediction && lastActual ? finalPrediction.forecast! - lastActual.actual! : 0;
    const isPositive = predictedChange >= 0;

    return (
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
            {/* Decorative AI Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-500" />
                        Prophet Engine (Beta)
                    </h3>
                    <p className="text-sm text-zinc-500">Forecasting Cashflow 30 Hari ke Depan</p>
                </div>

                {finalPrediction && (
                    <div className="text-right">
                        <p className="text-xs text-zinc-400">Proyeksi Akhir</p>
                        <p className={cn("text-lg font-mono font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>
                            {formatCurrency(finalPrediction.forecast || 0)}
                        </p>
                    </div>
                )}
            </div>

            <div className="h-[350px] w-full text-xs relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <defs>
                            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => {
                                const date = parseISO(str);
                                return format(date, 'd MMM');
                            }}
                            stroke="#71717a"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#71717a"
                            tickFormatter={(value) => `${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    const isPrediction = item.actual === undefined;

                                    return (
                                        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-sm ring-1 ring-purple-500/20">
                                            <p className="font-semibold mb-2 flex items-center justify-between">
                                                {format(parseISO(label), 'EEEE, d MMM')}
                                                {isPrediction && <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-600 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Forecast</span>}
                                            </p>

                                            <div className="space-y-1">
                                                {item.actual !== undefined && (
                                                    <div className="flex justify-between gap-8 text-zinc-600 dark:text-zinc-300">
                                                        <span>Actual:</span>
                                                        <span className="font-mono font-bold">
                                                            {formatCurrency(item.actual)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between gap-8 text-purple-500">
                                                    <span>Model Projection:</span>
                                                    <span className="font-mono font-bold">
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
                            <ReferenceLine x={lastActual.date} stroke="#a855f7" strokeDasharray="3 3" label={{ value: 'Today', position: 'top', fill: '#a855f7', fontSize: 10 }} />
                        )}

                        {/* Confidence Interval Area (Only show for forecast range ideally, but Recharts handles nulls well usually) */}
                        <Area
                            type="monotone"
                            dataKey="upperBound"
                            data={data} // Pass full data, but only points with bounds will render
                            stroke="none"
                            fill="url(#confidenceGradient)"
                            fillOpacity={1}
                            baseLine={-10000000} // Hacky active base line? No, Area chart usually needs range.
                        // We need a proper Area range chart. Recharts helps with <Area dataKey="range" /> if data is formatted [min, max],
                        // OR we stack two areas. Let's keep it simple: Just shade below UpperBound? or better: Composed range?
                        // Recharts doesn't support "RangeArea" easily in ComposedChart without tricks.
                        // Trick: Area with 'lowerBound' as baseline?
                        // Recharts <Area> takes `baseValue`.
                        // Alternative: Use ErrorBar? No.
                        // Let's just draw the bounds as thin lines for now to avoid complexity or visual clutter.
                        />
                        <Line
                            type="monotone"
                            dataKey="upperBound"
                            stroke="#a855f7"
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
                            stroke="#a855f7"
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
                            stroke="#a855f7"
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
                            stroke="#10b981" // Emerald for actual positive history visual
                            strokeWidth={3}
                            dot={{ r: 3, fill: '#10b981' }}
                            name="Historical Data"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-start gap-2 mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl text-xs text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/20">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                    Model menggunakan Double Exponential Smoothing (Holt's Linear) untuk mendeteksi tren jangka pendek. Garis putus-putus adalah probabilitas arah cashflow Anda jika pola belanja saat ini berlanjut.
                </p>
            </div>
        </div>
    );
}
