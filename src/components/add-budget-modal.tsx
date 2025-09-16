
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';

export const AddBudgetModal = ({ onClose }: { onClose: () => void }) => {
  const { addBudget, expenseCategories } = useApp();
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName || !targetAmount || selectedCategories.length === 0) {
      toast.error("Semua kolom harus diisi.");
      return;
    }
    setIsSubmitting(true);
    await addBudget({
      name: budgetName,
      targetAmount: parseInt(targetAmount.replace(/[^0-9]/g, '')),
      categories: selectedCategories,
    });
    setIsSubmitting(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
      setTargetAmount(formattedValue);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
          <h2 className="text-xl font-bold">Buat Anggaran Baru</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="space-y-2">
            <Label htmlFor="budget-name">Nama Anggaran</Label>
            <Input id="budget-name" placeholder="Contoh: Belanja Bulanan" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-amount">Target Anggaran</Label>
            <Input id="target-amount" placeholder="Rp 0" value={targetAmount} onChange={handleAmountChange} required inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map(cat => (
                <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.name)} className={cn("p-2 text-center border rounded-lg flex flex-col items-center gap-2", selectedCategories.includes(cat.name) ? 'border-primary bg-primary/10' : 'border-muted')}>
                  <cat.icon className={cn("h-6 w-6", selectedCategories.includes(cat.name) ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Simpan Anggaran'}</Button>
        </form>
      </motion.div>
    </motion.div>
  );
};
