
'use client';
import { WalletsPage } from '@/components/wallets-page';
import { useApp } from '@/components/app-provider';

export default function Wallets() {
    const { setIsWalletModalOpen } = useApp();
    return <WalletsPage onAddWallet={() => setIsWalletModalOpen(true)} />;
}
