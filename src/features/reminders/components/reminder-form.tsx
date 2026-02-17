'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, CalendarClock } from 'lucide-react';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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

    const [title, setTitle] = useState(initialData?.title || '');
    const [type, setType] = useState<Reminder['type']>(initialData?.type || 'one_time');
    const [amount, setAmount] = useState(() => {
        if (!initialData?.amount) return '';
        return new Intl.NumberFormat('id-ID').format(initialData.amount);
    });
    const [dueDate, setDueDate] = useState<Date | undefined>(
        initialData?.dueDate ? parseISO(initialData.dueDate) : new Date()
    );
    const [repeatFrequency, setRepeatFrequency] = useState<ReminderRepeatRule['frequency']>(
        initialData?.repeatRule?.frequency || 'none'
    );
    const [customInterval, setCustomInterval] = useState(
        initialData?.repeatRule?.customInterval ? String(initialData.repeatRule.customInterval) : ''
    );
    const [notes, setNotes] = useState(initialData?.notes || '');
    const initialChannels: ReminderChannel[] = Array.isArray(initialData?.channels) && initialData.channels?.length
        ? (initialData.channels as ReminderChannel[])
        : ['push'];
    const [channels, setChannels] = useState<ReminderChannel[]>(initialChannels);
    const [linkedDebtId, setLinkedDebtId] = useState(
        initialData?.targetType === 'debt' ? initialData.targetId || '' : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const dueDateLabel = useMemo(() => {
        if (!dueDate) return 'Pilih tanggal';
        return format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [dueDate]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setAmount(formattedValue);
    };

    const handleChannelToggle = (channel: ReminderChannel) => {
        setChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dueDate) {
            showToast('Judul dan tanggal jatuh tempo wajib diisi.', 'error');
            return;
        }

        const parsedAmount = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
        const payload: ReminderInput = {
            title,
            type,
            amount: parsedAmount,
            dueDate: dueDate.toISOString(),
            repeatRule:
                repeatFrequency === 'none'
                    ? null
                    : {
                          frequency: repeatFrequency,
                          customInterval:
                              repeatFrequency === 'custom'
                                  ? parseInt(customInterval || '0') || null
                                  : null,
                      },
            notes,
            channels,
            status: initialData?.status || 'upcoming',
            snoozeCount: initialData?.snoozeCount ?? 0,
        };

        if (type === 'debt' && linkedDebtId) {
            payload.targetType = 'debt';
            payload.targetId = linkedDebtId;
        } else {
            payload.targetType = 'standalone';
            payload.targetId = null;
        }

        try {
            setIsSubmitting(true);
            if (isEditMode) {
                await updateReminder(initialData.id, payload);
            } else {
                await addReminder(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan saat menyimpan pengingat.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;
        try {
            setIsDeleting(true);
            await deleteReminder(initialData.id);
            onClose();
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
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-xl font-medium">{isEditMode ? 'Edit Pengingat' : 'Pengingat Baru'}</h2>
                        <p className="text-sm text-muted-foreground">Atur tagihan, langganan, atau pengingat hutang.</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Pengingat</Label>
                        <Input
                            id="title"
                            placeholder="Contoh: Bayar listrik"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe Pengingat</Label>
                        <Select value={type} onValueChange={value => setType(value as Reminder['type'])}>
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
                    </div>

                    {type === 'debt' && (
                        <div className="space-y-2">
                            <Label>Terhubung ke Hutang/Piutang</Label>
                            <Select value={linkedDebtId} onValueChange={setLinkedDebtId}>
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
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Nominal (opsional)</Label>
                            <Input
                                id="amount"
                                placeholder="Rp 0"
                                value={amount}
                                onChange={handleAmountChange}
                                inputMode="numeric"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Jatuh Tempo</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
                                    >
                                        <CalendarClock className="mr-2 h-4 w-4" />
                                        {dueDateLabel}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        locale={dateFnsLocaleId}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Frekuensi Pengingat</Label>
                        <Select
                            value={repeatFrequency}
                            onValueChange={value => setRepeatFrequency(value as ReminderRepeatRule['frequency'])}
                        >
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
                        {repeatFrequency === 'custom' && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Input
                                    value={customInterval}
                                    onChange={e => setCustomInterval(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-20"
                                    inputMode="numeric"
                                />
                                <span>hari sekali</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Catatan</Label>
                        <Textarea
                            placeholder="Detail tambahan seperti nomor akun atau catatan pembayaran"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Kanal Pengingat</Label>
                        <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={channels.includes('push')}
                                    onCheckedChange={() => handleChannelToggle('push')}
                                />
                                Notifikasi aplikasi
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={channels.includes('email')}
                                    onCheckedChange={() => handleChannelToggle('email')}
                                />
                                Email pengingat
                            </label>
                        </div>
                    </div>
                </form>
                <div className="p-4 border-t sticky bottom-0 bg-background flex gap-2">
                    <Button type="submit" onClick={handleSubmit} className="flex-1" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Pengingat'}`}
                    </Button>
                    {isEditMode && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="icon" disabled={isDeleting}>
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

