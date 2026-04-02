'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FAB } from '@/components/ui/fab';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/components/ui-provider';
import { formatCurrency, cn } from '@/lib/utils';
import { parseISO, differenceInCalendarDays, format } from 'date-fns';
import { ArrowsDownUp, CalendarDots, TrendDown, TrendUp } from '@phosphor-icons/react';
import type { Debt } from '@/types/models';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { DebtsEmptyState } from '@/features/debts/components/debts-empty-state';
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
                <CalendarDots className="h-3 w-3" weight="regular" />
                Telat {Math.abs(diff)} hari
            </span>
        );
    }
    if (diff === 0) {
        return (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1">
                <CalendarDots className="h-3 w-3" weight="regular" />
                Hari ini
            </span>
        );
    }
    if (diff <= 7) {
        return (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit mt-1">
                <CalendarDots className="h-3 w-3" weight="regular" />
                {diff} hari lagi
            </span>
        );
    }
    return (
        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded w-fit mt-1">
            <CalendarDots className="h-3 w-3" weight="regular" />
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
        return <div className="p-6 text-center text-muted-foreground">Memuat data hutang...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header: Actions & Filter Integration */}
            <div className="flex flex-col gap-4">
                {/* Summary & Analytics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-card-premium border border-destructive/20 bg-destructive/5 p-4 flex flex-col justify-between group hover:bg-destructive/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendDown className="h-3.5 w-3.5 text-destructive opacity-70" weight="regular" />
                            <p className="text-[10px] uppercase font-bold text-destructive tracking-[0.1em]">Saya Berhutang</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-semibold tracking-tighter text-destructive tabular-nums leading-none">{formatCurrency(totals.totalOwed)}</p>
                        </div>
                    </div>
                    <div className="rounded-card-premium border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between group hover:bg-primary/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendUp className="h-3.5 w-3.5 text-primary opacity-70" weight="regular" />
                            <p className="text-[10px] uppercase font-bold text-primary tracking-[0.1em]">Piutang Saya</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-semibold tracking-tighter text-primary tabular-nums leading-none">{formatCurrency(totals.totalOwing)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                            <TabsList className="bg-muted/50 h-10 p-1 gap-1 justify-start w-full rounded-full border border-border/20">
                                {Object.entries(filterLabels).map(([value, label]) => (
                                    <TabsTrigger 
                                        key={value} 
                                        value={value} 
                                        className="flex-1 rounded-full h-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                                    >
                                        {label === 'Orang Lain Berhutang' ? 'Piutang' : label === 'Saya Berhutang' ? 'Hutang' : label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[44px] h-10 p-0 flex items-center justify-center rounded-full bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors">
                            <ArrowsDownUp className="w-4 h-4 text-muted-foreground" weight="regular" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-card-glass border-border/40 min-w-[160px]">
                            <SelectItem value="updated_desc" className="text-xs font-medium">✨ Terbaru Update</SelectItem>
                            <SelectItem value="due_soon" className="text-xs font-medium">⏰ Jatuh Tempo</SelectItem>
                            <SelectItem value="amount_desc" className="text-xs font-medium">💰 Nominal Tertinggi</SelectItem>
                            <SelectItem value="amount_asc" className="text-xs font-medium">💸 Nominal Terendah</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3 app-page-body-padding">
                {visibleDebts.length === 0 ? (
                    <DebtsEmptyState />
                ) : (
                    visibleDebts.map((debt: Debt) => {
                         const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
                         const progressValue = Math.max(0, Math.min(100, (1 - outstanding / (debt.principal ?? 1)) * 100));
                         return (
                            <Card
                                key={debt.id}
                                className="overflow-hidden transition-all border border-border/40 bg-card group hover:border-primary/20 hover:bg-primary/[0.02]"
                                onClick={() => router.push(`/debts/${debt.id}`)}
                            >
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h3 className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{debt.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/10">
                                                    {debt.direction === 'owed' ? 'Kepada: ' : 'Dari: '} 
                                                    <span className="text-foreground/80">{debt.counterparty}</span>
                                                </p>
                                                {getDebtDueStatus(debt)}
                                            </div>
                                        </div>
                                        {getDebtStatusBadge(debt)}
                                    </div>

                                    <div className="space-y-3 p-3 rounded-card-glass bg-muted/30 border border-border/20">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-0.5">
                                                    {debt.direction === 'owed' ? 'Sisa Hutang' : 'Sisa Piutang'}
                                                </p>
                                                <p className={cn(
                                                    "text-xl font-bold tracking-tighter tabular-nums",
                                                    debt.direction === 'owed' ? "text-destructive" : "text-emerald-600"
                                                )}>
                                                    {formatCurrency(outstanding)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-1">PROGRES</p>
                                                <p className="text-sm font-bold tracking-tighter">{Math.round(progressValue)}%</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Progress
                                                value={progressValue}
                                                className={cn(
                                                    "h-2 overflow-hidden bg-background/50",
                                                    debt.direction === 'owed' ? "text-destructive" : "text-emerald-500"
                                                )}
                                            />
                                            {debt.dueDate && (
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                                    <span>Mulai: {debt.createdAt ? format(new Date(debt.createdAt), 'd MMM') : '-'}</span>
                                                    <span>Tempo: {format(parseISO(debt.dueDate), 'd MMM')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Contextual FAB */}
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


