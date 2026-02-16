'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/components/ui-provider';
import { format, formatDistanceToNow, isBefore, parseISO, addDays, isSameDay, startOfDay, differenceInCalendarDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarClock, Clock, Check, Plus, BellRing, EllipsisVertical, Filter } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Filter Tabs and Actions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent h-auto p-0 gap-2 justify-start w-full">
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="rounded-full border bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-7 text-xs px-3 shadow-sm"
                                >
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Cari pengingat..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2">
                                <Filter className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">{range === 'week' ? 'Minggu Ini' : '30 Hari'}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRange('week')}>Minggu Ini</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRange('30')}>30 Hari Kedepan</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex flex-col justify-between">
                    <p className="text-[10px] uppercase font-bold text-destructive tracking-wider">Terlambat</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-destructive">{overdueRemindersCount}</p>
                        <span className="text-xs text-destructive/80">invoice</span>
                    </div>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col justify-between">
                    <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Segera</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-primary">{upcomingRemindersCount}</p>
                        <span className="text-xs text-primary/80">jadwal</span>
                    </div>
                </div>
            </div>

            {/* Reminders List */}
            <div className="space-y-3 pb-24">
                {groupedByDate.length === 0 ? (
                    <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[200px] border-dashed">
                        <div className="bg-muted rounded-full p-4 mb-3">
                            <BellRing className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Tidak ada pengingat</p>
                        <p className="text-xs text-muted-foreground mb-4">Semua tagihan aman terkendali.</p>
                        <Button size="sm" onClick={() => { setReminderToEdit(null); setIsReminderModalOpen(true); }}>
                            Buat Pengingat
                        </Button>
                    </Card>
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
                                <h2 className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground px-1 mt-2">{dateLabel}</h2>
                                {items.map(reminder => {
                                    const status = getReminderStatus(reminder);
                                    const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
                                    const linkedDebt: Debt | undefined = reminder.targetType === 'debt'
                                        ? debts.find((debt: Debt) => debt.id === reminder.targetId)
                                        : undefined;
                                    return (
                                        <Card key={reminder.id} className="p-4 border-none shadow-sm hover:shadow-md transition-all">
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
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h2 className="font-semibold text-sm truncate pr-2">{reminder.title}</h2>
                                                        {renderStatusBadge(status)}
                                                    </div>

                                                    <div className="space-y-1">
                                                        {dueDate && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                <CalendarClock className="h-3.5 w-3.5" />
                                                                {format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                                            </p>
                                                        )}
                                                        {linkedDebt && (
                                                            <p className="text-xs text-muted-foreground/80 bg-muted/50 px-2 py-1 rounded w-fit">
                                                                Terkait: <span className="font-medium">{linkedDebt.title}</span> ({formatCurrency(linkedDebt.outstandingBalance ?? linkedDebt.principal ?? 0)})
                                                            </p>
                                                        )}
                                                        {reminder.amount ? (
                                                            <p className="text-sm font-bold text-foreground">{formatCurrency(reminder.amount)}</p>
                                                        ) : null}
                                                        {reminder.notes && (
                                                            <p className="text-xs text-muted-foreground italic line-clamp-2">{reminder.notes}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-2 border-t mt-2 border-border/40">
                                                        {status !== 'completed' && (
                                                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 hover:bg-emerald-500/10 hover:text-emerald-700 -ml-2" onClick={() => handleComplete(reminder)}>
                                                                <Check className="h-3.5 w-3.5" /> Selesai
                                                            </Button>
                                                        )}
                                                        <div className="flex-1" />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full">
                                                                    <EllipsisVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {status !== 'completed' && dueDate && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => handleSnooze(reminder, 1)}>Tunda 1 hari</DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleSnooze(reminder, 3)}>Tunda 3 hari</DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                <DropdownMenuItem onClick={() => { setReminderToEdit(reminder); setIsReminderModalOpen(true); }}>
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(reminder)} className="text-destructive">
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
            <div className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden">
                <Button
                    onClick={() => {
                        setReminderToEdit(null);
                        setIsReminderModalOpen(true);
                    }}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-transform active:scale-95"
                    aria-label="Tambah pengingat"
                >
                    <Plus className="h-7 w-7" />
                </Button>
            </div>
        </div>
    );
};
