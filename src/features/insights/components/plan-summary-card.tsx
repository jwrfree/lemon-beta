'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, PiggyBank, HandCoins, Sparkle, Info } from '@/lib/icons';
import { useFinancialContext } from '@/hooks/use-financial-context';
import { formatCurrency, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function PlanSummaryCard() {
 const { context, isLoading } = useFinancialContext();

 const stats = useMemo(() => {
 if (!context) return null;

 const totalBudgetLimit = context.budgets.reduce((sum, b) => sum + b.limit, 0);
 const totalBudgetSpent = context.budgets.reduce((sum, b) => sum + b.spent, 0);
 const budgetPercent = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

 const totalGoalTarget = context.goals.reduce((sum, g) => sum + g.target, 0);
 const totalGoalCurrent = context.goals.reduce((sum, g) => sum + g.current, 0);
 const goalPercent = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

 const liability = context.wealth.liabilities;
 const asset = context.wealth.assets + context.wealth.cash;
 const debtHealth = liability > 0 ? Math.max(0, 100 - (liability / asset) * 100) : 100;

 // Composite Health Score
 // 40% Budget (Lower is better until 90%), 40% Goal (Higher is better), 20% Debt Risk
 const budgetHealth = budgetPercent > 100 ? 0 : 100 - budgetPercent;
 const totalHealth = Math.round((budgetHealth * 0.4) + (goalPercent * 0.4) + (debtHealth * 0.2));

 return {
 totalHealth,
 budgetPercent,
 goalPercent,
 debtHealth,
 totalBudgetSpent,
 totalGoalCurrent,
 liability
 };
 }, [context]);

 if (isLoading) {
 return <Skeleton className="h-64 w-full rounded-card-premium"/>;
 }

 if (!stats) return null;

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-8"
 >
 <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-none rounded-card-premium relative">
 {/* Decorative background elements */}
 <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl"/>
 <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl"/>

 <CardContent className="p-6 md:p-8 relative z-10">
 <div className="flex flex-col md:flex-row gap-8 items-center">
 {/* Health Score Circle */}
 <div className="relative h-40 w-40 shrink-0">
 <svg className="h-full w-full -rotate-90">
 <circle
 cx="80"cy="80"r="70"
 className="stroke-white/10 fill-none"
 strokeWidth="12"
 />
 <motion.circle
 cx="80"cy="80"r="70"
 className="stroke-emerald-400 fill-none"
 strokeWidth="12"
 strokeLinecap="round"
 initial={{ strokeDasharray: "0 440"}}
 animate={{ strokeDasharray:`${(stats.totalHealth / 100) * 440} 440` }}
 transition={{ duration: 1.5, ease: "easeOut"}}
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-display-lg tracking-tighter">{stats.totalHealth}</span>
 <span className="text-label-xs font-medium text-white/60">Skor Rencana</span>
 </div>
 </div>

 {/* Progress Bars */}
 <div className="flex-1 w-full space-y-5">
 <div className="space-y-2">
 <div className="flex justify-between items-end">
 <div className="flex items-center gap-2">
 <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
 <PiggyBank size={14} className="text-emerald-300"/>
 </div>
 <span className="text-body-md font-medium">Batas Anggaran</span>
 </div>
 <span className="text-label-md tabular-nums text-emerald-300">{Math.round(stats.budgetPercent)}%</span>
 </div>
 <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width:`${Math.min(100, stats.budgetPercent)}%` }}
 className={cn("h-full rounded-full transition-colors", stats.budgetPercent > 90 ? "bg-amber-400": "bg-emerald-400")}
 />
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex justify-between items-end">
 <div className="flex items-center gap-2">
 <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center">
 <Target size={14} className="text-indigo-200"/>
 </div>
 <span className="text-body-md font-medium">Progres Target</span>
 </div>
 <span className="text-label-md tabular-nums text-indigo-200">{Math.round(stats.goalPercent)}%</span>
 </div>
 <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width:`${stats.goalPercent}%` }}
 className="h-full bg-indigo-300 rounded-full"
 />
 </div>
 </div>

 <div className="pt-4 flex items-center gap-4 border-t border-white/10 text-label-md font-medium text-white/70">
 <div className="flex items-center gap-1.5 border-r border-white/10 pr-4">
 <Sparkle size={12} className="text-amber-300"/>
 <span>Skor perencanaanmu {stats.totalHealth >= 70 ? 'Sangat Baik': 'Butuh Perhatian'}.</span>
 </div>
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger className="flex items-center gap-1 hover:text-white transition-colors">
 <Info size={12} />
 <span>Detail Insight</span>
 </TooltipTrigger>
 <TooltipContent className="bg-popover/90 backdrop-blur-xl border-none shadow-elevation-4 p-4 max-w-xs">
 <p className="text-body-md font-medium">Skor ini dihitung berdasarkan kedisiplinan anggaran (40%), progres target keuangan (40%), dan rasio hutang terhadap aset (20%).</p>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}
