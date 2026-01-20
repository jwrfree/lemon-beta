import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types/models';

const PAGE_SIZE = 20;

export interface TransactionFilters {
    searchQuery?: string;
    type?: string; // 'all', 'expense', 'income'
    category?: string[];
    walletId?: string[];
}

export const usePaginatedTransactions = (filters: TransactionFilters) => {
    const { user } = useApp();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0); // 0-indexed for Supabase range
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    
    // Ref for AbortController
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce search query to avoid rapid fetching
    const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

    // Reset and fetch when filters change
    useEffect(() => {
        if (!user) return;
        
        setPage(0);
        setHasMore(true);
        setTransactions([]); // Clear current list to show loading state or empty state correctly
        fetchTransactions(0, true);
        
        // Cleanup function to abort request on unmount or dependency change
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [
        user, 
        debouncedSearchQuery, 
        filters.type, 
        JSON.stringify(filters.category), 
        JSON.stringify(filters.walletId)
    ]);

    const fetchTransactions = async (pageIndex: number, isReset: boolean = false) => {
        if (!user) return;
        
        // Abort previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;
        
        setIsLoading(true);
        setError(null);
        
        try {
            let query = supabase
                .from('transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)
                .abortSignal(signal);

            // Apply Filters
            if (debouncedSearchQuery) {
                // Search in description OR category
                // Supabase 'or' syntax: description.ilike.%query%,category.ilike.%query%
                query = query.or(`description.ilike.%${debouncedSearchQuery}%,category.ilike.%${debouncedSearchQuery}%`);
            }

            if (filters.type && filters.type !== 'all') {
                query = query.eq('type', filters.type);
            }

            if (filters.category && filters.category.length > 0) {
                query = query.in('category', filters.category);
            }

            if (filters.walletId && filters.walletId.length > 0) {
                query = query.in('wallet_id', filters.walletId);
            }

            const { data, error, count } = await query;
            
            // If aborted, stop here
            if (signal.aborted) return;

            if (error) throw error;

            if (data) {
                const mappedTx = data.map((t: any) => ({
                    id: t.id,
                    amount: t.amount,
                    category: t.category,
                    date: t.date,
                    description: t.description,
                    type: t.type,
                    walletId: t.wallet_id,
                    userId: t.user_id,
                    createdAt: t.created_at,
                    subCategory: t.subCategory,
                    location: t.location
                }));

                if (isReset) {
                    setTransactions(mappedTx);
                } else {
                    setTransactions(prev => [...prev, ...mappedTx]);
                }

                // Check if we reached the end
                // If we got fewer items than requested, or the total count is reached
                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                } else if (count !== null && (pageIndex + 1) * PAGE_SIZE >= count) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (err: any) {
            // Ignore abort errors
            if (err.name === 'AbortError' || signal.aborted) {
                return;
            }
            console.error("Error fetching paginated transactions:", err);
            setError(err.message || "Gagal memuat transaksi.");
        } finally {
            // Only update loading state if this request wasn't aborted
            if (!signal.aborted) {
                setIsLoading(false);
                // Clear ref if this was the last controller
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        }
    };

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTransactions(nextPage);
        }
    }, [isLoading, hasMore, page]);

    return {
        transactions,
        isLoading,
        hasMore,
        loadMore,
        error
    };
};

// Helper hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
