
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Edit2, AlertCircle, PlusCircle, Wallet } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const WalletsPage = ({ onAddWallet }: { onAddWallet: () => void }) => {
  const { wallets, isLoading } = useApp();
  const router = useRouter();

  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

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
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
            {isLoading ? <Skeleton className="h-8 w-1/2 mx-auto" /> : <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col h-[50vh] items-center justify-center text-center">
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
        ) : (
          <div className="space-y-3">
          {wallets.map(wallet => {
            const { Icon, color } = getWalletVisuals(wallet.icon);
            return (
              <Card key={wallet.id} className={cn("overflow-hidden", color.replace('bg-', 'border-'))} style={{borderLeftWidth: 4}}>
                <div className="p-4 flex items-center gap-4">
                    <Icon className={cn("h-8 w-8", color.replace('bg-', 'text-'))} />
                    <div className="flex-1">
                      <p className="font-semibold">{wallet.name}</p>
                      <p className="text-lg font-bold text-muted-foreground">{formatCurrency(wallet.balance)}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-5 w-5" />
                    </Button>
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </main>
    </div>
  );
};
