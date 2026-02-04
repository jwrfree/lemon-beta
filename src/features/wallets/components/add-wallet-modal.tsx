'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Landmark, Smartphone, ArrowLeft, CircleDollarSign, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActions } from '@/providers/action-provider';
import { useUI } from '@/components/ui-provider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { walletSchema, WalletFormValues } from '../schemas/wallet-schema';
import { cn } from '@/lib/utils';

const popularWallets: Record<string, string[]> = {
  'e-wallet': ['GoPay', 'OVO', 'DANA', 'LinkAja', 'ShopeePay'],
  'bank': ['BCA', 'Mandiri', 'BNI', 'BRI', 'Jenius', 'Bank Jago'],
};

const walletCategories = [
  { key: 'e-wallet', name: 'E-Wallet', Icon: Smartphone },
  { key: 'bank', name: 'Bank', Icon: Landmark },
  { key: 'cash', name: 'Tunai', Icon: Wallet },
  { key: 'other', name: 'Lainnya', Icon: CircleDollarSign },
];

export const AddWalletModal = ({ onClose }: { onClose: () => void }) => {
  const { addWallet } = useActions();
  const { showToast } = useUI();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<{key: string, name: string, Icon: React.ElementType} | null>(null);

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      balance: '',
      icon: '',
      isDefault: false,
    }
  });

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = form;

  const handleCategorySelect = (category: {key: string, name: string, Icon: React.ElementType}) => {
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

  const onSubmit = async (values: WalletFormValues) => {
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
        className="w-full max-w-md bg-popover rounded-t-2xl shadow-lg flex flex-col h-fit md:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-popover rounded-t-2xl">
          <div className="w-11">
            {step === 2 && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Kembali</span>
              </Button>
            )}
          </div>
          <h2 className="text-xl font-bold text-center">
            {step === 1 ? 'Pilih Jenis Dompet' : `Detail Dompet ${selectedCategory?.name}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/10 dark:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>
        
        <div className="relative overflow-hidden">
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
                className="p-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {walletCategories.map((cat) => (
                    <div
                      key={cat.key}
                      onClick={() => handleCategorySelect(cat)}
                      className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCategorySelect(cat);
                        }
                      }}
                    >
                      <cat.Icon className="h-8 w-8 text-primary" />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  ))}
                </div>
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
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-name" className={cn(errors.name && "text-destructive")}>Nama Dompet</Label>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="wallet-name"
                          placeholder={`Contoh: ${selectedCategory.key === 'e-wallet' ? 'GoPay' : 'Rekening Gaji'}`}
                          disabled={selectedCategory.key === 'cash'}
                          className={cn(errors.name && "border-destructive")}
                        />
                      )}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  
                  {popularWallets[selectedCategory.key] && (
                    <div className="flex flex-wrap gap-2">
                        {popularWallets[selectedCategory.key].map(name => (
                            <Button key={name} type="button" variant="outline" size="sm" onClick={() => setValue('name', name, { shouldValidate: true })}>
                                {name}
                            </Button>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="initial-balance" className={cn(errors.balance && "text-destructive")}>Saldo Awal</Label>
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
                          className={cn(errors.balance && "border-destructive")}
                        />
                      )}
                    />
                    {errors.balance && <p className="text-xs text-destructive">{errors.balance.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
