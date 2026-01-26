'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import { generateFinancialInsight, FinancialData } from '@/ai/flows/generate-insight-flow';
import { Transaction, Wallet, Debt } from '@/types/models';
import { isSameMonth, parseISO, subMonths, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightCardProps {
    transactions: Transaction[];
    wallets: Wallet[];
    debts: Debt[];
}

export function AIInsightCard({ transactions, wallets, debts }: AIInsightCardProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateInsight = async () => {
        setIsLoading(true);
        try {
            const now = new Date();
            const currentMonthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now));
            
            const monthlyIncome = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const monthlyExpense = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

            // Calculate top categories
            const categoryMap = new Map<string, number>();
            currentMonthTransactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    const current = categoryMap.get(t.category) || 0;
                    categoryMap.set(t.category, current + t.amount);
                });
            
            const topExpenseCategories = Array.from(categoryMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([category, amount]) => ({ category, amount }));

            // Debt analytics for AI
            const myDebts = debts?.filter(d => d.direction === 'owed') || [];
            const totalDebt = myDebts.reduce((acc, d) => acc + (d.outstandingBalance ?? 0), 0);
            
            const lastMonth = subMonths(now, 1);
            const calculateHistoricalBalance = (targetDate: Date) => {
                return myDebts.reduce((acc, d) => {
                    const startDate = d.startDate ? parseISO(d.startDate) : (d.createdAt ? parseISO(d.createdAt) : new Date(0));
                    if (isAfter(startDate, targetDate)) return acc;
                    const paymentsUntilTarget = d.payments?.filter(p => {
                        const pDate = p.paymentDate ? parseISO(p.paymentDate) : new Date(0);
                        return !isAfter(pDate, targetDate);
                    }) || [];
                    const totalPaidUntilTarget = paymentsUntilTarget.reduce((sum, p) => sum + p.amount, 0);
                    const estimatedBalance = Math.max(0, (d.principal ?? 0) - totalPaidUntilTarget);
                    return acc + estimatedBalance;
                }, 0);
            };
            
            const lastMonthBalance = calculateHistoricalBalance(lastMonth);
            const debtChangeMonth = totalDebt - lastMonthBalance;
            
            const hasSilentGrowth = myDebts.some(d => (d.outstandingBalance ?? 0) > (d.principal ?? 0) && (d.interestRate ?? 0) > 0);
            
            // Simplified projection
            const threeMonthsAgo = subMonths(now, 3);
            const recentPayments = myDebts.flatMap(d => d.payments || [])
                .filter(p => isAfter(parseISO(p.paymentDate), threeMonthsAgo));
            const avgMonthlyPayment = recentPayments.reduce((sum, p) => sum + p.amount, 0) / 3;
            const projectedPayoffMonths = avgMonthlyPayment > 0 ? Math.ceil(totalDebt / avgMonthlyPayment) : undefined;

            const data: FinancialData = {
                monthlyIncome,
                monthlyExpense,
                totalBalance,
                topExpenseCategories,
                recentTransactionsCount: currentMonthTransactions.length,
                debtInfo: totalDebt > 0 ? {
                    totalDebt,
                    debtChangeMonth,
                    hasSilentGrowth,
                    projectedPayoffMonths
                } : undefined
            };

            const result = await generateFinancialInsight(data);
            setInsight(result);
        } catch (error) {
            console.error("Failed to generate insight:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-sm bg-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-700 dark:text-violet-400">
                    <Lightbulb className="h-4 w-4" />
                    Lemon Insight
                </CardTitle>
                {insight && !isLoading && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleGenerateInsight}>
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {!insight && !isLoading ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center text-center py-2"
                        >
                            <p className="text-xs text-muted-foreground mb-3">
                                Analisis pengeluaranmu bulan ini dengan AI.
                            </p>
                            <Button 
                                size="sm" 
                                onClick={handleGenerateInsight} 
                                className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                            >
                                <Sparkles className="mr-1.5 h-3 w-3" />
                                Cek Insight
                            </Button>
                        </motion.div>
                    ) : isLoading ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center py-4 gap-2 text-sm text-muted-foreground"
                        >
                            <Sparkles className="h-4 w-4 animate-spin text-violet-600" />
                            Sedang menganalisis...
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="text-sm leading-relaxed font-medium text-foreground/90"
                        >
                            &quot;{insight}&quot;
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
