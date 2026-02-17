'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet as WalletIcon, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Target, Search } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useUI } from '@/components/ui-provider';
import type { Wallet } from '@/types/models';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { usePaginatedTransactions } from '@/features/transactions/hooks/use-paginated-transactions';
import { parseISO, subDays, isAfter, startOfDay, endOfDay } from 'date-fns';

interface DesktopWalletViewProps {
    wallets: Wallet[];
    activeIndex: number;
    setActiveIndex: (index: number) => void;
}

export const DesktopWalletView = ({ wallets, activeIndex, setActiveIndex }: DesktopWalletViewProps) => {
    const { openEditWalletModal } = useUI();
    const { isBalanceVisible } = useBalanceVisibility();
    
    // For 30-day overview (all wallets)
    const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30), []);
    const { transactions: recentTransactions } = useRangeTransactions(thirtyDaysAgo, new Date());
    
    const activeWallet = wallets[activeIndex];
    
    // For the specific wallet's transaction list (paginated)
    const { 
        transactions: walletTransactions, 
        isLoading: isTransactionsLoading,
        hasMore,
        loadMore
    } = usePaginatedTransactions(useMemo(() => ({
        walletId: activeWallet ? [activeWallet.id] : []
    }), [activeWallet]));

    const activeWalletVisuals = activeWallet ? getWalletVisuals(activeWallet.name, activeWallet.icon || undefined) : null;

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

    const { income30, expense30 } = useMemo(() => {
        let income = 0;
        let expense = 0;

        recentTransactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
            }
        });

        return { income30: income, expense30: expense };
    }, [recentTransactions]);

    const activeAnalytics = useMemo(() => {
        if (!activeWallet) return { income30: 0, expense30: 0 };
        let income = 0;
        let expense = 0;
        
        // Use recentTransactions which already contains the last 30 days
        recentTransactions.filter(t => t.walletId === activeWallet.id).forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });
        return { income30: income, expense30: expense };
    }, [recentTransactions, activeWallet]);

    const getHealth = (wallet?: Wallet) => {
        if (!wallet) return { label: 'Tidak ada', variant: 'secondary' as const };
        if (wallet.balance <= 0) return { label: 'Kritis', variant: 'destructive' as const };
        if (wallet.balance < 500000) return { label: 'Perlu Perhatian', variant: 'secondary' as const };
        return { label: 'Sehat', variant: 'success' as const };
    };
    
    // Helper for badge className since variant='success' might not be standard in our Badge component yet
    const getHealthBadgeClass = (variant: string) => {
        switch(variant) {
            case 'destructive': return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
            case 'success': return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20";
            case 'secondary': return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20";
            default: return "";
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {/* Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary to-primary/80 border-none text-primary-foreground shadow-lg shadow-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">Total Aset</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-medium tracking-tight">
                            {isBalanceVisible ? formatCurrency(totalBalance) : "Rp •••••••••"}
                        </div>
                        <p className="text-xs opacity-75 mt-1 font-medium">
                            {wallets.length} Dompet Aktif
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pemasukan (30 Hari)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/10 rounded-md">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-medium tracking-tight text-foreground">
                                {formatCurrency(income30)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pengeluaran (30 Hari)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-rose-500/10 rounded-md">
                                <TrendingDown className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="text-2xl font-medium tracking-tight text-foreground">
                                {formatCurrency(expense30)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6 min-h-0">
                {/* Left Side: Wallet List */}
                <Card className="flex flex-col border-none shadow-sm bg-background/50 backdrop-blur-sm h-full overflow-hidden">
                    <div className="p-4 border-b space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium tracking-tight flex items-center gap-2">
                                Dompet Saya
                                <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-xs">{filteredWallets.length}</Badge>
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                    {sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSort(prev => prev === 'name' ? 'balance' : 'name')}>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari aset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-muted/50 border-none h-9 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {filteredWallets.map((wallet) => {
                            const { Icon } = getWalletVisuals(wallet.name, wallet.icon || undefined);
                            const isActive = wallets.indexOf(wallet) === activeIndex;
                            const health = getHealth(wallet);

                            return (
                                <motion.button
                                    key={wallet.id}
                                    onClick={() => setActiveIndex(wallets.indexOf(wallet))}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group",
                                        isActive 
                                            ? "bg-card border-primary/20 shadow-sm ring-1 ring-primary/10" 
                                            : "bg-transparent border-transparent hover:bg-muted/50"
                                    )}
                                    whileHover={{ scale: 0.99 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2.5 rounded-lg transition-colors", 
                                            isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className={cn("text-sm font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                                                {wallet.name}
                                            </span>
                                            <span className={cn(
                                                "text-sm font-medium tracking-tight", 
                                                isActive ? "text-primary" : "text-foreground",
                                                !isBalanceVisible && "blur-sm"
                                            )}>
                                                {isBalanceVisible ? formatCurrency(wallet.balance) : "Rp ••••••"}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 h-5 border font-medium", getHealthBadgeClass(health.variant))}>
                                        {health.label}
                                    </Badge>
                                </motion.button>
                            );
                        })}
                    </div>
                </Card>

                {/* Right Side: Detail & Transactions */}
                <Card className="flex flex-col border-none shadow-sm overflow-hidden bg-card/80 backdrop-blur-sm h-full">
                    {activeWallet ? (
                        <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as 'transactions' | 'analytics' | 'settings')} className="flex flex-col h-full">
                            <div className="p-6 border-b bg-card/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        {activeWalletVisuals && (
                                            <div 
                                                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-[image:var(--wallet-gradient)]"
                                                style={{ 
                                                    '--wallet-gradient': `linear-gradient(to bottom right, ${activeWalletVisuals.gradient.from}, ${activeWalletVisuals.gradient.to})` 
                                                } as React.CSSProperties}
                                            >
                                                <activeWalletVisuals.Icon className={cn("h-7 w-7", activeWalletVisuals.textColor)} />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-medium tracking-tight">{activeWallet.name}</h3>
                                                <Badge variant="outline" className={cn("text-[10px] border", getHealthBadgeClass(getHealth(activeWallet).variant))}>
                                                    {getHealth(activeWallet).label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Detail dan riwayat transaksi</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Saldo</div>
                                        <h4 className={cn("text-2xl font-medium tracking-tight text-primary", !isBalanceVisible && "blur-md")}>
                                            {isBalanceVisible ? formatCurrency(activeWallet.balance) : "Rp •••••••••"}
                                        </h4>
                                    </div>
                                </div>

                                <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full lg:w-fit grid grid-cols-3">
                                    <TabsTrigger value="transactions" className="h-full rounded-xl font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Riwayat</TabsTrigger>
                                    <TabsTrigger value="analytics" className="h-full rounded-xl font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Insight</TabsTrigger>
                                    <TabsTrigger value="settings" className="h-full rounded-xl font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Pengaturan</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 min-h-0 bg-background/50">
                                <TabsContent value="transactions" className="h-full m-0 p-0 relative">
                                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar px-6 py-4">
                                        <TransactionList 
                                            transactions={walletTransactions} 
                                            isLoading={isTransactionsLoading}
                                            hasMore={hasMore}
                                            loadMore={loadMore}
                                        />
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="analytics" className="h-full m-0 p-6 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-none">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="p-3 bg-emerald-500/10 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-600/80 uppercase tracking-wider">Pemasukan</p>
                                                    <p className="text-xl font-medium text-emerald-700 dark:text-emerald-500">{formatCurrency(activeAnalytics.income30)}</p>
                                                    <p className="text-[10px] text-muted-foreground">30 Hari terakhir</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-rose-500/5 border-rose-500/20 shadow-none">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="p-3 bg-rose-500/10 rounded-lg">
                                                    <TrendingDown className="h-5 w-5 text-rose-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-rose-600/80 uppercase tracking-wider">Pengeluaran</p>
                                                    <p className="text-xl font-medium text-rose-700 dark:text-rose-500">{formatCurrency(activeAnalytics.expense30)}</p>
                                                    <p className="text-[10px] text-muted-foreground">30 Hari terakhir</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        
                                        <Card className="col-span-full border-dashed bg-muted/20 shadow-none">
                                            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                                                <div className="p-3 bg-background rounded-full shadow-sm">
                                                    <Target className="h-6 w-6 text-primary" />
                                                </div>
                                                <h3 className="font-medium text-sm">Analitik Lanjutan Segera Hadir</h3>
                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                    Kami sedang menyiapkan fitur analitik mendalam untuk membantu Anda memahami pertumbuhan aset dengan lebih baik.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="settings" className="h-full m-0 p-6 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-md space-y-6 mx-auto">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-medium">Pengaturan Dompet</h3>
                                                <p className="text-sm text-muted-foreground">Ubah informasi dasar atau hapus dompet ini.</p>
                                            </div>
                                            
                                            <Card>
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <div className="font-medium text-sm">Edit Informasi</div>
                                                            <div className="text-xs text-muted-foreground">Ubah nama, ikon, atau saldo awal.</div>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => openEditWalletModal(activeWallet)}>
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-destructive/30 bg-destructive/5">
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-sm text-destructive">Hapus Dompet</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Tindakan ini tidak dapat dibatalkan. Semua transaksi terkait akan dihapus.
                                                        </div>
                                                    </div>
                                                    <Button variant="destructive" size="sm" className="w-full">
                                                        Hapus Dompet Ini
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <WalletIcon className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">Pilih Dompet</h3>
                            <p className="text-sm max-w-xs mt-1">Pilih salah satu dompet dari daftar di sebelah kiri untuk melihat detailnya.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
