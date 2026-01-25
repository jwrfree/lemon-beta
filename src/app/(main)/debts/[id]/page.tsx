'use client';

import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/components/ui-provider';
import { formatCurrency } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronLeft, CalendarClock, Trash2 } from 'lucide-react';
import type { Debt, DebtPayment } from '@/types/models';
import { useDebts } from '@/features/debts/hooks/use-debts';

import { PageHeader } from '@/components/page-header';

const PaymentItem = ({ payment, direction }: { payment: DebtPayment; direction: string }) => {
    const paymentDate = payment.paymentDate ? parseISO(payment.paymentDate) : null;
    return (
        <div className="flex items-start justify-between gap-3 py-3">
            <div>
                <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                {paymentDate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {format(paymentDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}
                        <span>&bull;</span>
                        {formatDistanceToNow(paymentDate, { addSuffix: true, locale: dateFnsLocaleId })}
                    </p>
                )}
                {payment.notes && <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>}
            </div>
            <Badge variant="secondary">{direction === 'owed' ? 'Pembayaran' : 'Penerimaan'}</Badge>
        </div>
    );
};

export default function DebtDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const debtId = params?.id;
    const { debts, deleteDebt, markDebtSettled, deleteDebtPayment } = useDebts();
    const { setDebtToEdit, setIsDebtModalOpen, setDebtForPayment, setIsDebtPaymentModalOpen, showToast } = useUI();

    const debt = debts.find((item: Debt) => item.id === debtId);

    const payments = useMemo(() => {
        if (!debt?.payments) return [] as DebtPayment[];
        return [...debt.payments].sort((a: DebtPayment, b: DebtPayment) => {
            const aDate = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
            const bDate = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
            return bDate - aDate;
        }) as DebtPayment[];
    }, [debt]);

    if (!debt) {
        return (
            <div className="flex flex-col h-full bg-muted">
                <PageHeader title="Detail Hutang" />
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Catatan tidak ditemukan.
                </div>
            </div>
        );
    }

    const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
    const total = debt.principal ?? outstanding;
    const dueDate = debt.dueDate ? parseISO(debt.dueDate) : null;
    const startDate = debt.startDate ? parseISO(debt.startDate) : null;
    const nextPaymentDate = debt.nextPaymentDate ? parseISO(debt.nextPaymentDate) : null;

    return (
        <div className="flex flex-col h-full bg-muted">
            <PageHeader title={debt.title || "Detail Hutang"} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Ringkasan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Tipe</span>
                                <span className="font-medium">{debt.direction === 'owed' ? 'Saya berhutang' : 'Orang lain berhutang'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pihak terkait</span>
                                <span className="font-medium">{debt.counterparty}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-semibold">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Sisa</span>
                                <span className="font-semibold">{formatCurrency(outstanding)}</span>
                            </div>
                            {startDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Mulai</span>
                                    <span>{format(startDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
                                </div>
                            )}
                            {dueDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Jatuh tempo</span>
                                    <span>{format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId })}</span>
                                </div>
                            )}
                            {nextPaymentDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Pembayaran berikutnya</span>
                                    <span>{formatDistanceToNow(nextPaymentDate, { addSuffix: true, locale: dateFnsLocaleId })}</span>
                                </div>
                            )}
                            {debt.notes && (
                                <div>
                                    <Separator className="my-3" />
                                    <p className="text-muted-foreground">Catatan</p>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{debt.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold">Riwayat Pembayaran</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setDebtForPayment(debt);
                                    setIsDebtPaymentModalOpen(true);
                                }}
                            >
                                Catat Pembayaran
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {payments.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Belum ada pembayaran yang dicatat.
                                </p>
                            ) : (
                                payments.map((payment: DebtPayment) => (
                                    <div key={payment.id} className="border-b last:border-0">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1">
                                                <PaymentItem payment={payment} direction={debt.direction} />
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive"
                                                onClick={async () => {
                                                    try {
                                                        await deleteDebtPayment(debt.id, payment.id);
                                                    } catch (error) {
                                                        console.error(error);
                                                        showToast('Gagal menghapus pembayaran.', 'error');
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap gap-2">
                        {debt.status !== 'settled' && outstanding > 0 && (
                            <Button variant="secondary" onClick={() => markDebtSettled(debt.id)}>
                                Tandai Lunas
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDebtToEdit(debt);
                                setIsDebtModalOpen(true);
                            }}
                        >
                            Edit Catatan
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Hapus Catatan</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus catatan ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Penghapusan akan menghilangkan seluruh riwayat pembayaran yang tersimpan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            try {
                                                await deleteDebt(debt.id);
                                                router.back();
                                            } catch (error) {
                                                console.error(error);
                                                showToast('Gagal menghapus catatan.', 'error');
                                            }
                                        }}
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </main>
        </div>
    );
}
