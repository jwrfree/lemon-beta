
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Edit2, AlertCircle, PlusCircle } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { Skeleton } from '@/components/ui/skeleton';

export const WalletsPage = ({ onAddWallet }: { onAddWallet: () => void }) => {
  const { wallets, isLoading } = useApp();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
        <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <h1 className="text-xl font-bold text-center w-full">Dompet Saya</h1>
        <Button variant="ghost" size="icon" className="absolute right-4" onClick={onAddWallet}>
          <Plus className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-16">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center">
            <div className="p-3 bg-destructive/10 rounded-full mb-3">
              <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold">Tidak ada Dompet</h2>
            <p className="text-muted-foreground mt-2 mb-6">Buat dompet pertama Anda untuk memulai.</p>
            <Button onClick={onAddWallet}>
              <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
              Buat Dompet
            </Button>
          </div>
        ) : (
          wallets.map(wallet => {
            const { Icon, color } = getWalletVisuals(wallet.icon);
            return (
              <div key={wallet.id} className={cn("p-4 rounded-lg shadow-md text-white", color)}>
                <div className="flex items-center gap-4 mb-2">
                  <Icon className="h-8 w-8 opacity-80" />
                  <div className="flex-1">
                    <p className="text-sm opacity-80">{wallet.name}</p>
                    <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/20">
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};
