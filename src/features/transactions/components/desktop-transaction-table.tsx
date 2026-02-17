'use client';

import React, { useMemo, useState } from 'react';
import {
    format,
    parseISO
} from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import {
    ArrowUpDown,
    Download,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownLeft,
    Pencil,
    Trash2,
    CornerDownRight,
    MapPin,
    Sparkles
} from 'lucide-react';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import type { Transaction, Wallet } from '@/types/models';

interface DesktopTransactionTableProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

type SortConfig = {
    key: keyof Transaction | 'status';
    direction: 'asc' | 'desc';
};

export const DesktopTransactionTable = ({ transactions, wallets }: DesktopTransactionTableProps) => {
    const { openEditTransactionModal, openDeleteModal } = useUI();
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date', direction: 'desc' });

    const sortedTransactions = useMemo(() => {
        const sortableItems = [...transactions];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Transaction];
                const bValue = b[sortConfig.key as keyof Transaction];

                if (aValue === undefined || bValue === undefined || aValue === null || bValue === null) return 0;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, sortConfig]);

    const handleSort = (key: keyof Transaction | 'status') => {
        triggerHaptic('light');
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
        triggerHaptic('medium');
        const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Dompet', 'Tipe', 'Jumlah', 'Status'];
        const rows = transactions.map(t => [
            format(parseISO(t.date), 'yyyy-MM-dd'),
            `"${t.description.replace(/"/g, '""')}"`,
            t.category,
            wallets.find(w => w.id === t.walletId)?.name || '',
            t.type,
            t.amount,
            'Tuntas'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transaksi-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="gap-2 h-10 rounded-xl px-4 border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </Button>
            </div>
            <div className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 premium-shadow border border-zinc-200/60 dark:border-zinc-800/60">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                        <tr>
                            <th className="p-5 pl-8 cursor-pointer hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-[0.15em]" onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-2">
                                    Tanggal
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-5 cursor-pointer hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-[0.15em]" onClick={() => handleSort('description')}>
                                <div className="flex items-center gap-2">
                                    Detail Transaksi
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-5 text-right cursor-pointer hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-[0.15em]" onClick={() => handleSort('amount')}>
                                <div className="flex items-center justify-end gap-2">
                                    Nominal
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-5 font-bold text-[10px] uppercase tracking-[0.15em]">Status</th>
                            <th className="p-5 text-right pr-8 font-bold text-[10px] uppercase tracking-[0.15em]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {sortedTransactions.map((t) => {
                            const isExpense = t.type === 'expense';
                            const wallet = wallets.find(w => w.id === t.walletId);
                            return (
                                <tr key={t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group">
                                    <td className="p-5 pl-8 text-xs font-bold text-zinc-400 whitespace-nowrap">
                                        {format(parseISO(t.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{t.description || t.category}</div>
                                        <div className="text-[10px] font-bold mt-1.5 flex items-center gap-2">
                                            <span className="uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5">
                                                {t.category}
                                            </span>
                                            {isExpense && t.isNeed === false && (
                                                <span className="flex items-center gap-1 uppercase tracking-wider text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-lg border border-pink-100 dark:border-pink-900/30">
                                                    <Sparkles className="h-3 w-3 fill-current" />
                                                    Keinginan
                                                </span>
                                            )}
                                            {t.subCategory && (
                                                <span className="flex items-center gap-1 text-zinc-400">
                                                    <CornerDownRight className="w-3 h-3" />
                                                    {t.subCategory}
                                                </span>
                                            )}
                                            <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                            <span className="text-zinc-400 flex items-center gap-1.5">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", wallet?.color || 'bg-zinc-300')} />
                                                {wallet?.name || '-'}
                                            </span>
                                            {t.location && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                                        <MapPin className="h-3 w-3 opacity-70" />
                                                        {t.location}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className={cn(
                                        "p-5 text-right font-bold text-sm tabular-nums tracking-tight",
                                        isExpense ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-500"
                                    )}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            {isExpense ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                                            {formatCurrency(t.amount)}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full w-fit border border-emerald-100 dark:border-emerald-900/30">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Tuntas
                                        </div>
                                    </td>
                                    <td className="p-5 text-right pr-8">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                onClick={() => {
                                                    triggerHaptic('light');
                                                    openEditTransactionModal(t);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl text-zinc-400 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => {
                                                    triggerHaptic('medium');
                                                    openDeleteModal(t);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};