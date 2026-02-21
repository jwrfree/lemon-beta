'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, PlusCircle } from 'lucide-react';
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

export default function WalletsPage() {
  const { wallets } = useWallets();
  const router = useRouter();
  const { setIsWalletModalOpen } = useUI();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState<'mutasi' | 'analitik'>('mutasi');

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
    <div className="flex flex-col h-full relative">
      {/* Mobile View */}
      <div className="md:hidden flex flex-col h-full">
        <PageHeader
          title="Dompet Kamu"
          extraActions={<BalanceVisibilityToggle variant="ghost" size="icon" />}
        />

        {wallets.length === 0 ? (
          <main className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
            <div className="max-w-[320px] w-full p-10 bg-card rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                <Wallet className="h-40 w-40" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                  <Wallet className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tighter mb-3">Belum Ada Dompet</h2>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-8">
                  Semua harta dan sumber dana kamu akan terorganisir rapi di sini.
                </p>
                <Button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full rounded-full h-12 shadow-lg shadow-primary/20 active:scale-95 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Dompet Pertama
                </Button>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto pb-24">
            <WalletCardStack
              wallets={wallets}
              setActiveIndex={setActiveIndex}
              activeIndex={safeActiveIndex}
            />

            <div className="mt-4">
              <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)} className="w-full">
                <div className="px-5 mb-6">
                  <TabsList className="bg-muted/50 p-1 rounded-full h-11 w-full grid grid-cols-2">
                    <TabsTrigger value="mutasi" className="h-full rounded-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Mutasi</TabsTrigger>
                    <TabsTrigger value="analitik" className="h-full rounded-full font-bold text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">Analitik</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="mutasi" className="mt-0">
                  <div className="px-6 flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">10 Transaksi Terakhir</h2>
                    <Button variant="link" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary px-0 h-auto" onClick={() => router.push('/transactions')}>Lihat Semua</Button>
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

                <TabsContent value="analitik" className="mt-0">
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
        <div className="fixed bottom-20 right-6 z-40">
          <Button
            onClick={() => setIsWalletModalOpen(true)}
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95"
            aria-label="Tambah dompet"
          >
            <Plus className="h-7 w-7" />
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <PageHeader
          title="Dompet Kamu"
          extraActions={
            <div className="flex items-center gap-2">
              <BalanceVisibilityToggle variant="ghost" size="icon" />
              <Button onClick={() => setIsWalletModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Dompet
              </Button>
            </div>
          }
        />
        <div className="flex-1">
          {wallets.length === 0 ? (
            <main className="flex h-full items-center justify-center p-8 bg-background">
              <div className="max-w-md w-full p-12 bg-card rounded-lg shadow-2xl border border-border text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                  <Wallet className="h-40 w-40" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-5 bg-primary/10 rounded-lg mb-6">
                    <Wallet className="h-12 w-12 text-primary" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-medium tracking-tighter mb-4">Mulai Kelola Asetmu</h2>
                  <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                    Dompet adalah sumber dana transaksi. Buat dompet seperti Kas, Bank, atau E-Wallet untuk mencatat keuangan lebih rapi.
                  </p>
                  <Button size="lg" onClick={() => setIsWalletModalOpen(true)} className="w-full h-14 rounded-lg text-lg font-medium shadow-xl shadow-primary/20">
                    <PlusCircle className="mr-2 h-6 w-6" />
                    Buat Dompet Baru
                  </Button>
                </div>
              </div>
            </main>
          ) : (
            <DesktopWalletView
              wallets={wallets}
              activeIndex={safeActiveIndex}
              setActiveIndex={setActiveIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};

