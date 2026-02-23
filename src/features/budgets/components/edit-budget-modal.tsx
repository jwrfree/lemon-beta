'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatCurrency } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUI } from '@/components/ui-provider';
import type { Budget } from '@/types/models';
import { getCategoryIcon } from '@/lib/category-utils';

const budgetSteps = [500000, 1000000, 2000000, 5000000, 10000000];

export const EditBudgetModal = ({ budget, onClose }: { budget: Budget, onClose: () => void }) => {
  const { expenseCategories } = useCategories();
  const { updateBudget, deleteBudget } = useBudgets();
  const { showToast } = useUI();

  const [budgetName, setBudgetName] = useState(budget.name);
  const [targetAmount, setTargetAmount] = useState(budget.targetAmount);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(budget.categories);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(budget.subCategory || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCategoryData = expenseCategories.find(c => c.name === selectedCategories[0]);
  const hasSubCategories = selectedCategoryData && selectedCategoryData.sub_categories && selectedCategoryData.sub_categories.length > 0;

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategories([categoryName]);
    setSelectedSubCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName) {
      showToast("Nama anggaran tidak boleh kosong.", 'error');
      return;
    }
    if (targetAmount <= 0) {
      showToast("Target anggaran harus lebih besar dari nol.", 'error');
      return;
    }
    if (selectedCategories.length === 0) {
      showToast("Pilih minimal satu kategori.", 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateBudget(budget.id, {
        name: budgetName,
        targetAmount: targetAmount,
        categories: [selectedCategories[0]],
        subCategory: selectedSubCategory || undefined,
      });
    } catch {
      // error handled by provider
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBudget(budget.id);
    } catch (error) {
      showToast("Gagal menghapus anggaran.", 'error');
      console.error(error);
      setIsDeleting(false);
    }
  };

  const hasChanges =
    budgetName !== budget.name ||
    targetAmount !== budget.targetAmount ||
    selectedSubCategory !== (budget.subCategory || null) ||
    JSON.stringify(selectedCategories) !== JSON.stringify(budget.categories);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md bg-background/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-2xl flex flex-col h-fit max-h-[90vh] border-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/10">
          <h2 className="text-xl font-semibold tracking-tighter">Adjust Budget</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full h-10 w-10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-8 overflow-y-auto">
          <div className="space-y-3">
            <Label htmlFor="budget-name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Budget Name</Label>
            <Input id="budget-name" placeholder="e.g. Daily Meals" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-none shadow-inner" required />
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <Label htmlFor="target-amount" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/40">Monthly Target</Label>
              <Input
                id="target-amount"
                value={formatCurrency(targetAmount)}
                onChange={(e) => setTargetAmount(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                className="text-5xl font-bold border-none focus-visible:ring-0 text-center bg-transparent h-auto p-0 tracking-tighter tabular-nums"
                size="lg"
                inputMode="numeric"
              />
            </div>
            <div className="px-4">
                <Slider
                value={[targetAmount]}
                onValueChange={(value) => setTargetAmount(value[0])}
                max={10000000}
                step={100000}
                className="py-4"
                />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {budgetSteps.map(val => (
                <Button key={val} type="button" variant="outline" size="sm" onClick={() => setTargetAmount(val)} className={cn("rounded-xl h-10 font-semibold text-xs", targetAmount === val ? "border-primary bg-primary/5 text-primary" : "border-border/50 text-muted-foreground")}>
                  {new Intl.NumberFormat('id-ID', { notation: "compact" }).format(val)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Main Category</Label>
            <ScrollArea className="h-48">
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
                      <span className={cn("text-xs text-center leading-tight font-semibold uppercase tracking-tight", isSelected ? 'text-primary' : 'text-muted-foreground/60')}>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {hasSubCategories && (
            <div className="space-y-4 pt-2">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Sub-Category (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                <Button 
                    type="button" 
                    variant={selectedSubCategory === null ? 'default' : 'outline'}
                    onClick={() => setSelectedSubCategory(null)}
                    className="rounded-full h-10 px-5 text-xs font-semibold uppercase tracking-widest"
                >
                    All {selectedCategories[0]}
                </Button>
                {selectedCategoryData.sub_categories?.map(sub => (
                    <Button 
                        key={sub}
                        type="button" 
                        variant={selectedSubCategory === sub ? 'default' : 'outline'}
                        onClick={() => setSelectedSubCategory(sub)}
                        className="rounded-full h-10 px-5 text-xs font-semibold uppercase tracking-widest"
                    >
                        {sub}
                    </Button>
                ))}
                </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-border/10 sticky bottom-0 bg-background/80 backdrop-blur-md flex gap-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <Button type="submit" onClick={handleSubmit} className="flex-1 h-14 rounded-full font-semibold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary active:scale-95" disabled={isSubmitting || !hasChanges}>
            {isSubmitting ? 'Updating...' : 'Save Changes'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-600 hover:bg-rose-500/20" disabled={isDeleting}>
                <Trash2 className="h-6 w-6" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[32px] border-none shadow-2xl bg-popover/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-semibold tracking-tighter">Delete Budget?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                  This will permanently remove the budget for &apos;{budget.name}&apos;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex-row gap-3">
                <AlertDialogCancel className="flex-1 rounded-full h-12 border-border font-semibold text-xs uppercase tracking-widest mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-full h-12 font-semibold text-xs uppercase tracking-widest">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </motion.div>
    </motion.div>
  );
};

