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
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[60vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                    <h2 className="text-xl font-bold">Pilih Sub-kategori {category.name}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {category.subCategories?.map((subCat) => (
                            <button
                                key={subCat}
                                type="button"
                                onClick={() => onSelect(subCat)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent text-left"
                            >
                                <span className={cn(selectedValue === subCat && "font-semibold text-primary")}>
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
