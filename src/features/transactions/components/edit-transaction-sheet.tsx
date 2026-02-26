'use client';

import React, { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronDown, FileText, Heart, Loader2, MapPin, Save, ShoppingBag, Tag, Trash2, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

import { useTransactionForm } from '../hooks/use-transaction-form';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '../hooks/use-transactions';
import { Transaction } from '@/types/models';

import { AmountInput } from './form-partials/amount-input';
import { CategorySelector } from './form-partials/category-selector';
import { WalletSelector } from './form-partials/wallet-selector';
import { DatePicker } from './form-partials/date-picker';
import { HeroAmount } from './liquid-composer/HeroAmount';
import { MagicBar } from './liquid-composer/MagicBar';

interface EditTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const EditTransactionSheet = ({ isOpen, onClose, transaction }: EditTransactionSheetProps) => {
  const { wallets } = useWallets();
  const { expenseCategories, incomeCategories } = useCategories();
  const [magicValue, setMagicValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const aiContext = useMemo(
    () => ({
      wallets,
      categories: [...expenseCategories, ...incomeCategories].map((categoryItem) => categoryItem.name),
    }),
    [wallets, expenseCategories, incomeCategories]
  );

  const { form, isSubmitting, handleSubmit, handleDelete, isAiProcessing, aiExplanation, applyLiquidPatch } = useTransactionForm({
    initialData: transaction,
    onSuccess: onClose,
    context: aiContext,
  });

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const type = watch('type');
  const amount = watch('amount');
  const category = watch('category');
  const subCategory = watch('subCategory');
  const dateValue = watch('date');
  const walletId = watch('walletId');
  const isNeed = watch('isNeed');

  const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;
  const formErrors = errors as Record<string, { message?: string } | undefined>;
  const walletError = formErrors.walletId?.message;
  const categoryError = formErrors.category?.message;

  if (!transaction) return null;

  const amountNumber = Number((amount ?? '0').toString().replace(/[^0-9]/g, ''));
  const selectedWallet = wallets.find((walletItem) => walletItem.id === walletId);
  const missingCoreFields = [!amountNumber, !category, !walletId, !dateValue].filter(Boolean).length;

  const summaryChips = [
    {
      icon: <Tag className="h-3.5 w-3.5" />,
      label: category || 'Pilih kategori',
    },
    {
      icon: <Wallet className="h-3.5 w-3.5" />,
      label: selectedWallet?.name || 'Pilih dompet',
    },
    {
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      label: dateValue ? format(dateValue, 'dd MMM yyyy', { locale: dateFnsLocaleId }) : 'Pilih tanggal',
    },
  ];

  const handleMagicSubmit = async () => {
    if (!magicValue.trim()) return;
    await applyLiquidPatch(magicValue.trim());
    setMagicValue('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[94vh] sm:h-auto sm:max-w-xl rounded-t-3xl sm:rounded-3xl px-0 pb-0 flex flex-col gap-0 overflow-hidden border-none shadow-xl bg-background text-foreground"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Edit Transaksi</SheetTitle>
          <SheetDescription>Ubah informasi inti dulu, lalu detail tambahan bila diperlukan.</SheetDescription>
        </SheetHeader>

        <div className="relative border-b border-border/60 bg-card/95 backdrop-blur-sm px-6 pt-7 pb-5">
          <div className="mb-4">
            <HeroAmount amount={amountNumber} type={type} onAmountClick={() => undefined} />
          </div>

          <div className="space-y-2.5">
            <p className="text-label tracking-wider text-muted-foreground">Ringkasan</p>
            <div className="flex flex-wrap gap-2">
              {summaryChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs text-foreground/80"
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/70 bg-background/60 p-2.5">
            <MagicBar
              value={magicValue}
              onChange={setMagicValue}
              onReturn={handleMagicSubmit}
              onClear={() => setMagicValue('')}
              isProcessing={isAiProcessing}
              placeholder="Contoh: ubah jadi pengeluaran makan siang 45 ribu kemarin"
            />
            <AnimatePresence>
              {aiExplanation && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 px-2 text-xs text-muted-foreground"
                >
                  {aiExplanation}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-5 pt-4 space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Informasi inti</h3>
                <p className="text-xs text-muted-foreground">Lengkapi nominal, dompet, tanggal, dan kategori.</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-label font-medium',
                  missingCoreFields > 0 ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-700'
                )}
              >
                {missingCoreFields > 0 ? `${missingCoreFields} belum lengkap` : 'Lengkap'}
              </span>
            </div>

            <Tabs value={type} onValueChange={(value) => { if (value === 'income' || value === 'expense') setValue('type', value); }}>
              <TabsList className="w-full h-11 bg-muted/60 rounded-xl p-1">
                <TabsTrigger value="expense" className="flex-1 rounded-lg text-xs font-medium">
                  Pengeluaran
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1 rounded-lg text-xs font-medium">
                  Pemasukan
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AmountInput control={control} name="amount" error={errors.amount?.message} useCustomKeyboard />

            <div className="grid grid-cols-2 gap-4">
              <WalletSelector control={control} name="walletId" wallets={wallets} label="Dompet" error={walletError} />
              <DatePicker control={control} name="date" error={errors.date?.message} />
            </div>

            <CategorySelector
              control={control}
              name="category"
              value={subCategory}
              categories={activeCategories}
              error={categoryError}
              onSubCategoryChange={(val) => setValue('subCategory', val)}
            />
          </section>

          {type === 'expense' && (
            <section className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur p-4 space-y-3">
              <p className="text-label tracking-wider text-muted-foreground">Intent pembelian</p>
              <div className="flex gap-2 rounded-xl border border-border/70 bg-background/70 p-1">
                <button
                  type="button"
                  onClick={() => setValue('isNeed', true, { shouldDirty: true })}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all flex items-center justify-center gap-2',
                    isNeed !== false ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/60'
                  )}
                >
                  <Heart className={cn('h-3.5 w-3.5', isNeed !== false ? 'fill-rose-500 text-rose-500' : 'opacity-50')} />
                  Kebutuhan
                </button>
                <button
                  type="button"
                  onClick={() => setValue('isNeed', false, { shouldDirty: true })}
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all flex items-center justify-center gap-2',
                    isNeed === false ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/60'
                  )}
                >
                  <ShoppingBag className={cn('h-3.5 w-3.5', isNeed === false ? 'fill-indigo-500 text-indigo-500' : 'opacity-50')} />
                  Keinginan
                </button>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold">Detail tambahan</p>
                <p className="text-xs text-muted-foreground">Opsional: lokasi dan catatan transaksi.</p>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showAdvanced && 'rotate-180')} />
            </button>

            <AnimatePresence initial={false}>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 border-t border-border/70 px-4 pb-4 pt-2">
                    <div className="space-y-2">
                      <p className="text-label tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Lokasi
                      </p>
                      <Input
                        {...form.register('location')}
                        placeholder="Contoh: Grand Indonesia, Starbucks"
                        className="h-11 rounded-xl bg-background/90"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-label tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Deskripsi
                      </p>
                      <Input
                        {...form.register('description')}
                        placeholder="Tulis konteks singkat transaksi"
                        className="h-11 rounded-xl bg-background/90"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <div className="border-t border-border/70 bg-card/85 backdrop-blur-xl p-4 sm:p-5 flex gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-12 w-12 rounded-xl border border-border/70 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 rounded-xl text-sm font-medium bg-primary text-primary-foreground">
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4.5 w-4.5" />
                Simpan • {formatCurrency(amountNumber)}
              </span>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
