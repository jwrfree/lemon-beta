'use client';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, X, ListFilter } from 'lucide-react';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { Input } from '@/components/ui/input';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '@/features/transactions/hooks/use-transactions';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { usePaginatedTransactions } from '@/features/transactions/hooks/use-paginated-transactions';
import { PageHeader } from "@/components/page-header";

function TransactionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const { debts } = useDebts();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Optimize: Initialize state from URL params directly to avoid double fetch
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
        const categoryFromURL = searchParams.get('category');
        return categoryFromURL ? [categoryFromURL] : [];
    });

    const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllWallets, setShowAllWallets] = useState(false);

    // Sync activeTab with initial selected category if present
    useEffect(() => {
        const categoryFromURL = searchParams.get('category');
        if (categoryFromURL) {
            const isExpense = expenseCategories.some(c => c.name === categoryFromURL);
            if (isExpense) {
                setActiveTab('expense');
            } else {
                const isIncome = incomeCategories.some(c => c.name === categoryFromURL);
                if (isIncome) setActiveTab('income');
            }
        }
    }, [searchParams, expenseCategories, incomeCategories]);

    // Use server-side pagination hook
    const {
        transactions: filteredTransactions,
        isLoading,
        loadMore,
        hasMore
    } = usePaginatedTransactions({
        searchQuery,
        type: activeTab,
        category: selectedCategories,
        walletId: selectedWallets
    });

    const categoriesForFilter = useMemo(() => {
        if (activeTab === 'expense') {
            return [...expenseCategories].sort((a, b) => a.name.localeCompare(b.name));
        }

        if (activeTab === 'income') {
            return [...incomeCategories].sort((a, b) => a.name.localeCompare(b.name));
        }

        return [...expenseCategories, ...incomeCategories].sort((a, b) => a.name.localeCompare(b.name));
    }, [activeTab, expenseCategories, incomeCategories]);

    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleWalletToggle = (walletId: string) => {
        setSelectedWallets(prev =>
            prev.includes(walletId)
                ? prev.filter(id => id !== walletId)
                : [...prev, walletId]
        );
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedWallets([]);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Don't reset filters when changing tabs
    };

    const activeFilterCount = selectedCategories.length + selectedWallets.length;

    const displayedCategories = showAllCategories ? categoriesForFilter : categoriesForFilter.slice(0, 8);
    const displayedWallets = showAllWallets ? wallets : wallets.slice(0, 8);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="px-4 py-3 flex flex-col gap-3 bg-card/80 backdrop-blur-xl border-b z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 -ml-2 rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Cari transaksi..."
                            className="pl-10 h-10 text-sm bg-muted/50 border-none focus-visible:ring-4 focus-visible:ring-primary/5 rounded-card transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "shrink-0 h-10 w-10 p-0 rounded-full gap-2 border-border/50",
                                    activeFilterCount > 0 && "bg-primary/5 text-primary border-primary/20"
                                )}
                            >
                                <div className="relative">
                                    <ListFilter className="h-4 w-4" />
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </div>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-card-premium max-h-[85vh] flex flex-col border-t-0 shadow-lg bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
                            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 shrink-0" />
                            <SheetHeader className="text-left mb-6">
                                <SheetTitle className="text-xl font-semibold tracking-tight">Atur Tampilan</SheetTitle>
                                <p className="text-xs text-muted-foreground">Fokuskan data pada kategori atau dompet tertentu.</p>
                            </SheetHeader>
                            <div className="space-y-6 py-2 overflow-y-auto pb-10">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pilih Kategori</Label>
                                        {selectedCategories.length > 0 && (
                                            <button onClick={() => setSelectedCategories([])} className="text-xs font-semibold text-destructive uppercase tracking-wide">Bersihkan</button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {displayedCategories.map(c => (
                                            <Button
                                                key={c.id}
                                                variant={selectedCategories.includes(c.name) ? 'default' : 'outline'}
                                                size="sm"
                                                className="rounded-full h-8 px-4 text-xs font-semibold transition-all"
                                                onClick={() => handleCategoryToggle(c.name)}
                                            >
                                                {c.name}
                                            </Button>
                                        ))}
                                        {categoriesForFilter.length > 8 && !showAllCategories && (
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary font-semibold rounded-full" onClick={() => setShowAllCategories(true)}>+ {categoriesForFilter.length - 8} Lainnya</Button>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-border/50 pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pilih Dompet</Label>
                                        {selectedWallets.length > 0 && (
                                            <button onClick={() => setSelectedWallets([])} className="text-xs font-semibold text-destructive uppercase tracking-wide">Bersihkan</button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {displayedWallets.map(w => (
                                            <Button
                                                key={w.id}
                                                variant={selectedWallets.includes(w.id) ? 'default' : 'outline'}
                                                size="sm"
                                                className="rounded-full h-8 px-4 text-xs font-semibold transition-all"
                                                onClick={() => handleWalletToggle(w.id)}
                                            >
                                                {w.name}
                                            </Button>
                                        ))}
                                        {wallets.length > 8 && !showAllWallets && (
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary font-semibold rounded-full" onClick={() => setShowAllWallets(true)}>Lihat Semua</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-border">
                                <Button variant="outline" className="h-12 rounded-full text-sm font-semibold" onClick={resetFilters}>Reset Semua</Button>
                                <SheetTrigger asChild>
                                    <Button className="h-12 rounded-full text-sm font-semibold shadow-lg shadow-primary/20">Terapkan</Button>
                                </SheetTrigger>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" suppressHydrationWarning>
                    <TabsList className="bg-muted/50 p-1 rounded-full h-10 w-full grid grid-cols-4" suppressHydrationWarning>
                        {[
                            { value: 'all', label: 'Semua' },
                            { value: 'expense', label: 'Keluar' },
                            { value: 'income', label: 'Masuk' },
                            { value: 'debt', label: 'Hutang' }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="h-full rounded-full font-semibold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-primary"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {(selectedCategories.length > 0 || selectedWallets.length > 0) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {selectedCategories.map(category => (
                            <Badge key={category} variant="secondary" className="gap-1 pl-2 pr-0.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20 rounded-md">
                                {category}
                                <button
                                    type="button"
                                    onClick={() => handleCategoryToggle(category)}
                                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                                    aria-label={`Hapus filter kategori ${category}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        {selectedWallets.map(walletId => {
                            const wallet = wallets.find(w => w.id === walletId);
                            return wallet && (
                                <Badge key={walletId} variant="secondary" className="gap-1 pl-2 pr-0.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20 rounded-md">
                                    {wallet.name}
                                    <button
                                        type="button"
                                        onClick={() => handleWalletToggle(walletId)}
                                        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                                        aria-label={`Hapus filter dompet ${wallet.name}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                )}
            </div>

            <main className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeTab === 'debt' ? (
                    <div className="space-y-2">
                        {debts.length === 0 ? (
                            <Card className="p-4 text-sm text-muted-foreground">
                                Belum ada catatan hutang/piutang.
                            </Card>
                        ) : (
                            debts.map(debt => {
                                const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
                                const dueDate = debt.dueDate ? parseISO(debt.dueDate) : null;
                                return (
                                    <Card key={debt.id} className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{debt.title}</p>
                                                <p className="text-xs text-muted-foreground">{debt.counterparty}</p>
                                            </div>
                                            <span className="text-sm font-semibold italic tracking-tight">{formatCurrency(outstanding)}</span>
                                        </div>
                                        {dueDate && (
                                            <p className="text-xs uppercase font-semibold text-muted-foreground">
                                                Tempo: {formatDistanceToNow(dueDate, { addSuffix: true, locale: dateFnsLocaleId })}
                                            </p>
                                        )}
                                    </Card>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <TransactionList
                        transactions={filteredTransactions}
                        loadMore={loadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                    />
                )}
            </main>
        </div>
    );
}

export default function AllTransactionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransactionsPageContent />
        </Suspense>
    );
}

