'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarBlank, CircleNotch, Trash } from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debtSchema, DebtFormValues } from '../schemas/debt-schema';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn, normalizeDateInput } from '@/lib/utils';
import type { Debt, DebtInput } from '@/types/models';
import { useDebts } from '../hooks/use-debts';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { Switch } from '@/components/ui/switch';

interface DebtFormProps {
    onClose: () => void;
    initialData?: Debt | null;
}

const directionOptions = [
    { value: 'owed', label: 'Saya Berhutang' },
    { value: 'owing', label: 'Orang Lain Berhutang ke Saya' },
];

const categoryOptions = [
    { value: 'personal', label: 'Pribadi' },
    { value: 'business', label: 'Bisnis' },
    { value: 'household', label: 'Rumah Tangga' },
];

const frequencyOptions = [
    { value: 'one_time', label: 'Sekali' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'biweekly', label: 'Dua Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'custom', label: 'Interval Kustom' },
];

export const DebtForm = ({ onClose, initialData = null }: DebtFormProps) => {
    const { addDebt, updateDebt, deleteDebt } = useDebts();
    const { showToast } = useUI();
    const { wallets } = useWallets();
    const isEditMode = !!initialData;
    const [isDeleting, setIsDeleting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<DebtFormValues>({
        resolver: zodResolver(debtSchema),
        defaultValues: {
            title: initialData?.title || '',
            direction: initialData?.direction || 'owed',
            counterparty: initialData?.counterparty || '',
            category: initialData?.category || 'personal',
            principal: initialData?.principal ? new Intl.NumberFormat('id-ID').format(initialData.principal) : '',
            outstandingBalance: initialData?.outstandingBalance ? new Intl.NumberFormat('id-ID').format(initialData.outstandingBalance) : '',
            interestRate: initialData?.interestRate?.toString() || '',
            paymentFrequency: initialData?.paymentFrequency || 'monthly',
            customInterval: initialData?.customInterval?.toString() || '',
            startDate: initialData?.startDate ? parseISO(initialData.startDate) : new Date(),
            dueDate: initialData?.dueDate ? parseISO(initialData.dueDate) : null,
            nextPaymentDate: initialData?.nextPaymentDate ? parseISO(initialData.nextPaymentDate) : null,
            notes: initialData?.notes || '',
            recordToWallet: false,
            walletId: wallets.find(w => w.isDefault)?.id || wallets[0]?.id || '',
        },
    });

    const { control, handleSubmit, watch, formState: { isSubmitting, errors } } = form;
    const paymentFrequency = watch('paymentFrequency');
    const direction = watch('direction');
    const recordToWallet = watch('recordToWallet');

    const counterpartyLabel = direction === 'owed' ? 'Pemberi Pinjaman' : 'Peminjam / Penerima';
    const principalLabel = 'Total Pinjaman / Piutang';

    const onSubmit = async (values: DebtFormValues) => {
        setSubmitError(null);
        const principalValue = parseInt(values.principal.replace(/[^0-9]/g, '')) || 0;
        const outstandingValue = values.outstandingBalance 
            ? parseInt(values.outstandingBalance.replace(/[^0-9]/g, '')) || principalValue
            : principalValue;

        const payload: DebtInput = {
            title: values.title,
            direction: values.direction,
            counterparty: values.counterparty,
            category: values.category,
            principal: principalValue,
            outstandingBalance: outstandingValue,
            interestRate: values.interestRate ? parseFloat(values.interestRate) : null,
            paymentFrequency: values.paymentFrequency,
            customInterval: values.paymentFrequency === 'custom' ? parseInt(values.customInterval || '0') || null : null,
            startDate: normalizeDateInput(values.startDate),
            dueDate: normalizeDateInput(values.dueDate),
            nextPaymentDate: normalizeDateInput(values.nextPaymentDate),
            notes: values.notes || '',
            status: initialData?.status || 'active',
            payments: initialData?.payments || [],
            walletId: values.recordToWallet ? values.walletId : null,
        };

        try {
            if (isEditMode) {
                await updateDebt(initialData.id, payload);
            } else {
                await addDebt(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
            setSubmitError(message);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;
        try {
            setIsDeleting(true);
            await deleteDebt(initialData.id);
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Gagal menghapus catatan.', 'error');
        } finally {
            setIsDeleting(false);
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
                className="w-full max-w-md bg-background rounded-t-card shadow-lg flex flex-col h-fit max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-card z-10">
                    <h2 className="text-title-lg">{isEditMode ? 'Edit Hutang/Piutang' : 'Catatan Hutang/Piutang'}</h2>
                    <CloseButton
                        ariaLabel="Tutup"
                        tone="muted"
                        className="bg-muted rounded-full"
                        onClick={onClose}
                    />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className={cn(errors.title && "text-destructive")}>Nama Hutang/Piutang</Label>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="title"
                                    placeholder="Contoh: Cicilan Laptop"
                                    className={cn(errors.title && "border-destructive")}
                                />
                            )}
                        />
                        {errors.title && <p className="text-label-md text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Controller
                            control={control}
                            name="direction"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {directionOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="counterparty" className={cn(errors.counterparty && "text-destructive")}>{counterpartyLabel}</Label>
                        <Controller
                            control={control}
                            name="counterparty"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="counterparty"
                                    placeholder="Nama teman, bank, atau institusi"
                                    className={cn(errors.counterparty && "border-destructive")}
                                />
                            )}
                        />
                        {errors.counterparty && <p className="text-label-md text-destructive">{errors.counterparty.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className={cn(errors.principal && "text-destructive")}>{principalLabel}</Label>
                            <Controller
                                control={control}
                                name="principal"
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
                                        className={cn(errors.principal && "border-destructive")}
                                    />
                                )}
                            />
                            {errors.principal && <p className="text-label-md text-destructive">{errors.principal.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className={cn(errors.outstandingBalance && "text-destructive")}>Sisa Saat Ini</Label>
                            <Controller
                                control={control}
                                name="outstandingBalance"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value || ''}
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
                                        className={cn(errors.outstandingBalance && "border-destructive")}
                                    />
                                )}
                            />
                            {errors.outstandingBalance && <p className="text-label-md text-destructive">{errors.outstandingBalance.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bunga (%)</Label>
                            <Controller
                                control={control}
                                name="interestRate"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value || ''}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Controller
                                control={control}
                                name="category"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Frekuensi Bayar</Label>
                            <Controller
                                control={control}
                                name="paymentFrequency"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih frekuensi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frequencyOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        {paymentFrequency === 'custom' && (
                            <div className="space-y-2">
                                <Label>Interval (Hari)</Label>
                                <Controller
                                    control={control}
                                    name="customInterval"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={field.value || ''}
                                            type="number"
                                            placeholder="30"
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mulai Pada</Label>
                            <Controller
                                control={control}
                                name="startDate"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                <CalendarBlank className="mr-2 h-4 w-4" weight="regular" />
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
                        </div>
                        <div className="space-y-2">
                            <Label>Jatuh Tempo</Label>
                            <Controller
                                control={control}
                                name="dueDate"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                <CalendarBlank className="mr-2 h-4 w-4" weight="regular" />
                                                {field.value ? format(field.value, 'd MMM yyyy', { locale: dateFnsLocaleId }) : 'Tidak ditentukan'}
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
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan</Label>
                        <Controller
                            control={control}
                            name="notes"
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Tambahkan catatan atau detail pinjaman di sini..."
                                    rows={3}
                                />
                            )}
                        />
                    </div>

                    {!isEditMode && (
                        <div className="pt-2 pb-1 bg-secondary/20 rounded-lg p-3 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-body-md font-medium">Catat ke Saldo Dompet?</Label>
                                    <p className="text-label-md text-muted-foreground">Otomatis buat transaksi awal di dompet</p>
                                </div>
                                <Controller
                                    control={control}
                                    name="recordToWallet"
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {recordToWallet && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Label className={cn(errors.walletId && "text-destructive")}>Pilih Dompet</Label>
                                    <Controller
                                        control={control}
                                        name="walletId"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={cn(errors.walletId && "border-destructive")}>
                                                    <SelectValue placeholder="Pilih dompet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {wallets.map(wallet => (
                                                        <SelectItem key={wallet.id} value={wallet.id}>
                                                            {wallet.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.walletId && <p className="text-label-md text-destructive">{errors.walletId.message}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Jatuh Tempo Cicilan Berikutnya</Label>
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
                                            <CalendarBlank className="mr-2 h-4 w-4" weight="regular" />
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
                        <p className="text-label-md text-muted-foreground px-1 italic">
                            *Gunakan ini untuk pengingat cicilan pertama.
                        </p>
                    </div>
                </form>
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t sticky bottom-0 bg-background flex flex-col gap-2">
                    {submitError && (
                        <p className="text-label-md text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                            {submitError}
                        </p>
                    )}
                    <Button type="submit" onClick={handleSubmit(onSubmit)} className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="regular" />
                                Menyimpan...
                            </>
                        ) : (
                            `Simpan ${isEditMode ? 'Perubahan' : 'Catatan'}`
                        )}
                    </Button>
                    {isEditMode && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isDeleting}>
                                    <Trash className="mr-2 h-4 w-4" weight="regular" />
                                    Hapus Catatan
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Catatan Hutang?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini tidak dapat dibatalkan. Seluruh riwayat pembayaran juga akan terhapus.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} variant="destructive" className="w-full sm:w-auto">
                                        Ya, Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
