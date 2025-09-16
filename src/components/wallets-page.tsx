
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Wallet, PlusCircle } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletCardStack } from '@/components/wallet-card-stack';
import { TransactionList } from '@/components/transaction-list';

export const WalletsPage = ({ onAddWallet }: { onAddWallet: () => void }) => {
  const { wallets, isLoading } = useApp();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeWallet = wallets.length > 0 ? wallets[activeIndex] : null;

  return (
    <div className="flex flex-col h-full bg-muted">
      <header className="h-16 flex items-center relative px-4 shrink-0 bg-muted z-20">
        <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <h1 className="text-xl font-bold text-center w-full">Dompet Saya</h1>
        <Button variant="ghost" size="icon" className="absolute right-4" onClick={onAddWallet}>
          <Plus className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      </header>
      
      {isLoading ? (
        <div className="flex flex-col flex-1 p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="space-y-2 pt-4">
              {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-1/4" />
                  </div>
              ))}
          </div>
        </div>
      ) : wallets.length === 0 ? (
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center text-center">
             <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Wallet className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold">Tidak ada Dompet</h2>
            <p className="text-muted-foreground mt-2 mb-6">Buat dompet pertama Anda untuk memulai.</p>
            <Button onClick={onAddWallet}>
              <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
              Buat Dompet
            </Button>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-64 pt-4 flex-shrink-0">
             <WalletCardStack 
                wallets={wallets} 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex} 
            />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-16">
             <h2 className="text-lg font-semibold mb-2 mt-4 sticky top-0 bg-muted py-2">Riwayat Transaksi</h2>
             {activeWallet ? (
                <TransactionList walletId={activeWallet.id} />
             ) : (
                <p className="text-muted-foreground text-center text-sm py-4">Pilih dompet untuk melihat transaksi.</p>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
