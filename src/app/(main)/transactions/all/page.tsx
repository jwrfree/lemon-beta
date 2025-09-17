
'use client';
import React, { useState, useMemo } from 'react';
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

export default function AllTransactionsPage() {
    const router = useRouter();
    const { transactions, expenseCategories, incomeCategories } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

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
            return matchesSearch && matchesType && matchesCategory;
        });
    }, [transactions, searchQuery, activeTab, selectedCategories]);
    
    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const resetFilters = () => {
        setSearchQuery('');
        setActiveTab('all');
        setSelectedCategories([]);
    };
    
    const hasActiveFilters = searchQuery !== '' || activeTab !== 'all' || selectedCategories.length > 0;

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Riwayat Transaksi</h1>
            </header>
            
            <div className="p-4 flex flex-col gap-3 bg-background border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cari transaksi..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="income">Pemasukan</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                 <div className="flex items-center justify-between">
                    <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isCategoryPopoverOpen}
                                className="w-fit justify-between"
                            >
                                Filter Kategori
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
                    
                    {hasActiveFilters && (
                        <Button variant="ghost" className="text-destructive hover:text-destructive" size="sm" onClick={resetFilters}>
                           <X className="mr-1 h-4 w-4" /> Reset
                        </Button>
                    )}
                </div>

                {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {selectedCategories.map(category => (
                            <Badge key={category} variant="secondary" className="gap-1">
                                {category}
                                <button onClick={() => handleCategorySelect(category)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <main className="flex-1 overflow-y-auto p-4 space-y-2 pb-16">
                <TransactionList transactions={filteredTransactions} />
            </main>
        </div>
    );
}


