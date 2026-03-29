'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, ArrowUpCircle, Sparkles, ChevronRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SavingPotentialData {
    income: number;
    fixedCosts: number;
    variableSpending: number;
    actualSavings: number;
    potentialSavings: number; // Income - Fixed Costs - Budgeted Variable
}

export function SavingPotential({ data }: { data: SavingPotentialData }) {
    const efficiency = (data.actualSavings / data.potentialSavings) * 100;

    return (
        <Card className="p-7 border-none rounded-card-glass bg-card text-foreground shadow-none border border-border/40 overflow-hidden relative group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 group-hover:bg-success/10 transition-colors duration-700 blur-[80px] rounded-full -mr-20 -mt-20 -z-0" />

            <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1.5">
                        <h3 className="text-label text-success/60 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Potensi efisiensi
                        </h3>
                        <p className="text-xl font-bold tracking-tight text-foreground/90 leading-tight">Rencana Simpanan</p>
                    </div>
                </div>

                <div className="space-y-8 flex-1">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-1.5">
                            <p className="text-label text-muted-foreground/40">Simpanan aktual</p>
                            <p className="text-3xl font-bold tabular-nums text-success tracking-tighter">
                                {formatCurrency(data.actualSavings)}
                            </p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <p className="text-label text-muted-foreground/40">Kapasitas maksimal</p>
                            <p className="text-3xl font-bold tabular-nums text-foreground/80 tracking-tighter">
                                {formatCurrency(data.potentialSavings)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-label text-muted-foreground/50">
                            <span>Indeks efisiensi</span>
                            <span className="text-success font-bold">{Math.round(efficiency)}%</span>
                        </div>
                        <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(efficiency, 100)}%` }}
                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-y-0 left-0 bg-success rounded-full shadow-lg"
                            />
                        </div>
                    </div>

                    <button className="w-full mt-auto p-5 rounded-card-glass bg-secondary/50 border border-border/40 flex items-center justify-between group/btn hover:bg-muted hover:border-border transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-success/10 text-success group-hover/btn:bg-success/20 group-hover/btn:scale-110 transition-all">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-foreground/80">Akselerator Aset</p>
                                <p className="text-label text-muted-foreground/50">Selisih: {formatCurrency(data.potentialSavings - data.actualSavings)} tersisa</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover/btn:translate-x-1 transition-all" />
                    </button>
                </div>
            </div>
        </Card>
    );
}


