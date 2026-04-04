'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CalendarClock, CircleNotch } from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reminderSchema, ReminderFormValues } from '../schemas/reminder-schema';
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
import { cn } from '@/lib/utils';
import type { Reminder, ReminderInput, ReminderChannel, Debt, ReminderRepeatRule } from '@/types/models';
import { useReminders } from '../hooks/use-reminders';
import { useDebts } from '../../debts/hooks/use-debts';

interface ReminderFormProps {
    onClose: () => void;
    initialData?: Reminder | null;
}

const repeatOptions = [
    { value: 'none', label: 'Tidak berulang' },
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'custom', label: 'Interval Kustom' },
];

const reminderTypes = [
    { value: 'one_time', label: 'Sekali' },
    { value: 'recurring', label: 'Berulang' },
    { value: 'debt', label: 'Terhubung ke Hutang/Piutang' },
];

export const ReminderForm = ({ onClose, initialData = null }: ReminderFormProps) => {
    const { debts } = useDebts();
    const { addReminder, updateReminder, deleteReminder } = useReminders();
    const { showToast } = useUI();
    const isEditMode = !!initialData;
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<ReminderFormValues>({
        resolver: zodResolver(reminderSchema),
        defaultValues: {
            title: initialData?.title || '',
            type: initialData?.type || 'one_time',
            amount: initialData?.amount ? new Intl.NumberFormat('id-ID').format(initialData.amount) : '',
            dueDate: initialData?.dueDate ? parseISO(initialData.dueDate) : new Date(),
            repeatFrequency: initialData?.repeatRule?.frequency || 'none',
            customInterval: initialData?.repeatRule?.customInterval ? String(initialData.repeatRule.customInterval) : '',
            notes: initialData?.notes || '',
            channels: (initialData?.channels as string[]) || ['push'],
            linkedDebtId: initialData?.targetType === 'debt' ? initialData.targetId || '' : '',
        },
    });

    const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
    const type = watch('type');
    const dueDate = watch('dueDate');
    const repeatFrequency = watch('repeatFrequency');
    const channels = watch('channels') || [];

    const dueDateLabel = useMemo(() => {
        if (!dueDate) return 'Pilih tanggal';
        return format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [dueDate]);

    const handleChannelToggle = (channel: string) => {
        const current = [...(channels as string[])];
        const next = current.includes(channel) 
            ? current.filter(c => c !== channel) 
            : [...current, channel];
        setValue('channels', next, { shouldValidate: true });
    };

    const onSubmit = async (values: ReminderFormValues) => {
        const parsedAmount = parseInt(values.amount?.replace(/[^0-9]/g, '') || '0') || 0;
        const payload: ReminderInput = {
            title: values.title,
            type: values.type,
            amount: parsedAmount,
            dueDate: values.dueDate.toISOString(),
            repeatRule:
                values.repeatFrequency === 'none'
                    ? null
                    : {
                          frequency: values.repeatFrequency,
                          customInterval:
                              values.repeatFrequency === 'custom'
                                  ? parseInt(values.customInterval || '0') || null
                                  : null,
                      },
            notes: values.notes || '',
            channels: values.channels,
            status: initialData?.status || 'upcoming',
            snoozeCount: initialData?.snoozeCount ?? 0,
        };

        if (values.type === 'debt' && values.linkedDebtId) {
            payload.targetType = 'debt';
            payload.targetId = values.linkedDebtId;
        } else {
            payload.targetType = 'standalone';
            payload.targetId = null;
        }

        try {
            if (isEditMode) {
                await updateReminder(initialData.id, payload);
            } else {
                await addReminder(payload);
            }
            onClose();
            showToast(`Pengingat berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan saat menyimpan pengingat.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;
        try {
            setIsDeleting(true);
            await deleteReminder(initialData.id);
            onClose();
            showToast('Pengingat telah dihapus.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Gagal menghapus pengingat.', 'error');
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
                className="flex h-fit max-h-[85vh] w-full max-w-md flex-col rounded-t-card bg-background shadow-elevation-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-card bg-background p-4 border-b border-border/15">
                    <div>
                        <h2 className="text-title-lg">{isEditMode ? 'Edit Pengingat' : 'Pengingat Baru'}</h2>
                        <p className="text-body-md text-muted-foreground">Atur tagihan, langganan, atau pengingat hutang.</p>
                    </div>
                    <CloseButton
                        ariaLabel="Tutup"
                        tone="muted"
                        className="bg-muted rounded-full"
                        onClick={onClose}
                    />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className={cn(errors.title && "text-destructive")}>Judul Pengingat</Label>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="title"
                                    placeholder="Contoh: Bayar listrik"
                                    className={cn(errors.title && "border-destructive")}
                                    autoFocus
                                />
                            )}
                        />
                        {errors.title && <p className="text-label-md text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe Pengingat</Label>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reminderTypes.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {type === 'debt' && (
                        <div className="space-y-2">
                            <Label>Terhubung ke Hutang/Piutang</Label>
                            <Controller
                                control={control}
                                name="linkedDebtId"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih catatan hutang/piutang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {debts.length === 0 ? (
                                                <SelectItem value="" disabled>
                                                    Belum ada catatan hutang/piutang
                                                </SelectItem>
                                            ) : (
                                                debts.map((debt: Debt) => (
                                                    <SelectItem key={debt.id} value={debt.id}>
                                                        {debt.title}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Nominal (opsional)</Label>
                            <Controller
                                control={control}
                                name="amount"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="amount"
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
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className={cn(errors.dueDate && "text-destructive")}>Jatuh Tempo</Label>
                            <Controller
                                control={control}
                                name="dueDate"
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn('w-full justify-start bg-background border border-border/15 text-left font-normal', !field.value && 'text-muted-foreground', errors.dueDate && "border-destructive")}
                                            >
                                                <CalendarClock className="mr-2 h-4 w-4" />
                                                {dueDateLabel}
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
                            {errors.dueDate && <p className="text-label-md text-destructive">{errors.dueDate.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Frekuensi Pengingat</Label>
                        <Controller
                            control={control}
                            name="repeatFrequency"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih frekuensi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {repeatOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {repeatFrequency === 'custom' && (
                            <div className="flex flex-col gap-1 pt-1">
                                <div className="flex items-center gap-2 text-body-md text-muted-foreground">
                                    <Controller
                                        control={control}
                                        name="customInterval"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                onChange={e => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                                                className={cn("w-20", errors.customInterval && "border-destructive")}
                                                inputMode="numeric"
                                            />
                                        )}
                                    />
                                    <span>hari sekali</span>
                                </div>
                                {errors.customInterval && <p className="text-label-md text-destructive">{errors.customInterval.message}</p>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan</Label>
                        <Controller
                            control={control}
                            name="notes"
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Detail tambahan seperti nomor akun atau catatan pembayaran"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className={cn(errors.channels && "text-destructive")}>Kanal Pengingat</Label>
                        <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center gap-2 text-body-md cursor-pointer select-none">
                                <Checkbox
                                    checked={channels.includes('push')}
                                    onCheckedChange={() => handleChannelToggle('push')}
                                />
                                Notifikasi aplikasi
                            </label>
                            <label className="inline-flex items-center gap-2 text-body-md cursor-pointer select-none">
                                <Checkbox
                                    checked={channels.includes('email')}
                                    onCheckedChange={() => handleChannelToggle('email')}
                                />
                                Email pengingat
                            </label>
                        </div>
                        {errors.channels && <p className="text-label-md text-destructive">{errors.channels.message}</p>}
                    </div>
                </form>
                <div className="sticky bottom-0 flex gap-2 bg-background p-4 border-t border-border/15">
                    <Button type="submit" onClick={handleSubmit(onSubmit)} className="flex-1" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            `Simpan ${isEditMode ? 'Perubahan' : 'Pengingat'}`
                        )}
                    </Button>
                    {isEditMode && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="icon" disabled={isDeleting} aria-label="Hapus pengingat">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus pengingat ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini akan menghapus pengingat secara permanen.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                        Hapus
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
