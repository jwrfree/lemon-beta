'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/components/ui-provider';
import { formatCurrency, cn } from '@/lib/utils';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import { CalendarClock, ArrowUpRight, ArrowDownRight, ArrowUpDown, Plus } from 'lucide-react';
import type { Debt } from '@/types/models';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Progress } from '@/components/ui/progress';
import { DebtsEmptyState } from '@/features/debts/components/debts-empty-state';
import { DebtAnalyticsCard } from '@/features/debts/components/debt-analytics-card';
import { StatusBadge } from '@/components/status-badge';

const filterLabels: Record<string, string> = {
    all: 'Semua',
    owed: 'Saya Berhutang',
    owing: 'Orang Lain Berhutang',
    settled: 'Lunas',
};

const getDebtStatusBadge = (debt: Debt) => {
    if (debt.status === 'settled' || (debt.outstandingBalance ?? 0) <= 0) {
        return (
            <StatusBadge variant="success" tooltip="Hutang ini sudah lunas sepenuhnya.">
                Lunas
            </StatusBadge>
        );
    }
    const dueDate = debt.dueDate ? parseISO(debt.dueDate) : null;
    if (dueDate && dueDate.getTime() < Date.now()) {
        return (
            <StatusBadge variant="error" tooltip="Melewati tanggal jatuh tempo pembayaran.">
                Terlambat
            </StatusBadge>
        );
    }
    return (
        <StatusBadge variant="default" tooltip="Hutang masih aktif berjalan.">
            Aktif
        </StatusBadge>
    );
};

const getDebtDueStatus = (debt: Debt) => {
    if (debt.status === 'settled' || (debt.outstandingBalance ?? 0) <= 0 || !debt.dueDate) return null;

    const diff = differenceInCalendarDays(parseISO(debt.dueDate), new Date());

    if (diff < 0) {
        return (
            <span className="text-xs text-destructive font-medium flex items-center gap-1 bg-destructive/5 px-1.5 py-0.5 rounded w-fit mt-1">
                <CalendarClock className="h-3 w-3" />
                Telat {Math.abs(diff)} hari
            </span>
        );
    }
    if (diff === 0) {
        return (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1">
                <CalendarClock className="h-3 w-3" />
                Hari ini
            </span>
        );
    }
    if (diff <= 7) {
        return (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1">
                <CalendarClock className="h-3 w-3" />
                {diff} hari lagi
            </span>
        );
    }
    return (
        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded w-fit mt-1">
            <CalendarClock className="h-3 w-3" />
            {diff} hari lagi
        </span>
    );
};

export const DebtsDashboard = () => {
    const router = useRouter();
    const { debts, isLoading } = useDebts(); // Assuming isLoading exists or handle without
    const { setIsDebtModalOpen, setDebtToEdit } = useUI();
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updated_desc');

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

    const visibleDebts = useMemo(() => {
        let result = debts.filter((debt: Debt) => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'settled') return debt.status === 'settled' || (debt.outstandingBalance ?? 0) <= 0;
            return debt.direction === activeFilter;
        });

        return result.sort((a, b) => {
            switch (sortBy) {
                case 'amount_desc':
                    return (b.outstandingBalance ?? 0) - (a.outstandingBalance ?? 0);
                case 'amount_asc':
                    return (a.outstandingBalance ?? 0) - (b.outstandingBalance ?? 0);
                case 'due_soon':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'updated_desc':
                default: {
                    const dateA = a.updatedAt ? new Date(a.updatedAt) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
                    const dateB = b.updatedAt ? new Date(b.updatedAt) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
                    return dateB.getTime() - dateA.getTime();
                }
            }
        });
    }, [debts, activeFilter, sortBy]);

    if (debts.length === 0 && isLoading) { // safe check
        return <div className="p-8 text-center text-muted-foreground">Memuat data hutang...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Filter Toolbar */}
            <div className="flex justify-end mb-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-9 text-xs bg-background border-input/60">
                        <ArrowUpDown className="w-3 h-3 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="updated_desc">Terbaru Update</SelectItem>
                        <SelectItem value="due_soon">Jatuh Tempo</SelectItem>
                        <SelectItem value="amount_desc">Nominal Tertinggi</SelectItem>
                        <SelectItem value="amount_asc">Nominal Terendah</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary & Analytics */}
            <div className="space-y-4">
                {/* Visual Summary Card - Compact */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="shadow-card border-border/60 bg-gradient-to-br from-card to-destructive/5 overflow-hidden">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-destructive" /> Saya Berhutang
                            </p>
                            <p className="text-lg font-medium text-destructive">{formatCurrency(totals.totalOwed)}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-card border-border/60 bg-gradient-to-br from-card to-emerald-500/5 overflow-hidden">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                                <ArrowDownRight className="h-3 w-3 text-emerald-600" /> Piutang Saya
                            </p>
                            <p className="text-lg font-medium text-emerald-600">{formatCurrency(totals.totalOwing)}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="bg-muted p-1 rounded-card h-12 w-full grid grid-cols-4">
                    {Object.entries(filterLabels).map(([value, label]) => (
                        <TabsTrigger key={value} value={value} className="h-full rounded-md font-medium text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 px-1">
                            {label === 'Orang Lain Berhutang' ? 'Piutang' : label === 'Saya Berhutang' ? 'Hutang' : label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="space-y-3 pb-24">
                {visibleDebts.length === 0 ? (
                    <DebtsEmptyState />
                ) : (
                    visibleDebts.map((debt: Debt) => (
                        <Card
                            key={debt.id}
                            className="overflow-hidden hover:shadow-card transition-shadow cursor-pointer border-none shadow-card bg-card"
                            onClick={() => router.push(`/debts/${debt.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{debt.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{debt.direction === 'owed' ? 'Kepada: ' : 'Dari: '} {debt.counterparty}</p>
                                        {getDebtDueStatus(debt)}
                                    </div>
                                    {getDebtStatusBadge(debt)}
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            {debt.direction === 'owed' ? 'Sisa Hutang' : 'Sisa Piutang'}
                                        </p>
                                        <p className={cn(
                                            "text-base font-medium tabular-nums",
                                            debt.direction === 'owed' ? "text-destructive" : "text-emerald-600"
                                        )}>
                                            {formatCurrency(debt.outstandingBalance ?? debt.principal ?? 0)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 text-right">Progress</p>
                                        <div className="flex items-center gap-2">
                                            <Progress
                                                value={Math.max(0, Math.min(100, (1 - (debt.outstandingBalance ?? 0) / (debt.principal ?? 1)) * 100))}
                                                className="w-16 h-1.5 bg-muted"
                                            />
                                            <span className="text-xs font-medium">{Math.round((1 - (debt.outstandingBalance ?? 0) / (debt.principal ?? 1)) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Contextual FAB handled by this component for consistency */}
            <FAB
                onClick={() => {
                    setDebtToEdit(null);
                    setIsDebtModalOpen(true);
                }}
                label="Tambah catatan"
            />
        </div>
    );
};

