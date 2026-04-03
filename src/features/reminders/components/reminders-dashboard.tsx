'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/components/ui-provider';
import { format, formatDistanceToNow, isBefore, parseISO, addDays, isSameDay, startOfDay, differenceInCalendarDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarClock, Clock, Check, Plus, BellRing, EllipsisVertical, Filter, AlertCircle, Sparkles } from '@/lib/icons';
import { formatCurrency, cn } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';
import type { Reminder, Debt } from '@/types/models';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
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
        return isBefore(dueDate, now) ? 'overdue' : 'snoozed';
    }
    return 'upcoming';
};

export const RemindersDashboard = () => {
    const { debts } = useDebts();
    const { reminders, markReminderComplete, snoozeReminder, deleteReminder } = useReminders();
    const { setIsReminderModalOpen, setReminderToEdit, showToast } = useUI();

    const [activeTab, setActiveTab] = useState('upcoming');
    const [search, setSearch] = useState('');
    const [range, setRange] = useState<'week' | '30'>('week');

    const sortedReminders = useMemo<Reminder[]>(() => {
        return [...reminders].sort((a, b) => {
            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return aDue - bDue;
        });
    }, [reminders]);

    const filteredReminders = useMemo(() => {
        const now = startOfDay(new Date());
        const forwardDays = range === 'week' ? 7 : 30;

        return sortedReminders.filter((reminder: Reminder) => {
            const status = getReminderStatus(reminder);
            const matchesStatus = activeTab === 'all' || status === activeTab;
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
            .sort(([a], [b]) => (a === 'no-date' ? 1 : b === 'no-date' ? -1 : new Date(a).getTime() - new Date(b).getTime()));
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

    const renderStatusBadge = React.useCallback((status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-emerald-500/10 text-emerald-600">Selesai</Badge>;
            case 'overdue':
                return <Badge className="bg-destructive/10 text-destructive">Terlambat</Badge>;
            case 'snoozed':
                return <Badge className="bg-amber-500/10 text-amber-600">Ditunda</Badge>;
            default:
                return <Badge className="bg-primary/10 text-primary">Akan Datang</Badge>;
        }
    }, []);

    const overdueRemindersCount = useMemo(() => reminders.filter(r => getReminderStatus(r) === 'overdue').length, [reminders]);
    const upcomingRemindersCount = useMemo(() => reminders.filter(r => {
        if (!r.dueDate || getReminderStatus(r) === 'completed') return false;
        const diff = differenceInCalendarDays(parseISO(r.dueDate), new Date());
        return diff >= 0 && diff <= 7;
    }).length, [reminders]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Status Integration (Modern Fluidity) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-card-premium bg-destructive/7 p-4 flex flex-col justify-between shadow-elevation-3 group hover:bg-destructive/10 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive opacity-70" />
                        <p className="text-label-sm uppercase font-bold text-destructive tracking-[0.1em]">Terlambat</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-semibold tracking-tighter text-destructive tabular-nums leading-none">{overdueRemindersCount}</p>
                        <span className="text-xs font-medium text-destructive/60 uppercase tracking-wider">Tagihan</span>
                    </div>
                </div>
                <div className="rounded-card-premium bg-primary/7 p-4 flex flex-col justify-between shadow-elevation-3 group hover:bg-primary/10 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary opacity-70" />
                        <p className="text-label-sm uppercase font-bold text-primary tracking-[0.1em]">Segera</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-semibold tracking-tighter text-primary tabular-nums leading-none">{upcomingRemindersCount}</p>
                        <span className="text-xs font-medium text-primary/60 uppercase tracking-wider">Jadwal</span>
                    </div>
                </div>
            </div>

            {/* Smart Filter & Action Bar */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Input
                            placeholder="Cari pengingat..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-11 text-sm bg-muted/30 border-none rounded-full px-4 focus-visible:ring-primary/20 transition-all"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-11 w-11 p-0 rounded-full bg-muted/30 hover:bg-muted/50 border-none">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-card-glass">
                            <DropdownMenuItem onClick={() => setRange('week')} className="text-xs font-medium">Minggu Ini</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRange('30')} className="text-xs font-medium">30 Hari Kedepan</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="h-10 w-full justify-start gap-1 rounded-full bg-muted/55 p-1 shadow-inner">
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="flex-1 rounded-full h-full text-label-sm md:text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                                >
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Reminders List */}
            <div className="space-y-3 pb-24">
                {groupedByDate.length === 0 ? (
                    <EmptyState
                        variant="filter"
                        title="Tidak Ada Tagihan"
                        description={search ? "Tidak ditemukan tagihan yang sesuai dengan pencarian kamu." : "Semua tagihan aman terkendali. Belum ada pengingat yang dibuat."}
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
                                <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground px-1 mt-2">{dateLabel}</h2>
                                {items.map(reminder => {
                                    const status = getReminderStatus(reminder);
                                    const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
                                    const linkedDebt: Debt | undefined = reminder.targetType === 'debt'
                                        ? debts.find((debt: Debt) => debt.id === reminder.targetId)
                                        : undefined;
                                    return (
                                        <Card key={reminder.id} className="rounded-card bg-card/98 overflow-hidden transition-all group hover:bg-primary/[0.02] shadow-elevation-3">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-full mt-0.5",
                                                    status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                                                        status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                                            status === 'snoozed' ? 'bg-amber-500/10 text-amber-600' :
                                                                'bg-blue-500/10 text-blue-600'
                                                )}>
                                                    <Clock className="h-4.5 w-4.5" />
                                                </div>
                                                <div className="flex-1 space-y-3 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h2 className="font-semibold text-sm tracking-tight text-foreground truncate pr-2 group-hover:text-primary transition-colors">{reminder.title}</h2>
                                                        {renderStatusBadge(status)}
                                                    </div>

                                                    <div className="space-y-1.5 rounded-card-glass bg-muted/32 p-3 shadow-inner">
                                                        {dueDate && (
                                                            <p className="text-label-md font-medium text-muted-foreground flex items-center gap-2">
                                                                <CalendarClock className="h-3.5 w-3.5 text-primary opacity-60" />
                                                                {format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                                            </p>
                                                        )}
                                                        {linkedDebt && (
                                                            <p className="text-label-md text-muted-foreground/80 flex items-center gap-2 rounded-sm bg-background/60 px-2 py-1 w-fit shadow-elevation-1">
                                                                <AlertCircle className="h-3 w-3 text-indigo-500" />
                                                                Terkait: <span className="font-semibold">{linkedDebt.title}</span> ({formatCurrency(linkedDebt.outstandingBalance ?? linkedDebt.principal ?? 0)})
                                                            </p>
                                                        )}
                                                        {reminder.amount ? (
                                                            <p className="text-base font-bold tracking-tighter text-foreground pt-1">{formatCurrency(reminder.amount)}</p>
                                                        ) : null}
                                                        {reminder.notes && (
                                                            <p className="text-label-md text-muted-foreground leading-relaxed italic line-clamp-2 rounded-md bg-primary/6 px-2 py-1.5">{reminder.notes}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-1">
                                                        {status !== 'completed' && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost" 
                                                                className="h-8 text-label-md font-bold uppercase tracking-widest gap-2 hover:bg-emerald-500/10 hover:text-emerald-700 -ml-2 rounded-full px-4" 
                                                                onClick={() => handleComplete(reminder)}
                                                            >
                                                                <Check className="h-3.5 w-3.5" /> Selesai
                                                            </Button>
                                                        )}
                                                        <div className="flex-1" />
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
																	<EllipsisVertical className="h-4 w-4 text-muted-foreground opacity-40" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="rounded-card-glass">
																{status !== 'completed' && dueDate && (
																	<>
																		<DropdownMenuItem onClick={() => handleSnooze(reminder, 1)} className="text-xs">Tunda 1 hari</DropdownMenuItem>
																		<DropdownMenuItem onClick={() => handleSnooze(reminder, 3)} className="text-xs">Tunda 3 hari</DropdownMenuItem>
																	</>
																)}
																<DropdownMenuItem onClick={() => { setReminderToEdit(reminder); setIsReminderModalOpen(true); }} className="text-xs">
																	Edit
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => handleDelete(reminder)} className="text-destructive text-xs">
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




