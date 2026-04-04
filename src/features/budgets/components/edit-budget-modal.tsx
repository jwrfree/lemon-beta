'use client';

import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Trash, X } from '@/lib/icons';
import { useCategories } from '@/features/transactions';
import { useBudgets } from '@/features/budgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
 const swipeHandlers = useSwipeable({
 onSwipedDown: onClose,
 preventScrollOnSwipe: true,
 trackMouse: true,
 });

 return (
 <Sheet open onOpenChange={(open) => !open && onClose()}>
 <SheetContent
 side="bottom"
 hideCloseButton
 className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-card-premium bg-background/95 p-0 shadow-lg backdrop-blur-xl"
 {...swipeHandlers}
 >
 <div className="pointer-events-none flex justify-center pt-3">
 <div className="h-1.5 w-12 rounded-full bg-border/80"/>
 </div>
 <SheetHeader className="sr-only">
 <SheetTitle>Edit anggaran</SheetTitle>
 <SheetDescription>Sesuaikan nama, target, dan kategori anggaran.</SheetDescription>
 </SheetHeader>

 <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/10 bg-background/80 p-6 backdrop-blur-md">
  <h2 className="text-title-lg">Ubah Anggaran</h2>
        <Button variant="ghost"size="icon"onClick={onClose} className="bg-muted rounded-full h-11 w-11" aria-label="Tutup">
 <X className="h-5 w-5"weight="regular"/>
 </Button>
 </div>

 <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
 <div className="space-y-3">
  <Label htmlFor="budget-name"className="text-label-md text-label text-muted-foreground ml-1">Nama Anggaran</Label>
  <Input id="budget-name"placeholder="contoh: Makan Harian"value={budgetName} onChange={(e) => setBudgetName(e.target.value)} className="h-12 rounded-card bg-muted border border-border/15"required />
 </div>

 <div className="space-y-6">
 <div className="space-y-2 text-center">
  <Label htmlFor="target-amount"className="text-label-md text-label text-muted-foreground/40">Target Bulanan</Label>
 <Input
 id="target-amount"
 value={formatCurrency(targetAmount)}
 onChange={(e) => setTargetAmount(parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
 className="text-display-lg font-medium border-none focus-visible:ring-0 text-center bg-transparent h-auto p-0 tracking-tighter tabular-nums"
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
 <Button key={val} type="button"variant="outline"size="sm"onClick={() => setTargetAmount(val)} className={cn("rounded-md h-10 text-label-md", targetAmount === val ? "border-primary bg-primary/5 text-primary": "border-border/20 text-muted-foreground")}>
 {new Intl.NumberFormat('id-ID', { notation: "compact"}).format(val)}
 </Button>
 ))}
 </div>
 </div>

 <div className="space-y-4">
  <Label className="text-label-md text-label text-muted-foreground ml-1">Kategori Utama</Label>
 <ScrollArea className="h-48">
 <div className="grid grid-cols-4 gap-3 pr-4 pb-4">
 {expenseCategories.map(cat => {
 const Icon = getCategoryIcon(cat.icon);
 const isSelected = selectedCategories.includes(cat.name);
 return (
 <button type="button"key={cat.id} onClick={() => handleCategorySelect(cat.name)}
 className={cn(
 "p-3 text-center border-2 rounded-card-icon flex flex-col items-center justify-center gap-2 aspect-square transition-all",
 isSelected ? 'border-primary bg-primary/5': 'border-transparent bg-muted/30 hover:bg-muted/50'
 )}>
 <Icon className={cn("h-6 w-6", isSelected ? 'text-primary': 'text-muted-foreground/60')} strokeWidth={2.5} />
 <span className={cn("text-label-md text-center leading-tight tracking-tight", isSelected ? 'text-primary': 'text-muted-foreground/60')}>{cat.name}</span>
 </button>
 );
 })}
 </div>
 </ScrollArea>
 </div>

 {hasSubCategories && (
 <div className="space-y-4 pt-2">
  <Label className="text-label-md text-label text-muted-foreground ml-1">Sub-kategori (Opsional)</Label>
 <div className="flex flex-wrap gap-2">
            <Button 
              type="button"
              variant={selectedSubCategory === null ? 'primary': 'outline'}
              onClick={() => setSelectedSubCategory(null)}
              className="rounded-full h-10 px-5 text-label-md text-label"
            >
  Semua {selectedCategories[0]}
 </Button>
 {selectedCategoryData.sub_categories?.map(sub => (
              <Button 
                key={sub}
                type="button"
                variant={selectedSubCategory === sub ? 'primary': 'outline'}
                onClick={() => setSelectedSubCategory(sub)}
                className="rounded-full h-10 px-5 text-label-md text-label"
              >
 {sub}
 </Button>
 ))}
 </div>
 </div>
 )}
 </form>

 <div className="p-6 border-t border-border/10 sticky bottom-0 bg-background/80 backdrop-blur-md flex gap-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
 <Button type="submit"onClick={handleSubmit} className="flex-1 h-14 rounded-full text-label-md text-label shadow-xl shadow-primary/20 bg-primary active:scale-95"disabled={isSubmitting || !hasChanges}>
  {isSubmitting ? 'Menyimpan...': 'Simpan Perubahan'}
 </Button>
 <AlertDialog>
 <AlertDialogTrigger asChild>
            <Button type="button"variant="ghost"className="h-14 w-14 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"disabled={isDeleting} aria-label="Hapus anggaran">
 <Trash className="h-6 w-6"weight="regular"/>
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className="rounded-card-premium border-none shadow-xl bg-popover/95 backdrop-blur-xl">
 <AlertDialogHeader>
  <AlertDialogTitle className="text-display-md tracking-tighter">Hapus Anggaran?</AlertDialogTitle>
  <AlertDialogDescription className="text-body-md font-medium text-muted-foreground">
  Anggaran &apos;{budget.name}&apos; akan dihapus permanen.
  </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-6 flex-row gap-3">
  <AlertDialogCancel className="flex-1 rounded-full h-12 border-border/20 text-label-md text-label mt-0">Batal</AlertDialogCancel>
  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-full h-12 text-label-md text-label">
  {isDeleting ? 'Menghapus...': 'Hapus'}
  </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>

 </SheetContent>
 </Sheet>
 );
};



