'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Wallet as WalletIcon, MoreVertical, ArrowUpDown, ArrowDown, ArrowUp, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useUI } from '@/components/ui-provider';
import type { Wallet } from '@/types/models';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { Badge } from '@/components/ui/badge';
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
        <div className="flex flex-col h-full bg-muted/20">
            <div className="flex-1 flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full overflow-hidden">
                {/* Summary Header - New Visual Design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Saldo Aset</p>
                            <h2 className={cn("text-3xl font-black mt-1 tracking-tight", !isBalanceVisible && "blur-md")}>
                                {isBalanceVisible ? formatCurrency(totalBalance) : "Rp •••••••••"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm text-[10px] font-bold uppercase">
                                {wallets.length} Dompet Aktif
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pemasukan (30 Hari)</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
                                    {formatCurrency(wallets.reduce((acc, w) => acc + (transactions.filter(t => t.walletId === w.id && t.type === 'income' && isAfter(parseISO(t.date), subDays(new Date(), 30))).reduce((sum, t) => sum + t.amount, 0)), 0))}
                                </h3>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic mt-2">Total dari seluruh dompet aktif</p>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pengeluaran (30 Hari)</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                    <TrendingDown className="h-4 w-4 text-rose-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
                                    {formatCurrency(wallets.reduce((acc, w) => acc + (transactions.filter(t => t.walletId === w.id && t.type === 'expense' && isAfter(parseISO(t.date), subDays(new Date(), 30))).reduce((sum, t) => sum + t.amount, 0)), 0))}
                                </h3>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic mt-2">Monitoring arus kas keluar Anda</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 min-h-0">
                    {/* Left Side: Wallet List - Refined Card Style */}
                    <div className="flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight">Dompet Saya</h2>
                                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground uppercase">{filteredWallets.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                    {sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSort(prev => prev === 'name' ? 'balance' : 'name')}>
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <Input
                                placeholder="Cari aset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 rounded-2xl bg-card border-none shadow-sm pl-4 pr-10 focus-visible:ring-primary/20"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {filteredWallets.map((wallet) => {
                                const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon || undefined);
                                const isActive = wallets.indexOf(wallet) === activeIndex;
                                const health = getHealth(wallet);

                                return (
                                    <motion.div
                                        key={wallet.id}
                                        initial={false}
                                        whileHover={{ y: -2 }}
                                        className={cn(
                                            "relative group rounded-3xl p-4 transition-all cursor-pointer overflow-hidden border",
                                            isActive 
                                                ? "bg-card border-primary/40 shadow-md ring-1 ring-primary/10" 
                                                : "bg-card/50 border-transparent hover:bg-card hover:border-border shadow-sm"
                                        )}
                                        onClick={() => setActiveIndex(wallets.indexOf(wallet))}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-2xl transition-colors shadow-inner", 
                                                    isActive ? "bg-primary/10" : "bg-muted"
                                                )}>
                                                    <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold tracking-tight">{wallet.name}</span>
                                                    <span className={cn(
                                                        "text-lg font-black tracking-tighter", 
                                                        isActive ? "text-primary" : "text-foreground/80",
                                                        !isBalanceVisible && "blur-sm"
                                                    )}>
                                                        {isBalanceVisible ? formatCurrency(wallet.balance) : "Rp ••••••"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditWalletModal(wallet);
                                                    }}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                <span className={cn("text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider", health.tone)}>
                                                    {health.label}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Detail & Transactions - Integrated Design */}
                    <div className="flex flex-col min-h-0 bg-card rounded-[32px] border shadow-sm overflow-hidden">
                        {activeWallet ? (
                            <Tabs value={panelTab} onValueChange={(v: any) => setPanelTab(v)} className="flex flex-col h-full">
                                <div className="p-8 pb-4 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-5">
                                            {activeWalletVisuals && (
                                                <div 
                                                    className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner"
                                                    style={{ 
                                                        backgroundImage: `linear-gradient(to bottom right, ${activeWalletVisuals.gradient.from}, ${activeWalletVisuals.gradient.to})` 
                                                    }}
                                                >
                                                    <activeWalletVisuals.Icon className={cn("h-8 w-8", activeWalletVisuals.textColor)} />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-2xl font-black tracking-tight">{activeWallet.name}</h3>
                                                    <Badge className={cn("text-[10px] font-bold uppercase tracking-widest", getHealth(activeWallet).tone)}>
                                                        {getHealth(activeWallet).label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium">Informasi detail dan riwayat transaksi aset</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Saldo Saat Ini</span>
                                            <h4 className={cn("text-3xl font-black text-primary tracking-tighter", !isBalanceVisible && "blur-md")}>
                                                {isBalanceVisible ? formatCurrency(activeWallet.balance) : "Rp •••••••••"}
                                            </h4>
                                        </div>
                                    </div>

                                    <TabsList className="bg-muted p-1.5 rounded-2xl h-14 w-full lg:w-fit grid grid-cols-3 border border-border">
                                        <TabsTrigger value="transactions" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Riwayat</TabsTrigger>
                                        <TabsTrigger value="analytics" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Insight</TabsTrigger>
                                        <TabsTrigger value="settings" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Pengaturan</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 min-h-0 overflow-hidden px-2">
                                    <TabsContent value="transactions" className="h-full m-0 outline-none">
                                        <div className="h-full overflow-y-auto custom-scrollbar px-6 pb-6">
                                            <TransactionList walletId={activeWallet.id} />
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="analytics" className="h-full m-0 outline-none p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-emerald-500 rounded-xl">
                                                        <TrendingUp className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Pemasukan</span>
                                                </div>
                                                <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(analytics.income30)}</p>
                                                <p className="text-[11px] text-emerald-600/70 font-medium mt-1">30 Hari terakhir</p>
                                            </div>

                                            <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-rose-500 rounded-xl">
                                                        <TrendingDown className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest">Pengeluaran</span>
                                                </div>
                                                <p className="text-2xl font-black text-rose-600 tracking-tight">{formatCurrency(analytics.expense30)}</p>
                                                <p className="text-[11px] text-rose-600/70 font-medium mt-1">30 Hari terakhir</p>
                                            </div>

                                            <div className="col-span-full bg-muted/30 p-8 rounded-[32px] border border-dashed flex flex-col items-center justify-center text-center space-y-4">
                                                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm">
                                                    <Target className="h-8 w-8 text-primary" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-lg">Analitik Aset Lanjutan</h5>
                                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                                        Pantau pertumbuhan aset, alokasi kategori, dan proyeksi saldo di masa mendatang dalam satu tampilan cerdas.
                                                    </p>
                                                </div>
                                                <Button variant="outline" className="rounded-2xl font-bold px-8">Lihat Laporan Lengkap</Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="h-full m-0 outline-none p-8">
                                        <div className="max-w-md space-y-6">
                                            <div className="p-6 rounded-3xl bg-muted/30 border space-y-4">
                                                <h5 className="font-bold tracking-tight">Kelola Dompet</h5>
                                                <p className="text-sm text-muted-foreground">Sesuaikan nama, ikon, atau jenis aset dompet ini agar lebih mudah dikenali.</p>
                                                <Button className="w-full rounded-2xl font-bold h-12" onClick={() => openEditWalletModal(activeWallet)}>
                                                    Ubah Pengaturan Dompet
                                                </Button>
                                            </div>
                                            <div className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
                                                <h5 className="font-bold text-destructive tracking-tight">Zona Bahaya</h5>
                                                <p className="text-sm text-muted-foreground">Menghapus dompet akan menghapus semua data transaksi terkait secara permanen.</p>
                                                <Button variant="destructive" className="w-full rounded-2xl font-bold h-12 opacity-80 hover:opacity-100">
                                                    Hapus Dompet Ini
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 bg-muted rounded-[40px] flex items-center justify-center mb-6 shadow-inner">
                                    <WalletIcon className="h-12 w-12 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Pilih Aset Anda</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                    Silakan pilih salah satu dompet di sisi kiri untuk melihat detail aset dan riwayat transaksi lengkap.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
