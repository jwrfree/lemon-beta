'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/components/ui-provider';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { HandCoins, ArrowUpRight, ArrowDownRight, Plus, ChevronLeft, CalendarClock } from 'lucide-react';
import type { Debt } from '@/types/models';
import { useAssetsLiabilities } from '@/hooks/use-assets-liabilities';

const filterLabels: Record<string, string> = {
    all: 'Semua',
    owed: 'Saya Berhutang',
    owing: 'Orang Lain Berhutang',
    settled: 'Lunas',
};

const getDebtStatusBadge = (debt: Debt) => {
    if (debt.status === 'settled' || (debt.outstandingBalance ?? 0) <= 0) {
        return <Badge className="bg-emerald-500/10 text-emerald-600">Lunas</Badge>;
    }
    const dueDate = debt.dueDate ? parseISO(debt.dueDate) : null;
    if (dueDate && dueDate.getTime() < Date.now()) {
        return <Badge className="bg-destructive/10 text-destructive">Terlambat</Badge>;
    }
    return <Badge className="bg-primary/10 text-primary">Aktif</Badge>;
};

export default function DebtsPage() {
    const router = useRouter();
    const { debts, markDebtSettled } = useAssetsLiabilities();
    const { setIsDebtModalOpen, setDebtToEdit, setIsDebtPaymentModalOpen, setDebtForPayment } = useUI();
    const [activeFilter, setActiveFilter] = useState('all');

    const totals = useMemo(() => {
        let totalOwed = 0;
        let totalOwing = 0;
        debts.forEach((debt: Debt) => {
            const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
            if (debt.direction === 'owed') {
                totalOwed += outstanding;
            } else if (debt.direction === 'owing') {
                totalOwing += outstanding;
            }
        });
        return { totalOwed, totalOwing };
    }, [debts]);

    const filteredDebts = useMemo(() => {
        return debts.filter((debt: Debt) => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'settled') return debt.status === 'settled' || (debt.outstandingBalance ?? 0) <= 0;
            return debt.direction === activeFilter;
        });
    }, [debts, activeFilter]);

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center gap-2 relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold flex-1 text-center pr-10">Hutang & Piutang</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setDebtToEdit(null);
                        setIsDebtModalOpen(true);
                    }}
                    className="shrink-0"
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Tambah Catatan</span>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <HandCoins className="h-5 w-5 text-primary" />
                                Ringkasan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <ArrowUpRight className="h-4 w-4 text-destructive" /> Saya berhutang
                                </p>
                                <p className="text-lg font-semibold text-destructive">{formatCurrency(totals.totalOwed)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <ArrowDownRight className="h-4 w-4 text-emerald-600" /> Orang lain berhutang
                                </p>
                                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(totals.totalOwing)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            {Object.entries(filterLabels).map(([key, label]) => (
                                <TabsTrigger key={key} value={key} className="text-xs">
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="space-y-3">
                        {filteredDebts.length === 0 ? (
                            <Card className="p-6 text-center text-sm text-muted-foreground">
                                Belum ada catatan di kategori ini.
                            </Card>
                        ) : (
                            filteredDebts.map(debt => {
                                const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
                                const dueDate = debt.dueDate ? parseISO(debt.dueDate) : null;
                                const nextPaymentDate = debt.nextPaymentDate ? parseISO(debt.nextPaymentDate) : null;
                                const total = debt.principal ?? outstanding;
                                const progress = total > 0 ? Math.min(100, Math.round(((total - outstanding) / total) * 100)) : 0;

                                return (
                                    <Card key={debt.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    {debt.direction === 'owed' ? 'Saya berhutang' : 'Orang lain berhutang'}
                                                </p>
                                                <h2 className="text-lg font-semibold">{debt.title}</h2>
                                                <p className="text-sm text-muted-foreground">{debt.counterparty}</p>
                                            </div>
                                            {getDebtStatusBadge(debt)}
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Sisa</p>
                                                <p className="font-semibold">{formatCurrency(outstanding)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-muted-foreground">Total</p>
                                                <p className="font-semibold">{formatCurrency(total)}</p>
                                            </div>
                                        </div>

                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Terlunasi {progress}%</span>
                                            {dueDate && (
                                                <span className="flex items-center gap-1">
                                                    <CalendarClock className="h-3 w-3" />
                                                    {formatDistanceToNow(dueDate, { addSuffix: true, locale: dateFnsLocaleId })}
                                                </span>
                                            )}
                                        </div>

                                        {nextPaymentDate && (
                                            <div className="text-xs text-muted-foreground">
                                                Pembayaran berikutnya: {formatDistanceToNow(nextPaymentDate, { addSuffix: true, locale: dateFnsLocaleId })}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => {
                                                    setDebtForPayment(debt);
                                                    setIsDebtPaymentModalOpen(true);
                                                }}
                                            >
                                                Catat Pembayaran
                                            </Button>
                                            {(debt.status !== 'settled' && outstanding > 0) && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => markDebtSettled(debt.id)}
                                                >
                                                    Tandai Lunas
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setDebtToEdit(debt);
                                                    setIsDebtModalOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => router.push(`/debts/${debt.id}`)}
                                            >
                                                Detail
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
