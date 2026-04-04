'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/categories';

interface SubCategorySheetProps {
 category: Category;
 selectedValue: string;
 onSelect: SubCategorySelectHandler;
 onClose: () => void;
}

type SubCategorySelectHandler = (subCategoryName: string) => void;

export const SubCategorySheet = ({ category, selectedValue, onSelect, onClose }: SubCategorySheetProps) => {
 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-end justify-center bg-black/80"
 onClick={onClose}
 >
 <motion.div
 initial={{ y: "100%"}}
 animate={{ y: 0 }}
 exit={{ y: "100%"}}
 transition={{ duration: 0.2, ease: "easeOut"}}
 className="flex h-fit max-h-[60vh] w-full max-w-md flex-col rounded-t-card border-t border-border/20 bg-background shadow-elevation-4"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-card bg-background p-4 border-b border-border/15">
 <h2 className="text-title-lg">Pilih Sub-kategori {category.name}</h2>
        <CloseButton
          ariaLabel="Tutup"
          tone="muted"
          className="text-muted-foreground"
          onClick={onClose}
        />
 </div>
 <ScrollArea className="flex-1 bg-muted/25">
 <div className="p-4 space-y-2">
 {category.sub_categories?.map((subCat) => (
 <button
 key={subCat}
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 onSelect(subCat);
 }}
 className="flex w-full items-center justify-between rounded-lg bg-background p-3 text-left border border-border/15 transition-colors hover:bg-secondary"
 >
 <div className="flex w-full items-center justify-between">
 <span className={cn('text-body-md transition-colors', selectedValue === subCat ? 'text-foreground': 'text-foreground')}>
 {subCat}
 </span>
 {selectedValue === subCat && <Check size={20} weight="regular"className="text-primary"/>}
 </div>
 </button>
 ))}
 </div>
 </ScrollArea>
 </motion.div>
 </motion.div>
 );
};

