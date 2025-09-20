
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Banknote, Landmark, Smartphone, ArrowLeft, CaseSensitive, CircleDollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';

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
  const { addWallet, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{key: string, name: string, Icon: React.ElementType} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (category: {key: string, name: string, Icon: React.ElementType}) => {
    setSelectedCategory(category);
    if (category.key === 'cash') {
      setWalletName('Tunai');
    }
    setStep(2);
  };
  
  const handleBack = () => {
    setStep(1);
    setWalletName('');
    setInitialBalance('');
    setSelectedCategory(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
      setInitialBalance(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) {
      showToast("Nama dompet tidak boleh kosong.", 'error');
      return;
    }
    setIsSubmitting(true);
    const balance = parseInt(initialBalance.replace(/[^0-9]/g, '')) || 0;
    try {
      await addWallet({ 
        name: walletName, 
        icon: selectedCategory?.key, 
        balance: balance 
      });
      // The addWallet function in provider now closes the modal
    } catch (error) {
      showToast("Gagal membuat dompet.", 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-popover rounded-t-2xl shadow-lg flex flex-col h-fit md:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-popover rounded-t-2xl">
          <div className="w-8">
            {step === 2 && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          <h2 className="text-xl font-bold text-center">
            {step === 1 ? 'Pilih Jenis Dompet' : `Detail Dompet ${selectedCategory?.name}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 bg-black/10 dark:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
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
                    <button
                      key={cat.key}
                      onClick={() => handleCategorySelect(cat)}
                      className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <cat.Icon className="h-8 w-8 text-primary" />
                      <span className="font-medium">{cat.name}</span>
                    </button>
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
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-name">Nama Dompet</Label>
                    <Input
                      id="wallet-name"
                      placeholder={`Contoh: ${selectedCategory.key === 'e-wallet' ? 'GoPay' : 'Rekening Gaji'}`}
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      required
                      disabled={selectedCategory.key === 'cash'}
                    />
                  </div>
                  
                  {popularWallets[selectedCategory.key] && (
                    <div className="flex flex-wrap gap-2">
                        {popularWallets[selectedCategory.key].map(name => (
                            <Button key={name} type="button" variant="outline" size="sm" onClick={() => setWalletName(name)}>
                                {name}
                            </Button>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="initial-balance">Saldo Awal (Opsional)</Label>
                    <Input
                      id="initial-balance"
                      placeholder="Rp 0"
                      value={initialBalance}
                      onChange={handleAmountChange}
                      inputMode="numeric"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : 'Simpan Dompet'}
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
