
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
      <header className="h-16 flex items-center relative px-4 shrink-0">
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
            const { Icon, gradient, textColor } = getWalletVisuals(wallet.name, wallet.icon);
            return (
              <Card 
                key={wallet.id} 
                className={cn("overflow-hidden text-white")}
                style={{backgroundImage: `linear-gradient(to right, ${gradient.split(' ')[0].replace('from-','--tw-gradient-from: var(--tw-gradient-to) calc(var(--tw-gradient-stops) * 0)); --tw-gradient-to: ').replace('-500', ' 500').replace('-400', ' 400').replace('-600', ' 600').replace('-700', ' 700').replace('-800', ' 800').replace('-900', ' 900')}, ${gradient.split(' ')[1].replace('to-','').replace('-500', ' 500').replace('-400', ' 400').replace('-600', ' 600').replace('-700', ' 700').replace('-800', ' 800').replace('-900', ' 900')})`
                  .replace(/(\w+)-(\d+)/g, (match, color, number) => `hsl(var(--${color}-${number}))`)
                  .replace(/hsl\(var\(--(\w+)-(\d+)\)\)/g, (match, color, number) => `var(--${color}-${number})`)
                  .replace(/--tw-gradient-from: var\(--tw-gradient-to\) calc\(var\(--tw-gradient-stops\) \* 0\); --tw-gradient-to: (\w+)-(\d+)/g, `var(--${'gray'}-${'500'})`)
                  .replace(/(\w+)-(\d+)/g, `var(--${'gray'}-${'700'})`)
                  }}
              >
                <div 
                    className={cn("p-4 flex items-center gap-4 bg-gradient-to-r", gradient)}
                >
                    <Icon className={cn("h-8 w-8", textColor, "opacity-80")} />
                    <div className="flex-1">
                      <p className="font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>{wallet.name}</p>
                      <p className={cn("text-xl font-bold", textColor)} style={{textShadow: '1px 1px 3px rgba(0,0,0,0.3)'}}>{formatCurrency(wallet.balance)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
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
