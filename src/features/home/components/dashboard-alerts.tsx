
'use client';

import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Bell, CalendarBlank, WarningCircle } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Reminder, Debt } from '@/types/models';
import { EmptyState } from '@/components/empty-state';

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
        <div id="widget-alerts" className="grid gap-4">
            <Card className="rounded-card bg-card/98 shadow-elevation-3">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Bell size={16} weight="regular" className="text-primary" /> Pengingat
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
                        <div className="rounded-md bg-muted/32 p-3 shadow-inner">
                            <p className="text-sm font-medium">{reminderSummary.nextReminder.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarBlank size={14} weight="regular" />
                                Jatuh tempo {format(parseISO(reminderSummary.nextReminder.dueDate as string), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                           <EmptyState 
                             title="Tidak Ada Pengingat"
                             description="Semua tagihanmu sudah aman terjadwal."
                             icon={Bell}
                             variant="filter"
                             className="md:min-h-0 pt-0"
                           />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-card bg-card/98 shadow-elevation-3">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <WarningCircle size={16} weight="regular" className="text-destructive" /> Hutang & Piutang
                        </CardTitle>
                        <CardDescription className="text-xs">Prioritas terdekat</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/debts')}>
                        Kelola
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {debtSummary.nextDueDebt ? (
                        <div className="rounded-md bg-muted/32 p-3 shadow-inner">
                            <p className="text-xs font-medium tracking-tight text-muted-foreground mb-1">Jatuh Tempo</p>
                            <p className="text-sm font-medium">{debtSummary.nextDueDebt.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarBlank size={14} weight="regular" />
                                {format(parseISO(debtSummary.nextDueDebt.dueDate as string), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                            <EmptyState 
                                title="Bebas Hutang"
                                description="Tidak ada kewajiban mendesak saat ini."
                                icon={WarningCircle}
                                variant="filter"
                                className="md:min-h-0 pt-0"
                            />
                        </div>
                    )}
                    {debtSummary.largestDebt && (
                        <div className="rounded-md bg-muted/32 p-3 shadow-inner">
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



