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
        <Card className="p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-zinc-900 text-white shadow-xl overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em]">Potensi Tabungan</h3>
                        </div>
                        <p className="text-2xl font-medium tracking-tight">Celah Keuanganmu</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <ArrowUpCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Tabungan Saat Ini</p>
                            <p className="text-2xl font-medium tabular-nums text-emerald-400">{formatCurrency(data.actualSavings)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Maksimal Potensi</p>
                            <p className="text-2xl font-medium tabular-nums text-white/90">{formatCurrency(data.potentialSavings)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-medium text-white/60">
                            <span>EFISIENSI TABUNGAN</span>
                            <span>{efficiency.toFixed(0)}%</span>
                        </div>
                        <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(efficiency, 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Wallet className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium">Kembangkan Asetmu</p>
                                <p className="text-[10px] text-white/40">Kamu punya sisa Rp {(data.potentialSavings - data.actualSavings).toLocaleString()} lagi</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                </div>
            </div>
        </Card>
    );
}

