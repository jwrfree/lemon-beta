'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/components/ui-provider';
import { format, formatDistanceToNow, isBefore, parseISO, addDays, isSameDay, startOfDay, differenceInCalendarDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarClock, Clock, Check, Plus, BellRing, EllipsisVertical, Filter, AlertCircle, Sparkles, MagnifyingGlass, CircleNotch } from '@/lib/icons';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';
import type { Reminder, Debt, Transaction } from '@/types/models';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { analyzeSubscriptions } from '@/lib/subscription-analysis';
import { auditSubscriptionsFlow } from '@/ai/flows/audit-subscriptions-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusLabels: Record<string, string> = {
 all: 'Semua',
 upcoming: 'Akan Datang',
 overdue: 'Terlambat',
 snoozed: 'Ditunda',
 completed: 'Selesai',
};

const getReminderStatus = (reminder: Reminder) => {
 if (reminder.status === 'completed') return 'completed';
 const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
 if (!dueDate) return 'upcoming';
 const now = new Date();
 if (isBefore(dueDate, now) && reminder.status !== 'snoozed') {
 return 'overdue';
 }
 if (reminder.status === 'snoozed') {
 return isBefore(dueDate, now) ? 'overdue': 'snoozed';
 }
 return 'upcoming';
};

interface RemindersDashboardProps {
  transactions: Transaction[];
}

export const RemindersDashboard = ({ transactions }: RemindersDashboardProps) => {
 const { debts } = useDebts();
 const { reminders, markReminderComplete, snoozeReminder, deleteReminder } = useReminders();
 const { setIsReminderModalOpen, setReminderToEdit, showToast } = useUI();

 // Subscription Analysis
 const subscriptionSummary = useMemo(() => analyzeSubscriptions(transactions), [transactions]);
 const [aiInsight, setAiInsight] = useState<string | null>(null);
 const [isAiLoading, setIsAiLoading] = useState(false);

 useEffect(() => {
   if (subscriptionSummary.activeSubscriptions > 0 && !aiInsight && !isAiLoading) {
     setIsAiLoading(true);
     auditSubscriptionsFlow(subscriptionSummary).then(text => {
       setAiInsight(text);
       setIsAiLoading(false);
     });
   }
 }, [subscriptionSummary.activeSubscriptions, subscriptionSummary, aiInsight, isAiLoading]);

 const [activeTab, setActiveTab] = useState('upcoming');
 const [search, setSearch] = useState('');
 const [range, setRange] = useState<'week'| '30'>('week');

 const sortedReminders = useMemo<Reminder[]>(() => {
 return [...reminders].sort((a, b) => {
 const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
 const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
 return aDue - bDue;
 });
 }, [reminders]);

 const filteredReminders = useMemo(() => {
 const now = startOfDay(new Date());
 const forwardDays = range === 'week'? 7 : 30;

 return sortedReminders.filter((reminder: Reminder) => {
 const status = getReminderStatus(reminder);
 const matchesStatus = activeTab === 'all'|| status === activeTab;
 const matchesSearch = reminder.title.toLowerCase().includes(search.toLowerCase());
 const withinRange = reminder.dueDate
 ? (() => {
 const diff = differenceInCalendarDays(parseISO(reminder.dueDate), now);
 return diff >= -1 && diff <= forwardDays;
 })()
 : true;
 return matchesStatus && matchesSearch && withinRange;
 });
 }, [sortedReminders, activeTab, search, range]);

 const groupedByDate = useMemo(() => {
 const groups: Record<string, Reminder[]> = {};
 filteredReminders.forEach(reminder => {
 const key = reminder.dueDate ? startOfDay(parseISO(reminder.dueDate)).toISOString() : 'no-date';
 if (!groups[key]) groups[key] = [];
 groups[key].push(reminder);
 });
 return Object.entries(groups)
 .sort(([a], [b]) => (a === 'no-date'? 1 : b === 'no-date'? -1 : new Date(a).getTime() - new Date(b).getTime()));
 }, [filteredReminders]);

 const handleComplete = async (reminder: Reminder) => {
 try {
 await markReminderComplete(reminder.id);
 } catch (error) {
 console.error(error);
 showToast('Gagal menandai pengingat.', 'error');
 }
 };

 const handleSnooze = async (reminder: Reminder, days = 1) => {
 if (!reminder.dueDate) {
 showToast('Pengingat ini belum memiliki tanggal jatuh tempo.', 'error');
 return;
 }
 const newDueDate = addDays(parseISO(reminder.dueDate), days).toISOString();
 try {
 await snoozeReminder(reminder.id, newDueDate, reminder.snoozeCount ?? 0);
 } catch (error) {
 console.error(error);
 showToast('Gagal menunda pengingat.', 'error');
 }
 };

 const handleDelete = async (reminder: Reminder) => {
 try {
 await deleteReminder(reminder.id);
 } catch (error) {
 console.error(error);
 showToast('Gagal menghapus pengingat.', 'error');
 }
 };

 const overdueRemindersCount = useMemo(() => reminders.filter(r => getReminderStatus(r) === 'overdue').length, [reminders]);
 const upcomingRemindersCount = useMemo(() => reminders.filter(r => {
 if (!r.dueDate || getReminderStatus(r) === 'completed') return false;
 const diff = differenceInCalendarDays(parseISO(r.dueDate), new Date());
 return diff >= 0 && diff <= 7;
 }).length, [reminders]);

 const renderStatusBadge = React.useCallback((status: string) => {
 switch (status) {
 case 'completed':
 return <Badge variant="secondary"className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-2 py-0">Selesai</Badge>;
 case 'overdue':
 return <Badge variant="secondary"className="bg-destructive/10 text-destructive border-none rounded-full px-2 py-0">Terlambat</Badge>;
 case 'snoozed':
 return <Badge variant="secondary"className="bg-amber-500/10 text-amber-600 border-none rounded-full px-2 py-0">Ditunda</Badge>;
 default:
 return <Badge variant="secondary"className="bg-primary/10 text-primary border-none rounded-full px-2 py-0">Akan Datang</Badge>;
 }
 }, []);

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 app-page-body-padding">
      {/* Unified Bills Dashboard Insight */}
      {(aiInsight || isAiLoading) && (
        <div className="flex items-start gap-4 rounded-card-premium bg-primary/6 p-4 shadow-none border-none transition-all">
          <div className="bg-primary/10 p-2 rounded-card shrink-0">
            {isAiLoading ? (
              <CircleNotch size={16} className="text-primary animate-spin" />
            ) : (
              <Sparkles size={16} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-label-xs text-primary mb-1">
              Audit Langganan AI
            </p>
            {isAiLoading ? (
              <Skeleton className="mt-1 h-3 w-3/4 bg-primary/10" />
            ) : (
                <p className="text-label-md text-foreground/80 leading-relaxed font-medium">
                {aiInsight}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Primary Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-card bg-muted/30 p-3 flex flex-col justify-between">
          <p className="text-label-sm text-muted-foreground/60 mb-1">Terlambat</p>
          <p className={cn("text-title-lg tracking-tighter tabular-nums", overdueRemindersCount > 0 ? "text-destructive" : "text-muted-foreground")}>
            {overdueRemindersCount}
          </p>
        </div>
        <div className="rounded-card bg-muted/30 p-3 flex flex-col justify-between">
          <p className="text-label-sm text-muted-foreground/60 mb-1">Segera</p>
          <p className="text-title-lg tracking-tighter tabular-nums text-primary">{upcomingRemindersCount}</p>
        </div>
         <div className="rounded-card bg-muted/30 p-3 flex flex-col justify-between">
          <p className="text-label-sm text-muted-foreground/60 mb-1">Langganan</p>
          <p className="text-title-lg tracking-tighter tabular-nums">{subscriptionSummary.activeSubscriptions}</p>
        </div>
         <div className="rounded-card bg-muted/30 p-3 flex flex-col justify-between">
          <p className="text-label-sm text-muted-foreground/60 mb-1">Biaya bulanan</p>
          <p className="text-label-sm font-medium tracking-tight h-8 flex items-end">
            {formatCurrency(subscriptionSummary.totalMonthlyBurn)}
          </p>
        </div>
      </div>

 {/* Smart Filter & Action Bar */}
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <div className="relative flex-1 group">
 <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40"/>
 <Input
 placeholder="Cari pengingat..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="h-11 text-body-md bg-muted/30 border-none rounded-full pl-10 pr-4 focus-visible:ring-primary/20 transition-all shadow-none"
 />
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"className="h-11 w-11 p-0 rounded-full bg-muted/30 hover:bg-muted/50 border-none">
 <Filter className="h-4 w-4 text-muted-foreground"/>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end"className="rounded-card-glass">
 <DropdownMenuItem onClick={() => setRange('week')} className="text-label-md font-medium">Minggu Ini</DropdownMenuItem>
 <DropdownMenuItem onClick={() => setRange('30')} className="text-label-md font-medium">30 Hari Kedepan</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
 <div className="flex bg-muted/40 p-1 rounded-full w-max min-w-full">
 {Object.entries(statusLabels).map(([key, label]) => {
 const isActive = activeTab === key;
 return (
          <button
            type="button"
            key={key}
            onClick={() => {
              triggerHaptic('light');
              setActiveTab(key);
            }}
 className={cn(
 "py-2 px-6 rounded-full text-label-md transition-all relative shrink-0",
 isActive ? "text-primary bg-card shadow-none": "text-muted-foreground hover:text-foreground"
 )}
 >
 {label}
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Reminders List */}
 <div className="space-y-3 pb-24">
 {groupedByDate.length === 0 ? (
 <EmptyState
 variant="filter"
 title="Tidak Ada Tagihan"
 description={search ? "Tidak ditemukan tagihan yang sesuai dengan pencarian kamu.": "Semua tagihan aman terkendali. Belum ada pengingat yang dibuat."}
 icon={BellRing}
 actionLabel="Buat Pengingat"
 onAction={() => { setReminderToEdit(null); setIsReminderModalOpen(true); }}
 className="pt-10 md:min-h-[400px]"
 />
 ) : (
 groupedByDate.map(([dateKey, items]) => {
 const isNoDate = dateKey === 'no-date';
 const dateLabel = isNoDate
 ? 'Tanpa tanggal'
 : isSameDay(parseISO(dateKey), startOfDay(new Date()))
 ? 'Hari ini'
 : isSameDay(parseISO(dateKey), addDays(startOfDay(new Date()), 1))
 ? 'Besok'
 : format(parseISO(dateKey), 'EEEE, d MMM', { locale: dateFnsLocaleId });
 return (
 <div key={dateKey} className="space-y-2">
 <h2 className="text-label-sm text-muted-foreground px-1 mt-2">{dateLabel}</h2>
 {items.map(reminder => {
 const status = getReminderStatus(reminder);
 const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
 const linkedDebt: Debt | undefined = reminder.targetType === 'debt'
 ? debts.find((debt: Debt) => debt.id === reminder.targetId)
 : undefined;
 return (
 <Card key={reminder.id} className="rounded-card-premium bg-card overflow-hidden transition-all group hover:bg-primary/[0.02] shadow-none border-none">
 <div className="flex items-start gap-3">
 <div className={cn(
 "p-2 rounded-full mt-0.5",
 status === 'overdue'? 'bg-destructive/10 text-destructive':
 status === 'completed'? 'bg-emerald-500/10 text-emerald-600':
 status === 'snoozed'? 'bg-amber-500/10 text-amber-600':
 'bg-blue-500/10 text-blue-600'
 )}>
 <Clock className="h-4.5 w-4.5"/>
 </div>
 <div className="flex-1 space-y-3 min-w-0">
 <div className="flex items-center justify-between gap-2">
 <h2 className="text-label text-foreground truncate pr-2 group-hover:text-primary transition-colors">{reminder.title}</h2>
 {renderStatusBadge(status)}
 </div>

 <div className="space-y-1.5 rounded-card bg-muted/40 p-3 shadow-none border-none">
 {dueDate && (
 <p className="text-label-md font-medium text-muted-foreground flex items-center gap-2">
 <CalendarClock className="h-3.5 w-3.5 text-primary opacity-60"/>
 {format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}
 </p>
 )}
 {linkedDebt && (
 <p className="text-label-md text-muted-foreground/80 flex items-center gap-2 rounded-lg bg-background/60 px-2 py-1 w-fit shadow-elevation-1 border-none">
 <AlertCircle className="h-3 w-3 text-indigo-500"/>
 Terkait: <span className="">{linkedDebt.title}</span> ({formatCurrency(linkedDebt.outstandingBalance ?? linkedDebt.principal ?? 0)})
 </p>
 )}
 {reminder.amount ? (
 <p className="text-body-lg tracking-tighter text-foreground pt-1">{formatCurrency(reminder.amount)}</p>
 ) : null}
 {reminder.notes && (
 <p className="text-label-md text-muted-foreground leading-relaxed italic line-clamp-2 rounded-md bg-primary/6 px-2 py-1.5">{reminder.notes}</p>
 )}
 </div>

 <div className="flex items-center gap-2 pt-1">
 {status !== 'completed'&& (
  <Button 
  size="sm"
  variant="ghost"
  className="h-8 text-label-md gap-2 hover:bg-success/10 hover:text-success -ml-2 rounded-full px-4"
  onClick={() => handleComplete(reminder)}
  >
 <Check className="h-3.5 w-3.5"/> Selesai
 </Button>
 )}
 <div className="flex-1"/>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button size="sm"variant="ghost"className="h-11 w-11 p-0 rounded-full hover:bg-muted" aria-label="Opsi pengingat">
																	<EllipsisVertical className="h-4 w-4 text-muted-foreground opacity-40"/>
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end"className="rounded-card-glass">
																{status !== 'completed'&& dueDate && (
																	<>
																		<DropdownMenuItem onClick={() => handleSnooze(reminder, 1)} className="text-label-md">Tunda 1 hari</DropdownMenuItem>
																		<DropdownMenuItem onClick={() => handleSnooze(reminder, 3)} className="text-label-md">Tunda 3 hari</DropdownMenuItem>
																	</>
																)}
																<DropdownMenuItem onClick={() => { setReminderToEdit(reminder); setIsReminderModalOpen(true); }} className="text-label-md">
																	Edit
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => handleDelete(reminder)} className="text-destructive text-label-md">
																	Hapus
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
 </div>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 );
 })
 )}
 </div>

 {/* Contextual FAB */}
 <FAB
 onClick={() => {
 setReminderToEdit(null);
 setIsReminderModalOpen(true);
 }}
 label="Tambah pengingat"
 />
 </div>
 );
};




