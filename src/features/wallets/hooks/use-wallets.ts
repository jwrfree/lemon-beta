import { useWalletData } from '@/providers/wallet-provider';

export const useWallets = () => {
    const { wallets, isLoading } = useWalletData();

    return {
        wallets,
        isLoading,
    };
};
