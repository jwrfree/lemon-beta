'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Plus, Wallet } from '@/lib/icons';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { WalletCardStack } from '@/features/wallets/components/wallet-card-stack';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useUI } from '@/components/ui-provider';
import { PageHeader } from '@/components/page-header';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { DesktopWalletView } from '@/features/wallets/components/desktop-wallet-view';
import { usePaginatedTransactions } from '@/features/transactions/hooks/use-paginated-transactions';
import { WalletAnalyticsMobile } from '@/features/wallets/components/wallet-analytics-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { AppPageBody, AppPageShell } from '@/components/app-page-shell';

export default function WalletsPage() {
 const { wallets } = useWallets();
 const router = useRouter();
 const { setIsWalletModalOpen } = useUI();
 const [activeIndex, setActiveIndex] = useState(0);
 const [mobileTab, setMobileTab] = useState<'mutasi'| 'analitik'>('mutasi');

 // Derive the effectively active index (clamped to range)
 const safeActiveIndex = wallets.length > 0
 ? Math.min(activeIndex, wallets.length - 1)
 : 0;

 const activeWallet = wallets.length > 0 ? wallets[safeActiveIndex] : null;

 // Fetch transactions for active wallet (mobile view)
 const { transactions: walletTransactions, isLoading: isTransactionsLoading } = usePaginatedTransactions(
 React.useMemo(() => ({
 walletId: activeWallet ? [activeWallet.id] : []
 }), [activeWallet])
 );

 return (
 <AppPageShell>
 {/* Mobile View */}
 <div className="md:hidden flex min-h-0 flex-1 flex-col bg-background">
 <PageHeader
 title="Dompet"
 showBackButton={false}
 width="full"
 extraActions={<BalanceVisibilityToggle variant="ghost"size="icon"/>}
 />

 {wallets.length === 0 ? (
 <main className="flex flex-1 flex-col bg-background">
 <EmptyState
 icon={Wallet}
 title="Belum Ada Dompet"
 description="Semua harta dan sumber dana kamu akan terorganisir rapi di sini."
 actionLabel="Buat Dompet Pertama"
 onAction={() => setIsWalletModalOpen(true)}
 variant="default"
 />
 </main>
 ) : (
 <main className="flex flex-1 flex-col bg-background pb-6 md:pb-24">
 <WalletCardStack
 wallets={wallets}
 setActiveIndex={setActiveIndex}
 activeIndex={safeActiveIndex}
 />

 <div className="mt-4">
 <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)} className="w-full">
 <div className="mb-6 px-4">
 <TabsList className="bg-muted/50 p-1 rounded-full h-11 w-full grid grid-cols-2">
 <TabsTrigger value="mutasi"className="h-full rounded-full text-label transition-all data-[state=active]:bg-card data-[state=active]:text-primary">Mutasi</TabsTrigger>
 <TabsTrigger value="analitik"className="h-full rounded-full text-label transition-all data-[state=active]:bg-card data-[state=active]:text-primary">Analitik</TabsTrigger>
 </TabsList>
 </div>

 <TabsContent value="mutasi"className="mt-0">
 <div className="mb-4 flex items-center justify-between px-4">
 <h2 className="text-label-sm">10 Transaksi Terakhir</h2>
 <Button variant="link"size="sm"className="text-label text-primary px-0 h-auto"onClick={() => router.push('/transactions')}>Lihat Semua</Button>
 </div>
 <div className="w-full">
 {activeWallet && (
 <TransactionList
 transactions={walletTransactions}
 isLoading={isTransactionsLoading}
 limit={10}
 />
 )}
 </div>
 </TabsContent>

 <TabsContent value="analitik"className="mt-0">
 {activeWallet && (
 <WalletAnalyticsMobile
 transactions={walletTransactions}
 />
 )}
 </TabsContent>
 </Tabs>
 </div>
 </main>
 )}

 {/* Floating Action Button (FAB) */}
 <FAB onClick={() => setIsWalletModalOpen(true)} label="Tambah dompet"/>
 </div>

 {/* Desktop View */}
 <div className="hidden min-h-0 flex-1 flex-col md:flex">
 <PageHeader
 title="Dompet"
 showBackButton={false}
 width="wide"
 extraActions={
 <div className="flex items-center gap-2">
 <BalanceVisibilityToggle variant="ghost"size="icon"/>
 <Button onClick={() => setIsWalletModalOpen(true)}>
 <Plus size={16} weight="regular"className="mr-2"/>
 Tambah Dompet
 </Button>
 </div>
 }
 />
 <AppPageBody width="wide"className="flex-1 py-6">
 {wallets.length === 0 ? (
 <div className="flex h-full items-center justify-center">
 <EmptyState
 icon={Wallet}
 title="Mulai Kelola Asetmu"
 description="Dompet adalah sumber dana transaksi. Buat dompet seperti Kas, Bank, atau E-Wallet untuk mencatat keuangan lebih rapi."
 actionLabel="Buat Dompet Baru"
 onAction={() => setIsWalletModalOpen(true)}
 variant="default"
 />
 </div>
 ) : (
 <DesktopWalletView
 wallets={wallets}
 activeIndex={safeActiveIndex}
 setActiveIndex={setActiveIndex}
 />
 )}
 </AppPageBody>
 </div>
 </AppPageShell>
 );
};


