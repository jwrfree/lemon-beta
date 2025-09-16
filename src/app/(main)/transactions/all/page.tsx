
'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { TransactionList } from '@/components/transaction-list';
import { Input } from '@/components/ui/input';
import { useApp } from '@/components/app-provider';
import { TransactionFilterSheet } from '@/components/transaction-filter-sheet';

export default function AllTransactionsPage() {
    const router = useRouter();
    const { transactions, expenseCategories, incomeCategories } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [filters, setFilters] = useState<{ type: string | null; categories: string[] }>({
        type: null,
        categories: [],
    });

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Apply search query
        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (filters.type) {
            filtered = filtered.filter(t => t.type === filters.type);
        }

        // Apply category filter
        if (filters.categories.length > 0) {
            filtered = filtered.filter(t => filters.categories.includes(t.category));
        }

        return filtered;
    }, [transactions, searchQuery, filters]);

    const handleApplyFilters = (newFilters: { type: string | null; categories: string[] }) => {
        setFilters(newFilters);
        setIsFilterSheetOpen(false);
    };

    const resetFilters = () => {
        setFilters({ type: null, categories: [] });
    };

    const hasActiveFilters = filters.type !== null || filters.categories.length > 0;

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Semua Transaksi</h1>
            </header>
            <div className="p-4 border-b space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cari transaksi..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setIsFilterSheetOpen(true)}>
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter
                    </Button>
                    {hasActiveFilters && (
                         <Button variant="outline" className="gap-2 text-destructive" onClick={resetFilters}>
                            <X className="h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>
            <main className="flex-1 overflow-y-auto p-4 space-y-2 pb-16">
                <TransactionList transactions={filteredTransactions} />
            </main>
            <TransactionFilterSheet
                isOpen={isFilterSheetOpen}
                onClose={() => setIsFilterSheetOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={filters}
                expenseCategories={expenseCategories}
                incomeCategories={incomeCategories}
            />
        </div>
    );
}

