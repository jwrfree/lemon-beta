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
    ArrowDownLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
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
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 h-9 rounded-lg">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="overflow-hidden rounded-lg bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('date')}> 
                                <div className="flex items-center gap-2">
                                    Tanggal
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('description')}>
                                <div className="flex items-center gap-2">
                                    Deskripsi
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="p-4 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('amount')}>
                                <div className="flex items-center justify-end gap-2">
                                    Jumlah
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                        {sortedTransactions.map((t) => {
                            const isExpense = t.type === 'expense';
                            return (
                                <tr key={t.id} className="hover:bg-primary/[0.02] transition-colors group cursor-pointer">
                                    <td className="p-4 text-xs font-medium text-muted-foreground/60 whitespace-nowrap">
                                        {format(parseISO(t.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{t.description}</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">{t.category} • {wallets.find(w => w.id === t.walletId)?.name}</div>
                                    </td>
                                    <td className={cn(
                                        "p-4 text-right font-extrabold text-sm",
                                        isExpense ? "text-rose-600" : "text-teal-600"
                                    )}>
                                        <div className="flex items-center justify-end gap-1">
                                            {isExpense ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                            {formatCurrency(t.amount)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full w-fit">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Tuntas
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