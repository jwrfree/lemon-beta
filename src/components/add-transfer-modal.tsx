
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, CalendarIcon, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';

export const AddTransferModal = ({ onClose }: { onClose: () => void }) => {
  const { addTransfer, wallets } = useApp();
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
    setAmount(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !fromWalletId || !toWalletId || !date || !description) {
      toast.error("Harap isi semua kolom.");
      return;
    }
    if (fromWalletId === toWalletId) {
        toast.error("Dompet asal dan tujuan tidak boleh sama.");
        return;
    }
    setIsSubmitting(true);
    try {
        await addTransfer({
            fromWalletId,
            toWalletId,
            amount: parseInt(amount.replace(/[^0-9]/g, '')),
            description,
            date: date.toISOString(),
        });
    } catch (error) {
        toast.error('Gagal mencatat transfer.');
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Antar Dompet
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full"><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              placeholder="Rp 0"
              value={amount}
              onChange={handleAmountChange}
              required
              inputMode="numeric"
              className="text-2xl h-14 font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-wallet">Dari Dompet</Label>
              <Select onValueChange={setFromWalletId} value={fromWalletId}>
                <SelectTrigger id="from-wallet">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-wallet">Ke Dompet</Label>
              <Select onValueChange={setToWalletId} value={toWalletId} disabled={!fromWalletId}>
                <SelectTrigger id="to-wallet">
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
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "d MMM yyyy", { locale: dateFnsLocaleId }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={dateFnsLocaleId} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              placeholder="e.g., Pindah dana untuk belanja"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </form>
        <div className="p-4 border-t sticky bottom-0 bg-background z-10">
          <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Simpan Transfer'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
