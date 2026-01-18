'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, CalendarClock } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import type { Debt, DebtPaymentInput } from '@/types/models';
import { useDebts } from '../hooks/use-debts';

interface DebtPaymentFormProps {
    onClose: () => void;
    debt: Debt;
}

export const DebtPaymentForm = ({ onClose, debt }: DebtPaymentFormProps) => {
    const { wallets } = useData();
    const { logDebtPayment } = useDebts();
    const { showToast } = useUI();

    const defaultWallet = wallets.find(wallet => wallet.isDefault) || wallets[0];
    const [amount, setAmount] = useState(() => {
        const suggested = typeof debt?.outstandingBalance === 'number' ? debt.outstandingBalance : debt?.principal || 0;
        return suggested > 0 ? new Intl.NumberFormat('id-ID').format(suggested) : '';
    });
    const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
    const [walletId, setWalletId] = useState(defaultWallet?.id || '');
    const [notes, setNotes] = useState('');
    const [nextPaymentDate, setNextPaymentDate] = useState<Date | undefined>(
        debt?.nextPaymentDate ? new Date(debt.nextPaymentDate) : undefined
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const paymentDateLabel = useMemo(() => {
        if (!paymentDate) return 'Pilih tanggal';
        return format(paymentDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [paymentDate]);

    const nextPaymentLabel = useMemo(() => {
        if (!nextPaymentDate) return 'Opsional';
        return format(nextPaymentDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [nextPaymentDate]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setAmount(formattedValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountValue = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
        if (amountValue <= 0 || !paymentDate) {
            showToast('Tanggal pembayaran dan nominal harus diisi.', 'error');
            return;
        }

        if (debt?.direction === 'owed' && amountValue > (debt.outstandingBalance ?? debt.principal ?? 0)) {
            showToast('Nominal melebihi sisa hutang yang tercatat.', 'error');
            return;
        }

        const payload: DebtPaymentInput = {
            amount: amountValue,
            paymentDate: paymentDate.toISOString(),
            walletId: walletId || null,
            notes,
            nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString() : null,
        };

        try {
            setIsSubmitting(true);
            await logDebtPayment(debt.id, payload);
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Gagal mencatat pembayaran.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-xl font-bold">Catat Pembayaran</h2>
                        <p className="text-sm text-muted-foreground">
                            {debt?.direction === 'owed'
                                ? `Sisa hutang: ${formatCurrency(debt?.outstandingBalance ?? debt?.principal ?? 0)}`
                                : `Sisa piutang: ${formatCurrency(debt?.outstandingBalance ?? debt?.principal ?? 0)}`}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Nominal Pembayaran</Label>
                        <Input
                            placeholder="Rp 0"
                            value={amount}
                            onChange={handleAmountChange}
                            inputMode="numeric"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tanggal Pembayaran</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn('w-full justify-start text-left font-normal', !paymentDate && 'text-muted-foreground')}
                                >
                                    <CalendarClock className="mr-2 h-4 w-4" />
                                    {paymentDateLabel}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={paymentDate}
                                    onSelect={setPaymentDate}
                                    locale={dateFnsLocaleId}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Dompet</Label>
                        <Select value={walletId} onValueChange={setWalletId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih dompet" />
                            </SelectTrigger>
                            <SelectContent>
                                {wallets.length === 0 ? (
                                    <SelectItem value="" disabled>
                                        Belum ada dompet
                                    </SelectItem>
                                ) : (
                                    wallets.map(wallet => (
                                        <SelectItem key={wallet.id} value={wallet.id}>
                                            {wallet.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Pembayaran Berikutnya (opsional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn('w-full justify-start text-left font-normal', !nextPaymentDate && 'text-muted-foreground')}
                                >
                                    <CalendarClock className="mr-2 h-4 w-4" />
                                    {nextPaymentLabel}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={nextPaymentDate}
                                    onSelect={setNextPaymentDate}
                                    locale={dateFnsLocaleId}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan</Label>
                        <Textarea
                            placeholder="Tambahkan catatan seperti metode pembayaran atau bukti transfer"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                </form>
                <div className="p-4 border-t sticky bottom-0 bg-background">
                    <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};
