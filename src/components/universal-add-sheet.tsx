
'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 Sheet, 
 SheetContent, 
 SheetHeader, 
 SheetTitle, 
 SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';
import { 
 Plus, 
 Sparkle, 
 ArrowsLeftRight, 
 Target, 
 HandCoins, 
 PiggyBank, 
 Bell,
 Receipt
} from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { cn, triggerHaptic } from '@/lib/utils';

export const UniversalAddSheet = () => {
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const tabParam = searchParams.get('tab');
 
 const { 
 isSmartAddOpen, 
 setIsSmartAddOpen,
 openTransactionSheet,
 setIsTransferModalOpen,
 setIsBudgetModalOpen,
 setIsGoalModalOpen,
 setIsDebtModalOpen,
 setIsReminderModalOpen,
 setGoalToEdit,
 setDebtToEdit,
 setReminderToEdit,
 budgetToEdit
 } = useUI();

 const handleAction = (type: string) => {
 triggerHaptic('medium');
 setIsSmartAddOpen(false); // Close the hub first
 
 // Small delay to allow drawer to start closing before opening the next one
 setTimeout(() => {
 switch (type) {
 case 'smart':
 openTransactionSheet(null, 'smart');
 break;
 case 'manual':
 openTransactionSheet(null, 'manual');
 break;
 case 'transfer':
 setIsTransferModalOpen(true);
 break;
 case 'budget':
 setIsBudgetModalOpen(true);
 break;
 case 'goal':
 setGoalToEdit(null);
 setIsGoalModalOpen(true);
 break;
 case 'debt':
 setDebtToEdit(null);
 setIsDebtModalOpen(true);
 break;
 case 'reminder':
 setReminderToEdit(null);
 setIsReminderModalOpen(true);
 break;
 }
 }, 150);
 };

 const isPlanContext = pathname === '/plan';
 
 const options = [
 { 
 id: 'smart', 
 label: 'Auto', 
 sublabel: 'AI Capture',
 icon: Sparkle, 
 color: 'text-primary',
 bg: 'bg-primary/10',
 borderColor: 'border-primary/20',
 isHighlighted: !isPlanContext 
 },
 { 
 id: 'manual', 
 label: 'Catat', 
 sublabel: 'Transaksi',
 icon: Receipt,
 color: 'text-foreground',
 bg: 'bg-secondary/50',
 borderColor: 'border-border/20'
 },
 { 
 id: 'transfer', 
 label: 'Pindah', 
 sublabel: 'Antar Dompet',
 icon: ArrowsLeftRight, 
 color: 'text-muted-foreground',
 bg: 'bg-muted/30',
 borderColor: 'border-border/20'
 },
 { 
 id: 'budget', 
 label: 'Anggaran', 
 sublabel: 'Atur Batas',
 icon: PiggyBank, 
 color: 'text-violet-500',
 bg: 'bg-violet-500/10',
 borderColor: 'border-violet-500/20',
 isHighlighted: tabParam === 'budget'
 },
 { 
 id: 'goal', 
 label: 'Target', 
 sublabel: 'Tabungan',
 icon: Target, 
 color: 'text-emerald-500',
 bg: 'bg-emerald-500/10',
 borderColor: 'border-emerald-500/20',
 isHighlighted: tabParam === 'goals'
 },
 { 
 id: 'debt', 
 label: 'Hutang', 
 sublabel: 'Pinjaman',
 icon: HandCoins, 
 color: 'text-amber-500',
 bg: 'bg-amber-500/10',
 borderColor: 'border-amber-500/20',
 isHighlighted: tabParam === 'debts'
 },
 { 
 id: 'reminder', 
 label: 'Tagihan', 
 sublabel: 'Pengingat',
 icon: Bell, 
 color: 'text-rose-500',
 bg: 'bg-rose-500/10',
 borderColor: 'border-rose-500/20',
 isHighlighted: tabParam === 'bills'
 }
 ];

 return (
 <Sheet open={isSmartAddOpen} onOpenChange={setIsSmartAddOpen}>
 <SheetContent 
 side="bottom"
 hideCloseButton 
 className="overflow-hidden rounded-t-[2.5rem] border-t border-border/20 bg-background pb-12 pt-10 sm:max-w-xl mx-auto shadow-elevation-4"
 >
      <div className="absolute right-4 top-4">
        <CloseButton
          ariaLabel="Tutup smart add"
          tone="default"
          className="bg-secondary text-muted-foreground transition-all active:scale-95"
          onClick={() => setIsSmartAddOpen(false)}
        />
      </div>

 <SheetHeader className="mb-8 px-6 text-left">
 <SheetTitle className="text-display-md tracking-tight">Apa yang ingin ditambah?</SheetTitle>
 <SheetDescription className="text-body-lg text-muted-foreground">Pilih kategori untuk mulai mencatat.</SheetDescription>
 </SheetHeader>

 <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3">
  {options.map((option) => (
  <motion.button
  key={option.id}
  type="button"
  whileTap={{ scale: 0.96 }}
  onClick={() => handleAction(option.id)}
 aria-label={`${option.label}: ${option.sublabel}`}
 className={cn(
 "group relative flex flex-col items-center gap-3 rounded-3xl p-5 text-center transition-all border overflow-hidden",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
 option.bg,
 option.borderColor,
 option.isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
 )}
 >
 {option.isHighlighted && (
 <div className="absolute right-3 top-3">
 <div className="h-2 w-2 rounded-full bg-primary animate-pulse"/>
 </div>
 )}
 <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border/15 transition-transform group-active:scale-90", option.color)}>
 <option.icon size={24} weight={option.isHighlighted ? "fill": "regular"} />
 </div>
 <div className="flex flex-col gap-0.5">
 <span className="text-body-md text-foreground leading-none">{option.label}</span>
 <span className="text-label-md text-foreground/80 ">{option.sublabel}</span>
 </div>
 </motion.button>
 ))}
 </div>
 </SheetContent>
 </Sheet>
 );
};
