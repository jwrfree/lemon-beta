
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet } from '@/types/models';

interface DashboardWalletsProps {
    wallets: Wallet[];
}

export const DashboardWallets = ({ wallets }: DashboardWalletsProps) => {
    const router = useRouter();

    return (
        <Card className="border border-border shadow-card bg-card rounded-card">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Dompet</CardTitle>
                <CardDescription className="text-xs">
                    {wallets.length} dompet aktif digunakan
                </CardDescription>
            </CardHeader>
            <CardContent>
                {wallets.length === 0 ? (
                    <div className="rounded-md border border-dashed border-primary/30 p-4 text-sm text-muted-foreground flex items-center justify-between">
                        <span>Tidak ada dompet untuk filter ini.</span>
                        <Button size="sm" variant="outline" onClick={() => router.push('/wallets')}>
                            Kelola Dompet
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {wallets.slice(0, 4).map(wallet => {
                            const { Icon, textColor, logo } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                            return (
                                <Link
                                    href="/wallets"
                                    key={wallet.id}
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2.5 rounded-md bg-primary/10 overflow-hidden flex items-center justify-center", textColor.replace('text-white', 'text-primary'))}>
                                            {logo ? (
                                                <>
                                                    <img
                                                        src={logo}
                                                        alt={wallet.name}
                                                        className="h-5 w-5 object-contain rounded-full"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const icon = e.currentTarget.nextElementSibling;
                                                            if (icon) icon.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <Icon className="h-5 w-5 hidden" />
                                                </>
                                            ) : (
                                                <Icon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{wallet.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{wallet.icon?.replace('-', ' ') || 'Personal'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm tabular-nums">{formatCurrency(wallet.balance)}</p>
                                    </div>
                                </Link>
                            )
                        })}
                        <Button variant="ghost" className="w-full text-xs font-medium text-primary hover:bg-primary/5 mt-2 rounded-lg" onClick={() => router.push('/wallets')}>
                            Lihat Semua Dompet <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

