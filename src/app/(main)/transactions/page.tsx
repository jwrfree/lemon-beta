
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, X, ChevronsUpDown, Check } from 'lucide-react';
import { TransactionList } from '@/components/transaction-list';
import { Input } from '@/components/ui/input';
import { useApp } from '@/components/app-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const TransactionsSkeleton = () => (
    <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-1/4" />
            </div>
             <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/4" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-1/5" />
            </div>
        </div>
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-2">
             <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-1/4" />
            </div>
        </div>
    </div>
);

export default function AllTransactionsPage() {
    const router = useRouter();
    const { transactions, expenseCategories, incomeCategories, wallets, isLoading } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
    const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
    const [isWalletPopoverOpen, setIsWalletPopoverOpen] = useState(false);

    const categoriesForFilter = useMemo(() => {
        if (activeTab === 'expense') return expenseCategories;
        if (activeTab === 'income') return incomeCategories;
        return [...expenseCategories, ...incomeCategories];
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
    
    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };
    
    const handleWalletSelect = (walletId: string) => {
        setSelectedWallets(prev =>
            prev.includes(walletId)
                ? prev.filter(id => id !== walletId)
                : [...prev, walletId]
        );
    };

    const resetFilters = () => {
        setSearchQuery('');
        setActiveTab('all');
        setSelectedCategories([]);
        setSelectedWallets([]);
    };
    
    const hasActiveFilters = searchQuery !== '' || activeTab !== 'all' || selectedCategories.length > 0 || selectedWallets.length > 0;

    return (
        <div className="flex flex-col h-full bg-muted overflow-y-auto pb-16">
            <header className="h-16 flex items-center gap-2 relative px-4 shrink-0 border-b bg-background sticky top-0 z-10">
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
            </header>
            
            <div className="p-4 flex flex-col gap-3 bg-background border-b sticky top-16 z-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="income">Pemasukan</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isCategoryPopoverOpen}
                                    className="w-fit justify-between"
                                >
                                    Kategori
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                 <Command>
                                    <CommandInput placeholder="Cari kategori..." />
                                    <CommandList>
                                        <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            <ScrollArea className="h-48">
                                                {categoriesForFilter.map((category) => (
                                                    <CommandItem
                                                        key={category.id}
                                                        value={category.name}
                                                        onSelect={() => handleCategorySelect(category.name)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCategories.includes(category.name) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {category.name}
                                                    </CommandItem>
                                                ))}
                                            </ScrollArea>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Popover open={isWalletPopoverOpen} onOpenChange={setIsWalletPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isWalletPopoverOpen}
                                    className="w-fit justify-between"
                                >
                                    Dompet
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                 <Command>
                                    <CommandInput placeholder="Cari dompet..." />
                                    <CommandList>
                                        <CommandEmpty>Dompet tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            <ScrollArea className="h-48">
                                                {wallets.map((wallet) => (
                                                    <CommandItem
                                                        key={wallet.id}
                                                        value={wallet.name}
                                                        onSelect={() => handleWalletSelect(wallet.id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedWallets.includes(wallet.id) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {wallet.name}
                                                    </CommandItem>
                                                ))}
                                            </ScrollArea>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    {hasActiveFilters && (
                        <Button variant="ghost" className="text-destructive hover:text-destructive" size="sm" onClick={resetFilters}>
                           <X className="mr-1 h-4 w-4" /> Reset
                        </Button>
                    )}
                </div>

                {(selectedCategories.length > 0 || selectedWallets.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                        {selectedCategories.map(category => (
                            <Badge key={category} variant="secondary" className="gap-1">
                                {category}
                                <button onClick={() => handleCategorySelect(category)} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                         {selectedWallets.map(walletId => {
                            const wallet = wallets.find(w => w.id === walletId);
                            return wallet && (
                                <Badge key={walletId} variant="secondary" className="gap-1">
                                    {wallet.name}
                                    <button onClick={() => handleWalletSelect(walletId)} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                )}
            </div>

            <main className="space-y-2">
                {isLoading ? <TransactionsSkeleton /> : <TransactionList transactions={filteredTransactions} />}
            </main>
        </div>
    );
}

    