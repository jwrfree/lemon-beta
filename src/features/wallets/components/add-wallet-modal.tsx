'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Landmark, Smartphone, ArrowLeft, CircleDollarSign, Loader2, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActions } from '@/providers/action-provider';
import { useUI } from '@/components/ui-provider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletSchema, WalletFormValues } from '../schemas/wallet-schema';
import { cn } from '@/lib/utils';

const popularWallets: Record<string, string[]> = {
  'e-wallet': ['GoPay', 'OVO', 'DANA', 'LinkAja', 'ShopeePay', 'PayPal'],
  'bank': ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Jenius', 'Bank Jago', 'Blu', 'Seabank'],
};

const walletCategories = [
  { key: 'e-wallet', name: 'E-Wallet', Icon: Smartphone },
  { key: 'bank', name: 'Bank', Icon: Landmark },
  { key: 'paylater', name: 'Paylater', Icon: Smartphone },
  { key: 'investasi', name: 'Investasi', Icon: TrendingUp },
  { key: 'cash', name: 'Tunai', Icon: Wallet },
  { key: 'other', name: 'Lainnya', Icon: CircleDollarSign },
];

export const AddWalletModal = ({ onClose }: { onClose: () => void }) => {
  const { addWallet } = useActions();
  const { showToast } = useUI();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<{ key: string, name: string, Icon: React.ElementType } | null>(null);

  const form = useForm<z.input<typeof walletSchema>>({
    resolver: zodResolver(walletSchema) as any,
    defaultValues: {
      name: '',
      balance: '',
      icon: '',
      isDefault: false,
    }
  });

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = form;

  const handleCategorySelect = (category: { key: string, name: string, Icon: React.ElementType }) => {
    setSelectedCategory(category);
    setValue('icon', category.key);
    if (category.key === 'cash') {
      setValue('name', 'Tunai');
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setValue('name', '');
    setValue('balance', '');
    setValue('icon', '');
    setSelectedCategory(null);
  };

  const onSubmit = async (data: z.input<typeof walletSchema>) => {
    const values = data as unknown as WalletFormValues;
    try {
      await addWallet({
        name: values.name,
        icon: values.icon,
        balance: Number(values.balance)
      });
    } catch (error) {
      showToast("Gagal membuat dompet.", 'error');
      console.error(error);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const direction = 1;

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
        className="w-full max-w-md bg-background/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-2xl flex flex-col h-fit md:h-auto border-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between sticky top-0 z-10">
          <div className="w-11">
            {step === 2 && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Kembali</span>
              </Button>
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tighter text-center">
            {step === 1 ? 'Pilih Jenis' : `Detail ${selectedCategory?.name}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full h-10 w-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>

        <div className="relative overflow-hidden p-6 pt-0">
          <AnimatePresence initial={false} custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="grid grid-cols-2 gap-4"
              >
                {walletCategories.map((cat) => (
                  <div
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-card rounded-[24px] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group border border-border/20"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategorySelect(cat);
                      }
                    }}
                  >
                    <div className="p-3 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <cat.Icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="font-semibold text-xs uppercase tracking-widest text-muted-foreground/80">{cat.name}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 2 && selectedCategory && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="wallet-name" className={cn("text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1", errors.name && "text-destructive")}>Nama Dompet</Label>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="wallet-name"
                          placeholder={`Contoh: ${selectedCategory.key === 'e-wallet' ? 'GoPay' : 'Rekening Gaji'}`}
                          disabled={selectedCategory.key === 'cash'}
                          className={cn("h-12 rounded-2xl bg-secondary/50 border-none shadow-inner focus-visible:ring-primary/30", errors.name && "bg-destructive/5")}
                        />
                      )}
                    />
                    {errors.name && <p className="text-xs font-medium text-destructive ml-1">{errors.name.message}</p>}
                  </div>

                  {popularWallets[selectedCategory.key] && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {popularWallets[selectedCategory.key].map(name => (
                        <Button key={name} type="button" variant="outline" size="sm" className="rounded-full h-8 px-4 text-xs font-semibold uppercase tracking-wider" onClick={() => setValue('name', name, { shouldValidate: true })}>
                          {name}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="initial-balance" className={cn("text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1", errors.balance && "text-destructive")}>Saldo Awal</Label>
                    <Controller
                      control={control}
                      name="balance"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="initial-balance"
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
                          className={cn("h-12 rounded-2xl bg-secondary/50 border-none shadow-inner text-lg font-semibold tabular-nums focus-visible:ring-primary/30", errors.balance && "bg-destructive/5")}
                        />
                      )}
                    />
                    {errors.balance && <p className="text-xs font-medium text-destructive ml-1">{errors.balance.message}</p>}
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-full font-semibold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Simpan Dompet'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

