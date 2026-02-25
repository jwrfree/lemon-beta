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
        <Card className="p-6 border-none rounded-card bg-card text-foreground shadow-card overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 blur-[100px] rounded-full -mr-20 -mt-20" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-success">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-xs font-medium uppercase tracking-widest">Potensi Tabungan</h3>
                        </div>
                        <p className="text-2xl font-medium tracking-tight">Celah Keuanganmu</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center border border-border">
                        <ArrowUpCircle className="h-6 w-6 text-success" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tabungan Saat Ini</p>
                            <p className="text-2xl font-medium tabular-nums text-success">{formatCurrency(data.actualSavings)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Maksimal Potensi</p>
                            <p className="text-2xl font-medium tabular-nums text-foreground">{formatCurrency(data.potentialSavings)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>EFISIENSI TABUNGAN</span>
                            <span>{efficiency.toFixed(0)}%</span>
                        </div>
                        <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden border border-border">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(efficiency, 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="absolute inset-y-0 left-0 bg-success rounded-full"
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary border border-border flex items-center justify-between group cursor-pointer hover:bg-muted transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-success/10">
                                <Wallet className="h-4 w-4 text-success" />
                            </div>
                            <div>
                                <p className="text-xs font-medium">Kembangkan Asetmu</p>
                                <p className="text-xs text-muted-foreground">Kamu punya sisa Rp {(data.potentialSavings - data.actualSavings).toLocaleString()} lagi</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                </div>
            </div>
        </Card>
    );
}

