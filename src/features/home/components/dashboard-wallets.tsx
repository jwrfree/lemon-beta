
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import type { Wallet as WalletType } from '@/types/models';
import { EmptyState } from '@/components/empty-state';

interface DashboardWalletsProps {
    wallets: WalletType[];
}

export const DashboardWallets = ({ wallets }: DashboardWalletsProps) => {
    const router = useRouter();

    return (
        <Card className="rounded-card bg-card/98 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Dompet</CardTitle>
                <CardDescription className="text-xs">
                    {wallets.length} dompet aktif digunakan
                </CardDescription>
            </CardHeader>
            <CardContent>
                {wallets.length === 0 ? (
                    <EmptyState
                        title="Buka Dompet"
                        description="Tidak ada dompet aktif ditemukan. Mulai kelola keuanganmu dengan membuat dompet pertama."
                        icon={Wallet}
                        actionLabel="Kelola Dompet"
                        onAction={() => router.push('/wallets')}
                        className="pt-0 md:min-h-[200px]"
                    />
                ) : (
                    <div className="space-y-3">
                        {wallets.slice(0, 4).map(wallet => {
                            const { Icon, textColor, logo } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                            return (
                                <Link
                                    href="/wallets"
                                    key={wallet.id}
                                    className="group flex items-center justify-between rounded-md p-3 transition-all hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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


