import { format, parseISO } from 'date-fns';
import type { Transaction } from '@/types/models';

/**
 * Mengelompokkan transaksi berdasarkan tanggal (yyyy-MM-dd).
 * Mengembalikan array of entries: [dateString, Transaction[]]
 * Diurutkan dari tanggal terbaru ke terlama.
 */
export const groupTransactionsByDate = (transactions: Transaction[]) => {
    const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
        try {
            const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(t);
        } catch (error) {
            // Skip invalid dates silently or log if needed
        }
        return acc;
    }, {});

    return Object.entries(grouped).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
};