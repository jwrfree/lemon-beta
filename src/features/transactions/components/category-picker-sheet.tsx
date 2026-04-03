'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CaretRight, MagnifyingGlass, X } from '@/lib/icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategoryIcon } from '@/lib/category-utils';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/categories';

interface CategoryPickerSheetProps {
 isOpen: boolean;
 onClose: () => void;
 categories: Category[];
 recentCategories: Category[];
 selectedCategoryName?: string;
 // eslint-disable-next-line no-unused-vars
 onSelect(category: Category): void;
}

const CategoryRow = ({
 category,
 isSelected,
 onClick,
}: {
 category: Category;
 isSelected: boolean;
 onClick: () => void;
}) => {
 return (
 <button
 type="button"
 onClick={onClick}
 className={cn(
 'flex w-full items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left shadow-elevation-2 transition-all active:scale-[0.99]',
 isSelected && 'ring-2 ring-primary/20'
 )}
 >
 <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', category.bg_color, category.color)}>
 {React.createElement(getCategoryIcon(category.icon), { className: 'h-5 w-5'})}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-body-md text-foreground">{category.name}</p>
 {category.sub_categories?.length ? (
 <p className="mt-0.5 text-label-md text-muted-foreground">
 {category.sub_categories.length} subkategori
 </p>
 ) : null}
 </div>
 {isSelected ? (
 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
 <Check size={18} weight="regular"/>
 </div>
 ) : (
 <CaretRight size={18} weight="regular"className="text-muted-foreground"/>
 )}
 </button>
 );
};

export const CategoryPickerSheet = ({
 isOpen,
 onClose,
 categories,
 recentCategories,
 selectedCategoryName,
 onSelect,
}: CategoryPickerSheetProps) => {
 const [query, setQuery] = useState('');

 const normalizedQuery = query.trim().toLowerCase();

 const filteredCategories = useMemo(() => {
 if (!normalizedQuery) return categories;

 return categories.filter((category) => {
 const haystacks = [
 category.name,
 ...(category.sub_categories || []),
 ].map((item) => item.toLowerCase());

 return haystacks.some((item) => item.includes(normalizedQuery));
 });
 }, [categories, normalizedQuery]);

 const visibleRecent = useMemo(() => {
 if (normalizedQuery) return [];

 return recentCategories.filter((category) => category.name !== selectedCategoryName);
 }, [normalizedQuery, recentCategories, selectedCategoryName]);

 const selectedCategory = categories.find((category) => category.name === selectedCategoryName);

 if (!isOpen) return null;

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-end justify-center bg-black/80"
 onClick={onClose}
 >
 <motion.div
 initial={{ y: '100%'}}
 animate={{ y: 0 }}
 exit={{ y: '100%'}}
 transition={{ duration: 0.22, ease: 'easeOut'}}
 className="flex h-[82vh] max-h-[82vh] w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-card border-t border-border bg-muted shadow-elevation-4"
 onClick={(event) => event.stopPropagation()}
 >
 <div className="flex flex-col gap-3 bg-muted px-4 pb-4 pt-3">
 <div className="mx-auto h-1.5 w-12 rounded-full bg-border"/>
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-title-lg text-foreground">Pilih kategori</h2>
 <p className="mt-1 text-body-md text-muted-foreground">Pilih kategori utama, lalu lanjut ke subkategori bila ada.</p>
 </div>
 <Button variant="ghost"size="icon"onClick={onClose} className="rounded-full bg-background">
 <X size={32} weight="regular"/>
 <span className="sr-only">Tutup</span>
 </Button>
 </div>

 <div className="relative">
 <MagnifyingGlass size={18} weight="regular"className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
 <Input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Cari kategori atau subkategori"
 className="h-11 rounded-xl bg-background pl-10"
 />
 </div>
 </div>

 <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted">
 <div className="space-y-5 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
 {selectedCategory && !normalizedQuery ? (
 <div className="space-y-2">
 <p className="px-1 text-label text-muted-foreground/55">
 Terpilih
 </p>
 <CategoryRow
 category={selectedCategory}
 isSelected
 onClick={() => onSelect(selectedCategory)}
 />
 </div>
 ) : null}

 {visibleRecent.length > 0 ? (
 <div className="space-y-2">
 <p className="px-1 text-label text-muted-foreground/55">
 Terakhir dipakai
 </p>
 <div className="space-y-2">
 {visibleRecent.map((category) => (
 <CategoryRow
 key={`recent-${category.id}`}
 category={category}
 isSelected={category.name === selectedCategoryName}
 onClick={() => onSelect(category)}
 />
 ))}
 </div>
 </div>
 ) : null}

 <div className="space-y-2">
 <p className="px-1 text-label text-muted-foreground/55">
 {normalizedQuery ? 'Hasil pencarian': 'Semua kategori'}
 </p>
 <div className="space-y-2">
 {filteredCategories.map((category) => (
 <CategoryRow
 key={category.id}
 category={category}
 isSelected={category.name === selectedCategoryName}
 onClick={() => onSelect(category)}
 />
 ))}
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 </motion.div>
 );
};

