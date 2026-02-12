'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';

interface CategoryGridProps {
    categories: (Category & { bg_color?: string })[];
    selectedCategory: string;
    onCategorySelect: (cat: Category) => void;
}

export const CategoryGrid = ({ categories, selectedCategory, onCategorySelect }: CategoryGridProps) => {
    return (
        <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;

                // Jika cat.icon sudah berupa komponen (LucideIcon), gunakan langsung.
                // Jika string (nama ikon dari DB), gunakan getCategoryIcon.
                const CategoryIcon = typeof cat.icon === 'string'
                    ? getCategoryIcon(cat.icon)
                    : (cat.icon || getCategoryIcon('Wrench'));

                const color = cat.color || 'text-gray-600';
                const bgColor = cat.bg_color || 'bg-gray-100';

                return (
                    <button
                        type="button"
                        key={cat.id}
                        onClick={() => onCategorySelect(cat)}
                        className={cn(
                            "p-2 text-center border rounded-xl flex flex-col items-center justify-center gap-1 aspect-square transition-all active:scale-95",
                            isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-transparent bg-muted/30'
                        )}
                    >
                        <div className={cn("p-2 rounded-full", isSelected ? 'bg-primary text-white shadow-sm' : bgColor)}>
                            <CategoryIcon className={cn("h-5 w-5", isSelected ? 'text-white' : color)} />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight truncate w-full">{cat.name}</span>
                    </button>
                );
            })}
        </div>
    );
};
