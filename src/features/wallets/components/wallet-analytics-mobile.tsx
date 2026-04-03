
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChartPieSlice, TrendDown, TrendUp } from '@/lib/icons';
import { formatCurrency, cn } from '@/lib/utils';
import { CategoryPie } from '@/features/charts/components/category-pie';
import type { Transaction } from '@/types/models';

interface WalletAnalyticsMobileProps {
 transactions: Transaction[];
}

export const WalletAnalyticsMobile = ({ transactions }: WalletAnalyticsMobileProps) => {
 const { income, expense, topCategories } = useMemo(() => {
 let inc = 0;
 let exp = 0;
 const catMap: Record<string, number> = {};

 transactions.forEach(t => {
 if (t.type === 'income') {
 inc += t.amount;
 } else {
 exp += t.amount;
 catMap[t.category] = (catMap[t.category] || 0) + t.amount;
 }
 });

 const topCats = Object.entries(catMap)
 .map(([name, value]) => ({ name, value }))
 .sort((a, b) => b.value - a.value);

 return { income: inc, expense: exp, topCategories: topCats };
 }, [transactions]);

 const totalExpense = expense || 1; // Avoid division by zero

 return (
 <div className="px-5 space-y-6">
 {/* Quick Stats Cards */}
 <div className="grid grid-cols-2 gap-4">
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="p-4 rounded-card bg-success/5 border border-success/10"
 >
 <div className="flex items-center gap-2 text-success mb-1">
 <TrendUp size={12} weight="regular"/>
 <span className="text-label">Pemasukan</span>
 </div>
 <p className="text-title-lg font-medium tracking-tight text-foreground">
 {formatCurrency(income)}
 </p>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="p-4 rounded-card bg-destructive/5 border border-destructive/10"
 >
 <div className="flex items-center gap-2 text-destructive mb-1">
 <TrendDown size={12} weight="regular"/>
 <span className="text-label">Pengeluaran</span>
 </div>
 <p className="text-title-lg font-medium tracking-tight text-foreground">
 {formatCurrency(expense)}
 </p>
 </motion.div>
 </div>

 {/* Category Analysis */}
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <ChartPieSlice size={16} weight="regular"className="text-primary opacity-70"/>
 <h2 className="text-label">Alokasi Pengeluaran</h2>
 </div>

 <div className="bg-card border border-border/50 rounded-card p-4 overflow-hidden">
 <CategoryPie data={topCategories} total={expense} type="expense"/>
 
 {/* Legend-ish List */}
 <div className="mt-2 space-y-2">
 {topCategories.slice(0, 3).map((cat, idx) => (
 <div key={cat.name} className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className={cn("h-1.5 w-1.5 rounded-full", 
 idx === 0 ? "bg-chart-1": idx === 1 ? "bg-chart-2": "bg-chart-3"
 )} />
 <span className="text-label-md font-medium text-muted-foreground">{cat.name}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-label-md ">{Math.round((cat.value / totalExpense) * 100)}%</span>
 <span className="text-label-md text-muted-foreground">{formatCurrency(cat.value)}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
};

