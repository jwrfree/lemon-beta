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
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recommendation, setRecommendation] = useState<{ avg: number; max: number } | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const selectedCategoryData = expenseCategories.find(c => c.name === selectedCategories[0]);
  const hasSubCategories = selectedCategoryData && selectedCategoryData.sub_categories && selectedCategoryData.sub_categories.length > 0;

  // Fetch recommendation when entering amount step
  useEffect(() => {
    // Determine the amount step index (it's either 3 or 4)
    const amountStep = hasSubCategories ? 4 : 3;
    
    if (step === amountStep && selectedCategories.length > 0 && user) {
      setLoadingRec(true);
      setRecommendation(null);
      
      // Get stats for category (and sub-category if selected)
      transactionService.getCategoryMonthlyStats(user.id, selectedCategories[0], selectedSubCategory || undefined)
        .then((res) => {
          if (res.data) {
            setRecommendation(res.data);
          }
        })
        .finally(() => setLoadingRec(false));
    }
  }, [step, selectedCategories, selectedSubCategory, user, hasSubCategories]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategories([categoryName]);
    setSelectedSubCategory(null); // Reset sub when main changes
  };

  const handleNext = () => {
    if (step === 1 && !budgetName) {
      showToast("Nama anggaran tidak boleh kosong.", 'error');
      return;
    }
    if (step === 2 && selectedCategories.length === 0) {
      showToast("Pilih minimal satu kategori.", 'error');
      return;
    }
    
    // Logic to skip sub-category step if not applicable
    if (step === 2 && !hasSubCategories) {
        setStep(3); // Go directly to target amount
        return;
    }

    if (step === 3 && targetAmount <= 0 && !hasSubCategories) {
        // This was the amount step, but we skipped sub step
        // This case should be handled by the next condition
    }

    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 3 && !hasSubCategories) {
        setStep(2);
        return;
    }
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
        subCategory: selectedSubCategory || undefined,
      });
      onClose();
    } catch {
      // error handled by provider
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    "Beri Nama Anggaran", 
    "Pilih Kategori", 
    hasSubCategories ? "Pilih Sub-Kategori" : "Tentukan Target",
    "Tentukan Target"
  ];

  const totalSteps = hasSubCategories ? 4 : 3;

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
        className="w-full max-w-md bg-popover rounded-t-[2.5rem] flex flex-col h-fit max-h-[85vh] shadow-2xl border-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between sticky top-0 z-10">
          <div className="w-11">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Kembali</span>
              </Button>
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tighter text-center">{stepTitles[step - 1]}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full h-10 w-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </div>

        <div className="flex-1 px-6 pb-6 relative overflow-y-auto">
          <AnimatePresence initial={false} custom={direction} mode="wait">
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
                <div className="space-y-4 pt-2">
                  <Label htmlFor="budget-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Anggaran</Label>
                  <Input id="budget-name" placeholder="Contoh: Makan Siang Kantor" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-none shadow-inner" required autoFocus />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-medium text-muted-foreground ml-1">Pilih kategori utama untuk anggaran &apos;{budgetName}&apos;.</p>
                  <ScrollArea className="h-72">
                    <div className="grid grid-cols-4 gap-3 pr-4 pb-4">
                      {expenseCategories.map(cat => {
                        const Icon = getCategoryIcon(cat.icon);
                        const isSelected = selectedCategories.includes(cat.name);
                        return (
                          <button type="button" key={cat.id} onClick={() => handleCategorySelect(cat.name)}
                            className={cn(
                              "p-3 text-center border-2 rounded-[20px] flex flex-col items-center justify-center gap-2 aspect-square transition-all",
                              isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                            )}>
                            <Icon className={cn("h-6 w-6", isSelected ? 'text-primary' : 'text-muted-foreground/60')} strokeWidth={2.5} />
                            <span className={cn("text-[9px] text-center leading-tight font-bold uppercase tracking-tight", isSelected ? 'text-primary' : 'text-muted-foreground/60')}>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {step === 3 && hasSubCategories && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-medium text-muted-foreground ml-1">Ingin mempersempit ke sub-kategori tertentu?</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                        type="button" 
                        variant={selectedSubCategory === null ? 'default' : 'outline'}
                        onClick={() => setSelectedSubCategory(null)}
                        className="rounded-full h-10 px-5 text-xs font-bold uppercase tracking-widest"
                    >
                        Semua {selectedCategories[0]}
                    </Button>
                    {selectedCategoryData.sub_categories?.map(sub => (
                        <Button 
                            key={sub}
                            type="button" 
                            variant={selectedSubCategory === sub ? 'default' : 'outline'}
                            onClick={() => setSelectedSubCategory(sub)}
                            className="rounded-full h-10 px-5 text-xs font-bold uppercase tracking-widest"
                        >
                            {sub}
                        </Button>
                    ))}
                  </div>
                </div>
              )}

              {((step === 3 && !hasSubCategories) || step === 4) && (
                <div className="space-y-8 pt-2">
                  {/* Recommendation Card */}
                  {loadingRec ? (
                    <div className="h-24 w-full animate-pulse bg-muted/50 rounded-3xl" />
                  ) : recommendation && recommendation.avg > 0 ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[2rem] flex items-start gap-4 shadow-sm">
                      <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 mb-1.5">Smart Insight</h4>
                        <p className="text-xs text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed font-medium">
                          Rata-rata pengeluaranmu di <span className="font-bold text-emerald-700">{selectedSubCategory || selectedCategories[0]}</span> adalah <span className="font-bold text-emerald-700">{formatCurrency(recommendation.avg)}</span> per bulan.
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-3 hover:bg-transparent hover:underline"
                          onClick={() => setTargetAmount(Math.ceil(recommendation.avg))}
                        >
                          Apply {formatCurrency(Math.ceil(recommendation.avg))}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-5 rounded-[2rem] flex items-center gap-4 text-muted-foreground/60 shadow-inner">
                      <TrendingUp className="h-5 w-5 opacity-40" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No historical data for insights yet.</p>
                    </div>
                  )}

                  <div className="space-y-3 text-center">
                    <Label htmlFor="target-amount" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Target Allowance</Label>
                    <div className="flex items-center justify-center gap-2">
                        <Input
                        id="target-amount"
                        value={formatCurrency(targetAmount)}
                        onChange={(e) => setTargetAmount(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                        className="text-5xl font-black border-none focus-visible:ring-0 text-center bg-transparent placeholder:text-muted-foreground/10 h-auto p-0 tracking-tighter"
                        placeholder="Rp 0"
                        inputMode="numeric"
                        autoFocus
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-4">
                    {budgetSteps.map(val => (
                      <Button key={val} type="button" variant="outline" size="sm" onClick={() => setTargetAmount(val)} className={cn("rounded-xl h-10 font-bold tabular-nums text-[10px]", targetAmount === val ? "border-primary bg-primary/5 text-primary" : "border-border/50 text-muted-foreground")}>
                        {new Intl.NumberFormat('id-ID', { notation: "compact" }).format(val)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-border/10 sticky bottom-0 bg-background/80 backdrop-blur-md z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {step < totalSteps ? (
            <Button onClick={handleNext} className="w-full h-14 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95" type="button">Next Step</Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full h-14 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary transition-all active:scale-95" disabled={isSubmitting}>
                {isSubmitting ? 'Syncing...' : 'Confirm & Save'}
            </Button>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};

