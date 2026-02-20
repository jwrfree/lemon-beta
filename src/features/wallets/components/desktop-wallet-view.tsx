'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet as WalletIcon, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Target, Search, Sparkles } from 'lucide-react';
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
    const [filter, setFilter] = useState<string>('all');
    const [panelTab, setPanelTab] = useState<'transactions' | 'analytics' | 'settings'>('transactions');

    const totalBalance = useMemo(
        () => wallets.reduce((acc, w) => acc + w.balance, 0),
        [wallets]
    );

    const filteredWallets = useMemo(() => {
        const term = search.toLowerCase();
        let list = wallets.filter(w => w.name.toLowerCase().includes(term));

        if (filter !== 'all') {
            list = list.filter(w => w.icon === filter);
        }

        return list.sort((a, b) => {
            if (sort === 'name') {
                return sortDir === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            return sortDir === 'asc' ? a.balance - b.balance : b.balance - a.balance;
        });
    }, [wallets, search, sort, sortDir, filter]);

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
        switch (variant) {
            case 'destructive': return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
            case 'success': return "bg-success/10 text-success hover:bg-success/20 border-success/20";
            case 'secondary': return "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20";
            default: return "";
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {/* Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="col-span-1 md:col-span-2 bg-[#064e4b] border-none text-white shadow-xl shadow-primary/10 overflow-hidden relative rounded-2xl p-6">
                    <div className="absolute top-0 right-0 p-6 opacity-10 -rotate-12">
                        <WalletIcon className="h-24 w-24" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-1">
                            <CardTitle className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em]">Total Kekayaan Bersih</CardTitle>
                            <div className="text-4xl font-bold tracking-tight py-1 transition-all">
                                {isBalanceVisible ? formatCurrency(totalBalance) : "Rp •••••••••"}
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-medium leading-relaxed">
                                Asetmu tumbuh <b>4.2%</b> bulan ini. Kamu punya <b>{wallets.length} dompet</b> yang terapung aman.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="shadow-sm border-border/50 rounded-2xl p-6 flex flex-col justify-between bg-card/50">
                    <div className="space-y-1">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Pemasukan</CardTitle>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <div className="text-2xl font-bold tracking-tight text-foreground">
                                {formatCurrency(income30)}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">30 Hari Terakhir</p>
                    </div>
                </Card>

                <Card className="shadow-sm border-border/50 rounded-2xl p-6 flex flex-col justify-between bg-card/50">
                    <div className="space-y-1">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Pengeluaran</CardTitle>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            <div className="text-2xl font-bold tracking-tight text-foreground">
                                {formatCurrency(expense30)}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">30 Hari Terakhir</p>
                    </div>
                </Card>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-8 min-h-0">
                {/* Left Side: Wallet List */}
                <Card className="flex flex-col border border-border/50 shadow-sm bg-card/30 backdrop-blur-md h-full overflow-hidden rounded-2xl">
                    <div className="p-6 border-b space-y-6 bg-card/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                Dompet
                                <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-bold bg-primary/10 text-primary border-none">{filteredWallets.length}</Badge>
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                    {sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setSort(prev => prev === 'name' ? 'balance' : 'name')}>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Cari aset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-muted/30 border-none h-10 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
                            {[
                                { id: 'all', label: 'Semua' },
                                { id: 'bank', label: 'Bank' },
                                { id: 'e-wallet', label: 'E-Wallet' },
                                { id: 'cash', label: 'Tunai' },
                                { id: 'investment', label: 'Investasi' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                                        filter === f.id
                                            ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
                                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredWallets.map((wallet) => {
                            const { Icon, logo } = getWalletVisuals(wallet.name, wallet.icon || undefined);
                            const isActive = wallets.indexOf(wallet) === activeIndex;
                            const health = getHealth(wallet);

                            return (
                                <motion.button
                                    key={wallet.id}
                                    onClick={() => setActiveIndex(wallets.indexOf(wallet))}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between group h-20",
                                        isActive
                                            ? "bg-card border-primary/30 shadow-md shadow-primary/5 ring-1 ring-primary/5"
                                            : "bg-transparent border-transparent hover:bg-muted/30"
                                    )}
                                    whileHover={{ scale: 0.992 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={cn(
                                            "flex-shrink-0 h-12 w-12 rounded-xl transition-all flex items-center justify-center overflow-hidden shadow-sm",
                                            isActive ? "bg-primary text-white scale-105" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10 group-hover:text-foreground"
                                        )}>
                                            {logo ? (
                                                <div className="p-2 w-full h-full flex items-center justify-center bg-white">
                                                    <img
                                                        src={logo}
                                                        alt={wallet.name}
                                                        className="h-full w-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const icon = e.currentTarget.nextElementSibling;
                                                            if (icon) icon.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <Icon className="h-6 w-6 hidden" />
                                                </div>
                                            ) : (
                                                <Icon className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className={cn("text-xs font-bold uppercase tracking-widest truncate mb-1", isActive ? "text-primary" : "text-muted-foreground/60")}>
                                                {wallet.name}
                                            </span>
                                            <span className={cn(
                                                "text-xl font-bold tracking-tight tabular-nums",
                                                isActive ? "text-foreground" : "text-foreground/80",
                                                !isBalanceVisible && "blur-sm"
                                            )}>
                                                {isBalanceVisible ? formatCurrency(wallet.balance) : "Rp ••••••"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full animate-pulse",
                                            health.variant === 'success' ? 'bg-success' : health.variant === 'destructive' ? 'bg-destructive' : 'bg-warning'
                                        )} />
                                        <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-50")}>
                                            {health.label}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </Card>

                {/* Right Side: Detail & Transactions */}
                <Card className="flex flex-col border-none shadow-card overflow-hidden bg-card/80 backdrop-blur-sm h-full">
                    {activeWallet ? (
                        <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as 'transactions' | 'analytics' | 'settings')} className="flex flex-col h-full">
                            <div className="p-6 border-b bg-card/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        {activeWalletVisuals && (
                                            <div
                                                className="w-14 h-14 rounded-lg flex items-center justify-center shadow-sm bg-[image:var(--wallet-gradient)] overflow-hidden"
                                                style={{
                                                    '--wallet-gradient': `linear-gradient(to bottom right, ${activeWalletVisuals.gradient.from}, ${activeWalletVisuals.gradient.to})`
                                                } as React.CSSProperties}
                                            >
                                                {activeWalletVisuals.logo ? (
                                                    <>
                                                        <img
                                                            src={activeWalletVisuals.logo}
                                                            alt={activeWallet.name}
                                                            className="h-8 w-8 object-contain rounded-full bg-white/90 p-0.5"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const icon = e.currentTarget.nextElementSibling;
                                                                if (icon) icon.classList.remove('hidden');
                                                            }}
                                                        />
                                                        <activeWalletVisuals.Icon className={cn("h-7 w-7 hidden", activeWalletVisuals.textColor)} />
                                                    </>
                                                ) : (
                                                    <activeWalletVisuals.Icon className={cn("h-7 w-7", activeWalletVisuals.textColor)} />
                                                )}
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

                                <TabsList className="bg-muted p-1 rounded-lg h-14 w-full lg:w-fit grid grid-cols-3">
                                    <TabsTrigger value="transactions" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Riwayat</TabsTrigger>
                                    <TabsTrigger value="analytics" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Insight</TabsTrigger>
                                    <TabsTrigger value="settings" className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Pengaturan</TabsTrigger>
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
                                        <Card className="bg-success/5 border-success/20 shadow-none">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="p-3 bg-success/10 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-success" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-success/80 uppercase tracking-wider">Pemasukan</p>
                                                    <p className="text-xl font-medium text-foreground">{formatCurrency(activeAnalytics.income30)}</p>
                                                    <p className="text-[10px] text-muted-foreground">30 Hari terakhir</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-destructive/5 border-destructive/20 shadow-none">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="p-3 bg-destructive/10 rounded-lg">
                                                    <TrendingDown className="h-5 w-5 text-destructive" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-destructive/80 uppercase tracking-wider">Pengeluaran</p>
                                                    <p className="text-xl font-medium text-foreground">{formatCurrency(activeAnalytics.expense30)}</p>
                                                    <p className="text-[10px] text-muted-foreground">30 Hari terakhir</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="col-span-full border-dashed bg-muted/20 shadow-none border-border">
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
