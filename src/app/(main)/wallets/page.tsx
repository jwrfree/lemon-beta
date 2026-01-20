'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, PlusCircle } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { WalletCardStack } from '@/features/wallets/components/wallet-card-stack';
import { TransactionList } from '@/features/transactions/components/transaction-list';
import { useUI } from '@/components/ui-provider';
import { PageHeader } from '@/components/page-header';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { DesktopWalletView } from '@/features/wallets/components/desktop-wallet-view';

export default function WalletsPage() {
  const { wallets } = useData();
  const { setIsWalletModalOpen } = useUI();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeWallet = wallets.length > 0 ? wallets[activeIndex] : null;

  // Clamp active index when wallet list changes
  useEffect(() => {
    if (activeIndex > wallets.length - 1) {
      setActiveIndex(wallets.length > 0 ? wallets.length - 1 : 0);
    }
  }, [wallets, activeIndex]);

  return (
    <div className="flex flex-col bg-muted h-full">
      {/* Mobile View */}
      <div className="md:hidden flex flex-col h-full">
          <PageHeader
            title="Dompet Kamu"
            actionButton={{
              icon: Plus,
              label: 'Tambah dompet',
              onClick: () => setIsWalletModalOpen(true),
            }}
            extraActions={<BalanceVisibilityToggle variant="ghost" size="icon" />}
          />
          
          {wallets.length === 0 ? (
            <main className="flex-1 flex items-center justify-center p-4">
              <div className="flex flex-col items-center justify-center text-center">
                 <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <Wallet className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold">Belum Ada Dompet</h2>
                <p className="text-muted-foreground mt-2 mb-6">Yuk, buat dompet pertamamu untuk memulai!</p>
                <Button onClick={() => setIsWalletModalOpen(true)}>
                  <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                  Buat Dompet
                </Button>
              </div>
            </main>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-64 pt-4 flex-shrink-0 bg-muted">
                 <WalletCardStack 
                    wallets={wallets} 
                    activeIndex={activeIndex} 
                    setActiveIndex={setActiveIndex} 
                />
              </div>
              <div className="flex-1 bg-background rounded-t-2xl overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] -mt-4 z-10 pt-4">
                 <h2 className="text-lg font-semibold mb-2 mt-4 sticky top-0 bg-background py-2">Riwayat Transaksi</h2>
                 {activeWallet ? (
                    <TransactionList walletId={activeWallet.id} />
                 ) : (
                    <p className="text-muted-foreground text-center text-sm py-4">Pilih dompet untuk melihat transaksi.</p>
                 )}
              </div>
            </div>
          )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-6 border-b bg-background">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Dompet</h1>
            <BalanceVisibilityToggle variant="ghost" size="icon" />
          </div>
          <Button onClick={() => setIsWalletModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Dompet
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          {wallets.length === 0 ? (
            <main className="flex h-full items-center justify-center p-4">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 bg-card rounded-2xl shadow-sm border">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Wallet className="h-12 w-12 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold">Belum Ada Dompet</h2>
                <p className="text-muted-foreground mt-2 mb-8 text-lg">Yuk, buat dompet pertamamu untuk memulai mencatat keuanganmu dengan lebih rapi!</p>
                <Button size="lg" onClick={() => setIsWalletModalOpen(true)} className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                  Buat Dompet Baru
                </Button>
              </div>
            </main>
          ) : (
            <DesktopWalletView 
              wallets={wallets} 
              activeIndex={activeIndex} 
              setActiveIndex={setActiveIndex} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
