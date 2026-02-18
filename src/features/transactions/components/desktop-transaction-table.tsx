
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
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';
import type { Transaction, Wallet } from '@/types/models';
import {
    getMerchantVisuals,
    getMerchantLogoUrl,
    getBackupLogoUrl
} from '@/lib/merchant-utils';

interface DesktopTransactionTableProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

type SortConfig = {
    key: keyof Transaction | 'wallet';
    direction: 'asc' | 'desc';
};

const TransactionRow = ({ t, wallets, openEditTransactionModal, openDeleteModal }: {
    t: Transaction,
    wallets: Wallet[],
    openEditTransactionModal: (t: Transaction) => void,
    openDeleteModal: (t: Transaction) => void
}) => {
    const isExpense = t.type === 'expense';
    const wallet = wallets.find(w => w.id === t.walletId);

    // Icon Logic (Match DashboardRecentTransactions)
    const categoryData = categoryDetails(t.category);
    const CategoryIcon = getCategoryIcon(categoryData.icon);

    // Merchant Logic
    const merchantVisuals = getMerchantVisuals(t.merchant || t.description);
    const [logoSource, setLogoSource] = useState<'clearbit' | 'google' | 'icon'>('clearbit');

    // Reset state when transaction changes
    React.useEffect(() => {
        setLogoSource('clearbit');
    }, [t.id, t.merchant, t.description]);

    const primaryLogo = merchantVisuals?.domain ? getMerchantLogoUrl(merchantVisuals.domain) : null;
    const backupLogo = merchantVisuals?.domain ? getBackupLogoUrl(merchantVisuals.domain) : null;

    const DefaultIcon = merchantVisuals?.icon || CategoryIcon;
    const iconColor = merchantVisuals?.color || categoryData.color;
    const iconBg = merchantVisuals?.bgColor || categoryData.bg_color || "bg-secondary";

    return (
        <tr className="hover:bg-muted/50 transition-all group">
            {/* 1. Tanggal */}
            <td className="p-4 pl-8 text-xs font-medium text-muted-foreground whitespace-nowrap align-middle">
                {format(parseISO(t.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}
            </td>

            {/* 2. Transaksi (Logo + Description) */}
            <td className="p-4 align-middle">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-border shadow-sm overflow-hidden transition-transform group-hover:scale-105",
                        iconBg
                    )}>
                        {primaryLogo && logoSource === 'clearbit' && (
                            <img
                                src={primaryLogo}
                                alt=""
                                className="h-full w-full object-cover animate-in fade-in duration-500"
                                onError={() => setLogoSource('google')}
                            />
                        )}
                        {backupLogo && logoSource === 'google' && (
                            <img
                                src={backupLogo}
                                alt=""
                                className="h-6 w-6 object-contain animate-in zoom-in-50 duration-300"
                                onError={() => setLogoSource('icon')}
                            />
                        )}
                        {(logoSource === 'icon' || !merchantVisuals?.domain) && (
                            React.createElement(DefaultIcon, {
                                className: cn("h-5 w-5", iconColor)
                            })
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <div className="font-medium text-foreground text-sm leading-tight truncate max-w-[200px] md:max-w-[300px]">
                            {t.description || t.category}
                        </div>
                        {t.location && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                <span className="truncate">{t.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* 3. Kategori (Terpisah) */}
            <td className="p-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg w-fit border border-border">
                        {t.category}
                    </span>
                    {t.subCategory && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 ml-1">
                            <CornerDownRight className="w-2.5 h-2.5" />
                            <span>{t.subCategory}</span>
                        </div>
                    )}
                </div>
            </td>

            {/* 4. Metode (Wallet) */}
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", wallet?.color || 'bg-muted')} />
                    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                        {wallet?.name || '-'}
                    </span>
                </div>
            </td>

            {/* 5. Nominal */}
            <td className={cn(
                "p-4 text-right font-medium text-sm tabular-nums tracking-tight",
                isExpense ? "text-destructive" : "text-success"
            )}>
                <div className="flex items-center justify-end gap-1.5">
                    {isExpense ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    {formatCurrency(t.amount)}
                </div>
                {isExpense && t.isNeed === false && (
                    <span className="text-[9px] font-bold text-accent-foreground/70 uppercase tracking-tighter block mt-0.5">
                        Gaya Hidup
                    </span>
                )}
            </td>

            {/* 6. Aksi */}
            <td className="p-4 text-right pr-8">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => { triggerHaptic('light'); openEditTransactionModal(t); }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { triggerHaptic('medium'); openDeleteModal(t); }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export const DesktopTransactionTable = ({ transactions, wallets }: DesktopTransactionTableProps) => {
    const { openEditTransactionModal, openDeleteModal } = useUI();
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date', direction: 'desc' });

    const sortedTransactions = useMemo(() => {
        const sortableItems = [...transactions];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Transaction];
                let bValue: any = b[sortConfig.key as keyof Transaction];

                if (sortConfig.key === 'wallet') {
                    aValue = wallets.find(w => w.id === a.walletId)?.name || '';
                    bValue = wallets.find(w => w.id === b.walletId)?.name || '';
                }

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
    }, [transactions, sortConfig, wallets]);

    const handleSort = (key: keyof Transaction | 'wallet') => {
        triggerHaptic('light');
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
        triggerHaptic('medium');
        const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Metode', 'Tipe', 'Jumlah'];
        const rows = transactions.map(t => [
            format(parseISO(t.date), 'yyyy-MM-dd'),
            `"${t.description.replace(/"/g, '""')}"`,
            t.category,
            wallets.find(w => w.id === t.walletId)?.name || '',
            t.type,
            t.amount
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
                    className="gap-2 h-10 rounded-lg px-4 border-border hover:bg-muted transition-all font-medium text-[10px] uppercase tracking-widest"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                </Button>
            </div>
            <div className="overflow-hidden rounded-lg bg-card shadow-card border border-border">
                <table className="w-full text-sm text-left table-fixed">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="p-4 pl-8 cursor-pointer hover:text-primary transition-colors font-medium text-[10px] uppercase tracking-[0.15em] w-32" onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-2">
                                    Tanggal
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-primary transition-colors font-medium text-[10px] uppercase tracking-[0.15em]" onClick={() => handleSort('description')}>
                                <div className="flex items-center gap-2">
                                    Transaksi
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-primary transition-colors font-medium text-[10px] uppercase tracking-[0.15em] w-44" onClick={() => handleSort('category')}>
                                <div className="flex items-center gap-2">
                                    Kategori
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-4 cursor-pointer hover:text-primary transition-colors font-medium text-[10px] uppercase tracking-[0.15em] w-40" onClick={() => handleSort('wallet')}>
                                <div className="flex items-center gap-2">
                                    Metode
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-4 text-right cursor-pointer hover:text-primary transition-colors font-medium text-[10px] uppercase tracking-[0.15em] w-40" onClick={() => handleSort('amount')}>
                                <div className="flex items-center justify-end gap-2">
                                    Nominal
                                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                                </div>
                            </th>
                            <th className="p-4 text-right pr-8 font-medium text-[10px] uppercase tracking-[0.15em] w-24">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedTransactions.map((t) => (
                            <TransactionRow
                                key={t.id}
                                t={t}
                                wallets={wallets}
                                openEditTransactionModal={openEditTransactionModal}
                                openDeleteModal={openDeleteModal}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
