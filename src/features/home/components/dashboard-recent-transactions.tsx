'use client';

import React, { useState, useEffect } from 'react';
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
import { getMerchantVisuals, getMerchantLogoUrl, getBackupLogoUrl } from '@/lib/merchant-utils';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

// Separate row component to manage local state for each logo fallback
const TransactionRow = ({ t, wallet, handleRowClick }: { t: Transaction, wallet: Wallet | undefined, handleRowClick: (t: Transaction) => void }) => {
    const categoryData = categoryDetails(t.category);
    const CategoryIcon = getCategoryIcon(categoryData.icon);
    const dateObj = parseISO(t.date);

    // Merchant Logic
    const merchantVisuals = getMerchantVisuals(t.merchant || t.description);
    const [logoSource, setLogoSource] = useState<'clearbit' | 'google' | 'icon'>('clearbit');

    // Reset state when transaction changes (important for list re-renders)
    useEffect(() => {
        setLogoSource('clearbit');
    }, [t.id, t.merchant, t.description]);

    const primaryLogo = merchantVisuals?.domain ? getMerchantLogoUrl(merchantVisuals.domain) : null;
    const backupLogo = merchantVisuals?.domain ? getBackupLogoUrl(merchantVisuals.domain) : null;

    const DefaultIcon = merchantVisuals?.icon || CategoryIcon;
    const iconColor = merchantVisuals?.color || categoryData.color;
    const iconBg = merchantVisuals?.bgColor || categoryData.bg_color || "bg-zinc-100";

    return (
        <tr
            onClick={() => handleRowClick(t)}
            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group cursor-pointer"
        >
            <td className="p-4 pl-6">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-11 h-11 rounded-md flex items-center justify-center shrink-0 shadow-sm border border-border transition-all group-hover:scale-110 overflow-hidden",
                        iconBg
                    )}>
                        {primaryLogo && logoSource === 'clearbit' && (
                            <img
                                src={primaryLogo}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={() => setLogoSource('google')}
                            />
                        )}
                        {backupLogo && logoSource === 'google' && (
                            <img
                                src={backupLogo}
                                alt=""
                                className="h-6 w-6 object-contain"
                                onError={() => setLogoSource('icon')}
                            />
                        )}
                        {(logoSource === 'icon' || !merchantVisuals?.domain) && (
                            <div className={cn("w-5 h-5", iconColor)}>
                                <DefaultIcon />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-foreground leading-tight truncate max-w-[200px] tracking-tight">
                            {t.description || t.category}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-2">
                            <span>{format(dateObj, 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>{format(dateObj, 'HH:mm')}</span>
                            {t.location && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-border" />
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
                        "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md w-fit mb-1 border",
                        categoryData.bg_color ? `${categoryData.bg_color} border-border` : "bg-secondary border-transparent",
                        categoryData.color
                    )}>
                        {t.category}
                    </span>
                    {t.subCategory ? (
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 ml-1">
                            <CornerDownRight className="w-3 h-3 text-muted-foreground/50" />
                            {t.subCategory}
                        </span>
                    ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/40 ml-1 italic">Umum</span>
                    )}
                </div>
            </td>

            <td className="p-4 text-xs font-medium text-muted-foreground align-middle">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", wallet?.color || 'bg-muted')} />
                    {wallet?.name || 'Dompet'}
                </div>
            </td>

            <td className="p-4 pr-6 text-right align-middle">
                <div className="flex flex-col items-end">
                    <span className={cn(
                        "font-medium tabular-nums text-sm tracking-tight",
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                    )}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                </div>
            </td>
        </tr>
    );
};

export const DashboardRecentTransactions = ({ transactions, wallets }: DashboardRecentTransactionsProps) => {
    const router = useRouter();

    const handleRowClick = (transaction: Transaction) => {
        triggerHaptic('light');
    };

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                    <tr>
                        <th className="p-5 pl-6 font-medium text-[10px] uppercase tracking-[0.15em]">Detail Transaksi</th>
                        <th className="p-5 font-medium text-[10px] uppercase tracking-[0.15em]">Kategori / Sub</th>
                        <th className="p-5 font-medium text-[10px] uppercase tracking-[0.15em]">Sumber Dana</th>
                        <th className="p-5 text-right pr-6 font-medium text-[10px] uppercase tracking-[0.15em]">Nominal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground italic">
                                Belum ada data transaksi yang ditemukan.
                            </td>
                        </tr>
                    )}
                    {transactions.map((t) => (
                        <TransactionRow
                            key={t.id}
                            t={t}
                            wallet={wallets.find(w => w.id === t.walletId)}
                            handleRowClick={handleRowClick}
                        />
                    ))}
                </tbody>
            </table>

            <div className="bg-muted/20 border-t border-border p-3 text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/transactions')}
                    className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                    Lihat Riwayat Lengkap
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
            </div>
        </div>
    );
};
