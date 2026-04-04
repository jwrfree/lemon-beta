'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/models';
import { format, parseISO } from 'date-fns';

import { AlertTriangle, Trophy } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';

export function CategoryPilla({ category, amount, total, budgetAmount, color, onClick }: {
 category: string,
 amount: number,
 total: number,
 budgetAmount?: number,
 color: string,
 onClick?: () => void
}) {
 // If budget exists, percentage is based on budget. Else, based on total expense.
 const percentage = budgetAmount ? (amount / budgetAmount) * 100 : (total > 0 ? (amount / total) * 100 : 0);
 const isOverBudget = budgetAmount ? amount > budgetAmount : false;

 // Extract background color from tailwind class if possible, or use a default
 const getGradientColor = () => {
 if (isOverBudget) return 'from-error to-destructive';
 const colorName = color.replace('bg-', '').replace('-500', '');
 return `from-${colorName}-500 to-${colorName}-600`;
 };

 return (
  <button
  type="button"
  onClick={onClick}
  className={cn(
  "group relative overflow-hidden bg-card rounded-md p-5 border-none shadow-none border border-border/15 transition-all text-left w-full",
  isOverBudget
  ? "ring-1 ring-error/20"
  : "hover:bg-muted/50"
  )}
  >
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className={cn("h-2 w-2 rounded-full", isOverBudget ? "bg-error" : color)} />
 <p className={cn("text-label text-muted-foreground", isOverBudget && "text-error")}>
 {category}
 </p>
 </div>
 <p className={cn("text-display-sm md:text-display-md font-medium tracking-tighter tabular-nums", isOverBudget ? "text-destructive" : "text-foreground")}>
 {formatCurrency(amount)}
 </p>
 </div>
 {isOverBudget && (
 <div className="bg-error/10 text-error p-2 rounded-md">
 <AlertTriangle className="w-5 h-5"/>
 </div>
 )}
 </div>

 <div className="space-y-2">
 <div className="flex justify-between items-center text-label">
 <div className="flex items-center gap-2">
 <span className={isOverBudget ? "text-error" : "text-muted-foreground/60"}>
 {percentage.toFixed(0)}% Terpakai
 </span>
 </div>
 {budgetAmount && (
 <span className="text-muted-foreground">Limit: {formatCurrency(budgetAmount)}</span>
 )}
 </div>
 <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 whileInView={{ width: `${Math.min(percentage, 100)}%` }}
 transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
 className={cn(
 "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
 getGradientColor()
 )}
 />
 </div>
 </div>
 </div>

 {/* Subtle background pattern for premium feel */}
 <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
 <Trophy className="h-20 w-20 -rotate-12"/>
 </div>
 </button>
 );
}

export function TopTransactionItem({ transaction, rank, onClick }: { transaction: Transaction, rank: number, onClick?: () => void }) {
 return (
  <button
  type="button"
  onClick={onClick}
  className="group flex items-center gap-4 p-4 bg-card rounded-card-glass border border-transparent hover:border-border/20 hover:bg-muted/30 transition-all w-full text-left active:scale-[0.98] shadow-sm hover:shadow-md"
  >
 <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground text-label-md transition-colors">
 #{rank}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-body-md truncate tracking-tight text-foreground/90">{transaction.description || transaction.category}</p>
 {transaction.type === 'expense' && typeof transaction.isNeed === 'boolean' && (
  <Badge 
    variant={transaction.isNeed ? "success" : "warning"}
    className="px-2 py-0.5"
  >
    {transaction.isNeed ? 'Kebutuhan' : 'Keinginan'}
  </Badge>
 )}
 </div>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="text-label text-muted-foreground/40">{format(parseISO(transaction.date), 'dd MMM yyyy')}</span>
 <span className="w-1 h-1 rounded-full bg-border"/>
 <span className="text-label text-muted-foreground/60">{transaction.category}</span>
 </div>
 </div>
 <p className="text-body-lg tabular-nums text-foreground">{formatCurrency(transaction.amount)}</p>
 </button>
 );
}
