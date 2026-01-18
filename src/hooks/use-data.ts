import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';

export const useData = () => {
    const walletsData = useWallets();
    const transactionsData = useTransactions();

    return {
        ...walletsData, // Contains app mutations and wallets
        transactions: transactionsData.transactions,
        expenseCategories: transactionsData.expenseCategories,
        incomeCategories: transactionsData.incomeCategories,
        isLoading: walletsData.isLoading || transactionsData.isLoading,
    };
};
