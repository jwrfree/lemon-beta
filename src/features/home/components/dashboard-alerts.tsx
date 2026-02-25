
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Bell, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Reminder, Debt } from '@/types/models';

interface DashboardAlertsProps {
    reminderSummary: {
        overdueCount: number;
        upcomingCount: number;
        nextReminder?: Reminder;
    };
    debtSummary: {
        nextDueDebt?: Debt;
        largestDebt?: Debt;
    };
}

export const DashboardAlerts = ({ reminderSummary, debtSummary }: DashboardAlertsProps) => {
    const router = useRouter();

    return (
        <div className="grid gap-4">
            <Card className="border-none shadow-card bg-card rounded-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" /> Pengingat
                        </CardTitle>
                        <CardDescription className="text-xs">7 hari ke depan</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/reminders')}>
                        Lihat
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm font-medium">
                            Overdue: {reminderSummary.overdueCount}
                        </div>
                        <div className="rounded-md bg-primary/10 text-primary px-3 py-2 text-sm font-medium">
                            Segera: {reminderSummary.upcomingCount}
                        </div>
                    </div>
                    {reminderSummary.nextReminder ? (
                        <div className="rounded-md border border-border p-3">
                            <p className="text-sm font-medium">{reminderSummary.nextReminder.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Jatuh tempo {format(parseISO(reminderSummary.nextReminder.dueDate as string), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Tidak ada pengingat dalam rentang ini.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-card bg-card rounded-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" /> Hutang & Piutang
                        </CardTitle>
                        <CardDescription className="text-xs">Prioritas terdekat</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/debts')}>
                        Kelola
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {debtSummary.nextDueDebt ? (
                        <div className="rounded-md border border-border p-3">
                            <p className="text-xs font-medium tracking-tight text-muted-foreground mb-1">Jatuh Tempo</p>
                            <p className="text-sm font-medium">{debtSummary.nextDueDebt.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(parseISO(debtSummary.nextDueDebt.dueDate as string), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Tidak ada jatuh tempo.</p>
                    )}
                    {debtSummary.largestDebt && (
                        <div className="rounded-md border border-border p-3">
                            <p className="text-xs font-medium tracking-tight text-muted-foreground mb-1">Outstanding Terbesar</p>
                            <p className="text-sm font-medium">{debtSummary.largestDebt.title}</p>
                            <p className="text-xs text-muted-foreground">{debtSummary.largestDebt.counterparty}</p>
                            <p className="text-sm font-medium mt-1">{formatCurrency(debtSummary.largestDebt.outstandingBalance ?? debtSummary.largestDebt.principal ?? 0)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

