import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/providers/auth-provider';
import type { Transaction } from '@/types/models';
import { transactionEvents } from '@/lib/transaction-events';
import { transactionService } from '../services/transaction.service';
import type { PaginatedTransactionFilters } from '../services/transaction.service';

const PAGE_SIZE = 20;

export type { PaginatedTransactionFilters as TransactionFilters } from '../services/transaction.service';

export const usePaginatedTransactions = (filters: PaginatedTransactionFilters) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0); // 0-indexed for Supabase range
    const [error, setError] = useState<string | null>(null);

    // Ref for AbortController
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce search query to avoid rapid fetching
    const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

    const categoriesJson = JSON.stringify(filters.category);
    const walletsJson = JSON.stringify(filters.walletId);

    const fetchTransactions = useCallback(async (pageIndex: number, isReset: boolean = false) => {
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
            // migrated from direct supabase call
            const { transactions: paginatedTransactions, count } = await transactionService.getPaginatedTransactions(
                user.id,
                pageIndex,
                PAGE_SIZE,
                {
                    type: filters.type,
                    category: filters.category,
                    walletId: filters.walletId,
                    searchQuery: debouncedSearchQuery,
                },
                signal,
            );

            // If aborted, stop here
            if (signal.aborted) return;

            if (isReset) {
                setTransactions(paginatedTransactions);
            } else {
                setTransactions(prev => [...prev, ...paginatedTransactions]);
            }

            if (paginatedTransactions.length < PAGE_SIZE) {
                setHasMore(false);
            } else if (count !== null && (pageIndex + 1) * PAGE_SIZE >= count) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (err: unknown) {
            // Ignore abort errors
            if ((err instanceof Error && err.name === 'AbortError') || signal.aborted) {
                return;
            }
            console.error("Error fetching paginated transactions:", err);
            setError(err instanceof Error ? err.message : "Gagal memuat transaksi.");
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, debouncedSearchQuery, filters.type, filters.category, filters.walletId, categoriesJson, walletsJson]);

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
    }, [user, fetchTransactions]);

    // Optimistic Updates Subscription
    useEffect(() => {
        const handleCreated = (newTx: Transaction) => {
            // Only add if it matches current filters (basic check)
            // Note: complex filters like date range or amount range might need more logic
            // For now we assume if user adds it, they want to see it if it matches wallet/category
            const matchesWallet = !filters.walletId?.length || filters.walletId.includes(newTx.walletId);
            const matchesCategory = !filters.category?.length || filters.category.includes(newTx.category);
            const matchesType = !filters.type || filters.type === 'all' || filters.type === newTx.type;

            if (matchesWallet && matchesCategory && matchesType) {
                setTransactions(prev => [newTx, ...prev]);
            }
        };

        const handleUpdated = (updatedTx: Transaction) => {
            setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
        };

        const handleDeleted = (deletedId: string) => {
            setTransactions(prev => prev.filter(t => t.id !== deletedId));
        };

        transactionEvents.on('transaction.created', handleCreated);
        transactionEvents.on('transaction.updated', handleUpdated);
        transactionEvents.on('transaction.deleted', handleDeleted);

        return () => {
            transactionEvents.off('transaction.created', handleCreated);
            transactionEvents.off('transaction.updated', handleUpdated);
            transactionEvents.off('transaction.deleted', handleDeleted);
        };
    }, [filters]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTransactions(nextPage);
        }
    }, [isLoading, hasMore, page, fetchTransactions]);

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
