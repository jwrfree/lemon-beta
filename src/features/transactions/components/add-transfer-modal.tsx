'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CalendarIcon, ArrowRightLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useUI } from '@/components/ui-provider';
import { useActions } from '@/providers/action-provider';
import { transferSchema, TransferFormValues } from '../schemas/transaction-schema';

export const AddTransferModal = ({ onClose }: { onClose: () => void }) => {
  const { addTransfer } = useActions();
  const { wallets } = useWallets();
  const { preFilledTransfer, setPreFilledTransfer, showToast } = useUI();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWalletId: preFilledTransfer?.fromWalletId || '',
      toWalletId: preFilledTransfer?.toWalletId || '',
      amount: preFilledTransfer?.amount ? new Intl.NumberFormat('id-ID').format(preFilledTransfer.amount) : '',
      description: preFilledTransfer?.description || '',
      date: new Date(),
    },
  });

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    if (preFilledTransfer) {
      if (preFilledTransfer.fromWalletId) setValue('fromWalletId', preFilledTransfer.fromWalletId);
      if (preFilledTransfer.toWalletId) setValue('toWalletId', preFilledTransfer.toWalletId);
      if (preFilledTransfer.amount) setValue('amount', new Intl.NumberFormat('id-ID').format(preFilledTransfer.amount));
      if (preFilledTransfer.description) setValue('description', preFilledTransfer.description);
    }
    return () => {
      setPreFilledTransfer(null);
    };
  }, [preFilledTransfer, setPreFilledTransfer, setValue]);

  const onSubmit = async (values: TransferFormValues) => {
    try {
      await addTransfer({
        fromWalletId: values.fromWalletId,
        toWalletId: values.toWalletId,
        amount: values.amount as unknown as number, // Zod transform handles this
        description: values.description,
        date: values.date.toISOString(),
      });
      onClose();
    } catch (error) {
      showToast('Gagal mencatat transfer.', 'error');
      console.error(error);
    }
  };

  const fromWalletId = watch('fromWalletId');
  const toWallets = wallets.filter(w => w.id !== fromWalletId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md bg-popover rounded-t-2xl shadow-lg flex flex-col h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-popover rounded-t-2xl z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Antar Dompet
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/10 dark:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount-transfer" className={cn(errors.amount && "text-destructive")}>Jumlah</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Input
                  {...field}
                  id="amount-transfer"
                  placeholder="Rp 0"
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
                    field.onChange(formattedValue);
                  }}
                  className={cn("text-2xl font-bold", errors.amount && "border-destructive")}
                  inputMode="numeric"
                />
              )}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-wallet" className={cn(errors.fromWalletId && "text-destructive")}>Dari Dompet</Label>
              <Controller
                control={control}
                name="fromWalletId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="from-wallet" className={cn(errors.fromWalletId && "border-destructive")}>
                      <SelectValue placeholder="Pilih dompet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fromWalletId && <p className="text-xs text-destructive">{errors.fromWalletId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-wallet" className={cn(errors.toWalletId && "text-destructive")}>Ke Dompet</Label>
              <Controller
                control={control}
                name="toWalletId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!fromWalletId}>
                    <SelectTrigger id="to-wallet" className={cn(errors.toWalletId && "border-destructive")}>
                      <SelectValue placeholder="Pilih dompet" />
                    </SelectTrigger>
                    <SelectContent>
                      {toWallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.toWalletId && <p className="text-xs text-destructive">{errors.toWalletId.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-transfer" className={cn(errors.date && "text-destructive")}>Tanggal</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="date-transfer" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground", errors.date && "border-destructive")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "d MMM yyyy", { locale: dateFnsLocaleId }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={dateFnsLocaleId} />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description-transfer" className={cn(errors.description && "text-destructive")}>Deskripsi</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  {...field}
                  id="description-transfer"
                  placeholder="e.g., Pindah dana untuk belanja"
                  className={cn(errors.description && "border-destructive")}
                />
              )}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </form>
        <div className="p-4 border-t sticky bottom-0 bg-popover z-10">
          <Button onClick={handleSubmit(onSubmit)} className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Simpan Transfer'
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
