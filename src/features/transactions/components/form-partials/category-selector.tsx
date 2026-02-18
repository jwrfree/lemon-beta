import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Control, Controller, FieldValues, Path, useWatch } from 'react-hook-form';
import { Category } from '@/lib/categories';
import { CategoryGrid } from '../category-grid';
import { SubCategorySheet } from '../sub-category-sheet';
import { getCategoryIcon } from '@/lib/category-utils';

interface CategorySelectorProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    subCategoryName?: Path<T>;
    categories: Category[];
    label?: string;
    error?: string;
    isSuggesting?: boolean;
    isAiSuggested?: boolean;
    onSubCategoryChange?: (value: string) => void;
}

export function CategorySelector<T extends FieldValues>({
    control,
    name,
    subCategoryName,
    categories,
    label = "Kategori",
    error,
    isSuggesting,
    isAiSuggested,
    onSubCategoryChange
}: CategorySelectorProps<T>) {
    const [isSubCategorySheetOpen, setIsSubCategorySheetOpen] = useState(false);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<Category | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [localSubCategory, setLocalSubCategory] = useState<string>(''); // Track locally

    const handleCategoryClick = (cat: Category, onChange: (value: string) => void) => {
        onChange(cat.name);
        if (onSubCategoryChange) {
            onSubCategoryChange(''); // Reset subcategory in form
            setLocalSubCategory(''); // Reset local state
        }

        if (cat.sub_categories && cat.sub_categories.length > 0) {
            setSelectedCategoryForSub(cat);
            setIsSubCategorySheetOpen(true);
        } else {
            setSelectedCategoryForSub(null);
        }
    };

    const handleSubCategorySelect = (val: string) => {
        console.log('[CategorySelector] Sub-category selected:', val); // Debug log
        setLocalSubCategory(val); // Update local state
        if (onSubCategoryChange) {
            onSubCategoryChange(val); // Update form
        }
        setIsSubCategorySheetOpen(false);
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const selectedCategory = categories.find(c => c.name === field.value);

                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-end min-h-[20px]">
                            <AnimatePresence>
                                {isSuggesting && (
                                    <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-md">
                                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                        AI berpikir...
                                    </motion.div>
                                )}
                                {!isSuggesting && isAiSuggested && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-[10px] text-warning font-medium bg-warning/10 px-2 py-0.5 rounded-md border border-warning/20">
                                        <Sparkles className="h-2.5 w-2.5 fill-warning" />
                                        Disarankan AI
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg p-4 h-auto border-border bg-secondary transition-all active:scale-[0.99]",
                                    isExpanded && "ring-2 ring-primary/20 border-primary/30 bg-background",
                                    error && "border-destructive hover:bg-destructive/5"
                                )}
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <div className="flex items-center gap-3">
                                    {selectedCategory ? (
                                        <>
                                            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shadow-card", selectedCategory.bg_color, selectedCategory.color)}>
                                                {(() => {
                                                    const Icon = getCategoryIcon(selectedCategory.icon);
                                                    return <Icon size={20} />;
                                                })()}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-medium text-sm tracking-tight">{selectedCategory.name}</span>
                                                {localSubCategory ? (
                                                    <span className="text-[10px] text-primary font-medium">• {localSubCategory}</span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground font-medium">Klik untuk ganti kategori</span>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                                                <Sparkles className="h-5 w-5 text-muted-foreground/40" />
                                            </div>
                                            <span className="text-muted-foreground font-medium text-sm">Pilih Kategori</span>
                                        </>
                                    )}
                                </div>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </motion.div>
                            </Button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-2 pb-4 px-1">
                                            <CategoryGrid
                                                categories={categories}
                                                selectedCategory={field.value}
                                                onCategorySelect={(cat) => {
                                                    handleCategoryClick(cat, field.onChange);
                                                    setIsExpanded(false);
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {error && <p className="text-sm font-medium text-destructive mt-1">{error}</p>}

                        <AnimatePresence>
                            {isSubCategorySheetOpen && selectedCategoryForSub && onSubCategoryChange && (
                                <SubCategorySheet
                                    category={selectedCategoryForSub}
                                    selectedValue={localSubCategory}
                                    onSelect={handleSubCategorySelect}
                                    onClose={() => setIsSubCategorySheetOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                );
            }}
        />
    );
}

