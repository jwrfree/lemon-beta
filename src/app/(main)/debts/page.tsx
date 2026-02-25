'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/components/ui-provider';
import { formatCurrency, cn } from '@/lib/utils';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import { HandCoins, ArrowUpRight, ArrowDownRight, Plus, CalendarClock, ArrowUpDown } from 'lucide-react';
import type { Debt } from '@/types/models';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import { DebtsEmptyState } from '@/features/debts/components/debts-empty-state';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DebtAnalyticsCard } from '@/features/debts/components/debt-analytics-card';
import { StatusBadge } from '@/components/status-badge';
import { motion } from 'framer-motion';

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
            <span className="text-xs text-destructive font-medium flex items-center gap-1 bg-destructive/10 px-1.5 py-0.5 rounded-md w-fit mt-1">
                <CalendarClock className="h-3 w-3" /> 
                Telat {Math.abs(diff)} hari
            </span>
        );
    }
    if (diff === 0) {
        return (
            <span className="text-xs text-warning font-medium flex items-center gap-1 bg-warning/10 px-1.5 py-0.5 rounded-md w-fit mt-1">
                <CalendarClock className="h-3 w-3" /> 
                Hari ini
            </span>
        );
    }
    if (diff <= 7) {
        return (
            <span className="text-xs text-warning font-medium flex items-center gap-1 bg-warning/10 px-1.5 py-0.5 rounded-md w-fit mt-1">
                <CalendarClock className="h-3 w-3" /> 
                {diff} hari lagi
            </span>
        );
    }
    return (
        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md w-fit mt-1">
            <CalendarClock className="h-3 w-3" /> 
            {diff} hari lagi
        </span>
    );
};

import { getVisualDNA } from '@/lib/visual-dna';

// ... (existing helper components)

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
        <div className="flex flex-col h-full relative">
            <PageHeader 
                title="Hutang & Piutang" 
                showBackButton={true}
                extraActions={
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] h-9 text-xs font-semibold uppercase tracking-widest bg-background/50 backdrop-blur-md border-none">
                            <ArrowUpDown className="w-3 h-3 mr-2 text-primary" />
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-card border-none shadow-xl bg-popover/95 backdrop-blur-xl">
                            <SelectItem value="updated_desc" className="text-xs font-semibold uppercase tracking-widest p-3">Terbaru Update</SelectItem>
                            <SelectItem value="due_soon" className="text-xs font-semibold uppercase tracking-widest p-3">Jatuh Tempo</SelectItem>
                            <SelectItem value="amount_desc" className="text-xs font-semibold uppercase tracking-widest p-3">Nominal Tertinggi</SelectItem>
                            <SelectItem value="amount_asc" className="text-xs font-semibold uppercase tracking-widest p-3">Nominal Terendah</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="p-4 space-y-8">
                    {/* Summary Hero Card */}
                    <Card className="border-none rounded-card-premium bg-teal-900 text-white shadow-card overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12">
                            <HandCoins className="h-40 w-40" />
                        </div>
                        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl"></div>

                        <CardContent className="p-8 space-y-8 relative z-10">
                            <div>
                                <p className="label-xs text-white/50 mb-2">Debt Overview</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-semibold tracking-tighter text-white tabular-nums">
                                        {formatCurrency(Math.abs(totals.totalOwing - totals.totalOwed))}
                                    </span>
                                    <span className="label-xs text-white/40">Net Liability</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-md rounded-card-glass p-4 border border-white/10 shadow-inner">
                                    <p className="label-xs text-rose-300/60 mb-1.5 flex items-center gap-1.5">
                                        <ArrowUpRight className="h-3 w-3" /> Owed
                                    </p>
                                    <p className="text-lg font-semibold tracking-tight text-white tabular-nums">{formatCurrency(totals.totalOwed)}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-card-glass p-4 border border-white/10 shadow-inner">
                                    <p className="label-xs text-emerald-300/60 mb-1.5 flex items-center gap-1.5">
                                        <ArrowDownRight className="h-3 w-3" /> Owing
                                    </p>
                                    <p className="text-lg font-semibold tracking-tight text-white tabular-nums">{formatCurrency(totals.totalOwing)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <DebtAnalyticsCard debts={debts} />

                    <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-full h-12 w-full grid grid-cols-4">
                            {Object.entries(filterLabels).map(([value, label]) => (
                                <TabsTrigger key={value} value={value} className="h-full rounded-full font-semibold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-primary">
                                    {label === 'Semua' ? 'All' : label.split(' ')[0]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="space-y-5">
                        {visibleDebts.length === 0 ? (
                            <DebtsEmptyState />
                        ) : (
                            visibleDebts.map((debt: Debt) => {
                                const isOwed = debt.direction === 'owed';
                                const dna = getVisualDNA(isOwed ? 'rose' : 'emerald');
                                const progress = Math.max(0, Math.min(100, (1 - (debt.outstandingBalance ?? 0) / (debt.principal ?? 1)) * 100));

                                return (
                                    <Card
                                        key={debt.id}
                                        className="overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer border-none shadow-card rounded-card-premium relative"
                                        style={{ 
                                            background: dna.gradient,
                                            boxShadow: `0 20px 40px -12px ${dna.ambient.replace('0.2', '0.4')}` 
                                        }}
                                        onClick={() => router.push(`/debts/${debt.id}`)}
                                    >
                                        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl"></div>
                                        
                                        <CardContent className="p-7 relative z-10 text-white">
                                            <div className="flex items-start justify-between gap-4 mb-8">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg tracking-tight truncate">{debt.title}</h3>
                                                    <p className="label-xs text-white/50 mt-1">{isOwed ? 'To: ' : 'From: '} {debt.counterparty}</p>
                                                    <div className="mt-2">{getDebtDueStatus(debt)}</div>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
                                                    <span className="label-xs text-white">
                                                        {debt.status === 'settled' ? 'Settled' : 'Active'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between gap-6">
                                                <div className="space-y-2 flex-1">
                                                    <p className="label-xs text-white/40">
                                                        {isOwed ? 'Principal Owed' : 'Receivable'}
                                                    </p>
                                                    <div className="bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-card-glass border border-white/5 w-fit">
                                                        <p className="text-2xl font-semibold tracking-tighter tabular-nums text-white">
                                                            {formatCurrency(debt.outstandingBalance ?? debt.principal ?? 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-2 min-w-[80px]">
                                                    <p className="label-xs text-white/40">Recovery</p>
                                                    <div className="flex items-center gap-3 justify-end">
                                                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                                className="h-full rounded-full bg-white"
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold tabular-nums text-white">{Math.round(progress)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <FAB
                onClick={() => {
                    setDebtToEdit(null);
                    setIsDebtModalOpen(true);
                }}
                label="Tambah catatan hutang"
                mobileOnly={false}
            />
        </div>
    );
}

