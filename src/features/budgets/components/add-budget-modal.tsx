'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { transactionService } from '@/features/transactions/services/transaction.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useUI } from '@/components/ui-provider';
import { getCategoryIcon } from '@/lib/category-utils';

const budgetSteps = [500000, 1000000, 2000000, 5000000, 10000000];

export const AddBudgetModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const { addBudget } = useBudgets();
  const { expenseCategories } = useCategories();
  const { showToast } = useUI();
  const [step, setStep] = useState(1);
  const [budgetName, setBudgetName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recommendation, setRecommendation] = useState<{ avg: number; max: number } | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  // Fetch recommendation when entering amount step (Step 3)
  useEffect(() => {
    if (step === 3 && selectedCategories.length > 0 && user) {
      setLoadingRec(true);
      setRecommendation(null);
      transactionService.getCategoryMonthlyStats(user.id, selectedCategories[0])
        .then((res) => {
          if (res.data) {
            setRecommendation(res.data);
            // Optional: Auto-set target if current is 0? 
            if (targetAmount === 0 && res.data.avg > 0) {
              // setTargetAmount(Math.ceil(res.data.avg)); // Maybe too intrusive? Let's just suggest.
            }
          }
        })
        .finally(() => setLoadingRec(false));
    }
  }, [step, selectedCategories, user]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleNext = () => {
    if (step === 1 && !budgetName) {
      showToast("Nama anggaran tidak boleh kosong.", 'error');
      return;
    }
    // Step 2 is now Category
    if (step === 2 && selectedCategories.length === 0) {
      showToast("Pilih minimal satu kategori.", 'error');
      return;
    }
    // Step 3 is Amount (Validation on Submit or Next if there was a Step 4)
    if (step === 3 && targetAmount <= 0) {
      showToast("Target anggaran harus lebih besar dari nol.", 'error');
      return;
    }
    setStep(s => s + 1);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (targetAmount <= 0) {
      showToast("Target anggaran harus lebih besar dari nol.", 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await addBudget({
        name: budgetName,
        targetAmount: targetAmount,
        period: 'monthly',
        categories: [selectedCategories[0]],
      });
      onClose(); // Explicitly close on success
    } catch {
      // error handled by provider
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = ["Beri Nama Anggaran", "Pilih Kategori", "Tentukan Target"];

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

  const [direction] = useState(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md bg-popover rounded-t-2xl flex flex-col h-fit max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-popover rounded-t-2xl z-10">
          <div className="w-11">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Kembali</span>
              </Button>
            )}
          </div>
          <h2 className="text-xl font-medium text-center">{stepTitles[step - 1]}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/10 dark:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>

        <div className="flex-1 p-6 relative overflow-y-auto">
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
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Pilih kategori untuk anggaran &apos;{budgetName}&apos;.</p>
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-4 gap-2 pr-4">
                      {expenseCategories.map(cat => {
                        const Icon = getCategoryIcon(cat.icon);
                        const isSelected = selectedCategories.includes(cat.name);
                        return (
                          <button type="button" key={cat.id} onClick={() => {
                            // Single select logic for MVP recommendation
                            setSelectedCategories([cat.name]);
                          }}
                            className={cn(
                              "p-2 text-center border rounded-lg flex flex-col items-center justify-center gap-1.5 aspect-square transition-all",
                              isSelected ? 'border-primary bg-primary/10 scale-95 ring-2 ring-primary/20' : 'hover:bg-accent hover:border-foreground/20'
                            )}>
                            <Icon className={cn("h-6 w-6", isSelected ? 'text-primary' : 'text-muted-foreground')} />
                            <span className="text-xs text-center leading-tight font-medium">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Recommendation Card */}
                  {loadingRec ? (
                    <div className="h-24 w-full animate-pulse bg-muted rounded-xl" />
                  ) : recommendation && recommendation.avg > 0 ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                      <div className="bg-emerald-500/20 p-2 rounded-full">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">Smart Insight</h4>
                        <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                          Rata-rata pengeluaranmu di <span className="font-medium">{selectedCategories[0]}</span> adalah <span className="font-medium">{formatCurrency(recommendation.avg)}</span> per bulan.
                        </p>
                        <Button
                          size="sm"
                          variant="link"
                          className="h-auto p-0 text-emerald-600 dark:text-emerald-400 font-medium text-xs mt-2"
                          onClick={() => setTargetAmount(Math.ceil(recommendation.avg))}
                        >
                          Gunakan {formatCurrency(Math.ceil(recommendation.avg))}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-xl flex items-center gap-3 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <p className="text-xs">Belum ada data historis cukup untuk rekomendasi.</p>
                    </div>
                  )}

                  <div className="space-y-2 text-center pt-2">
                    <Label htmlFor="target-amount" className="text-sm font-medium text-muted-foreground">Tentukan Target Maksimal</Label>
                    <Input
                      id="target-amount"
                      value={formatCurrency(targetAmount)}
                      onChange={(e) => setTargetAmount(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                      className="text-4xl font-medium border-none focus-visible:ring-0 text-center bg-transparent placeholder:text-muted-foreground/20"
                      placeholder="Rp 0"
                      size="lg"
                      inputMode="numeric"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {budgetSteps.map(val => (
                      <Button key={val} type="button" variant="outline" size="sm" onClick={() => setTargetAmount(val)} className={cn(targetAmount === val && "border-primary bg-primary/5")}>
                        {formatCurrency(val / 1000)}k
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t sticky bottom-0 bg-popover">
          {step < 3 ? (
            <Button onClick={handleNext} className="w-full" type="button">Lanjut</Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Simpan Anggaran'}</Button>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};

