
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSwipeable } from 'react-swipeable';
import { X, Wallet, Banknote, Landmark } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem as ShadCNRadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';

export const AddWalletModal = ({ onClose }: { onClose: () => void }) => {
  const { addWallet } = useApp();
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) {
      toast.error("Nama dompet tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addWallet({ name: walletName, icon: walletType });
      // The addWallet function in provider now closes the modal
    } catch (error) {
      toast.error("Gagal membuat dompet.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlers = useSwipeable({
    onSwipedDown: onClose,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  
  const walletTypes = [
    { key: 'wallet', name: 'Dompet', Icon: Wallet },
    { key: 'bank', name: 'Bank', Icon: Banknote },
    { key: 'landmark', name: 'Lainnya', Icon: Landmark },
  ];

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
        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit md:h-auto"
        onClick={(e) => e.stopPropagation()}
        {...handlers}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
          <h2 className="text-xl font-bold">Buat Dompet Baru</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Nama Dompet</Label>
            <Input
              id="wallet-name"
              placeholder="Contoh: Tabungan, E-Wallet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Jenis Dompet</Label>
            <RadioGroup onValueChange={setWalletType} value={walletType} className="grid grid-cols-3 gap-2">
              {walletTypes.map(({key, name, Icon}) => {
                return (
                  <Label key={key} htmlFor={`wallet-type-${key}`} className={cn(
                    "relative flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 cursor-pointer",
                    "font-normal",
                    walletType === key ? 'border-primary' : 'border-muted'
                  )}>
                    <ShadCNRadioGroupItem value={key} id={`wallet-type-${key}`} className="sr-only" />
                    <Icon className={cn("h-8 w-8", walletType === key ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-medium">{name}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Simpan Dompet'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};
