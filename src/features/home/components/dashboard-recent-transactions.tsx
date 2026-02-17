'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import { CornerDownRight, ArrowRight, MapPin } from 'lucide-react';
import type { Transaction, Wallet } from '@/types/models';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

export const DashboardRecentTransactions = ({ transactions, wallets }: DashboardRecentTransactionsProps) => {
    const router = useRouter();

    const handleRowClick = (transaction: Transaction) => {
        triggerHaptic('light');
    };

    return (
        <div className="overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-400 font-medium border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                        <th className="p-5 pl-6 font-medium text-[10px] uppercase tracking-[0.15em]">Detail Transaksi</th>
                        <th className="p-5 font-medium text-[10px] uppercase tracking-[0.15em]">Kategori / Sub</th>
                        <th className="p-5 font-medium text-[10px] uppercase tracking-[0.15em]">Sumber Dana</th>
                        <th className="p-5 text-right pr-6 font-medium text-[10px] uppercase tracking-[0.15em]">Nominal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground italic">
                                Belum ada data transaksi yang ditemukan.
                            </td>
                        </tr>
                    )}
                    {transactions.map((t) => {
                        const categoryData = categoryDetails(t.category);
                        const CategoryIcon = getCategoryIcon(categoryData.icon);
                        const wallet = wallets.find(w => w.id === t.walletId);
                        const dateObj = parseISO(t.date);

                        return (
                            <tr 
                                key={t.id} 
                                onClick={() => handleRowClick(t)}
                                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group cursor-pointer"
                            >
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110",
                                            categoryData.bg_color || "bg-zinc-100"
                                        )}>
                                            <div className={cn("w-5 h-5", categoryData.color)}>
                                                <CategoryIcon />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100 leading-tight truncate max-w-[200px]">
                                                {t.description || t.category}
                                            </div>
                                            <div className="text-[10px] font-medium text-zinc-400 mt-1 flex items-center gap-2">
                                                <span>{format(dateObj, 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                                <span>{format(dateObj, 'HH:mm')}</span>
                                                {t.location && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                                        <span className="flex items-center gap-0.5 truncate max-w-[100px]">
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            {t.location}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 align-middle">
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg w-fit mb-1 border",
                                            categoryData.bg_color ? `${categoryData.bg_color} border-black/5 dark:border-white/5` : "bg-zinc-100 border-transparent",
                                            categoryData.color
                                        )}>
                                            {t.category}
                                        </span>
                                        {t.subCategory ? (
                                            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 ml-1">
                                                <CornerDownRight className="w-3 h-3 text-zinc-300" />
                                                {t.subCategory}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-600 ml-1 italic">Umum</span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 align-middle">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", wallet?.color || 'bg-zinc-300')} />
                                        {wallet?.name || 'Dompet'}
                                    </div>
                                </td>

                                <td className="p-4 pr-6 text-right align-middle">
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "font-medium tabular-nums text-sm tracking-tight",
                                            t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
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

            <div className="bg-zinc-50/30 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800/50 p-3 text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/transactions')}
                    className="text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors"
                >
                    Lihat Riwayat Lengkap
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

