
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { cn, formatCurrency } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useUI } from './ui-provider';

const budgetSteps = [500000, 1000000, 2000000, 5000000, 10000000];

export const EditBudgetModal = ({ budget, onClose }: { budget: any, onClose: () => void }) => {
  const { updateBudget, deleteBudget, expenseCategories } = useData();
  const { showToast } = useUI();

  const [budgetName, setBudgetName] = useState(budget.name);
  const [targetAmount, setTargetAmount] = useState(budget.targetAmount);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(budget.categories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
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
      showToast("Pilih minimal satu kategori untuk anggaran ini.", 'error');
      return;
    }
    setIsSubmitting(true);
    try {
        await updateBudget(budget.id, {
            name: budgetName,
            targetAmount: targetAmount,
            categories: selectedCategories,
        });
    } catch(e) {
        // error handled by provider
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBudget(budget.id);
      // The deleteBudget function in provider now closes the modal and navigates back
    } catch (error) {
      showToast("Gagal menghapus anggaran.", 'error');
      console.error(error);
      setIsDeleting(false);
    }
  };
  
  const hasChanges = 
    budgetName !== budget.name || 
    targetAmount !== budget.targetAmount || 
    JSON.stringify(selectedCategories.sort()) !== JSON.stringify(budget.categories.sort());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }} 
        transition={{ duration: 0.2, ease: "easeOut" }} 
        className="w-full max-w-md bg-popover rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[85vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-popover rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-center">Edit Anggaran</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 bg-black/10 dark:bg-white/10 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
                <Label htmlFor="budget-name">Nama Anggaran</Label>
                <Input id="budget-name" placeholder="Contoh: Belanja Bulanan" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} required />
            </div>

            <div className="space-y-4">
                <div className="space-y-2 text-center">
                    <Label htmlFor="target-amount" className="text-sm">Target Pengeluaran per Bulan</Label>
                    <Input 
                        id="target-amount" 
                        value={formatCurrency(targetAmount)}
                        onChange={(e) => setTargetAmount(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                        className="text-4xl font-bold border-none focus-visible:ring-0 text-center bg-transparent"
                        size="lg"
                        inputMode="numeric"
                    />
                </div>
                <Slider
                    value={[targetAmount]}
                    onValueChange={(value) => setTargetAmount(value[0])}
                    max={10000000}
                    step={50000}
                />
                <div className="grid grid-cols-4 gap-2">
                    {budgetSteps.map(val => (
                        <Button key={val} type="button" variant="outline" size="sm" onClick={() => setTargetAmount(val)}>
                            {formatCurrency(val / 1000)}k
                        </Button>
                    ))}
                </div>
            </div>

             <div className="space-y-3">
                <Label>Kategori</Label>
                <p className="text-sm text-muted-foreground">Pilih satu atau lebih kategori yang masuk dalam anggaran ini.</p>
                <ScrollArea className="h-48">
                    <div className="grid grid-cols-4 gap-2 pr-4">
                    {expenseCategories.map(cat => (
                        <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.name)} 
                        className={cn(
                            "p-2 text-center border rounded-lg flex flex-col items-center justify-center gap-1.5 aspect-square transition-colors", 
                            selectedCategories.includes(cat.name) ? 'border-primary bg-primary/10' : 'hover:bg-accent'
                        )}>
                        <cat.icon className={cn("h-6 w-6", selectedCategories.includes(cat.name) ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="text-xs text-center leading-tight">{cat.name}</span>
                        </button>
                    ))}
                    </div>
                </ScrollArea>
            </div>
        </form>
        
        <div className="p-4 border-t sticky bottom-0 bg-popover flex gap-2">
            <Button type="submit" onClick={handleSubmit} className="flex-1" size="lg" disabled={isSubmitting || !hasChanges}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="icon" disabled={isDeleting}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin mau menghapus anggaran ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan dan akan menghapus anggaran '{budget.name}' secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>

      </motion.div>
    </motion.div>
  );
};
