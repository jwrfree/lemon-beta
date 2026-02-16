'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import { CornerDownRight, ArrowRight } from 'lucide-react';
import type { Transaction, Wallet } from '@/types/models';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

export const DashboardRecentTransactions = ({ transactions, wallets }: DashboardRecentTransactionsProps) => {
    const router = useRouter();

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-500 font-medium border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                        <th className="p-4 pl-4 font-medium text-xs uppercase tracking-wider">Detail Transaksi</th>
                        <th className="p-4 font-medium text-xs uppercase tracking-wider">Kategori / Sub</th>
                        <th className="p-4 font-medium text-xs uppercase tracking-wider">Sumber Dana</th>
                        <th className="p-4 text-right pr-4 font-medium text-xs uppercase tracking-wider">Nominal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground italic">
                                Belum ada data transaksi yang ditemukan.
                            </td>
                        </tr>
                    )}
                    {transactions.map((t) => {
                        const categoryData = categoryDetails(t.category);
                        const CategoryIcon = getCategoryIcon(categoryData.icon); // Should handle string/component correctly if generic
                        // Fallback icon logic if needed:
                        // If CategoryIcon is undefined, show generic icon

                        const wallet = wallets.find(w => w.id === t.walletId);
                        const dateObj = parseISO(t.date);

                        return (
                            <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                                <td className="p-4 pl-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5",
                                            categoryData.bg_color || "bg-zinc-100"
                                        )}>
                                            {/* Lucide icon rendering */}
                                            {/* Note: In this codebase, getCategoryIcon might return a component or null */}
                                            {/* We rely on the existing pattern */}
                                            <div className={cn("w-5 h-5", categoryData.color)}>
                                                {/* Re-use existing icon logic logic from previous implementation if available, 
                                                    assuming getCategoryIcon returns a generic Lucide component */}
                                                <CategoryIcon />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                                                {t.description || t.category}
                                            </div>
                                            <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                                {format(dateObj, 'd MMM yyyy, HH:mm', { locale: dateFnsLocaleId })}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 align-middle">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md w-fit mb-1">
                                            {t.category}
                                        </span>
                                        {/* Sub Category Display */}
                                        {t.subCategory ? (
                                            <span className="text-[11px] text-zinc-500 flex items-center gap-1 ml-1">
                                                <CornerDownRight className="w-3 h-3 text-zinc-300" />
                                                {t.subCategory}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-zinc-300 ml-1">-</span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-4 text-xs text-zinc-500 align-middle">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                                        {wallet?.name || 'Dompet Terhapus'}
                                    </div>
                                </td>

                                <td className="p-4 pr-4 text-right align-middle">
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "font-bold tabular-nums text-sm",
                                            t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'
                                        )}>
                                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 p-2 text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/transactions')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-transparent"
                >
                    Lihat Semua Transaksi
                    <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </div>
    );
};
