
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import type { Transaction, Wallet } from '@/types/models';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

export const DashboardRecentTransactions = ({ transactions, wallets }: DashboardRecentTransactionsProps) => {
    const router = useRouter();

    return (
        <Card className="shadow-sm border-none rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-bold tracking-tight">Transaksi Terakhir</CardTitle>
                    <CardDescription className="text-xs">5 transaksi terbaru yang kamu lakukan.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')} className="text-primary hover:bg-primary/5">
                    Lihat Semua
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="p-3 pl-4">Transaksi</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">Dompet</th>
                                <th className="p-3 text-right pr-4">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                                        Belum ada transaksi untuk filter ini.
                                    </td>
                                </tr>
                            )}
                            {transactions.map((t) => {
                                const categoryData = categoryDetails(t.category);
                                const CategoryIcon = getCategoryIcon(categoryData.icon);
                                const wallet = wallets.find(w => w.id === t.walletId);
                                const bgColor = categoryData.bg_color;

                                return (
                                    <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-3 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2.5 rounded-xl shadow-sm", bgColor)}>
                                                    <CategoryIcon className={cn("h-5 w-5", categoryData.color)} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold leading-tight">{t.description || t.category}</div>
                                                    <div className="text-[11px] text-muted-foreground/70 hidden sm:block">
                                                        {t.subCategory || t.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted-foreground text-xs">
                                            {t.category}
                                        </td>
                                        <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                                            {format(parseISO(t.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                        </td>
                                        <td className="p-3 text-muted-foreground text-xs">
                                            {wallet?.name || '-'}
                                        </td>
                                        <td className="p-3 pr-4 text-right font-semibold tracking-tight">
                                            <span className={cn(t.type === 'income' ? 'text-teal-600 dark:text-teal-500' : 'text-destructive', 'tabular-nums')}>
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
