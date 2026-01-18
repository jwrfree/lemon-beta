
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUI } from '@/components/ui-provider';
import { format, formatDistanceToNow, isBefore, parseISO, addDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { CalendarClock, Clock, Clock3, Check, ChevronLeft, Plus, BellRing } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Reminder, Debt } from '@/types/models';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';

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

    const sortedReminders = useMemo<Reminder[]>(() => {
        return [...reminders].sort((a, b) => {
            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return aDue - bDue;
        });
    }, [reminders]);

    const filteredReminders = useMemo(() => {
        return sortedReminders.filter((reminder: Reminder) => {
            const status = getReminderStatus(reminder);
            const matchesStatus = activeTab === 'all' || status === activeTab;
            const matchesSearch = reminder.title.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [sortedReminders, activeTab, search]);

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
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center gap-2 relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold flex-1 text-center pr-10">Pengingat</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setReminderToEdit(null);
                        setIsReminderModalOpen(true);
                    }}
                    className="shrink-0"
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Tambah Pengingat</span>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <BellRing className="h-5 w-5 text-primary" />
                                Ringkasan Pengingat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Total</p>
                                <p className="text-lg font-semibold">{reminders.length}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Jatuh tempo minggu ini</p>
                                <p className="text-lg font-semibold">
                                    {
                                        reminders.filter(reminder => {
                                            if (!reminder.dueDate) return false;
                                            const due = parseISO(reminder.dueDate);
                                            const now = new Date();
                                            const diff = Math.abs(due.getTime() - now.getTime());
                                            const sevenDays = 7 * 24 * 60 * 60 * 1000;
                                            return diff <= sevenDays && getReminderStatus(reminder) !== 'completed';
                                        }).length
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Input
                            placeholder="Cari pengingat..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <TabsTrigger key={key} value={key} className="text-xs">
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="space-y-3">
                        {filteredReminders.length === 0 ? (
                            <Card className="p-6 text-center text-sm text-muted-foreground">
                                Belum ada pengingat pada kategori ini.
                            </Card>
                        ) : (
                            filteredReminders.map(reminder => {
                                const status = getReminderStatus(reminder);
                                const dueDate = reminder.dueDate ? parseISO(reminder.dueDate) : null;
                                const linkedDebt: Debt | undefined = reminder.targetType === 'debt'
                                    ? debts.find((debt: Debt) => debt.id === reminder.targetId)
                                    : undefined;

                                return (
                                    <Card key={reminder.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <Clock className="h-5 w-5 text-primary" />
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
                                                <div className="flex flex-wrap gap-2">
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
                                                    {status !== 'completed' && dueDate && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1"
                                                            onClick={() => handleSnooze(reminder)}
                                                        >
                                                            <Clock3 className="h-4 w-4" /> Tunda 1 hari
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => {
                                                            setReminderToEdit(reminder);
                                                            setIsReminderModalOpen(true);
                                                        }}
                                                    >
                                                        <Clock className="h-4 w-4" /> Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(reminder)}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </div>
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
