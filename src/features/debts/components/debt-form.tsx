'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, CalendarClock } from 'lucide-react';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
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
import type { Debt, DebtInput, PaymentFrequency } from '@/types/models';
import { useDebts } from '../hooks/use-debts';

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
    const isEditMode = !!initialData;

    const [title, setTitle] = useState(initialData?.title || '');
    const [direction, setDirection] = useState<Debt['direction']>(initialData?.direction || 'owed');
    const [counterparty, setCounterparty] = useState(initialData?.counterparty || '');
    const [category, setCategory] = useState(initialData?.category || 'personal');
    const [principal, setPrincipal] = useState(() => {
        if (!initialData?.principal) return '';
        return new Intl.NumberFormat('id-ID').format(initialData.principal);
    });
    const [outstanding, setOutstanding] = useState(() => {
        if (!initialData?.outstandingBalance && !initialData?.principal) return '';
        const value = initialData?.outstandingBalance ?? initialData?.principal ?? 0;
        return value ? new Intl.NumberFormat('id-ID').format(value) : '';
    });
    const [interestRate, setInterestRate] = useState(
        typeof initialData?.interestRate === 'number' ? String(initialData.interestRate) : ''
    );
    const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(
        initialData?.paymentFrequency || 'monthly'
    );
    const [customInterval, setCustomInterval] = useState(
        initialData?.customInterval ? String(initialData.customInterval) : ''
    );
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialData?.startDate ? parseISO(initialData.startDate) : new Date()
    );
    const [dueDate, setDueDate] = useState<Date | undefined>(
        initialData?.dueDate ? parseISO(initialData.dueDate) : undefined
    );
    const [nextPaymentDate, setNextPaymentDate] = useState<Date | undefined>(
        initialData?.nextPaymentDate ? parseISO(initialData.nextPaymentDate) : undefined
    );
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formattedStartDate = useMemo(() => {
        if (!startDate) return 'Pilih tanggal';
        return format(startDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [startDate]);

    const formattedDueDate = useMemo(() => {
        if (!dueDate) return 'Tidak ditentukan';
        return format(dueDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [dueDate]);

    const formattedNextPayment = useMemo(() => {
        if (!nextPaymentDate) return 'Tidak ditentukan';
        return format(nextPaymentDate, 'd MMM yyyy', { locale: dateFnsLocaleId });
    }, [nextPaymentDate]);

    const handleCurrencyChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setter(formattedValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const principalValue = parseInt(principal.replace(/[^0-9]/g, '')) || 0;
        if (!title || !counterparty || principalValue <= 0) {
            showToast('Nama hutang/piutang, pihak terkait, dan nominal utama wajib diisi.', 'error');
            return;
        }

        const outstandingValue = outstanding
            ? parseInt(outstanding.replace(/[^0-9]/g, '')) || principalValue
            : principalValue;

        const payload: DebtInput = {
            title,
            direction,
            counterparty,
            category,
            principal: principalValue,
            outstandingBalance: outstandingValue,
            interestRate: interestRate ? parseFloat(interestRate) : null,
            paymentFrequency,
            customInterval:
                paymentFrequency === 'custom' ? parseInt(customInterval || '0') || null : null,
            startDate: startDate ? startDate.toISOString() : null,
            dueDate: dueDate ? dueDate.toISOString() : null,
            nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString() : null,
            notes,
            status: initialData?.status || 'active',
            payments: initialData?.payments || [],
        };

        try {
            setIsSubmitting(true);
            if (isEditMode) {
                await updateDebt(initialData.id, payload);
            } else {
                await addDebt(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan catatan hutang/piutang.', 'error');
        } finally {
            setIsSubmitting(false);
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
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-xl font-bold">{isEditMode ? 'Edit Hutang/Piutang' : 'Catatan Hutang/Piutang'}</h2>
                        <p className="text-sm text-muted-foreground">
                            Simpan detail pinjaman, cicilan, atau piutang yang harus kamu pantau.
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Nama Hutang/Piutang</Label>
                        <Input
                            id="title"
                            placeholder="Contoh: Cicilan Laptop"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={direction} onValueChange={value => setDirection(value as Debt['direction'])}>
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="counterparty">Pihak Terkait</Label>
                        <Input
                            id="counterparty"
                            placeholder="Nama teman, bank, atau institusi"
                            value={counterparty}
                            onChange={e => setCounterparty(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nominal Awal</Label>
                            <Input
                                placeholder="Rp 0"
                                value={principal}
                                onChange={handleCurrencyChange(setPrincipal)}
                                inputMode="numeric"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sisa Saat Ini</Label>
                            <Input
                                placeholder="Rp 0"
                                value={outstanding}
                                onChange={handleCurrencyChange(setOutstanding)}
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select value={category} onValueChange={setCategory}>
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
                        </div>
                        <div className="space-y-2">
                            <Label>Suku Bunga (%)</Label>
                            <Input
                                placeholder="0"
                                value={interestRate}
                                onChange={e => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
                                inputMode="decimal"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Frekuensi Pembayaran</Label>
                        <Select
                            value={paymentFrequency}
                            onValueChange={value => setPaymentFrequency(value as PaymentFrequency)}
                        >
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
                        {paymentFrequency === 'custom' && (
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tanggal Mulai</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                                    >
                                        <CalendarClock className="mr-2 h-4 w-4" />
                                        {formattedStartDate}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        locale={dateFnsLocaleId}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Jatuh Tempo</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
                                    >
                                        <CalendarClock className="mr-2 h-4 w-4" />
                                        {formattedDueDate}
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
                        <Label>Pembayaran Berikutnya</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn('w-full justify-start text-left font-normal', !nextPaymentDate && 'text-muted-foreground')}
                                >
                                    <CalendarClock className="mr-2 h-4 w-4" />
                                    {formattedNextPayment}
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
                            placeholder="Tambahkan detail penting seperti skedul pembayaran, nomor rekening, atau jaminan"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                </form>
                <div className="p-4 border-t sticky bottom-0 bg-background flex gap-2">
                    <Button type="submit" onClick={handleSubmit} className="flex-1" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Catatan'}`}
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
                                    <AlertDialogTitle>Hapus catatan ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Penghapusan tidak dapat dibatalkan dan akan menghapus seluruh riwayat pembayaran.
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
