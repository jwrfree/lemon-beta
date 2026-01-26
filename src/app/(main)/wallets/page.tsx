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

  // Derive the effectively active index (clamped to range)
  const safeActiveIndex = wallets.length > 0 
    ? Math.min(activeIndex, wallets.length - 1) 
    : 0;

  const activeWallet = wallets.length > 0 ? wallets[safeActiveIndex] : null;

  return (
    <div className="flex flex-col h-full relative">
      {/* Mobile View */}
      <div className="md:hidden flex flex-col h-full">
          <PageHeader
            title="Dompet Kamu"
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
            <main className="flex-1 overflow-y-auto pb-24">
              <WalletCardStack 
                wallets={wallets} 
                setActiveIndex={setActiveIndex}
                activeIndex={safeActiveIndex}
              />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Transaksi Terakhir</h2>
                  <Button variant="link" size="sm">Lihat Semua</Button>
                </div>
                
                {activeWallet && (
                  <TransactionList walletId={activeWallet.id} limit={10} />
                )}
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
      <div className="hidden md:flex flex-col h-full">
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
        <div className="flex-1 overflow-hidden">
          {wallets.length === 0 ? (
            <main className="flex h-full items-center justify-center p-4">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 bg-card rounded-lg shadow-sm border">
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
              activeIndex={safeActiveIndex} 
              setActiveIndex={setActiveIndex} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
