'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FAB } from '@/components/ui/fab';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/components/ui-provider';
import { formatCurrency, cn, triggerHaptic } from '@/lib/utils';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import { ArrowsDownUp, ArrowDownRight, ArrowUpRight, CalendarDots } from '@/lib/icons';
import type { Debt } from '@/types/models';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { layout } from '@/lib/layout-tokens';

import { PageHeader } from '@/components/page-header';
import { DebtsEmptyState } from '@/features/debts/components/debts-empty-state';
import { StatusBadge } from '@/components/status-badge';
import { motion } from 'framer-motion';
import { AppPageBody, AppPageShell } from '@/components/app-page-shell';

const filterLabels: Record<string, string> = {
    all: 'Semua',
    owed: 'Hutang',
    owing: 'Piutang',
    settled: 'Lunas',
};

const getDebtDueStatus = (debt: Debt) => {
    if (debt.status === 'settled' || (debt.outstandingBalance ?? 0) <= 0 || !debt.dueDate) return null;
    
    const diff = differenceInCalendarDays(parseISO(debt.dueDate), new Date());
    
    if (diff < 0) {
        return (
            <span className="text-label uppercase tracking-widest text-destructive font-semibold flex items-center gap-1.5 bg-destructive/10 px-2 py-0.5 rounded-full w-fit mt-1">
                <CalendarDots className="h-3 w-3" weight="bold" /> 
                Telat {Math.abs(diff)} hari
            </span>
        );
    }
    if (diff === 0) {
        return (
            <span className="text-label uppercase tracking-widest text-warning font-semibold flex items-center gap-1.5 bg-warning/10 px-2 py-0.5 rounded-full w-fit mt-1">
                <CalendarDots className="h-3 w-3" weight="bold" /> 
                Hari ini
            </span>
        );
    }
    if (diff <= 7) {
        return (
            <span className="text-label uppercase tracking-widest text-warning font-semibold flex items-center gap-1.5 bg-warning/10 px-2 py-0.5 rounded-full w-fit mt-1">
                <CalendarDots className="h-3 w-3" weight="bold" /> 
                {diff} hari lagi
            </span>
        );
    }
    return (
        <span className="text-label uppercase tracking-widest text-muted-foreground/60 font-semibold flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-full w-fit mt-1">
            <CalendarDots className="h-3 w-3" weight="regular" /> 
            {diff} hari lagi
        </span>
    );
};

export default function DebtsPage() {
    const router = useRouter();
    const { debts } = useDebts();
    const { setIsDebtModalOpen, setDebtToEdit } = useUI();
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updated_desc');

    const totals = useMemo(() => {
        let totalOwed = 0;
        let totalOwing = 0;
        debts.forEach((debt: Debt) => {
            const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
            if (debt.status === 'settled' || outstanding <= 0) return;
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

    return (
        <AppPageShell className="bg-zinc-50 dark:bg-black">
            <PageHeader 
                title="Hutang & Piutang" 
                showBackButton={false}
                extraActions={
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] h-9 text-label font-semibold uppercase tracking-widest bg-white dark:bg-zinc-900 border-none shadow-sm rounded-full px-4">
                            <ArrowsDownUp className="w-3 h-3 mr-2 text-muted-foreground/60" weight="regular" />
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-card-glass border-none shadow-xl bg-popover/95 backdrop-blur-xl">
                            <SelectItem value="updated_desc" className="text-label font-semibold uppercase tracking-widest p-3">Terbaru Update</SelectItem>
                            <SelectItem value="due_soon" className="text-label font-semibold uppercase tracking-widest p-3">Jatuh Tempo</SelectItem>
                            <SelectItem value="amount_desc" className="text-label font-semibold uppercase tracking-widest p-3">Nominal Tertinggi</SelectItem>
                            <SelectItem value="amount_asc" className="text-label font-semibold uppercase tracking-widest p-3">Nominal Terendah</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />
            
            <AppPageBody className={cn(layout.container, "pt-6")}>
                
                {/* 1. Hero Summary (High Contrast NeoBank Style) */}
                <div className="px-1 space-y-6">
                    <div className="space-y-1.5">
                        <span className="label-xs !text-muted-foreground/45">Liabilitas Bersih</span>
                        <h2 className="text-4xl font-medium tracking-tighter tabular-nums text-foreground leading-none">
                            {formatCurrency(Math.abs(totals.totalOwing - totals.totalOwed))}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-card-premium shadow-soft border-none flex flex-col gap-1">
                            <span className="label-xs !text-destructive/70 flex items-center gap-1.5">
                                <ArrowUpRight size={12} weight="bold" /> Hutang
                            </span>
                            <span className="text-lg font-medium tracking-tight text-foreground tabular-nums">
                                {formatCurrency(totals.totalOwed)}
                            </span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-card-premium shadow-soft border-none flex flex-col gap-1">
                            <span className="label-xs !text-success/70 flex items-center gap-1.5">
                                <ArrowDownRight size={12} weight="bold" /> Piutang
                            </span>
                            <span className="text-lg font-medium tracking-tight text-foreground tabular-nums">
                                {formatCurrency(totals.totalOwing)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Advanced Filtering */}
                <div className="space-y-4 px-1">
                    <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-full h-12 w-full grid grid-cols-4 border-none">
                            {Object.entries(filterLabels).map(([value, label]) => (
                                <TabsTrigger 
                                    key={value} 
                                    value={value} 
                                    className="h-full rounded-full font-semibold text-label uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* 3. Debt List */}
                <div className="space-y-4">
                    {visibleDebts.length === 0 ? (
                        <DebtsEmptyState />
                    ) : (
                        <div className="space-y-3">
                            {visibleDebts.map((debt: Debt) => {
                                const isOwed = debt.direction === 'owed';
                                const progress = Math.max(0, Math.min(100, (1 - (debt.outstandingBalance ?? 0) / (debt.principal ?? 1)) * 100));

                                return (
                                    <motion.div
                                        key={debt.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { triggerHaptic('light'); router.push(`/debts/${debt.id}`); }}
                                        className="cursor-pointer"
                                    >
                                        <Card className="border-none rounded-card-premium bg-white dark:bg-zinc-900 shadow-soft p-6 flex flex-col gap-6 overflow-hidden relative group">
                                            {/* Decorative Background Glow */}
                                            <div className={cn(
                                                "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                                                isOwed ? "bg-destructive" : "bg-success"
                                            )} />

                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{debt.title}</h3>
                                                    <p className="label-xs !text-muted-foreground/35">
                                                        {isOwed ? 'Kepada: ' : 'Dari: '} <span className="text-muted-foreground/60">{debt.counterparty}</span>
                                                    </p>
                                                </div>
                                                <StatusBadge variant={debt.status === 'settled' ? 'success' : isOwed ? 'error' : 'default'}>
                                                    {debt.status === 'settled' ? 'Lunas' : isOwed ? 'Hutang' : 'Piutang'}
                                                </StatusBadge>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="flex items-end justify-between">
                                                    <div className="space-y-1">
                                                        <span className="label-xs !text-muted-foreground/45">
                                                            {isOwed ? 'Sisa Hutang' : 'Sisa Piutang'}
                                                        </span>
                                                        <p className="text-2xl font-medium tracking-tighter tabular-nums text-foreground">
                                                            {formatCurrency(debt.outstandingBalance ?? debt.principal ?? 0)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        {getDebtDueStatus(debt)}
                                                    </div>
                                                </div>

                                                {/* Progress Bar (Recovery) */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center label-xs !text-muted-foreground/30">
                                                        <span>Progress Pelunasan</span>
                                                        <span className="tabular-nums font-semibold">{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            className={cn("h-full rounded-full", isOwed ? "bg-destructive" : "bg-success")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </AppPageBody>

            <FAB
                onClick={() => {
                    triggerHaptic('medium');
                    setDebtToEdit(null);
                    setIsDebtModalOpen(true);
                }}
                label="Tambah catatan hutang"
                mobileOnly={false}
            />
        </AppPageShell>
    );
}

