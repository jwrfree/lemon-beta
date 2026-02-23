'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet as WalletIcon, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Target, Search, Sparkles } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useUI } from '@/components/ui-provider';
import { useActions } from '@/providers/action-provider';
import type { Wallet } from '@/types/models';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { usePaginatedTransactions } from '@/features/transactions/hooks/use-paginated-transactions';
import { parseISO, subDays, isAfter, startOfDay, endOfDay } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';

interface DesktopWalletViewProps {
    wallets: Wallet[];
    activeIndex: number;
    setActiveIndex: (index: number) => void;
}

export const DesktopWalletView = ({ wallets, activeIndex, setActiveIndex }: DesktopWalletViewProps) => {
    const { openEditWalletModal, showToast } = useUI();
    const { deleteWallet } = useActions();
    const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();
    const [isDeleting, setIsDeleting] = useState(false);

    // Safety: If wallets are deleted, ensure activeIndex is still valid
    React.useEffect(() => {
        if (wallets.length > 0 && activeIndex >= wallets.length) {
            setActiveIndex(wallets.length - 1);
        }
    }, [wallets.length, activeIndex, setActiveIndex]);

    // For 30-day overview (all wallets)
    const { thirtyDaysAgo, today } = useMemo(() => ({
        thirtyDaysAgo: subDays(new Date(), 30),
        today: new Date()
    }), []);
    const { transactions: recentTransactions } = useRangeTransactions(thirtyDaysAgo, today);

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
        <div className="flex flex-col space-y-6 p-6 max-w-[1600px] mx-auto w-full min-h-screen">
            {/* 1. EMPOWERING HERO HEADER - Compact Command Center */}
            <header className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-5 relative overflow-hidden rounded-lg bg-teal-950 p-6 shadow-card min-h-[160px] flex flex-col justify-center">
                    {/* Subtle Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-medium text-teal-100/40 uppercase tracking-[0.4em]">Net Worth Portfolio</span>
                            <div className="flex items-center gap-3">
                                <h1 className={cn("text-4xl font-medium text-white tracking-tighter transition-all duration-300", !isBalanceVisible && "blur-xl")}>
                                    {isBalanceVisible ? formatCurrency(totalBalance) : "Rp •••••••••"}
                                </h1>
                                <button
                                    onClick={toggleBalanceVisibility}
                                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-white/30" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 relative">
                            {/* Visual Separator */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5" />
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-medium text-white/20 uppercase tracking-[0.3em]">Instruments</p>
                                    <p className="text-lg font-medium text-white">{wallets.length} <span className="text-[10px] font-normal opacity-30">Accounts</span></p>
                                </div>
                                <div className="h-8 w-[1px] bg-white/5" />
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-medium text-white/20 uppercase tracking-[0.3em]">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(var(--success),0.4)]" />
                                        <p className="text-lg font-medium text-white tracking-tight">Prime</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                    <Card className="bg-card shadow-card rounded-lg p-5 group flex flex-col justify-center border-none">
                        <div className="flex items-start justify-between mb-2">
                            <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Inflow</p>
                            <TrendingUp className="h-3.5 w-3.5 text-success" />
                        </div>
                        <p className="text-xl font-medium tracking-tight text-foreground">{formatCurrency(income30)}</p>
                    </Card>
                    <Card className="bg-card shadow-card rounded-lg p-5 group flex flex-col justify-center border-none">
                        <div className="flex items-start justify-between mb-2">
                            <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Outflow</p>
                            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                        </div>
                        <p className="text-xl font-medium tracking-tight text-foreground">{formatCurrency(expense30)}</p>
                    </Card>
                </div>

                <div className="lg:col-span-3 bg-secondary rounded-lg p-5 flex items-center gap-4 shadow-sm border-none">
                    <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0 opacity-80">
                        <Target className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[9px] uppercase tracking-widest text-primary mb-0.5">Wealth Goal</h4>
                        <p className="text-[10px] text-muted-foreground leading-tight opacity-70 truncate">Financial freedom target</p>
                        <Button variant="link" size="sm" className="h-auto p-0 text-[9px] uppercase font-medium tracking-widest text-primary mt-1">
                            Configure
                        </Button>
                    </div>
                </div>
            </header>

            {/* 2. DYNAMIC WORKSPACE GRID */}
            <main className="grid grid-cols-1 xl:grid-cols-[400px,1fr] gap-10 items-start">

                {/* LEFT NAVIGATOR: MASTER COLLECTION */}
                <div className="flex flex-col space-y-5 xl:sticky xl:top-6">
                    <div className="space-y-4 bg-card p-5 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground opacity-60">Portfolio Accounts</h2>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-secondary" onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                            </Button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-secondary border-none h-9 text-[11px] rounded-lg focus-visible:ring-primary/20 transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                            {['all', 'bank', 'e-wallet', 'cash', 'paylater', 'investasi'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-2.5 py-1.5 rounded-[6px] text-[8px] font-medium uppercase tracking-widest transition-all shrink-0 border-none",
                                        filter === f
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <AnimatePresence mode="popLayout">
                            {filteredWallets.map((wallet) => {
                                const { logo, Icon: CategoryIcon } = getWalletVisuals(wallet.name, wallet.icon || undefined);
                                const isActive = wallets.indexOf(wallet) === activeIndex;

                                return (
                                    <motion.div
                                        key={wallet.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => setActiveIndex(wallets.indexOf(wallet))}
                                        className={cn(
                                            "group cursor-pointer relative p-3 rounded-lg transition-all duration-300 flex items-center gap-4",
                                            isActive
                                                ? "bg-card shadow-sm ring-1 ring-primary/5"
                                                : "bg-transparent hover:bg-secondary/40"
                                        )}
                                        whileHover={{ x: 2 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-full p-0.5 bg-white shadow-sm flex items-center justify-center transition-all duration-500",
                                            isActive ? "ring-2 ring-primary/30 scale-105" : "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
                                        )}>
                                            {logo ? (
                                                <img src={logo} alt="" className="h-full w-full object-contain rounded-full" />
                                            ) : CategoryIcon ? (
                                                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <WalletIcon className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0">
                                                <p className={cn("text-[8px] font-medium uppercase tracking-[0.15em] truncate", isActive ? "text-primary" : "text-muted-foreground/60")}>
                                                    {wallet.name}
                                                </p>
                                                {wallet.isDefault && <div className="h-1 w-1 rounded-full bg-primary" />}
                                            </div>
                                            <p className={cn("text-base font-medium tracking-tighter tabular-nums", !isBalanceVisible && "blur-sm")}>
                                                {isBalanceVisible ? formatCurrency(wallet.balance) : "Rp ••••••"}
                                            </p>
                                        </div>

                                        <div
                                            className={cn("h-full w-1 rounded-full bg-primary absolute right-0 top-0 bottom-0 transition-all duration-500", isActive ? "opacity-100 scale-y-75" : "opacity-0 scale-y-0")}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT CANVAS: SELECTED ASSET INSIGHTS */}
                <div className="flex flex-col space-y-8 min-w-0">
                    {activeWallet ? (
                        <div className="space-y-8">
                            {/* Detailed Asset Header Card */}
                            <Card className="relative bg-card shadow-card rounded-lg overflow-hidden group border-none">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div
                                            className="h-16 w-16 rounded-lg shadow-sm flex items-center justify-center relative transition-all duration-500 group-hover:rotate-1"
                                            style={{
                                                background: activeWalletVisuals ? `linear-gradient(135deg, ${activeWalletVisuals.gradient.from}, ${activeWalletVisuals.gradient.to})` : 'hsl(var(--primary))'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {activeWalletVisuals?.logo ? (
                                                <img src={activeWalletVisuals.logo} className="h-8 w-8 object-contain rounded-full bg-white/95 p-1 shadow-md" alt="" />
                                            ) : activeWalletVisuals?.Icon ? (
                                                <activeWalletVisuals.Icon className="h-8 w-8 text-white" />
                                            ) : (
                                                <WalletIcon className="h-8 w-8 text-white" />
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-medium tracking-tighter text-foreground">{activeWallet.name}</h2>
                                                <Badge className={cn("rounded-full px-2 py-0.5 border-none text-[8px] font-medium uppercase tracking-widest", getHealthBadgeClass(getHealth(activeWallet).variant))}>
                                                    {getHealth(activeWallet).label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowUp className="h-2.5 w-2.5 text-success" />
                                                    <span className="text-[10px] font-medium tabular-nums text-foreground/60">{formatCurrency(activeAnalytics.income30)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowDown className="h-2.5 w-2.5 text-destructive" />
                                                    <span className="text-[10px] font-medium tabular-nums text-foreground/60">{formatCurrency(activeAnalytics.expense30)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end justify-center space-y-0.5 bg-secondary rounded-lg px-6 py-4">
                                        <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.3em] opacity-60">Liquid Balance</p>
                                        <h3 className={cn("text-3xl font-medium tracking-tighter text-foreground transition-all duration-300", !isBalanceVisible && "blur-xl")}>
                                            {isBalanceVisible ? formatCurrency(activeWallet.balance) : "Rp •••••••••"}
                                        </h3>
                                    </div>
                                </div>

                                {/* Custom Workspace Navigation */}
                                <div className="px-6 py-0 flex items-center justify-between bg-secondary/80">
                                    <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as any)} className="w-auto">
                                        <TabsList className="bg-transparent h-12 p-0 gap-8">
                                            {['transactions', 'analytics', 'settings'].map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab}
                                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground bg-transparent transition-all px-0 text-[10px] font-medium uppercase tracking-[0.4em] opacity-30 data-[state=active]:opacity-100"
                                                >
                                                    {tab}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-4 rounded-lg text-[9px] font-medium uppercase tracking-widest border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                                            onClick={() => openEditWalletModal(activeWallet)}
                                        >
                                            Modify
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Detailed Content Canvas */}
                            <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Tabs value={panelTab} className="w-full">
                                    <TabsContent value="transactions" className="m-0 p-0">
                                        <Card className="bg-card rounded-lg overflow-hidden border-none">
                                            <TransactionList
                                                transactions={walletTransactions}
                                                isLoading={isTransactionsLoading}
                                                hasMore={hasMore}
                                                loadMore={loadMore}
                                            />
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="analytics" className="m-0 p-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <Card className="p-6 bg-card rounded-lg shadow-sm space-y-6 border-none">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-40">Cashflow Stats</h4>
                                                    <Badge className="bg-primary/5 text-primary rounded-full px-3 py-1 text-[8px] border-none">30D</Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase opacity-40">Net Position</p>
                                                    <p className={cn("text-2xl font-medium tracking-tighter", (activeAnalytics.income30 - activeAnalytics.expense30) >= 0 ? "text-success" : "text-destructive")}>
                                                        {formatCurrency(activeAnalytics.income30 - activeAnalytics.expense30)}
                                                    </p>
                                                </div>
                                            </Card>

                                            <Card className="p-6 bg-card rounded-lg shadow-sm flex flex-col items-center justify-center text-center space-y-4 border-none">
                                                <div className="h-10 w-10 bg-primary/5 rounded-full flex items-center justify-center text-primary border-none">
                                                    <Sparkles className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-[9px] uppercase tracking-[0.2em]">Forecast</h4>
                                                    <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px] opacity-70">
                                                        AI Analyzing patterns...
                                                    </p>
                                                </div>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="m-0 p-0">
                                        <Card className="max-w-2xl mx-auto bg-card rounded-lg border border-border overflow-hidden shadow-card">
                                            <div className="p-10 space-y-10">
                                                <div className="space-y-3">
                                                    <h4 className="text-2xl font-bold tracking-tighter">Asset Control Center</h4>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">Kelola integrasi dan otorisasi untuk aset strategis {activeWallet.name}.</p>
                                                </div>

                                                <div className="space-y-5">
                                                    <div className="p-6 rounded-lg border border-border bg-secondary/40 flex items-center justify-between group hover:border-primary/20 transition-all">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold tracking-tight">Instrument Identity</p>
                                                            <p className="text-[11px] text-muted-foreground opacity-70">Manage labels, categories, and visual identification.</p>
                                                        </div>
                                                        <Button variant="outline" size="sm" className="rounded-lg text-[9px] font-semibold uppercase tracking-widest" onClick={() => openEditWalletModal(activeWallet)}>
                                                            Modify
                                                        </Button>
                                                    </div>

                                                    {activeWallet.name !== 'Tunai' ? (
                                                        <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5 flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-semibold text-destructive">Danger Zone</p>
                                                                <p className="text-xs text-muted-foreground text-destructive/60">Hapus aset ini secara permanen dari portofolio.</p>
                                                            </div>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm" className="rounded-lg text-[9px] font-semibold uppercase tracking-widest" disabled={isDeleting}>
                                                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terminate'}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="rounded-lg border-border/40">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="font-bold tracking-tight text-2xl">Yakin ingin menghapus ini?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-sm leading-relaxed">
                                                                            Tindakan ini permanen. {activeWallet.name} akan dihapus beserta seluruh referensi yang melampirinya. Saldo harus nol untuk melanjutkan.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter className="mt-6">
                                                                        <AlertDialogCancel className="rounded-lg">Kembali</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive hover:bg-destructive/90 rounded-lg"
                                                                            onClick={async () => {
                                                                                setIsDeleting(true);
                                                                                try {
                                                                                    await deleteWallet(activeWallet.id);
                                                                                } catch (err) {
                                                                                    console.error(err);
                                                                                } finally {
                                                                                    setIsDeleting(false);
                                                                                }
                                                                            }}
                                                                        >
                                                                            Ya, Hapus Aset
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    ) : (
                                                        <div className="p-6 bg-muted/20 rounded-lg border border-dashed border-border flex items-center justify-center">
                                                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground opacity-30">Protected System Wallet (Cash)</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    ) : (
                        <Card className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-card/20 border-dashed border-border/40 rounded-lg">
                            <div className="h-28 w-28 bg-muted/40 rounded-full flex items-center justify-center mb-8 shadow-inner">
                                <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tighter">Pusat Strategi Aset</h3>
                                <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed mx-auto">
                                    Silakan pilih salah satu instrument keuangan dari Master List di sebelah kiri untuk memulai audit dan analisis.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};
