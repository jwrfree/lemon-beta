
'use client';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, X, ListFilter } from 'lucide-react';
import { TransactionList } from '@/components/transaction-list';
import { Input } from '@/components/ui/input';
import { useApp } from '@/components/app-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

const TransactionsPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { transactions, expenseCategories, incomeCategories, wallets, debts } = useApp();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllWallets, setShowAllWallets] = useState(false);

    useEffect(() => {
        const categoryFromURL = searchParams.get('category');
        if (categoryFromURL) {
            setSelectedCategories([categoryFromURL]);
            const isExpense = expenseCategories.some(c => c.name === categoryFromURL);
            if (isExpense) {
              setActiveTab('expense');
            } else {
              const isIncome = incomeCategories.some(c => c.name === categoryFromURL);
              if (isIncome) setActiveTab('income');
            }
        }
    }, [searchParams, expenseCategories, incomeCategories]);

    const categoriesForFilter = useMemo(() => {
        if (activeTab === 'expense') {
            return [...expenseCategories].sort((a, b) => a.name.localeCompare(b.name));
        }

        if (activeTab === 'income') {
            return [...incomeCategories].sort((a, b) => a.name.localeCompare(b.name));
        }

        return [...expenseCategories, ...incomeCategories].sort((a, b) => a.name.localeCompare(b.name));
    }, [activeTab, expenseCategories, incomeCategories]);

    const filteredTransactions = useMemo(() => {
        if (activeTab === 'debt') return [];
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = activeTab === 'all' || t.type === activeTab;
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
            const matchesWallet = selectedWallets.length === 0 || selectedWallets.includes(t.walletId);
            return matchesSearch && matchesType && matchesCategory && matchesWallet;
        });
    }, [transactions, searchQuery, activeTab, selectedCategories, selectedWallets]);
    
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
        <div className="flex flex-col h-full bg-muted overflow-y-auto pb-16">
            <header className="h-16 flex items-center gap-2 relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <div className="relative w-full">
                    <Label htmlFor="transaction-search" className="sr-only">Cari transaksi</Label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="transaction-search"
                        placeholder="Cari transaksi..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 relative"
                            aria-label="Buka filter transaksi"
                         >
                            <ListFilter className="h-5 w-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                                    {activeFilterCount}
                                </span>
                            )}
                            <span className="sr-only">Buka filter transaksi</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] flex flex-col">
                        <SheetHeader className="text-left">
                            <SheetTitle>Filter Transaksi</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 py-4 overflow-y-auto">
                            <div>
                                <Label className="text-sm font-medium">Kategori</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {displayedCategories.map(c => (
                                        <Button key={c.id} variant={selectedCategories.includes(c.name) ? 'default' : 'outline'} size="sm" onClick={() => handleCategoryToggle(c.name)}>{c.name}</Button>
                                    ))}
                                    {categoriesForFilter.length > 8 && !showAllCategories && (
                                        <Button variant="link" size="sm" onClick={() => setShowAllCategories(true)}>Lihat Semua</Button>
                                    )}
                                </div>
                            </div>
                             <div>
                                <Label className="text-sm font-medium">Dompet</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {displayedWallets.map(w => (
                                        <Button key={w.id} variant={selectedWallets.includes(w.id) ? 'default' : 'outline'} size="sm" onClick={() => handleWalletToggle(w.id)}>{w.name}</Button>
                                    ))}
                                    {wallets.length > 8 && !showAllWallets && (
                                        <Button variant="link" size="sm" onClick={() => setShowAllWallets(true)}>Lihat Semua</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {activeFilterCount > 0 && <Button variant="ghost" size="sm" className="w-full text-destructive mt-auto" onClick={resetFilters}>Reset Filter</Button>}
                    </SheetContent>
                </Sheet>
            </header>
            
            <div className="p-4 flex flex-col gap-3 bg-background border-b sticky top-16 z-10">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="income">Pemasukan</TabsTrigger>
                        <TabsTrigger value="debt">Hutang</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                {(selectedCategories.length > 0 || selectedWallets.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedCategories.map(category => (
                            <Badge key={category} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1">
                                {category}
                                <button
                                    type="button"
                                    onClick={() => handleCategoryToggle(category)}
                                    className="ml-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-medium transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                                    aria-label={`Hapus filter kategori ${category}`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </Badge>
                        ))}
                         {selectedWallets.map(walletId => {
                            const wallet = wallets.find(w => w.id === walletId);
                            return wallet && (
                                <Badge key={walletId} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1">
                                    {wallet.name}
                                    <button
                                        type="button"
                                        onClick={() => handleWalletToggle(walletId)}
                                        className="ml-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-medium transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                                        aria-label={`Hapus filter dompet ${wallet.name}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                )}
            </div>

            <main className="space-y-2 p-4">
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
                                                <p className="font-semibold">{debt.title}</p>
                                                <p className="text-xs text-muted-foreground">{debt.counterparty}</p>
                                            </div>
                                            <span className="text-sm font-semibold">{formatCurrency(outstanding)}</span>
                                        </div>
                                        {dueDate && (
                                            <p className="text-xs text-muted-foreground">
                                                Jatuh tempo {formatDistanceToNow(dueDate, { addSuffix: true, locale: dateFnsLocaleId })}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => router.push(`/debts/${debt.id}`)}>
                                                Lihat Detail
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <TransactionList transactions={filteredTransactions} />
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
