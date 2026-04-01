'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/categories';

interface SubCategorySheetProps {
    category: Category;
    selectedValue: string;
    onSelect: (subCategoryName: string) => void;
    onClose: () => void;
}

export const SubCategorySheet = ({ category, selectedValue, onSelect, onClose }: SubCategorySheetProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex h-fit max-h-[60vh] w-full max-w-md flex-col rounded-t-card bg-background/98 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.35)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-card bg-background/96 p-4 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.2)]">
                    <h2 className="text-xl font-medium tracking-tight">Pilih Sub-kategori {category.name}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {category.sub_categories?.map((subCat) => (
                            <button
                                key={subCat}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(subCat);
                                }}
                                className="flex w-full items-center justify-between rounded-lg bg-background/70 p-3 text-left shadow-[0_10px_20px_-18px_rgba(15,23,42,0.14)] transition-colors hover:bg-accent"
                            >
                                <span className={cn(selectedValue === subCat && "font-medium text-primary")}>
                                    {subCat}
                                </span>
                                {selectedValue === subCat && <Check className="h-5 w-5 text-primary" />}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </motion.div>
        </motion.div>
    );
};

