
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
  const { wallets } = useApp();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeWallet = wallets.length > 0 ? wallets[activeIndex] : null;

  return (
    <div className="flex flex-col bg-muted h-full">
      <header className="h-16 flex items-center relative px-4 shrink-0 bg-muted z-20 border-b">
        <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <h1 className="text-xl font-bold text-center w-full">Dompet Saya</h1>
        <Button variant="ghost" size="icon" className="absolute right-4" onClick={onAddWallet}>
          <Plus className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      </header>
      
      {wallets.length === 0 ? (
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
          <div className="h-64 pt-4 flex-shrink-0 bg-muted">
             <WalletCardStack 
                wallets={wallets} 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex} 
            />
          </div>
          <div className="flex-1 bg-background rounded-t-2xl overflow-y-auto px-4 pb-16 -mt-4 z-10 pt-4">
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
  );
};
