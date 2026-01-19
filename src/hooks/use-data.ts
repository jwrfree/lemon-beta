import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';

export const useData = () => {
    const walletsData = useWallets();
    const transactionsData = useTransactions();

    return {
        ...walletsData, // Contains app mutations and wallets
        ...transactionsData, // Contains transactions and getCategoryVisuals
        isLoading: walletsData.isLoading || transactionsData.isLoading,
    };
};
