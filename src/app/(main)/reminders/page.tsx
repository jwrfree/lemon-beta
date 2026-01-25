
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/components/ui-provider';
import { format, formatDistanceToNow, isBefore, parseISO, addDays, isSameDay, startOfDay, differenceInCalendarDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarClock, Clock, Clock3, Check, Plus, BellRing, EllipsisVertical, Filter, Calendar } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Reminder, Debt } from '@/types/models';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from "@/components/page-header";

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

export default function RemindersPage() {
    const router = useRouter();
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

    const renderStatusBadge = (status: string) => {
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
    };

    return (
        <div className="flex flex-col h-full bg-muted relative">
            <PageHeader 
                title="Pengingat" 
                extraActions={
                    <div className="flex items-center gap-1 md:gap-2">
                        <div className="hidden md:flex items-center gap-2 mr-2">
                            <Badge className="bg-destructive/10 text-destructive border-none">
                                Terlambat: {reminders.filter(r => getReminderStatus(r) === 'overdue').length}
                            </Badge>
                            <Badge className="bg-primary/10 text-primary border-none">
                                Segera: {reminders.filter(r => {
                                    if (!r.dueDate || getReminderStatus(r) === 'completed') return false;
                                    const diff = differenceInCalendarDays(parseISO(r.dueDate), new Date());
                                    return diff >= 0 && diff <= 7;
                                }).length}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setReminderToEdit(null);
                                setIsReminderModalOpen(true);
                            }}
                            className="rounded-full"
                            aria-label="Tambah pengingat"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>
                }
            />
            <main className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-6 grid md:grid-cols-[2fr_1fr] gap-4 md:gap-6 pb-24 md:pb-6">
                    <div className="space-y-4">
                        {/* Mobile chip filters */}
                        <div className="md:hidden space-y-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-transparent h-auto p-0 gap-2 justify-start w-full overflow-x-auto">
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                        <TabsTrigger 
                                            key={key} 
                                            value={key} 
                                            className="rounded-full border bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-7 text-xs px-3"
                                        >
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                            <div className="flex items-center gap-2">
                                <Tabs value={range} onValueChange={(v: string) => setRange(v as 'week' | '30')} className="w-full">
                                    <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 w-full grid grid-cols-2">
                                        <TabsTrigger value="week" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Minggu ini</TabsTrigger>
                                        <TabsTrigger value="30" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">30 hari</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                        setReminderToEdit(null);
                                        setIsReminderModalOpen(true);
                                    }}
                                    aria-label="Tambah pengingat"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                placeholder="Cari pengingat..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Mobile simple list */}
                        <div className="md:hidden space-y-3">
                            {groupedByDate.length === 0 ? (
                                <Card className="p-6 text-center text-sm text-muted-foreground">
                                    Belum ada pengingat pada filter ini. <br />
                                    <Button className="mt-3" size="sm" onClick={() => { setReminderToEdit(null); setIsReminderModalOpen(true); }}>
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
                                            <h2 className="text-sm font-medium tracking-tight text-muted-foreground px-1">{dateLabel}</h2>
                                            {items.map(reminder => {
                                                const status = getReminderStatus(reminder);
                                                const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
                                                const linkedDebt: Debt | undefined = reminder.targetType === 'debt'
                                                    ? debts.find((debt: Debt) => debt.id === reminder.targetId)
                                                    : undefined;
                                                return (
                                                    <Card key={reminder.id} className="p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className={cn(
                                                                "p-2 rounded-full",
                                                                status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                                                                status === 'completed' ? 'bg-gray-200 text-gray-700' :
                                                                status === 'snoozed' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-primary/10 text-primary'
                                                            )}>
                                                                <Clock className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h2 className="font-semibold text-base">{reminder.title}</h2>
                                                                    {renderStatusBadge(status)}
                                                                </div>
                                                                {dueDate && (
                                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <CalendarClock className="h-4 w-4" />
                                                                        {format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                                                    </p>
                                                                )}
                                                                {linkedDebt && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Terkait: {linkedDebt.title} ({formatCurrency(linkedDebt.outstandingBalance ?? linkedDebt.principal ?? 0)})
                                                                    </p>
                                                                )}
                                                                {reminder.amount ? (
                                                                    <p className="text-sm font-medium">{formatCurrency(reminder.amount)}</p>
                                                                ) : null}
                                                                {reminder.notes && (
                                                                    <p className="text-xs text-muted-foreground">{reminder.notes}</p>
                                                                )}
                                                                <div className="flex items-center gap-2 pt-1">
                                                                    {status !== 'completed' && (
                                                                        <Button size="sm" variant="secondary" className="gap-1" onClick={() => handleComplete(reminder)}>
                                                                            <Check className="h-4 w-4" /> Selesai
                                                                        </Button>
                                                                    )}
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button size="sm" variant="outline" className="px-2">
                                                                                <EllipsisVertical className="h-4 w-4" />
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

                        {/* Desktop timeline */}
                        <div className="hidden md:block space-y-4">
                            {groupedByDate.length === 0 ? (
                                <Card className="p-6 text-center text-sm text-muted-foreground">
                                    Belum ada pengingat pada filter ini. <br />
                                    <Button className="mt-3" size="sm" onClick={() => { setReminderToEdit(null); setIsReminderModalOpen(true); }}>
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
                                        <div key={dateKey} className="relative pl-6">
                                            <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <h2 className="text-sm font-medium tracking-tight text-muted-foreground">{dateLabel}</h2>
                                            </div>
                                            <div className="space-y-3">
                                                {items.map(reminder => {
                                                    const status = getReminderStatus(reminder);
                                                    const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
                                                    const linkedDebt: Debt | undefined = reminder.targetType === 'debt'
                                                        ? debts.find((debt: Debt) => debt.id === reminder.targetId)
                                                        : undefined;
                                                    return (
                                                        <Card key={reminder.id} className="p-4 border-border/60">
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-full",
                                                                    status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                                                                    status === 'completed' ? 'bg-gray-200 text-gray-700' :
                                                                    status === 'snoozed' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-primary/10 text-primary'
                                                                )}>
                                                                    <Clock className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <h2 className="font-semibold text-base">{reminder.title}</h2>
                                                                            {renderStatusBadge(status)}
                                                                        </div>
                                                                        {dueDate && (
                                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                <CalendarClock className="h-4 w-4" />
                                                                                {format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                                                                <span>&bull;</span>
                                                                                {formatDistanceToNow(dueDate, { addSuffix: true, locale: dateFnsLocaleId })}
                                                                            </p>
                                                                        )}
                                                                        {linkedDebt && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Terkait: {linkedDebt.title} ({formatCurrency(linkedDebt.outstandingBalance ?? linkedDebt.principal ?? 0)})
                                                                            </p>
                                                                        )}
                                                                        {reminder.amount ? (
                                                                            <p className="text-sm font-medium">{formatCurrency(reminder.amount)}</p>
                                                                        ) : null}
                                                                        {reminder.notes && (
                                                                            <p className="text-xs text-muted-foreground">{reminder.notes}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {status !== 'completed' && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="secondary"
                                                                                className="gap-1"
                                                                                onClick={() => handleComplete(reminder)}
                                                                            >
                                                                                <Check className="h-4 w-4" /> Selesai
                                                                            </Button>
                                                                        )}
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button size="sm" variant="outline" className="px-2">
                                                                                    <EllipsisVertical className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                {status !== 'completed' && dueDate && (
                                                                                    <>
                                                                                        <DropdownMenuItem onClick={() => handleSnooze(reminder, 1)}>
                                                                                            Tunda 1 hari
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => handleSnooze(reminder, 3)}>
                                                                                            Tunda 3 hari
                                                                                        </DropdownMenuItem>
                                                                                    </>
                                                                                )}
                                                                                <DropdownMenuItem onClick={() => {
                                                                                    setReminderToEdit(reminder);
                                                                                    setIsReminderModalOpen(true);
                                                                                }}>
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
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Desktop sidebar filters */}
                    <div className="hidden md:flex flex-col gap-4 sticky top-20 h-fit">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Filter className="h-4 w-4 text-primary" /> Filter & Ringkasan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Input
                                    placeholder="Cari pengingat..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                        <Button
                                            key={key}
                                            variant={activeTab === key ? "secondary" : "outline"}
                                            size="sm"
                                            onClick={() => setActiveTab(key)}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> Rentang waktu
                                    </p>
                                    <div className="w-full">
                                        <Tabs value={range} onValueChange={(v: string) => setRange(v as 'week' | '30')} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted rounded-lg">
                                                <TabsTrigger value="week" className="rounded-md text-xs">Minggu ini</TabsTrigger>
                                                <TabsTrigger value="30" className="rounded-md text-xs">30 hari</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-xl bg-destructive/10 text-destructive p-3">
                                        <p className="text-xs text-destructive/80">Terlambat</p>
                                        <p className="text-lg font-semibold">
                                            {reminders.filter(r => getReminderStatus(r) === 'overdue').length}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-primary/10 text-primary p-3">
                                        <p className="text-xs text-primary/80">Segera</p>
                                        <p className="text-lg font-semibold">
                                            {reminders.filter(r => {
                                                if (!r.dueDate || getReminderStatus(r) === 'completed') return false;
                                                const diff = differenceInCalendarDays(parseISO(r.dueDate), new Date());
                                                return diff >= 0 && diff <= 7;
                                            }).length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" onClick={() => { setReminderToEdit(null); setIsReminderModalOpen(true); }}>
                                    Buat Pengingat
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => setActiveTab('overdue')}>
                                    Lihat yang Terlambat
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Mobile bottom bar */}
            <div className="md:hidden sticky bottom-0 inset-x-0 bg-background/95 border-t p-3 flex items-center justify-between gap-2 pb-[max(0px,env(safe-area-inset-bottom))]">
                <Button variant="outline" className="flex-1" onClick={() => setActiveTab('overdue')}>
                    Terlambat
                </Button>
                <Button className="flex-1" onClick={() => { setReminderToEdit(null); setIsReminderModalOpen(true); }}>
                    Tambah
                </Button>
            </div>
        </div>
    );
}
