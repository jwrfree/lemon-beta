'use client';

import React, { useEffect, useState } from 'react';
import { Receipt } from '@/lib/icons';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { formatCurrency, cn } from '@/lib/utils';
import { financialContextService, type TransactionSearchResult } from '@/lib/services/financial-context-service';

export const RecentTransactionsList = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<TransactionSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const loadRecentTransactions = async () => {
            if (!user) {
                if (isActive) {
                    setTransactions([]);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);

            try {
                const results = await financialContextService.getRecentTransactions(user.id, undefined, 3);
                if (isActive) {
                    setTransactions(results);
                }
            } catch (error) {
                console.error('Failed to load recent transactions for chat card:', error);
                if (isActive) {
                    setTransactions([]);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void loadRecentTransactions();

        return () => {
            isActive = false;
        };
    }, [user]);

    if (isLoading) {
        return <Skeleton className="h-32 w-full rounded-2xl" />;
    }

    return (
        <Card className="mt-4 bg-background border border-border/40 shadow-soft rounded-card overflow-hidden motion-surface">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Recent Transactions</span>
                    <Receipt size={12} weight="regular" className="text-muted-foreground/30" />
                </div>

                {transactions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 px-3 py-4 text-center">
                        <p className="text-xs text-muted-foreground">Belum ada transaksi terbaru yang bisa ditampilkan.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map((tx) => (
                            <div key={tx.transaction_id || tx.id} className="flex items-center justify-between group">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold truncate text-foreground/80">{tx.description}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                        {tx.category} - {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-semibold shrink-0 ml-2",
                                        tx.type === 'income' ? "text-success" : "text-foreground"
                                    )}
                                >
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

