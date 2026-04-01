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

                const color = cat.color || 'text-muted-foreground';
                const bgColor = cat.bg_color || 'bg-muted';

                return (
                    <button
                        type="button"
                        key={cat.id}
                        onClick={() => onCategorySelect(cat)}
                        className={cn(
                            "aspect-square rounded-lg p-2 text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                            isSelected ? 'bg-primary/10 shadow-[0_14px_28px_-22px_rgba(13,148,136,0.22)] ring-2 ring-primary/25' : 'bg-secondary/72 hover:bg-secondary'
                        )}
                    >
                        <div className={cn("rounded-lg p-2.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]", isSelected ? 'bg-primary text-white' : bgColor)}>
                            <CategoryIcon className={cn("h-5 w-5", isSelected ? 'text-white' : color)} />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight truncate w-full">{cat.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

