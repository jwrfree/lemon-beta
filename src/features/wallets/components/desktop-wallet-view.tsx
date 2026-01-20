'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Wallet as WalletIcon, MoreVertical, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useUI } from '@/components/ui-provider';
import type { Wallet } from '@/types/models';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useData } from '@/hooks/use-data';
import { parseISO, subDays, isAfter } from 'date-fns';

interface DesktopWalletViewProps {
    wallets: Wallet[];
    activeIndex: number;
    setActiveIndex: (index: number) => void;
}

export const DesktopWalletView = ({ wallets, activeIndex, setActiveIndex }: DesktopWalletViewProps) => {
    const { setIsWalletModalOpen, openEditWalletModal } = useUI();
    const { isBalanceVisible } = useBalanceVisibility();
    const { transactions } = useData();
    const activeWallet = wallets[activeIndex];

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'name' | 'balance'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [panelTab, setPanelTab] = useState<'transactions' | 'analytics' | 'settings'>('transactions');

    const totalBalance = useMemo(
        () => wallets.reduce((acc, w) => acc + w.balance, 0),
        [wallets]
    );

    const filteredWallets = useMemo(() => {
        const term = search.toLowerCase();
        const list = wallets.filter(w => w.name.toLowerCase().includes(term));
        return list.sort((a, b) => {
            if (sort === 'name') {
                return sortDir === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            return sortDir === 'asc' ? a.balance - b.balance : b.balance - a.balance;
        });
    }, [wallets, search, sort, sortDir]);

    const walletTransactions = useMemo(() => {
        if (!activeWallet) return [];
        return transactions.filter(t => t.walletId === activeWallet.id);
    }, [transactions, activeWallet]);

    const analytics = useMemo(() => {
        if (!activeWallet) return { income30: 0, expense30: 0 };
        const now = new Date();
        const start = subDays(now, 30);
        let income30 = 0;
        let expense30 = 0;
        walletTransactions.forEach(t => {
            const date = parseISO(t.date);
            if (!isAfter(date, start)) return;
            if (t.type === 'income') income30 += t.amount;
            else expense30 += t.amount;
        });
        return { income30, expense30 };
    }, [walletTransactions, activeWallet]);

    const getHealth = (wallet?: Wallet) => {
        if (!wallet) return { label: 'Tidak ada', tone: 'bg-muted text-muted-foreground' };
        if (wallet.balance <= 0) return { label: 'Kritis', tone: 'bg-destructive/15 text-destructive' };
        if (wallet.balance < 500000) return { label: 'Was-was', tone: 'bg-amber-100 text-amber-700' };
        return { label: 'Sehat', tone: 'bg-emerald-100 text-emerald-700' };
    };

    return (
        <div className="flex h-full min-h-[calc(100vh-160px)] gap-6 p-6 max-w-6xl lg:max-w-7xl mx-auto w-full">
            <div className="flex-1 flex flex-col gap-4">
                {/* Summary Bar */}
                <div className="rounded-2xl border bg-card p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Saldo</p>
                        <p className={cn("text-3xl font-bold", !isBalanceVisible && "blur-sm")}>
                            {isBalanceVisible ? formatCurrency(totalBalance) : "Rp ••••••"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{wallets.length} dompet aktif</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <BalanceVisibilityToggle variant="ghost" size="icon" />
                        <Button onClick={() => setIsWalletModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Dompet
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 h-full">
                    {/* Left Side: Wallet List */}
                    <div className="rounded-2xl border bg-background shadow-sm flex flex-col min-h-[400px] max-h-[calc(100vh-220px)]">
                        <div className="p-4 border-b space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold">Dompet Saya</h2>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
                                }} title="Urutkan">
                                    {sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Cari dompet..."
                                        value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9"
                                />
                                <Button variant="outline" size="icon" title="Sortir nama/saldo" onClick={() => setSort(prev => prev === 'name' ? 'balance' : 'name')}>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {filteredWallets.map((wallet, index) => {
                                const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon);
                                const isActive = wallets.indexOf(wallet) === activeIndex;

                                return (
                                    <div
                                        key={wallet.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setActiveIndex(wallets.indexOf(wallet))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setActiveIndex(wallets.indexOf(wallet));
                                            }
                                        }}
                                        className={cn(
                                            "w-full text-left rounded-xl border bg-card p-3 transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                                            isActive ? "border-primary ring-1 ring-primary/30" : "border-border"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg bg-muted", textColor.replace('text-', 'text-muted-'))}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{wallet.name}</p>
                                                    <p className={cn("text-sm font-bold text-foreground/80", !isBalanceVisible && "blur-sm")}>
                                                        {isBalanceVisible ? formatCurrency(wallet.balance) : "Rp ••••••"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditWalletModal(wallet);
                                                }}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Transactions */}
                    <div className="flex-1 flex flex-col bg-card rounded-2xl border shadow-sm overflow-hidden min-h-[400px] max-h-[calc(100vh-220px)]">
                        {activeWallet ? (
                            <Tabs value={panelTab} onValueChange={(v: any) => setPanelTab(v)} className="flex flex-col h-full">
                                <div className="p-6 border-b bg-muted/30 flex flex-col gap-3 sticky top-0 z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <h3 className="text-lg font-semibold">{activeWallet.name}</h3>
                                            <p className="text-xs text-muted-foreground">Riwayat & detail dompet</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Saldo dompet</p>
                                            <p className={cn("text-sm font-bold", !isBalanceVisible && "blur-sm")}>
                                                {isBalanceVisible ? formatCurrency(activeWallet.balance) : "Rp ••••••"}
                                            </p>
                                            <span className={cn("text-[11px] px-2 py-0.5 rounded-full inline-block mt-1", getHealth(activeWallet).tone)}>
                                                {getHealth(activeWallet).label}
                                            </span>
                                        </div>
                                    </div>
                                    <TabsList className="w-full grid grid-cols-3">
                                        <TabsTrigger value="transactions">Transaksi</TabsTrigger>
                                        <TabsTrigger value="analytics">Analitik</TabsTrigger>
                                        <TabsTrigger value="settings">Atur</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="transactions" className="flex-1 overflow-y-auto p-0">
                                    <TransactionList walletId={activeWallet.id} />
                                </TabsContent>
                                <TabsContent value="analytics" className="flex-1 overflow-y-auto p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border bg-muted/40">
                                            <p className="text-xs text-muted-foreground">Pemasukan 30 hari</p>
                                            <p className="text-lg font-semibold">{formatCurrency(analytics.income30)}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/40">
                                            <p className="text-xs text-muted-foreground">Pengeluaran 30 hari</p>
                                            <p className="text-lg font-semibold text-destructive">{formatCurrency(analytics.expense30)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4">Analitik lanjutan bisa ditambahkan (trend, kategori, dll.).</p>
                                </TabsContent>
                                <TabsContent value="settings" className="flex-1 overflow-y-auto p-6">
                                    <div className="space-y-3">
                                        <Button variant="outline" onClick={() => openEditWalletModal(activeWallet)}>
                                            Ubah Dompet
                                        </Button>
                                        <p className="text-xs text-muted-foreground">Aksi lain seperti arsip/gabung dompet bisa ditambahkan di sini.</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <WalletIcon className="h-12 w-12 mb-4 opacity-20" />
                                <p>Pilih dompet untuk melihat detail transaksi</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
