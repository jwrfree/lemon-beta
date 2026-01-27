import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useTransactions, useCategories } from '@/features/transactions/hooks/use-transactions';
import { useDebts } from '@/features/debts/hooks/use-debts';

export const useData = () => {
    const walletsData = useWallets();
    const transactionsData = useTransactions();
    const categoriesData = useCategories();
    const debtsData = useDebts();

    return {
        ...walletsData, // Contains app mutations and wallets
        ...transactionsData, // Contains transactions and getCategoryVisuals
        ...categoriesData, // Contains expenseCategories, incomeCategories, etc.
        ...debtsData, // Contains debts and debt mutations
        isLoading: walletsData.isLoading || transactionsData.isLoading || categoriesData.isLoading || debtsData.isLoading,
    };
};
