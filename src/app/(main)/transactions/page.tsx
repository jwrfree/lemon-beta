
'use client';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, X, ListFilter } from 'lucide-react';
import { TransactionList } from '@/components/transaction-list';
import { Input } from '@/components/ui/input';
import { useApp } from '@/components/app-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

const TransactionsPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { transactions, expenseCategories, incomeCategories, wallets, isLoading } = useApp();
    
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
            setActiveTab('expense'); // Assume filtered category is an expense for now
        }
    }, [searchParams]);

    const categoriesForFilter = useMemo(() => {
        const cats = activeTab === 'expense' ? expenseCategories : activeTab === 'income' ? incomeCategories : [...incomeCategories, ...expenseCategories];
        return cats.sort((a,b) => a.name.localeCompare(b.name));
    }, [activeTab, expenseCategories, incomeCategories]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
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
    
    const activeFilterCount = selectedCategories.length + selectedWallets.length;

    const displayedCategories = showAllCategories ? categoriesForFilter : categoriesForFilter.slice(0, 8);
    const displayedWallets = showAllWallets ? wallets : wallets.slice(0, 8);

    return (
        <div className="flex flex-col h-full bg-muted overflow-y-auto pb-16">
            <header className="h-16 flex items-center gap-2 relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cari transaksi..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="ghost" size="icon" className="shrink-0 relative">
                            <ListFilter className="h-5 w-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                                    {activeFilterCount}
                                </span>
                            )}
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
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetFilters(); }} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="income">Pemasukan</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                {(selectedCategories.length > 0 || selectedWallets.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(category => (
                            <Badge key={category} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1">
                                {category}
                                <button onClick={() => handleCategoryToggle(category)} className="flex-shrink-0 h-4 w-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                         {selectedWallets.map(walletId => {
                            const wallet = wallets.find(w => w.id === walletId);
                            return wallet && (
                                <Badge key={walletId} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1">
                                    {wallet.name}
                                    <button onClick={() => handleWalletToggle(walletId)} className="flex-shrink-0 h-4 w-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                )}
            </div>

            <main className="space-y-2">
                {isLoading ? null : <TransactionList transactions={filteredTransactions} />}
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
