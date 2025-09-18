
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';
import { ScrollArea } from './ui/scroll-area';

export const AddBudgetModal = ({ onClose }: { onClose: () => void }) => {
  const { addBudget, expenseCategories } = useApp();
  const [step, setStep] = useState(1);
  const [budgetName, setBudgetName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };
  
  const handleNext = () => {
    if (step === 1 && !budgetName) {
        toast.error("Nama anggaran tidak boleh kosong.");
        return;
    }
    if (step === 2 && !targetAmount) {
        toast.error("Target anggaran harus diisi.");
        return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      toast.error("Pilih minimal satu kategori untuk anggaran ini.");
      return;
    }
    setIsSubmitting(true);
    try {
        await addBudget({
            name: budgetName,
            targetAmount: parseInt(targetAmount.replace(/[^0-9]/g, '')),
            categories: selectedCategories,
        });
    } catch(e) {
        // error handled by provider
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
      setTargetAmount(formattedValue);
  };
  
  const stepTitles = ["Beri Nama Anggaran", "Tentukan Target", "Pilih Kategori"];

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

  const [direction, setDirection] = useState(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[85vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
          <div className="w-8">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          <h2 className="text-xl font-bold text-center">{stepTitles[step - 1]}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 bg-muted rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 p-4 relative overflow-y-auto">
            <AnimatePresence initial={false} custom={direction}>
                 <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                 >
                    {step === 1 && (
                        <div className="space-y-2">
                            <Label htmlFor="budget-name">Nama Anggaran</Label>
                            <Input id="budget-name" placeholder="Contoh: Belanja Bulanan" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} required autoFocus />
                        </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-2">
                            <Label htmlFor="target-amount">Target Pengeluaran per Bulan</Label>
                            <Input id="target-amount" placeholder="Rp 0" value={targetAmount} onChange={handleAmountChange} required inputMode="numeric" autoFocus />
                        </div>
                    )}
                    {step === 3 && (
                         <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Pilih satu atau lebih kategori yang masuk dalam anggaran '{budgetName}'.</p>
                            <ScrollArea className="h-64">
                                <div className="grid grid-cols-4 gap-2 pr-4">
                                {expenseCategories.map(cat => (
                                    <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.name)} 
                                    className={cn(
                                        "p-2 text-center border rounded-lg flex flex-col items-center justify-center gap-1.5 aspect-square transition-colors", 
                                        selectedCategories.includes(cat.name) ? 'border-primary bg-primary/10' : 'border-muted hover:bg-accent'
                                    )}>
                                    <cat.icon className={cn("h-6 w-6", selectedCategories.includes(cat.name) ? 'text-primary' : 'text-muted-foreground')} />
                                    <span className="text-xs text-center leading-tight">{cat.name}</span>
                                    </button>
                                ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                 </motion.div>
            </AnimatePresence>
        </div>
        
        <div className="p-4 border-t sticky bottom-0 bg-background">
          {step < 3 ? (
             <Button onClick={handleNext} className="w-full" size="lg">Lanjut</Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Simpan Anggaran'}</Button>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};
