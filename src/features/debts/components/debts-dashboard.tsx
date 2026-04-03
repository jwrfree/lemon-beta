'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FAB } from '@/components/ui/fab';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/components/ui-provider';
import { formatCurrency, cn, triggerHaptic } from '@/lib/utils';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import {
 ArrowsDownUp,
 CalendarDots,
 TrendDown,
 TrendUp,
 CaretRight,
 CheckCircle,
 PencilSimple,
} from '@/lib/icons';
import type { Debt } from '@/types/models';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { DebtsEmptyState } from '@/features/debts/components/debts-empty-state';
import { StatusBadge } from '@/components/status-badge';
import { motion, useMotionValue, useTransform, type PanInfo, animate } from 'framer-motion';

const filterLabels: Record<string, string> = {
 all: 'Semua',
 owed: 'Hutang',
 owing: 'Piutang',
 settled: 'Lunas',
};

type DragPointerEvent = MouseEvent | TouchEvent | PointerEvent;

interface SwipeableDebtItemProps {
 debt: Debt;
 // eslint-disable-next-line no-unused-vars
 onSettle: (debt: Debt) => void;
 // eslint-disable-next-line no-unused-vars
 onEdit: (debt: Debt) => void;
}

const getDebtDueStatus = (debt: Debt) => {
 if (debt.status === 'settled'|| (debt.outstandingBalance ?? 0) <= 0 || !debt.dueDate) return null;

 const diff = differenceInCalendarDays(parseISO(debt.dueDate), new Date());

 if (diff < 0) {
 return (
 <span className="text-label flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
 <CalendarDots className="h-3 w-3"weight="regular"/>
 Telat {Math.abs(diff)} hari
 </span>
 );
 }

 if (diff === 0) {
 return (
 <span className="text-label flex w-fit items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-warning">
 <CalendarDots className="h-3 w-3"weight="regular"/>
 Hari ini
 </span>
 );
 }

 if (diff <= 7) {
 return (
 <span className="text-label flex w-fit items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-warning">
 <CalendarDots className="h-3 w-3"weight="regular"/>
 {diff} hari lagi
 </span>
 );
 }

 return (
 <span className="text-label flex w-fit items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-muted-foreground/45">
 <CalendarDots className="h-3 w-3"weight="regular"/>
 {diff} hari lagi
 </span>
 );
};

const SwipeableDebtItem = ({ debt, onSettle, onEdit }: SwipeableDebtItemProps) => {
 const router = useRouter();
 const itemRef = useRef<HTMLDivElement>(null);
 const x = useMotionValue(0);
 const settleVibrated = useRef(false);
 const editVibrated = useRef(false);

 const settleOpacity = useTransform(x, [0, 80], [0, 1]);
 const editOpacity = useTransform(x, [-80, 0], [1, 0]);

 const onDrag = (_event: DragPointerEvent, info: PanInfo) => {
 const distance = info.offset.x;
 if (!itemRef.current) return;

 const threshold = itemRef.current.offsetWidth / 3;

 if (distance > threshold && !settleVibrated.current) {
 triggerHaptic('medium');
 settleVibrated.current = true;
 editVibrated.current = false;
 } else if (distance < threshold && settleVibrated.current) {
 settleVibrated.current = false;
 }

 if (distance < -threshold && !editVibrated.current) {
 triggerHaptic('medium');
 editVibrated.current = true;
 settleVibrated.current = false;
 } else if (distance > -threshold && editVibrated.current) {
 editVibrated.current = false;
 }
 };

 const onDragEnd = (_event: DragPointerEvent, info: PanInfo) => {
 const offset = info.offset.x;
 const velocity = info.velocity.x;
 if (!itemRef.current) return;

 const threshold = itemRef.current.offsetWidth / 3;

 if (offset > threshold || velocity > 500) {
 animate(x, itemRef.current.offsetWidth, {
 type: 'spring',
 stiffness: 500,
 damping: 50,
 onComplete: () => {
 onSettle(debt);
 setTimeout(() => x.set(0), 500);
 },
 });
 } else if (offset < -threshold || velocity < -500) {
 animate(x, -itemRef.current.offsetWidth, {
 type: 'spring',
 stiffness: 500,
 damping: 50,
 onComplete: () => {
 onEdit(debt);
 setTimeout(() => x.set(0), 500);
 },
 });
 } else {
 animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
 }

 settleVibrated.current = false;
 editVibrated.current = false;
 };

 const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
 const progressValue = Math.max(0, Math.min(100, (1 - outstanding / (debt.principal ?? 1)) * 100));
 const isOwed = debt.direction === 'owed';

 return (
 <div ref={itemRef} className="relative overflow-hidden rounded-card-premium">
 <motion.div
 style={{ opacity: settleOpacity }}
 className="absolute inset-0 flex items-center justify-start bg-emerald-500 pl-8 text-white"
 >
 <div className="flex flex-col items-center gap-1">
 <CheckCircle size={24} weight="regular"/>
 <span className="text-label ">Lunas</span>
 </div>
 </motion.div>

 <motion.div
 style={{ opacity: editOpacity }}
 className="absolute inset-0 flex items-center justify-end bg-zinc-800 pr-8 text-white"
 >
 <div className="flex flex-col items-center gap-1">
 <PencilSimple size={24} weight="regular"/>
 <span className="text-label ">Ubah</span>
 </div>
 </motion.div>

 <motion.div
 drag="x"
 dragConstraints={{ left: -100, right: 100 }}
 dragElastic={0.05}
 onDrag={onDrag}
 onDragEnd={onDragEnd}
 style={{ x }}
 whileTap={{ scale: 0.99 }}
 onClick={() => {
 if (Math.abs(x.get()) < 5) {
 triggerHaptic('light');
 router.push(`/debts/${debt.id}`);
 }
 }}
 className="relative z-10"
 >
 <Card className="group overflow-hidden rounded-card-premium border-none bg-white p-6 shadow-sm dark:bg-zinc-900">
 <div className="relative z-10 flex flex-col gap-6">
 <div className="flex items-start justify-between">
 <div className="space-y-1.5">
 <h3 className="line-clamp-1 text-body-lg tracking-tight text-foreground">{debt.title}</h3>
 <div className="flex items-center gap-2">
 <div className="label-xs flex items-center gap-1.5 lowercase !text-muted-foreground/35">
 <span>{isOwed ? 'kepada': 'dari'}</span>
 <span className="text-muted-foreground/60">{debt.counterparty}</span>
 </div>
 </div>
 </div>
 <StatusBadge variant={debt.status === 'settled'? 'success': isOwed ? 'error': 'default'}>
 {debt.status === 'settled'? 'Lunas': isOwed ? 'Hutang': 'Piutang'}
 </StatusBadge>
 </div>

 <div className="space-y-4">
 <div className="flex items-end justify-between">
 <div className="space-y-1">
 <span className="label-xs !text-muted-foreground/45">Sisa Pelunasan</span>
 <p
 className={cn(
 'text-display-md font-medium leading-tight tracking-tighter tabular-nums',
 isOwed ? 'text-rose-500': 'text-emerald-500'
 )}
 >
 {formatCurrency(outstanding)}
 </p>
 </div>
 <div className="text-right">{getDebtDueStatus(debt)}</div>
 </div>

 <div className="space-y-2.5">
 <div className="flex items-end justify-between">
 <span className="label-xs !text-muted-foreground/30">Progres</span>
 <span className="text-label tabular-nums text-muted-foreground/45">
 {Math.round(progressValue)}%
 </span>
 </div>
 <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted dark:bg-zinc-800">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width:`${progressValue}%` }}
 className={cn('h-full rounded-full transition-all', isOwed ? 'bg-rose-500': 'bg-emerald-500')}
 />
 </div>
 </div>
 </div>
 </div>

 <div className="absolute bottom-1/2 right-4 translate-y-1/2 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
 <CaretRight size={16} className="text-muted-foreground/30"weight="regular"/>
 </div>
 </Card>
 </motion.div>
 </div>
 );
};

export const DebtsDashboard = () => {
 const { debts, isLoading } = useDebts();
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
 const filtered = debts.filter((debt: Debt) => {
 if (activeFilter === 'all') return true;
 if (activeFilter === 'settled') return debt.status === 'settled'|| (debt.outstandingBalance ?? 0) <= 0;
 return debt.direction === activeFilter;
 });

 return filtered.sort((a, b) => {
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

 const handleSettleDebt = (debt: Debt) => {
 void debt;
 triggerHaptic('success');
 };

 const handleEditDebt = (debt: Debt) => {
 triggerHaptic('medium');
 setDebtToEdit(debt);
 setIsDebtModalOpen(true);
 };

 if (debts.length === 0 && isLoading) {
 return (
 <div className="flex justify-center p-12">
 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear'}}>
 <CalendarDots size={24} className="text-muted-foreground/20"weight="regular"/>
 </motion.div>
 </div>
 );
 }

 return (
 <div className="animate-in space-y-8 fade-in slide-in-from-bottom-2 duration-500">
 <div className="space-y-6 px-1">
 <div className="grid grid-cols-2 gap-3">
 <div
 className="flex flex-col gap-1.5 rounded-card-premium border-none bg-white p-5 shadow-sm transition-all active:scale-[0.98] dark:bg-zinc-900"
 onClick={() => setActiveFilter('owed')}
 >
 <div className="label-xs flex items-center gap-1.5 !text-rose-500/70">
 <TrendDown size={14} weight="regular"/>
 <span>Hutang</span>
 </div>
 <p className="text-display-md font-medium leading-tight tracking-tighter tabular-nums text-foreground">
 {formatCurrency(totals.totalOwed)}
 </p>
 </div>
 <div
 className="flex flex-col gap-1.5 rounded-card-premium border-none bg-white p-5 shadow-sm transition-all active:scale-[0.98] dark:bg-zinc-900"
 onClick={() => setActiveFilter('owing')}
 >
 <div className="label-xs flex items-center gap-1.5 !text-emerald-500/70">
 <TrendUp size={14} weight="regular"/>
 <span>Piutang</span>
 </div>
 <p className="text-display-md font-medium leading-tight tracking-tighter tabular-nums text-foreground">
 {formatCurrency(totals.totalOwing)}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <div className="flex-1 overflow-x-auto py-1 scrollbar-hide">
 <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
 <TabsList className="h-10 w-fit rounded-full border-none bg-muted/50 p-1">
 {Object.entries(filterLabels).map(([value, label]) => (
 <TabsTrigger
 key={value}
 value={value}
 className="h-full rounded-full px-4 text-label transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800"
 >
 {label}
 </TabsTrigger>
 ))}
 </TabsList>
 </Tabs>
 </div>

 <Select value={sortBy} onValueChange={setSortBy}>
 <SelectTrigger className="flex h-10 w-[44px] items-center justify-center rounded-full border-none bg-muted/40 p-0 shadow-none transition-colors hover:bg-muted/60">
 <ArrowsDownUp className="h-4 w-4 text-muted-foreground/60"weight="regular"/>
 </SelectTrigger>
 <SelectContent align="end"className="rounded-3xl border-none bg-popover/95 shadow-xl backdrop-blur-xl">
 <SelectItem value="updated_desc"className="p-3 text-label ">
 Terbaru
 </SelectItem>
 <SelectItem value="due_soon"className="p-3 text-label ">
 Jatuh Tempo
 </SelectItem>
 <SelectItem value="amount_desc"className="p-3 text-label ">
 Nominal Tertinggi
 </SelectItem>
 <SelectItem value="amount_asc"className="p-3 text-label ">
 Nominal Terendah
 </SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-3 px-1 pb-24">
 {visibleDebts.length === 0 ? (
 <DebtsEmptyState />
 ) : (
 visibleDebts.map((debt: Debt) => (
 <SwipeableDebtItem key={debt.id} debt={debt} onSettle={handleSettleDebt} onEdit={handleEditDebt} />
 ))
 )}
 </div>

 <FAB
 onClick={() => {
 triggerHaptic('medium');
 setDebtToEdit(null);
 setIsDebtModalOpen(true);
 }}
 label="Tambah catatan"
 />
 </div>
 );
};

