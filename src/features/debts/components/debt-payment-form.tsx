'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, CalendarClock, Loader2 } from 'lucide-react';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debtPaymentSchema, DebtPaymentFormValues } from '../schemas/debt-schema';
import { cn, formatCurrency } from '@/lib/utils';
import type { Debt, DebtPaymentInput } from '@/types/models';
import { useDebts } from '../hooks/use-debts';

interface DebtPaymentFormProps {
    onClose: () => void;
    debt: Debt;
}

export const DebtPaymentForm = ({ onClose, debt }: DebtPaymentFormProps) => {
    const { wallets } = useWallets();
    const { logDebtPayment } = useDebts();
    const { showToast } = useUI();

    const defaultWallet = useMemo(() => wallets.find(wallet => wallet.isDefault) || wallets[0], [wallets]);

    const form = useForm<DebtPaymentFormValues>({
        resolver: zodResolver(debtPaymentSchema),
        defaultValues: {
            amount: debt?.outstandingBalance ? new Intl.NumberFormat('id-ID').format(debt.outstandingBalance) : '',
            paymentDate: new Date(),
            walletId: defaultWallet?.id || '',
            notes: '',
            nextPaymentDate: debt?.nextPaymentDate ? new Date(debt.nextPaymentDate) : null,
        },
    });

    const { control, handleSubmit, formState: { isSubmitting, errors } } = form;

    const onSubmit = async (values: DebtPaymentFormValues) => {
        const amountValue = parseInt(values.amount.replace(/[^0-9]/g, '')) || 0;
        
        if (debt?.direction === 'owed' && amountValue > (debt.outstandingBalance ?? debt.principal ?? 0)) {
            showToast('Nominal melebihi sisa hutang yang tercatat.', 'error');
            return;
        }

        const payload: DebtPaymentInput = {
            amount: amountValue,
            paymentDate: values.paymentDate.toISOString(),
            walletId: values.walletId || null,
            notes: values.notes || '',
            nextPaymentDate: values.nextPaymentDate ? values.nextPaymentDate.toISOString() : null,
        };

        try {
            await logDebtPayment(debt.id, payload);
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Gagal mencatat pembayaran.', 'error');
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
                className="w-full max-w-md bg-background rounded-t-card shadow-lg flex flex-col h-fit max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-card z-10">
                    <div>
                        <h2 className="text-xl font-medium">Catat Pembayaran</h2>
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
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className={cn(errors.amount && "text-destructive")}>Nominal Pembayaran</Label>
                        <Controller
                            control={control}
                            name="amount"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Rp 0"
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                        if (rawValue === '') {
                                            field.onChange('');
                                            return;
                                        }
                                        field.onChange(new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0));
                                    }}
                                    inputMode="numeric"
                                    className={cn(errors.amount && "border-destructive")}
                                />
                            )}
                        />
                        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className={cn(errors.paymentDate && "text-destructive")}>Tanggal Pembayaran</Label>
                        <Controller
                            control={control}
                            name="paymentDate"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground', errors.paymentDate && "border-destructive")}
                                        >
                                            <CalendarClock className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, 'd MMM yyyy', { locale: dateFnsLocaleId }) : 'Pilih tanggal'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            locale={dateFnsLocaleId}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.paymentDate && <p className="text-xs text-destructive">{errors.paymentDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className={cn(errors.walletId && "text-destructive")}>Dompet</Label>
                        <Controller
                            control={control}
                            name="walletId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={cn(errors.walletId && "border-destructive")}>
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
                            )}
                        />
                        {errors.walletId && <p className="text-xs text-destructive">{errors.walletId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Pembayaran Berikutnya (opsional)</Label>
                        <Controller
                            control={control}
                            name="nextPaymentDate"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                                        >
                                            <CalendarClock className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, 'd MMM yyyy', { locale: dateFnsLocaleId }) : 'Opsional'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value || undefined}
                                            onSelect={field.onChange}
                                            locale={dateFnsLocaleId}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan</Label>
                        <Controller
                            control={control}
                            name="notes"
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Tambahkan catatan seperti metode pembayaran atau bukti transfer"
                                />
                            )}
                        />
                    </div>
                </form>
                <div className="p-4 border-t sticky bottom-0 bg-background">
                    <Button type="submit" onClick={handleSubmit(onSubmit)} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Pembayaran'
                        )}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

